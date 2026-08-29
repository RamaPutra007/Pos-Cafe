<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $now = Carbon::now();
        $startOfWeek = $now->copy()->startOfWeek();
        $endOfWeek = $now->copy()->endOfWeek();

        // 1. Metrics from actual Order History
        $totalRevenue = (float) Order::where('status', 'paid')->sum('total_amount');
        $totalOrders = Order::where('status', '!=', 'cancelled')->count();
        $todayOrdersCount = Order::where('status', '!=', 'cancelled')->whereDate('created_at', Carbon::today())->count();
        $activeMenuCount = Product::where('is_active', true)->count();
        $activeCashierCount = User::where('role', 'cashier')->count();

        // 2. Weekly Chart Data (Senin - Minggu)
        $dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        $weeklyChart = [];

        for ($i = 0; $i < 7; $i++) {
            $dayDate = $startOfWeek->copy()->addDays($i);
            $dayOrders = Order::where('status', 'paid')
                ->whereDate('created_at', $dayDate->toDateString())
                ->get();

            $revenue = (float) $dayOrders->sum('total_amount');
            $count = $dayOrders->count();

            $weeklyChart[] = [
                'day' => $dayNames[$i],
                'date' => $dayDate->format('d M'),
                'value' => round($revenue / 1000000, 2), // in Millions (Juta)
                'revenue_raw' => $revenue,
                'display' => 'Rp '.number_format($revenue, 0, ',', '.'),
                'orders' => $count,
            ];
        }

        // 3. Recent Orders (Exclude cancelled orders)
        $recentOrders = Order::where('status', '!=', 'cancelled')
            ->with(['customer', 'cashier', 'items'])
            ->latest('id')
            ->take(6)
            ->get()
            ->map(function ($order) {
                $itemNames = $order->items->map(function ($item) {
                    $tempTag = $item->temperature ? ' ['.strtoupper($item->temperature === 'hot' ? 'Panas' : 'Dingin').']' : '';

                    return "{$item->quantity}x {$item->product_name}{$tempTag}";
                })->implode(', ');

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer?->name ?? 'Pelanggan Umum',
                    'items_summary' => $itemNames ?: 'Tidak ada item',
                    'total_amount' => (float) $order->total_amount,
                    'total_formatted' => 'Rp '.number_format($order->total_amount, 0, ',', '.'),
                    'status' => strtoupper($order->status),
                    'payment_method' => strtoupper($order->payment_method),
                    'created_at_human' => $order->created_at->diffForHumans(),
                ];
            });

        // 4. Low Stock Products
        $lowStockProducts = Product::whereColumn('current_stock', '<=', 'min_stock')
            ->orderBy('current_stock', 'asc')
            ->take(5)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'current_stock' => $p->current_stock,
                    'min_stock' => $p->min_stock,
                    'unit' => $p->unit,
                    'display_stock' => "{$p->current_stock} {$p->unit} tersisa",
                    'is_critical' => $p->current_stock <= 2,
                ];
            });

        $staffMembers = User::where('role', 'cashier')
            ->get()
            ->map(function ($u, $idx) {
                $initials = collect(explode(' ', $u->name))->map(fn ($s) => strtoupper(substr($s, 0, 1)))->take(2)->implode('');

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'initials' => $initials ?: 'ST',
                    'is_online' => true,
                ];
            });

        // 6. Payment Breakdown
        $cashRevenue = (float) Order::where('status', 'paid')->where('payment_method', 'cash')->sum('total_amount');
        $qrisRevenue = (float) Order::where('status', 'paid')->where('payment_method', 'qris')->sum('total_amount');

        return Inertia::render('dashboard', [
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'total_revenue_formatted' => 'Rp '.number_format($totalRevenue, 0, ',', '.'),
                'total_orders' => $totalOrders,
                'total_orders_formatted' => number_format($totalOrders, 0, ',', '.').' Pesanan',
                'today_orders_count' => $todayOrdersCount,
                'active_menu_count' => $activeMenuCount,
                'active_cashier_count' => $activeCashierCount,
                'cash_revenue_formatted' => 'Rp '.number_format($cashRevenue, 0, ',', '.'),
                'qris_revenue_formatted' => 'Rp '.number_format($qrisRevenue, 0, ',', '.'),
            ],
            'weeklyChart' => $weeklyChart,
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
            'staffMembers' => $staffMembers,
        ]);
    }
}
