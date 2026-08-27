import { Link, router } from '@inertiajs/react';
import {
    Banknote,
    Calendar,
    CircleDollarSign,
    ExternalLink,
    FileSpreadsheet,
    FileText,
    Flame,
    History,
    QrCode,
    Receipt,
    ShoppingBag,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';

interface RecentOrderRow {
    id: number;
    order_number: string;
    customer_name: string;
    cashier_name: string;
    items_count: number;
    total_amount: number;
    total_formatted: string;
    payment_method: string;
    created_at: string;
}

interface ReportsProps {
    periodLabel: string;
    summary: {
        total_revenue: number;
        total_revenue_formatted: string;
        total_orders: number;
        total_cogs_formatted: string;
        gross_profit: number;
        gross_profit_formatted: string;
        total_items_sold: number;
        average_order_formatted?: string;
    };
    paymentBreakdown: {
        cash: {
            revenue: number;
            revenue_formatted: string;
            count: number;
            percentage: number;
        };
        qris: {
            revenue: number;
            revenue_formatted: string;
            count: number;
            percentage: number;
        };
    };
    topProducts: Array<{
        product_name: string;
        total_qty: number;
        total_sales: number;
        total_sales_formatted: string;
    }>;
    recentOrders?: RecentOrderRow[];
    stockMovementsCount: {
        in: number;
        out: number;
        sale: number;
    };
    filters: {
        period: string;
        start_date: string;
        end_date: string;
    };
}

export default function ReportsIndex({
    periodLabel,
    summary,
    paymentBreakdown,
    topProducts,
    recentOrders = [],
    stockMovementsCount,
    filters,
}: ReportsProps) {
    const [period, setPeriod] = useState(filters.period || 'this_week');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
        router.get(
            '/reports',
            { period: newPeriod, start_date: startDate, end_date: endDate },
            { preserveState: true },
        );
    };

    const handleCustomFilter = () => {
        router.get(
            '/reports',
            { period: 'custom', start_date: startDate, end_date: endDate },
            { preserveState: true },
        );
    };

    const handleDownloadExcel = () => {
        const params = new URLSearchParams({
            period,
            start_date: startDate,
            end_date: endDate,
        });
        window.location.href = `/reports/export-excel?${params.toString()}`;
    };

    const handleDownloadPdf = () => {
        const params = new URLSearchParams({
            period,
            start_date: startDate,
            end_date: endDate,
        });
        window.location.href = `/reports/export-pdf?${params.toString()}`;
    };

    const periodPresets = [
        { id: 'today', label: 'Hari Ini' },
        { id: 'yesterday', label: 'Kemarin' },
        { id: 'this_week', label: 'Minggu Ini' },
        { id: 'this_month', label: 'Bulan Ini' },
        { id: 'last_month', label: 'Bulan Lalu' },
        { id: 'this_year', label: 'Tahun Ini' },
    ];

    return (
        <PosLayout
            title="Laporan Penjualan & Keuangan - Pos Cafe"
            headerTitle="Laporan & Finansial"
            headerSubtitle={`Periode: ${periodLabel}`}
            activeNav="reports"
            headerActions={
                <div className="flex items-center gap-2.5">
                    {/* Export PDF */}
                    <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border border-[#F0D5D0] bg-[#FFF8F7] px-4 py-2.5 text-xs font-bold text-[#C53030] shadow-xs transition hover:bg-[#FDE8E8] active:scale-95"
                    >
                        <FileText className="h-4 w-4 text-[#C53030]" />
                        <span>Export PDF</span>
                    </button>

                    {/* Export Excel */}
                    <button
                        type="button"
                        onClick={handleDownloadExcel}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[#2E7D32] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#256629] active:scale-95"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Export Excel</span>
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Date Filter Bar */}
                <div className="flex flex-col gap-3 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    {/* Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {periodPresets.map((preset) => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => handlePeriodChange(preset.id)}
                                className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                    period === preset.id
                                        ? 'bg-[#6B4028] text-white shadow-xs'
                                        : 'border border-[#E2D4C6] bg-[#F7F2EB] text-[#6B574B] hover:bg-[#EFE8DF]'
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Range */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-xl border border-[#E2D4C6] bg-[#F7F2EB] px-2.5 py-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[#8C6B56]" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-xs text-[#24140E] focus:outline-none"
                            />
                            <span className="text-xs text-[#8C6B56]">s/d</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-xs text-[#24140E] focus:outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleCustomFilter}
                            className="cursor-pointer rounded-xl bg-[#6B4028] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#57331F] active:scale-95"
                        >
                            Terapkan
                        </button>
                    </div>
                </div>

                {/* 5 Summary KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Card 1: Total Omset */}
                    <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Total Omset
                                </p>
                                <h3 className="mt-1 font-serif text-xl font-bold text-[#24140E]">
                                    {summary.total_revenue_formatted}
                                </h3>
                                <p className="mt-1 text-[11px] font-semibold text-[#8C6B56]">
                                    {summary.total_orders} transaksi sukses
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFE5DA] text-[#6B4028]">
                                <CircleDollarSign className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Laba Kotor */}
                    <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Estimasi Laba Kotor
                                </p>
                                <h3 className="mt-1 font-serif text-xl font-bold text-[#2E7D32]">
                                    {summary.gross_profit_formatted}
                                </h3>
                                <p className="mt-1 text-[11px] font-semibold text-[#7A6353]">
                                    HPP: {summary.total_cogs_formatted}
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF7ED] text-[#2E7D32]">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Rata-rata per Transaksi */}
                    <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Rata-rata Transaksi
                                </p>
                                <h3 className="mt-1 font-serif text-xl font-bold text-[#24140E]">
                                    {summary.average_order_formatted || 'Rp 0'}
                                </h3>
                                <p className="mt-1 text-[11px] font-semibold text-[#8C6B56]">
                                    Basket size rata-rata
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFE5DA] text-[#6B4028]">
                                <Wallet className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Cup / Porsi Terjual */}
                    <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Menu Terjual
                                </p>
                                <h3 className="mt-1 font-serif text-xl font-bold text-[#24140E]">
                                    {summary.total_items_sold} Cup / Pcs
                                </h3>
                                <p className="mt-1 text-[11px] font-semibold text-[#8C6B56]">
                                    Total item terdistribusi
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFE5DA] text-[#6B4028]">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    {/* Card 5: Mutasi Stok */}
                    <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs transition hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Mutasi Bahan & Stok
                                </p>
                                <div className="mt-1 flex items-center gap-1.5 font-mono text-xs">
                                    <span className="font-bold text-[#2E7D32]">
                                        +{stockMovementsCount.in}
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-[#6B4028]">
                                        -{stockMovementsCount.sale}
                                    </span>
                                    <span>•</span>
                                    <span className="font-bold text-[#C53030]">
                                        -{stockMovementsCount.out}
                                    </span>
                                </div>
                                <p className="mt-1 text-[11px] text-[#8C6B56]">
                                    In • Sales • Out/Wastage
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFE5DA] text-[#6B4028]">
                                <History className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2-Column Section: Payment Methods Breakdown & Top Products */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left (5 cols): Payment Breakdown */}
                    <div className="space-y-6 lg:col-span-5">
                        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs">
                            <h3 className="border-b border-[#EADCCE] pb-3 font-serif text-lg font-bold text-[#24140E]">
                                Rincian Metode Pembayaran
                            </h3>

                            <div className="mt-5 space-y-4">
                                {/* Cash */}
                                <div className="rounded-2xl border border-[#F0E4D8] bg-[#FDFBF7] p-4 transition hover:border-[#D5C2B1]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFE5DA] text-[#6B4028]">
                                                <Banknote className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-[#24140E]">
                                                    Tunai (Cash)
                                                </h4>
                                                <p className="text-[11px] text-[#7A6353]">
                                                    {paymentBreakdown.cash.count} transaksi ({paymentBreakdown.cash.percentage}%)
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#24140E]">
                                            {paymentBreakdown.cash.revenue_formatted}
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mt-3 h-2 w-full rounded-full bg-[#EADCCE]">
                                        <div
                                            className="h-2 rounded-full bg-[#6B4028] transition-all duration-500"
                                            style={{
                                                width: `${paymentBreakdown.cash.percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* QRIS */}
                                <div className="rounded-2xl border border-[#F0E4D8] bg-[#FDFBF7] p-4 transition hover:border-[#D5C2B1]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7ED] text-[#2E7D32]">
                                                <QrCode className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-[#24140E]">
                                                    QRIS Statis
                                                </h4>
                                                <p className="text-[11px] text-[#7A6353]">
                                                    {paymentBreakdown.qris.count} transaksi ({paymentBreakdown.qris.percentage}%)
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#24140E]">
                                            {paymentBreakdown.qris.revenue_formatted}
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mt-3 h-2 w-full rounded-full bg-[#EADCCE]">
                                        <div
                                            className="h-2 rounded-full bg-[#2E7D32] transition-all duration-500"
                                            style={{
                                                width: `${paymentBreakdown.qris.percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right (7 cols): Top Selling Menu Items */}
                    <div className="space-y-6 lg:col-span-7">
                        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                                <div className="flex items-center gap-2">
                                    <Flame className="h-5 w-5 text-[#C53030]" />
                                    <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                        Menu Terlaris (Best Seller)
                                    </h3>
                                </div>
                                <span className="text-[11px] font-bold text-[#8C6B56]">
                                    Performa Penjualan
                                </span>
                            </div>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left text-xs text-[#24140E]">
                                    <thead>
                                        <tr className="border-b border-[#F0E4D8] text-[11px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                            <th className="py-2.5 pr-3">Rank</th>
                                            <th className="px-3 py-2.5">Nama Menu</th>
                                            <th className="px-3 py-2.5 text-center">Terjual</th>
                                            <th className="py-2.5 pl-3 text-right">Kontribusi Omset</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F5ECE2]">
                                        {topProducts.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="py-8 text-center text-xs text-[#8C6B56]"
                                                >
                                                    Belum ada data penjualan pada periode ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            topProducts.map((prod, idx) => (
                                                <tr
                                                    key={idx}
                                                    className="transition hover:bg-[#FDFBF7]"
                                                >
                                                    <td className="py-3 pr-3 font-serif font-bold text-[#7A4B2F]">
                                                        #{idx + 1}
                                                    </td>
                                                    <td className="px-3 py-3 font-bold text-[#24140E]">
                                                        {prod.product_name}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className="rounded-lg bg-[#F7F2EB] px-2.5 py-1 font-extrabold text-[#6B4028]">
                                                            {prod.total_qty}x
                                                        </span>
                                                    </td>
                                                    <td className="py-3 pl-3 text-right font-bold text-[#24140E]">
                                                        {prod.total_sales_formatted}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Rekap Transaksi Pesanan dalam Periode */}
                {recentOrders.length > 0 && (
                    <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs">
                        <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-[#6B4028]" />
                                <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                    Rekap Transaksi Pesanan ({recentOrders.length} Transaksi Terakhir)
                                </h3>
                            </div>
                            <Link
                                href="/orders"
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#6B4028] hover:underline"
                            >
                                <span>Lihat Semua Pesanan</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-left text-xs text-[#24140E]">
                                <thead>
                                    <tr className="border-b border-[#F0E4D8] text-[11px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                        <th className="py-2.5 pr-4">No. Nota</th>
                                        <th className="px-4 py-2.5">Waktu</th>
                                        <th className="px-4 py-2.5">Pelanggan</th>
                                        <th className="px-4 py-2.5">Kasir</th>
                                        <th className="px-4 py-2.5 text-center">Item</th>
                                        <th className="px-4 py-2.5 text-center">Metode</th>
                                        <th className="py-2.5 pl-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F5ECE2]">
                                    {recentOrders.map((ord) => (
                                        <tr
                                            key={ord.id}
                                            className="transition hover:bg-[#FDFBF7]"
                                        >
                                            <td className="py-3 pr-4 font-mono font-bold text-[#6B4028]">
                                                <Link
                                                    href={`/orders/${ord.id}`}
                                                    className="hover:underline"
                                                >
                                                    {ord.order_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-[#7A6353]">
                                                {ord.created_at}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-[#24140E]">
                                                {ord.customer_name}
                                            </td>
                                            <td className="px-4 py-3 text-[#7A6353]">
                                                {ord.cashier_name}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="rounded-md bg-[#F7F2EB] px-2 py-0.5 font-bold text-[#6B4028]">
                                                    {ord.items_count}x
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                        ord.payment_method === 'cash'
                                                            ? 'bg-[#EFE5DA] text-[#6B4028]'
                                                            : 'bg-[#EAF7ED] text-[#2E7D32]'
                                                    }`}
                                                >
                                                    {ord.payment_method}
                                                </span>
                                            </td>
                                            <td className="py-3 pl-4 text-right font-bold text-[#24140E]">
                                                {ord.total_formatted}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </PosLayout>
    );
}
