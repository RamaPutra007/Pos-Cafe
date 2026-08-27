<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    /**
     * Display the POS cashier terminal.
     */
    public function index(): Response
    {
        $categories = Category::where('is_active', true)
            ->withCount(['products' => function ($query) {
                $query->where('is_active', true);
            }])
            ->get();

        $products = Product::where('is_active', true)
            ->with('category')
            ->orderBy('category_id')
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'category_id' => $p->category_id,
                    'category_name' => $p->category?->name,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'description' => $p->description,
                    'selling_price' => (float) $p->selling_price,
                    'selling_price_formatted' => 'Rp '.number_format($p->selling_price, 0, ',', '.'),
                    'purchase_price' => (float) $p->purchase_price,
                    'unit' => $p->unit,
                    'temperature_option' => $p->temperature_option ?? 'none',
                    'image' => $p->image,
                    'current_stock' => $p->current_stock,
                    'min_stock' => $p->min_stock,
                    'is_out_of_stock' => $p->current_stock <= 0,
                    'is_low_stock' => $p->current_stock <= $p->min_stock && $p->current_stock > 0,
                ];
            });

        $customers = Customer::orderBy('name')->get();

        return Inertia::render('pos/index', [
            'categories' => $categories,
            'products' => $products,
            'customers' => $customers,
        ]);
    }

    /**
     * Process checkout transaction for Cash / QRIS.
     */
    public function checkout(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'customer_name' => 'required_without:customer_id|string|min:1|max:100',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.temperature' => 'nullable|string|in:hot,ice',
            'payment_method' => 'required|in:cash,qris',
            'cash_received' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ], [
            'customer_name.required_without' => 'Nama pelanggan wajib diisi.',
            'customer_name.required' => 'Nama pelanggan wajib diisi.',
            'items.required' => 'Keranjang pesanan tidak boleh kosong.',
        ]);

        if (empty($validated['customer_id']) && (! isset($validated['customer_name']) || trim($validated['customer_name']) === '')) {
            throw ValidationException::withMessages([
                'customer_name' => 'Nama pelanggan wajib diisi.',
            ]);
        }

        $order = DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $itemsToProcess = [];

            // 1. Group and validate total requested quantities against current stock
            $productQuantities = [];
            foreach ($validated['items'] as $itemData) {
                $pId = $itemData['product_id'];
                $productQuantities[$pId] = ($productQuantities[$pId] ?? 0) + $itemData['quantity'];
            }

            $lockedProducts = [];
            foreach ($productQuantities as $pId => $totalQty) {
                $product = Product::lockForUpdate()->find($pId);

                if (! $product || ! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => "Produk '{$product?->name}' sedang tidak aktif.",
                    ]);
                }

                if ($product->current_stock < $totalQty) {
                    throw ValidationException::withMessages([
                        'items' => "Stok '{$product->name}' tidak mencukupi. Tersedia: {$product->current_stock} {$product->unit}, diminta: {$totalQty} {$product->unit}.",
                    ]);
                }

                $lockedProducts[$pId] = $product;
            }

            foreach ($validated['items'] as $itemData) {
                $product = $lockedProducts[$itemData['product_id']];
                $itemSubtotal = $product->selling_price * $itemData['quantity'];
                $subtotal += $itemSubtotal;

                $itemsToProcess[] = [
                    'product' => $product,
                    'quantity' => $itemData['quantity'],
                    'temperature' => $itemData['temperature'] ?? null,
                    'price' => $product->selling_price,
                    'cost_price' => $product->purchase_price,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $discount = (float) ($validated['discount_amount'] ?? 0);
            $tax = (float) ($validated['tax_amount'] ?? 0);
            $total = max(0, $subtotal - $discount + $tax);

            // 2. Validate Payment
            $paymentMethod = $validated['payment_method'];
            $cashReceived = (float) ($validated['cash_received'] ?? 0);
            $changeDue = 0;

            if ($paymentMethod === 'cash') {
                if ($cashReceived < $total) {
                    throw ValidationException::withMessages([
                        'cash_received' => 'Nominal uang tunai yang diterima kurang dari total tagihan.',
                    ]);
                }
                $changeDue = $cashReceived - $total;
            } else {
                // QRIS exact match
                $cashReceived = $total;
                $changeDue = 0;
            }

            // 3. Generate Unique Order Number (Safe from order cancellations/deletions)
            $todayDate = Carbon::now()->format('Ymd');
            $prefix = "ORD-{$todayDate}-";

            $latestOrder = Order::where('order_number', 'like', "{$prefix}%")
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            $nextSeq = 1;
            if ($latestOrder && preg_match('/-(\d+)$/', $latestOrder->order_number, $matches)) {
                $nextSeq = ((int) $matches[1]) + 1;
            }

            $orderNumber = sprintf('%s%04d', $prefix, $nextSeq);

            while (Order::where('order_number', $orderNumber)->exists()) {
                $nextSeq++;
                $orderNumber = sprintf('%s%04d', $prefix, $nextSeq);
            }

            // 4. Resolve Customer
            $customerId = $validated['customer_id'] ?? null;
            if (! $customerId && ! empty($validated['customer_name'])) {
                $manualName = trim($validated['customer_name']);
                if (strtolower($manualName) !== 'pelanggan umum' && strtolower($manualName) !== 'umum' && $manualName !== '') {
                    $customer = Customer::firstOrCreate(['name' => $manualName]);
                    $customerId = $customer->id;
                }
            }

            // 5. Create Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customerId,
                'user_id' => $request->user()?->id,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'tax_amount' => $tax,
                'total_amount' => $total,
                'status' => 'paid',
                'payment_method' => $paymentMethod,
                'payment_status' => 'paid',
                'notes' => $validated['notes'] ?? null,
                'paid_at' => Carbon::now(),
            ]);

            // 5. Create Order Items & Update Stock & Movements
            foreach ($itemsToProcess as $item) {
                /** @var Product $prod */
                $prod = $item['product'];
                $qty = $item['quantity'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $prod->id,
                    'product_name' => $prod->name,
                    'temperature' => $item['temperature'],
                    'price' => $item['price'],
                    'cost_price' => $item['cost_price'],
                    'quantity' => $qty,
                    'subtotal' => $item['subtotal'],
                ]);

                // Deduct Product Stock
                $prod->decrement('current_stock', $qty);
                $newStock = $prod->fresh()->current_stock;

                // Deduct Batches FIFO
                $remainingQtyToDeduct = $qty;
                $batches = ProductBatch::where('product_id', $prod->id)
                    ->where('current_qty', '>', 0)
                    ->orderBy('received_at', 'asc')
                    ->get();

                $usedBatchId = null;
                foreach ($batches as $batch) {
                    if ($remainingQtyToDeduct <= 0) {
                        break;
                    }
                    $usedBatchId = $batch->id;
                    $deduct = min($batch->current_qty, $remainingQtyToDeduct);
                    $batch->decrement('current_qty', $deduct);
                    $remainingQtyToDeduct -= $deduct;
                }

                // Record Stock Movement
                StockMovement::create([
                    'product_id' => $prod->id,
                    'product_batch_id' => $usedBatchId,
                    'user_id' => $request->user()?->id,
                    'type' => 'SALE',
                    'quantity' => $qty,
                    'balance_after' => $newStock,
                    'reason' => 'sale',
                    'notes' => "Penjualan Kasir pesanan #{$order->order_number}",
                ]);
            }

            // 6. Record Payment
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $paymentMethod,
                'amount_due' => $total,
                'amount_paid' => $cashReceived,
                'change_due' => $changeDue,
                'status' => 'paid',
                'reference_number' => strtoupper($paymentMethod).'-'.Carbon::now()->format('His').'-'.rand(100, 999),
                'notes' => $paymentMethod === 'cash' ? 'Tunai Rp '.number_format($cashReceived, 0, ',', '.').', Kembalian Rp '.number_format($changeDue, 0, ',', '.') : 'Pembayaran QRIS Berhasil',
            ]);

            return $order->load(['customer', 'cashier', 'items.product', 'payment']);
        });

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Transaksi #{$order->order_number} berhasil diselesaikan!",
            ],
            'last_order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer?->name ?? 'Pelanggan Umum',
                'cashier_name' => $order->cashier?->name ?? 'Kasir',
                'created_at_formatted' => $order->created_at->format('d/m/Y H:i'),
                'items' => $order->items->map(fn ($it) => [
                    'name' => $it->product_name.($it->temperature ? ' ['.strtoupper($it->temperature === 'hot' ? 'Panas' : 'Dingin').']' : ''),
                    'temperature' => $it->temperature,
                    'qty' => $it->quantity,
                    'price' => (float) $it->price,
                    'subtotal' => (float) $it->subtotal,
                ]),
                'subtotal' => (float) $order->subtotal,
                'discount' => (float) $order->discount_amount,
                'tax' => (float) $order->tax_amount,
                'total' => (float) $order->total_amount,
                'payment_method' => strtoupper($order->payment_method),
                'amount_paid' => (float) $order->payment?->amount_paid,
                'change_due' => (float) $order->payment?->change_due,
                'reference_number' => $order->payment?->reference_number,
            ],
        ]);
    }
}
