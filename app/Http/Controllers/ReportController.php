<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StockMovement;
use App\Services\ExcelReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display sales, payment, and inventory reports with date filters.
     */
    public function index(Request $request): Response
    {
        [$start, $end, $periodLabel, $period] = $this->resolveDateRange($request);

        // 1. Orders within period
        $orders = Order::where('status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->with(['items.product.category', 'customer', 'cashier', 'payment'])
            ->latest('id')
            ->get();

        $totalRevenue = (float) $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $averageOrder = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Calculate Cost of Goods Sold (HPP) & Gross Profit
        $totalCogs = (float) OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', [$start, $end]);
        })->selectRaw('SUM(cost_price * quantity) as cogs')->value('cogs') ?? 0;

        $grossProfit = max(0, $totalRevenue - $totalCogs);
        $totalItemsSold = (int) OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', [$start, $end]);
        })->sum('quantity');

        // 2. Payment Method Breakdown
        $cashOrders = $orders->where('payment_method', 'cash');
        $qrisOrders = $orders->where('payment_method', 'qris');

        $cashRevenue = (float) $cashOrders->sum('total_amount');
        $cashCount = $cashOrders->count();

        $qrisRevenue = (float) $qrisOrders->sum('total_amount');
        $qrisCount = $qrisOrders->count();

        // 3. Top Selling Products
        $topProducts = OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', [$start, $end]);
        })
            ->selectRaw('product_name, SUM(quantity) as total_qty, SUM(subtotal) as total_sales')
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->take(8)
            ->get()
            ->map(function ($item) {
                return [
                    'product_name' => $item->product_name,
                    'total_qty' => (int) $item->total_qty,
                    'total_sales' => (float) $item->total_sales,
                    'total_sales_formatted' => 'Rp '.number_format($item->total_sales, 0, ',', '.'),
                ];
            });

        // 4. Stock Movement in Period
        $stockMovementsCount = [
            'in' => (int) StockMovement::where('type', 'IN')->whereBetween('created_at', [$start, $end])->sum('quantity'),
            'out' => (int) StockMovement::where('type', 'OUT')->whereBetween('created_at', [$start, $end])->sum('quantity'),
            'sale' => (int) StockMovement::where('type', 'SALE')->whereBetween('created_at', [$start, $end])->sum('quantity'),
        ];

        // 5. Transaction List in this period (for detailed table)
        $recentOrders = $orders->take(30)->map(function ($ord) {
            return [
                'id' => $ord->id,
                'order_number' => $ord->order_number,
                'customer_name' => $ord->customer?->name ?? 'Pelanggan Umum',
                'cashier_name' => $ord->cashier?->name ?? 'Kasir',
                'items_count' => $ord->items->sum('quantity'),
                'total_amount' => (float) $ord->total_amount,
                'total_formatted' => 'Rp '.number_format($ord->total_amount, 0, ',', '.'),
                'payment_method' => $ord->payment_method,
                'created_at' => $ord->created_at->format('d/m/Y H:i'),
            ];
        });

        return Inertia::render('reports/index', [
            'periodLabel' => $periodLabel,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_revenue_formatted' => 'Rp '.number_format($totalRevenue, 0, ',', '.'),
                'total_orders' => $totalOrders,
                'total_cogs_formatted' => 'Rp '.number_format($totalCogs, 0, ',', '.'),
                'gross_profit' => $grossProfit,
                'gross_profit_formatted' => 'Rp '.number_format($grossProfit, 0, ',', '.'),
                'total_items_sold' => $totalItemsSold,
                'average_order_formatted' => 'Rp '.number_format($averageOrder, 0, ',', '.'),
            ],
            'paymentBreakdown' => [
                'cash' => [
                    'revenue' => $cashRevenue,
                    'revenue_formatted' => 'Rp '.number_format($cashRevenue, 0, ',', '.'),
                    'count' => $cashCount,
                    'percentage' => $totalRevenue > 0 ? round(($cashRevenue / $totalRevenue) * 100, 1) : 0,
                ],
                'qris' => [
                    'revenue' => $qrisRevenue,
                    'revenue_formatted' => 'Rp '.number_format($qrisRevenue, 0, ',', '.'),
                    'count' => $qrisCount,
                    'percentage' => $totalRevenue > 0 ? round(($qrisRevenue / $totalRevenue) * 100, 1) : 0,
                ],
            ],
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
            'stockMovementsCount' => $stockMovementsCount,
            'filters' => [
                'period' => $period,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
            ],
        ]);
    }

    /**
     * Export neat multi-sheet Excel spreadsheet.
     */
    public function exportExcel(Request $request, ExcelReportService $excelService): StreamedResponse
    {
        [$start, $end, $periodLabel] = $this->resolveDateRange($request);

        return $excelService->export($start, $end, $periodLabel);
    }

    /**
     * Export professionally formatted PDF report.
     */
    public function exportPdf(Request $request): HttpResponse
    {
        [$start, $end, $periodLabel] = $this->resolveDateRange($request);

        $orders = Order::where('status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->with(['items', 'customer', 'cashier', 'payment'])
            ->latest('id')
            ->get();

        $totalRevenue = (float) $orders->sum('total_amount');
        $totalOrders = $orders->count();
        $averageOrder = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        $totalCogs = (float) OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', [$start, $end]);
        })->selectRaw('SUM(cost_price * quantity) as cogs')->value('cogs') ?? 0;

        $grossProfit = max(0, $totalRevenue - $totalCogs);
        $totalItemsSold = (int) OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', [$start, $end]);
        })->sum('quantity');

        $cashOrders = $orders->where('payment_method', 'cash');
        $qrisOrders = $orders->where('payment_method', 'qris');

        $cashRevenue = (float) $cashOrders->sum('total_amount');
        $qrisRevenue = (float) $qrisOrders->sum('total_amount');

        $topProducts = OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', [$start, $end]);
        })
            ->selectRaw('product_name, SUM(quantity) as total_qty, SUM(subtotal) as total_sales')
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->take(10)
            ->get()
            ->map(function ($item) {
                return [
                    'product_name' => $item->product_name,
                    'total_qty' => (int) $item->total_qty,
                    'total_sales' => (float) $item->total_sales,
                    'total_sales_formatted' => 'Rp '.number_format($item->total_sales, 0, ',', '.'),
                ];
            });

        $data = [
            'periodLabel' => $periodLabel,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_revenue_formatted' => 'Rp '.number_format($totalRevenue, 0, ',', '.'),
                'total_orders' => $totalOrders,
                'total_cogs_formatted' => 'Rp '.number_format($totalCogs, 0, ',', '.'),
                'gross_profit' => $grossProfit,
                'gross_profit_formatted' => 'Rp '.number_format($grossProfit, 0, ',', '.'),
                'total_items_sold' => $totalItemsSold,
                'average_order_formatted' => 'Rp '.number_format($averageOrder, 0, ',', '.'),
            ],
            'paymentBreakdown' => [
                'cash' => [
                    'count' => $cashOrders->count(),
                    'revenue_formatted' => 'Rp '.number_format($cashRevenue, 0, ',', '.'),
                    'percentage' => $totalRevenue > 0 ? round(($cashRevenue / $totalRevenue) * 100, 1) : 0,
                ],
                'qris' => [
                    'count' => $qrisOrders->count(),
                    'revenue_formatted' => 'Rp '.number_format($qrisRevenue, 0, ',', '.'),
                    'percentage' => $totalRevenue > 0 ? round(($qrisRevenue / $totalRevenue) * 100, 1) : 0,
                ],
            ],
            'topProducts' => $topProducts,
            'orders' => $orders,
        ];

        $pdf = Pdf::loadView('pdf.sales-report', $data)->setPaper('a4', 'portrait');

        $filename = 'Laporan_Penjualan_POS_Cafe_'.Carbon::now()->format('Ymd_His').'.pdf';

        return $pdf->download($filename);
    }

    /**
     * Helper to resolve start date, end date, and label based on request inputs.
     *
     * @return array{0: Carbon, 1: Carbon, 2: string, 3: string}
     */
    private function resolveDateRange(Request $request): array
    {
        $period = $request->input('period', 'this_week');
        $startDateInput = $request->input('start_date');
        $endDateInput = $request->input('end_date');

        $now = Carbon::now();

        switch ($period) {
            case 'today':
                $start = $now->copy()->startOfDay();
                $end = $now->copy()->endOfDay();
                $periodLabel = 'Hari Ini ('.$now->format('d M Y').')';
                break;
            case 'yesterday':
                $start = $now->copy()->subDay()->startOfDay();
                $end = $now->copy()->subDay()->endOfDay();
                $periodLabel = 'Kemarin ('.$start->format('d M Y').')';
                break;
            case 'this_month':
                $start = $now->copy()->startOfMonth();
                $end = $now->copy()->endOfMonth();
                $periodLabel = 'Bulan Ini ('.$now->format('F Y').')';
                break;
            case 'last_month':
                $start = $now->copy()->subMonth()->startOfMonth();
                $end = $now->copy()->subMonth()->endOfMonth();
                $periodLabel = 'Bulan Lalu ('.$start->format('F Y').')';
                break;
            case 'this_year':
                $start = $now->copy()->startOfYear();
                $end = $now->copy()->endOfYear();
                $periodLabel = 'Tahun Ini ('.$now->format('Y').')';
                break;
            case 'custom':
                $start = $startDateInput ? Carbon::parse($startDateInput)->startOfDay() : $now->copy()->subDays(30)->startOfDay();
                $end = $endDateInput ? Carbon::parse($endDateInput)->endOfDay() : $now->copy()->endOfDay();
                $periodLabel = $start->format('d M Y').' - '.$end->format('d M Y');
                break;
            case 'this_week':
            default:
                $start = $now->copy()->startOfWeek();
                $end = $now->copy()->endOfWeek();
                $periodLabel = 'Minggu Ini ('.$start->format('d M').' - '.$end->format('d M Y').')';
                break;
        }

        return [$start, $end, $periodLabel, $period];
    }
}
