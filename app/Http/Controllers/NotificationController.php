<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get real-time system notifications for POS & Dashboard.
     */
    public function live(Request $request): JsonResponse
    {
        $notifications = [];

        // 1. Out of stock products (High Priority Danger)
        $outOfStock = Product::where('current_stock', '<=', 0)
            ->where('is_active', true)
            ->take(4)
            ->get();

        foreach ($outOfStock as $item) {
            $notifications[] = [
                'id' => "out_of_stock_{$item->id}",
                'type' => 'out_of_stock',
                'title' => 'Stok Habis!',
                'message' => "Menu '{$item->name}' habis (0 {$item->unit}). Segera lakukan restok.",
                'time' => 'Perlu Restok',
                'timestamp' => now()->timestamp,
                'link' => '/inventory',
                'severity' => 'danger',
            ];
        }

        // 2. Low stock products (Warning)
        $lowStock = Product::whereColumn('current_stock', '<=', 'min_stock')
            ->where('current_stock', '>', 0)
            ->where('is_active', true)
            ->take(4)
            ->get();

        foreach ($lowStock as $item) {
            $notifications[] = [
                'id' => "low_stock_{$item->id}",
                'type' => 'stock_warning',
                'title' => 'Peringatan Stok Rendah',
                'message' => "Stok '{$item->name}' tersisa {$item->current_stock} {$item->unit} (Batas Min: {$item->min_stock} {$item->unit}).",
                'time' => 'Stok Menipis',
                'timestamp' => now()->timestamp - 60,
                'link' => '/inventory',
                'severity' => 'warning',
            ];
        }

        // 3. Recent Completed Orders (Success)
        $recentOrders = Order::with(['customer', 'cashier'])
            ->where('status', '!=', 'cancelled')
            ->latest('id')
            ->take(5)
            ->get();

        foreach ($recentOrders as $order) {
            $customerName = $order->customer?->name ?? 'Pelanggan Umum';
            $amountFormatted = 'Rp '.number_format($order->total_amount, 0, ',', '.');
            $notifications[] = [
                'id' => "order_{$order->id}",
                'type' => 'order_success',
                'title' => "Pesanan #{$order->order_number}",
                'message' => "Transaksi berhasil {$amountFormatted} • {$customerName} ({$order->payment_method})",
                'time' => $order->created_at->diffForHumans(),
                'timestamp' => $order->created_at->timestamp,
                'link' => "/orders/{$order->id}",
                'severity' => 'success',
            ];
        }

        // Sort notifications by timestamp desc
        usort($notifications, fn ($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        return response()->json([
            'status' => 'success',
            'count' => count($notifications),
            'notifications' => array_values($notifications),
            'summary' => [
                'out_of_stock_count' => $outOfStock->count(),
                'low_stock_count' => $lowStock->count(),
                'recent_orders_count' => $recentOrders->count(),
                'online_cashiers' => User::where('role', 'cashier')->count(),
            ],
        ]);
    }
}
