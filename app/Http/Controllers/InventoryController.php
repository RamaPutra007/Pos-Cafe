<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Display inventory overview, batches, and low stock items.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $filter = $request->input('filter'); // 'all', 'low_stock'

        $query = Product::with(['category', 'batches' => fn ($q) => $q->where('current_qty', '>', 0)])
            ->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($filter === 'low_stock') {
            $query->whereColumn('current_stock', '<=', 'min_stock');
        }

        $products = $query->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'category_name' => $p->category?->name,
                'current_stock' => $p->current_stock,
                'min_stock' => $p->min_stock,
                'unit' => $p->unit,
                'purchase_price' => (float) $p->purchase_price,
                'selling_price' => (float) $p->selling_price,
                'rack_location' => $p->rack_location ?? 'Gudang Utama',
                'is_low_stock' => $p->current_stock <= $p->min_stock,
                'batches_count' => $p->batches->count(),
                'batches' => $p->batches->map(fn ($b) => [
                    'id' => $b->id,
                    'batch_number' => $b->batch_number,
                    'current_qty' => $b->current_qty,
                    'expired_at' => $b->expired_at ? $b->expired_at->format('d/m/Y') : '-',
                    'supplier' => $b->supplier ?? '-',
                ]),
            ];
        });

        // Summary counts
        $totalItems = Product::count();
        $lowStockCount = Product::whereColumn('current_stock', '<=', 'min_stock')->count();
        $totalValuation = (float) Product::selectRaw('SUM(current_stock * purchase_price) as val')->value('val') ?? 0;

        return Inertia::render('inventory/index', [
            'products' => $products,
            'summary' => [
                'total_items' => $totalItems,
                'low_stock_count' => $lowStockCount,
                'total_valuation' => $totalValuation,
                'total_valuation_formatted' => 'Rp '.number_format($totalValuation, 0, ',', '.'),
            ],
            'filters' => [
                'search' => $search,
                'filter' => $filter ?? 'all',
            ],
        ]);
    }

    /**
     * Handle incoming stock (Stok Masuk).
     */
    public function stockIn(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'batch_number' => 'nullable|string|max:100',
            'purchase_price' => 'nullable|numeric|min:0',
            'received_at' => 'required|date',
            'expired_at' => 'nullable|date|after_or_equal:received_at',
            'supplier' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
            $qty = $validated['quantity'];
            $cost = $validated['purchase_price'] ?? $product->purchase_price;

            $batchNumber = $validated['batch_number'] ?: 'BATCH-'.strtoupper(Str::random(6));

            // Create batch
            $batch = ProductBatch::create([
                'product_id' => $product->id,
                'batch_number' => $batchNumber,
                'initial_qty' => $qty,
                'current_qty' => $qty,
                'purchase_price' => $cost,
                'received_at' => $validated['received_at'],
                'expired_at' => $validated['expired_at'] ?? null,
                'supplier' => $validated['supplier'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Increment product stock
            $product->increment('current_stock', $qty);
            $newStock = $product->fresh()->current_stock;

            // Create Stock Movement record
            StockMovement::create([
                'product_id' => $product->id,
                'product_batch_id' => $batch->id,
                'user_id' => $request->user()?->id,
                'type' => 'IN',
                'quantity' => $qty,
                'balance_after' => $newStock,
                'reason' => 'purchase',
                'notes' => $validated['notes'] ?: "Stok masuk supplier {$validated['supplier']} (#{$batchNumber})",
            ]);
        });

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => 'Stok masuk berhasil dicatat!',
            ],
        ]);
    }

    /**
     * Handle outgoing stock (Stok Keluar: rusak, expired, internal use, penyesuaian).
     */
    public function stockOut(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|in:damage,expired,internal_use,correction,other',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $product = Product::lockForUpdate()->findOrFail($validated['product_id']);
            $qty = $validated['quantity'];

            if ($product->current_stock < $qty) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok saat ini ({$product->current_stock} {$product->unit}) tidak mencukupi untuk dikeluarkan sejumlah {$qty}.",
                ]);
            }

            // Decrement product stock
            $product->decrement('current_stock', $qty);
            $newStock = $product->fresh()->current_stock;

            // Deduct batches FIFO
            $remaining = $qty;
            $batches = ProductBatch::where('product_id', $product->id)
                ->where('current_qty', '>', 0)
                ->orderBy('received_at', 'asc')
                ->get();

            $lastBatchId = null;
            foreach ($batches as $batch) {
                if ($remaining <= 0) {
                    break;
                }
                $lastBatchId = $batch->id;
                $deduct = min($batch->current_qty, $remaining);
                $batch->decrement('current_qty', $deduct);
                $remaining -= $deduct;
            }

            $reasonMap = [
                'damage' => 'Barang Rusak / Pecah',
                'expired' => 'Kadaluarsa / Basi',
                'internal_use' => 'Konsumsi Internal / Barista Trial',
                'correction' => 'Penyesuaian Selisih Opname',
                'other' => 'Lainnya',
            ];

            // Create Stock Movement record
            StockMovement::create([
                'product_id' => $product->id,
                'product_batch_id' => $lastBatchId,
                'user_id' => $request->user()?->id,
                'type' => 'OUT',
                'quantity' => $qty,
                'balance_after' => $newStock,
                'reason' => $validated['reason'],
                'notes' => ($reasonMap[$validated['reason']] ?? $validated['reason']).($validated['notes'] ? ': '.$validated['notes'] : ''),
            ]);
        });

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => 'Stok keluar berhasil dicatat!',
            ],
        ]);
    }

    /**
     * Display stock movements history.
     */
    public function movements(Request $request): Response
    {
        $type = $request->input('type'); // IN, OUT, ADJUSTMENT, SALE
        $search = $request->input('search');
        $date = $request->input('date');

        $query = StockMovement::with(['product.category', 'batch', 'user'])->latest();

        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($date) {
            $query->whereDate('created_at', $date);
        }

        $movements = $query->paginate(20)->withQueryString()->through(function ($m) {
            return [
                'id' => $m->id,
                'product_name' => $m->product?->name ?? 'Produk Dihapus',
                'sku' => $m->product?->sku ?? '-',
                'unit' => $m->product?->unit ?? 'unit',
                'batch_number' => $m->batch?->batch_number ?? '-',
                'type' => $m->type,
                'quantity' => $m->quantity,
                'balance_after' => $m->balance_after,
                'reason' => $m->reason,
                'notes' => $m->notes,
                'user_name' => $m->user?->name ?? 'Sistem',
                'created_at' => $m->created_at->format('d/m/Y H:i'),
            ];
        });

        return Inertia::render('inventory/movements', [
            'movements' => $movements,
            'filters' => [
                'type' => $type ?? 'all',
                'search' => $search,
                'date' => $date,
            ],
        ]);
    }
}
