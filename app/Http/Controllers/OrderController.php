<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * List all orders with filters and pagination.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $paymentMethod = $request->input('payment_method');
        $date = $request->input('date');

        $query = Order::with(['customer', 'cashier', 'items.product', 'payment'])
            ->where('status', '!=', 'cancelled')
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($paymentMethod && $paymentMethod !== 'all') {
            $query->where('payment_method', $paymentMethod);
        }

        if ($date) {
            $query->whereDate('created_at', $date);
        }

        $orders = $query->paginate(15)->withQueryString()->through(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer?->name ?? 'Pelanggan Umum',
                'cashier_name' => $order->cashier?->name ?? 'Kasir',
                'subtotal' => (float) $order->subtotal,
                'discount_amount' => (float) $order->discount_amount,
                'tax_amount' => (float) $order->tax_amount,
                'total_amount' => (float) $order->total_amount,
                'total_formatted' => 'Rp '.number_format($order->total_amount, 0, ',', '.'),
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'items_count' => $order->items->sum('quantity'),
                'items' => $order->items->map(fn ($it) => [
                    'name' => $it->product_name,
                    'temperature' => $it->temperature,
                    'quantity' => $it->quantity,
                    'price' => (float) $it->price,
                    'subtotal' => (float) $it->subtotal,
                ]),
                'payment' => $order->payment ? [
                    'method' => $order->payment->payment_method,
                    'amount_paid' => (float) $order->payment->amount_paid,
                    'change_due' => (float) $order->payment->change_due,
                    'reference_number' => $order->payment->reference_number,
                ] : null,
                'created_at' => $order->created_at->format('d/m/Y H:i'),
            ];
        });

        return Inertia::render('orders/index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'status' => $status ?? 'all',
                'payment_method' => $paymentMethod ?? 'all',
                'date' => $date,
            ],
        ]);
    }

    /**
     * Show single order details.
     */
    public function show(Order $order): Response
    {
        $order->load(['customer', 'cashier', 'items.product', 'payment']);

        return Inertia::render('orders/show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer' => $order->customer,
                'cashier' => $order->cashier,
                'subtotal' => (float) $order->subtotal,
                'discount_amount' => (float) $order->discount_amount,
                'tax_amount' => (float) $order->tax_amount,
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'notes' => $order->notes,
                'items' => $order->items,
                'payment' => $order->payment,
                'created_at' => $order->created_at->format('d/m/Y H:i:s'),
            ],
        ]);
    }

    /**
     * Cancel an order, restore product stocks and remove it from history.
     */
    public function cancel(Order $order): RedirectResponse
    {
        $orderNumber = $order->order_number;

        DB::transaction(function () use ($order) {
            $order->load(['items.product']);

            foreach ($order->items as $item) {
                if ($item->product_id && $item->product) {
                    // 1. Restore product current stock
                    $item->product->increment('current_stock', $item->quantity);

                    // 2. Restore active batch qty
                    $batch = ProductBatch::where('product_id', $item->product_id)
                        ->latest('id')
                        ->first();

                    if ($batch) {
                        $batch->increment('current_qty', $item->quantity);
                    }

                    // 3. Record stock movement entry
                    StockMovement::create([
                        'product_id' => $item->product_id,
                        'product_batch_id' => $batch?->id,
                        'user_id' => auth()->id(),
                        'type' => 'IN',
                        'quantity' => $item->quantity,
                        'balance_after' => $item->product->fresh()->current_stock,
                        'reason' => 'correction',
                        'notes' => "Pengembalian stok dari pembatalan pesanan #{$order->order_number}",
                    ]);
                }
            }

            // 4. Delete the order to permanently remove it from history
            $order->delete();
        });

        return redirect()->route('orders.index')->with([
            'toast' => [
                'type' => 'success',
                'message' => "Pesanan #{$orderNumber} berhasil dibatalkan dan dihapus dari riwayat pesanan.",
            ],
        ]);
    }
}
