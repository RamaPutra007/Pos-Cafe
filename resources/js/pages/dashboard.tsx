import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Briefcase,
    Coffee,
    CreditCard,
    Download,
    FolderPlus,
    PlusCircle,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';

interface DashboardProps {
    metrics: {
        total_revenue: number;
        total_revenue_formatted: string;
        total_orders: number;
        total_orders_formatted?: string;
        today_orders_count?: number;
        active_menu_count: number;
        active_cashier_count: number;
        cash_revenue_formatted: string;
        qris_revenue_formatted: string;
    };
    weeklyChart: Array<{
        day: string;
        date: string;
        value: number;
        revenue_raw: number;
        display: string;
        orders: number;
    }>;
    recentOrders: Array<{
        id: number;
        order_number: string;
        customer_name: string;
        items_summary: string;
        total_amount: number;
        total_formatted: string;
        status: string;
        payment_method: string;
        created_at_human: string;
    }>;
    lowStockProducts: Array<{
        id: number;
        name: string;
        current_stock: number;
        min_stock: number;
        unit: string;
        display_stock: string;
        is_critical: boolean;
    }>;
    staffMembers: Array<{
        id: number;
        name: string;
        email: string;
        initials: string;
        terminal: string;
        is_online: boolean;
    }>;
}

export default function Dashboard({
    metrics,
    weeklyChart,
    recentOrders,
    lowStockProducts,
    staffMembers,
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'keuangan' | 'pesanan'>(
        'keuangan',
    );
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(6);

    const maxVal = Math.max(...weeklyChart.map((d) => d.value), 10);
    const points = weeklyChart.map((item, idx) => {
        const x = 35 + idx * 90;
        const y = Math.round(180 - (item.value / maxVal) * 155);

        return { x, y };
    });

    const pathString = points.reduce((acc, p, i) => {
        if (i === 0) {
            return `M ${p.x} ${p.y}`;
        }

        const prev = points[i - 1];
        const cx1 = prev.x + (p.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (p.x - prev.x) / 2;
        const cy2 = p.y;

        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
    }, '');

    const areaString = `${pathString} L 575 190 L 35 190 Z`;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <PosLayout
            title="Dashboard Admin - Pos Cafe"
            headerTitle="Dashboard Admin"
            headerSubtitle="Ringkasan kinerja penjualan, inventaris & kasir"
            activeNav="dashboard"
        >
            <div className="space-y-7">
                {/* ================= 4 SUMMARY METRIC CARDS WITH FRAMER MOTION ================= */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {/* Card 1: Total Pendapatan */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -3 }}
                        className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs transition hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Total Pendapatan
                                </p>
                                <h3 className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-[#24140E] xl:text-3xl">
                                    {metrics.total_revenue_formatted}
                                </h3>
                                <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#2E7D32]">
                                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">
                                        Tunai {metrics.cash_revenue_formatted}{' '}
                                        <br /> QRIS{' '}
                                        {metrics.qris_revenue_formatted}
                                    </span>
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE5DA] text-[#6B4028]">
                                <CreditCard className="h-6 w-6" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Total Transaksi (Mengikuti Riwayat Pesanan) */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -3 }}
                        className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs transition hover:shadow-md"
                    >
                        <Link href="/orders" className="block cursor-pointer">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-medium text-[#7A6353]">
                                            Total Transaksi
                                        </p>
                                        <span className="py-0.2 rounded-full border border-[#E8D7C8] bg-[#FAF3EC] px-2 text-[9px] font-bold text-[#8C4A27]">
                                            Riwayat
                                        </span>
                                    </div>
                                    <h3 className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-[#24140E] xl:text-3xl">
                                        {metrics.total_orders}{' '}
                                        <span className="text-base font-normal text-[#7A6353]">
                                            Pesanan
                                        </span>
                                    </h3>
                                    <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#2E7D32] hover:underline">
                                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                                        <span>
                                            {metrics.today_orders_count || 0}{' '}
                                            transaksi hari ini • Buka Riwayat
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Card 3: Item Menu Aktif */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -3 }}
                        className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs transition hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Item Menu Aktif
                                </p>
                                <h3 className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-[#24140E] xl:text-3xl">
                                    {metrics.active_menu_count} Menu
                                </h3>
                                <p className="mt-2 text-xs font-medium text-[#8C6B56]">
                                    Siap dijual di POS
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE5DA] text-[#6B4028]">
                                <Coffee className="h-6 w-6" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 4: Kasir Aktif */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -3 }}
                        className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs transition hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Kasir Aktif
                                </p>
                                <h3 className="mt-1.5 font-serif text-2xl font-bold tracking-tight text-[#24140E] xl:text-3xl">
                                    {metrics.active_cashier_count} Kasir
                                </h3>
                                <p className="mt-2 text-xs font-medium text-[#2E7D32]">
                                    Semua kasir aktif melayani
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE5DA] text-[#6B4028]">
                                <Briefcase className="h-6 w-6" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ================= 2-COLUMN MAIN CONTENT ================= */}
                <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
                    {/* Left Column (8 cols): Chart + Recent Orders */}
                    <div className="space-y-7 lg:col-span-8">
                        {/* CARD: Laporan Ringkasan (Chart) */}
                        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs sm:p-7">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-[#24140E]">
                                        Laporan Ringkasan Penjualan
                                    </h3>
                                    <p className="text-xs text-[#8C6B56]">
                                        Grafik omset harian minggu ini
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('keuangan')}
                                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                            activeTab === 'keuangan'
                                                ? 'bg-[#6B4028] text-white shadow-xs'
                                                : 'border border-[#D5C2B1] bg-[#F7F2EB] text-[#6B574B]'
                                        }`}
                                    >
                                        Keuangan
                                    </button>
                                    <Link
                                        href="/reports"
                                        className="rounded-full border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-1.5 text-xs font-semibold text-[#6B574B] transition hover:bg-[#EAE0D4]"
                                    >
                                        Lihat Laporan
                                    </Link>
                                </div>
                            </div>

                            {/* Chart SVG */}
                            <div className="relative mt-6 h-64 w-full select-none">
                                <svg
                                    viewBox="0 0 600 220"
                                    className="h-full w-full overflow-visible"
                                >
                                    <defs>
                                        <linearGradient
                                            id="areaGrad"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#B57A54"
                                                stopOpacity="0.45"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#F5EFEB"
                                                stopOpacity="0.05"
                                            />
                                        </linearGradient>
                                    </defs>

                                    {[20, 60, 100, 140, 180].map((yVal, i) => (
                                        <g key={yVal}>
                                            <line
                                                x1="30"
                                                y1={yVal}
                                                x2="585"
                                                y2={yVal}
                                                stroke="#EADCCE"
                                                strokeDasharray="4 4"
                                            />
                                            <text
                                                x="5"
                                                y={yVal + 4}
                                                fontSize="10"
                                                fill="#9E8372"
                                                fontWeight="600"
                                            >
                                                {Math.round(
                                                    maxVal * (1 - i / 4),
                                                )}{' '}
                                                jt
                                            </text>
                                        </g>
                                    ))}

                                    <path
                                        d={areaString}
                                        fill="url(#areaGrad)"
                                    />

                                    <path
                                        d={pathString}
                                        fill="none"
                                        stroke="#7A4B2F"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                    />

                                    {points.map((pt, idx) => (
                                        <g
                                            key={weeklyChart[idx]?.day || idx}
                                            className="cursor-pointer"
                                            onMouseEnter={() =>
                                                setHoveredPoint(idx)
                                            }
                                        >
                                            <circle
                                                cx={pt.x}
                                                cy={pt.y}
                                                r={hoveredPoint === idx ? 6 : 4}
                                                fill="#7A4B2F"
                                                stroke="#FFFDF9"
                                                strokeWidth="2"
                                                className="transition-all duration-200"
                                            />
                                            <text
                                                x={pt.x}
                                                y="208"
                                                textAnchor="middle"
                                                fontSize="11"
                                                fill="#6B574B"
                                                fontWeight="600"
                                            >
                                                {weeklyChart[idx]?.day}
                                            </text>
                                        </g>
                                    ))}
                                </svg>

                                {hoveredPoint !== null &&
                                    weeklyChart[hoveredPoint] && (
                                        <div
                                            className="pointer-events-none absolute -top-2 rounded-xl bg-[#24140E] px-3 py-1.5 text-xs text-white shadow-lg transition-all duration-200"
                                            style={{
                                                left: `${(points[hoveredPoint].x / 600) * 100}%`,
                                                transform:
                                                    'translate(-50%, -100%)',
                                            }}
                                        >
                                            <p className="font-bold">
                                                {weeklyChart[hoveredPoint].day}{' '}
                                                (
                                                {weeklyChart[hoveredPoint].date}
                                                ):{' '}
                                                {
                                                    weeklyChart[hoveredPoint]
                                                        .display
                                                }
                                            </p>
                                            <p className="text-[10px] text-amber-200">
                                                {
                                                    weeklyChart[hoveredPoint]
                                                        .orders
                                                }{' '}
                                                pesanan
                                            </p>
                                        </div>
                                    )}
                            </div>

                            <div className="mt-6 flex justify-center">
                                <Link
                                    href="/reports"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#6B4028] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#57331F] active:scale-95"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Buka Laporan Finansial Lengkap</span>
                                </Link>
                            </div>
                        </div>

                        {/* CARD: Pesanan Terbaru (Table) */}
                        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs sm:p-7">
                            <div className="flex items-center justify-between border-b border-[#EADCCE] pb-4">
                                <h3 className="font-serif text-xl font-bold text-[#24140E]">
                                    Pesanan Terbaru
                                </h3>
                                <Link
                                    href="/orders"
                                    className="text-xs font-bold text-[#7A4B2F] transition hover:text-[#24140E] hover:underline"
                                >
                                    Lihat Semua Pesanan →
                                </Link>
                            </div>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left text-xs text-[#24140E]">
                                    <thead>
                                        <tr className="border-b border-[#F0E4D8] text-[11px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                            <th className="py-3 pr-4">
                                                ID Pesanan
                                            </th>
                                            <th className="px-4 py-3">
                                                Pelanggan
                                            </th>
                                            <th className="px-4 py-3">Item</th>
                                            <th className="px-4 py-3">Total</th>
                                            <th className="py-3 pl-4">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F5ECE2]">
                                        {recentOrders.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-xs text-[#8C6B56]"
                                                >
                                                    Belum ada riwayat pesanan
                                                    aktif.
                                                </td>
                                            </tr>
                                        ) : (
                                            recentOrders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="transition hover:bg-[#FDFBF7]"
                                                >
                                                    <td className="py-3.5 pr-4 font-bold text-[#7A4B2F]">
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="hover:underline"
                                                        >
                                                            #
                                                            {order.order_number}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3.5 font-medium text-[#24140E]">
                                                        {order.customer_name}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-[#6B574B]">
                                                        {order.items_summary}
                                                    </td>
                                                    <td className="px-4 py-3.5 font-bold text-[#24140E]">
                                                        {order.total_formatted}
                                                    </td>
                                                    <td className="py-3.5 pl-4">
                                                        <span
                                                            className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold ${
                                                                order.status ===
                                                                'PAID'
                                                                    ? 'bg-[#EAF7ED] text-[#2E7D32]'
                                                                    : 'bg-[#FDF3E5] text-[#C07718]'
                                                            }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (4 cols): Quick Actions, Stock Alert, Staff Activity */}
                    <div className="space-y-7 lg:col-span-4">
                        {/* CARD: Tindakan Inventaris (Quick Actions) */}
                        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs">
                            <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                Tindakan Cepat
                            </h3>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <Link
                                    href="/menus"
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-[#6B4028] px-3 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#59341F] active:scale-95"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Tambah Menu</span>
                                </Link>

                                <Link
                                    href="/menus"
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-[#D5C2B1] bg-[#FFFDF9] px-3 py-3 text-xs font-bold text-[#24140E] transition hover:bg-[#F5EFEB] active:scale-95"
                                >
                                    <FolderPlus className="h-4 w-4 text-[#7A4B2F]" />
                                    <span>Kategori</span>
                                </Link>

                                <Link
                                    href="/inventory"
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-[#D5C2B1] bg-[#FFFDF9] px-3 py-3 text-xs font-bold text-[#24140E] transition hover:bg-[#F5EFEB] active:scale-95"
                                >
                                    <Download className="h-4 w-4 text-[#7A4B2F]" />
                                    <span>Stok Masuk</span>
                                </Link>

                                <Link
                                    href="/inventory"
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-[#D5C2B1] bg-[#FFFDF9] px-3 py-3 text-xs font-bold text-[#24140E] transition hover:bg-[#F5EFEB] active:scale-95"
                                >
                                    <Upload className="h-4 w-4 text-[#7A4B2F]" />
                                    <span>Stok Keluar</span>
                                </Link>
                            </div>
                        </div>

                        {/* CARD: Peringatan Stok (Low Stock) */}
                        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                        Peringatan Stok
                                    </h3>
                                    <p className="text-[11px] text-[#8C6B56]">
                                        Item perlu diisi ulang
                                    </p>
                                </div>
                                <AlertTriangle className="h-5 w-5 text-[#C53030]" />
                            </div>

                            <div className="mt-4 space-y-2.5">
                                {lowStockProducts.length === 0 ? (
                                    <p className="py-2 text-center text-xs text-[#8C6B56]">
                                        Semua stok produk mencukupi!
                                    </p>
                                ) : (
                                    lowStockProducts.map((p) => (
                                        <div
                                            key={p.id}
                                            className={`flex items-center justify-between rounded-2xl border p-3 ${
                                                p.is_critical
                                                    ? 'border-[#FADCD9] bg-[#FDF7F7]'
                                                    : 'border-[#F6E3B8] bg-[#FFFBF2]'
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-[#24140E]">
                                                {p.name}
                                            </span>
                                            <span
                                                className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                                                    p.is_critical
                                                        ? 'bg-[#FDE8E8] text-[#C53030]'
                                                        : 'bg-[#FDF3E5] text-[#C07718]'
                                                }`}
                                            >
                                                {p.display_stock}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-4 text-center">
                                <Link
                                    href="/inventory?filter=low_stock"
                                    className="text-xs font-bold text-[#7A4B2F] transition hover:text-[#24140E] hover:underline"
                                >
                                    Kelola Inventaris & Restok →
                                </Link>
                            </div>
                        </div>

                        {/* CARD: Aktivitas Staf (Staff Status) */}
                        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                                <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                    Aktivitas Kasir
                                </h3>
                                <Link
                                    href="/cashiers"
                                    className="text-xs font-bold text-[#7A4B2F] hover:underline"
                                >
                                    Kelola
                                </Link>
                            </div>

                            <div className="mt-4 space-y-3">
                                {staffMembers.map((staff) => (
                                    <div
                                        key={staff.id}
                                        className="flex items-center justify-between rounded-2xl p-2 transition hover:bg-[#FDFBF7]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5A3726] text-xs font-bold text-white shadow-xs">
                                                {staff.initials}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-[#24140E]">
                                                    {staff.name}
                                                </h4>
                                                <p className="text-[11px] text-[#7A6353]">
                                                    {staff.terminal}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#2E7D32]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PosLayout>
    );
}
