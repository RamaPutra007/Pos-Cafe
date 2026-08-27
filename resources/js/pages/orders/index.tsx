import { Link, router } from '@inertiajs/react';
import { Eye, Printer, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';

interface OrderRow {
    id: number;
    order_number: string;
    customer_name: string;
    cashier_name: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    total_formatted: string;
    status: string;
    payment_method: string;
    payment_status: string;
    items_count: number;
    items: Array<{
        name: string;
        temperature?: string | null;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
    payment: {
        method: string;
        amount_paid: number;
        change_due: number;
        reference_number: string | null;
    } | null;
    created_at: string;
}

interface OrdersIndexProps {
    orders: {
        data: OrderRow[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string | null;
        status: string;
        payment_method: string;
        date: string | null;
    };
}

export default function OrdersIndex({ orders, filters }: OrdersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentMethod, setPaymentMethod] = useState(
        filters.payment_method || 'all',
    );
    const [date, setDate] = useState(filters.date || '');
    const [selectedReceipt, setSelectedReceipt] = useState<OrderRow | null>(
        null,
    );

    const handleFilter = (newOverrides: Record<string, string>) => {
        router.get(
            '/orders',
            {
                search,
                status,
                payment_method: paymentMethod,
                date,
                ...newOverrides,
            },
            { preserveState: true },
        );
    };

    const handleCancelOrder = (orderId: number, orderNum: string) => {
        if (
            confirm(`Apakah Anda yakin ingin membatalkan pesanan #${orderNum}?`)
        ) {
            router.post(`/orders/${orderId}/cancel`);
        }
    };

    return (
        <PosLayout
            title="Riwayat Pesanan - Pos Cafe"
            headerTitle="Riwayat Pesanan"
            headerSubtitle="Daftar semua transaksi, status pembayaran, dan cetak ulang struk"
            activeNav="orders"
        >
            <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="flex flex-col gap-3 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8C6B56]" />
                        <input
                            type="text"
                            placeholder="Cari nomor pesanan atau nama pelanggan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleFilter({ search })
                            }
                            className="w-full rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] py-2.5 pr-4 pl-10 text-xs font-medium text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white focus:outline-none"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                handleFilter({ status: e.target.value });
                            }}
                            className="rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] px-3 py-2 text-xs font-medium text-[#24140E] focus:outline-none"
                        >
                            <option value="all">Semua Status</option>
                            <option value="paid">PAID (Selesai)</option>
                            <option value="pending">PENDING (Menunggu)</option>
                            <option value="cancelled">CANCELLED (Batal)</option>
                        </select>

                        {/* Payment Method Filter */}
                        <select
                            value={paymentMethod}
                            onChange={(e) => {
                                setPaymentMethod(e.target.value);
                                handleFilter({
                                    payment_method: e.target.value,
                                });
                            }}
                            className="rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] px-3 py-2 text-xs font-medium text-[#24140E] focus:outline-none"
                        >
                            <option value="all">Semua Pembayaran</option>
                            <option value="cash">Tunai (Cash)</option>
                            <option value="qris">QRIS</option>
                        </select>

                        {/* Date Filter */}
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                handleFilter({ date: e.target.value });
                            }}
                            className="rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] px-3 py-2 text-xs font-medium text-[#24140E] focus:outline-none"
                        />

                        {(search ||
                            status !== 'all' ||
                            paymentMethod !== 'all' ||
                            date) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        setStatus('all');
                                        setPaymentMethod('all');
                                        setDate('');
                                        router.get('/orders');
                                    }}
                                    className="cursor-pointer rounded-xl border border-[#D5C2B1] bg-[#F7F2EB] px-3 py-2 text-xs font-bold text-[#A24D3D] hover:bg-[#FBEBE8]"
                                >
                                    Reset Filter
                                </button>
                            )}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs sm:p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#24140E]">
                            <thead>
                                <tr className="border-b border-[#F0E4D8] text-[11px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                    <th className="py-3 pr-4">No. Pesanan</th>
                                    <th className="px-4 py-3">Waktu</th>
                                    <th className="px-4 py-3">Pelanggan</th>
                                    <th className="px-4 py-3">Kasir</th>
                                    <th className="px-4 py-3">Item</th>
                                    <th className="px-4 py-3">Metode</th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="py-3 pl-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5ECE2]">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="py-10 text-center text-xs text-[#8C6B56]"
                                        >
                                            Tidak ada data pesanan yang
                                            ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="transition hover:bg-[#FDFBF7]"
                                        >
                                            <td className="py-3.5 pr-4 font-bold text-[#7A4B2F]">
                                                #{order.order_number}
                                            </td>
                                            <td className="px-4 py-3.5 text-[#7A6353]">
                                                {order.created_at}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-[#24140E]">
                                                {order.customer_name}
                                            </td>
                                            <td className="px-4 py-3.5 text-[#7A6353]">
                                                {order.cashier_name}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="rounded-lg bg-[#F7F2EB] px-2 py-0.5 text-[11px] font-semibold text-[#6B574B]">
                                                    {order.items_count} item
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-bold text-[#6B4028] uppercase">
                                                    {order.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-[#24140E]">
                                                {order.total_formatted}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold ${order.status === 'paid'
                                                            ? 'bg-[#EAF7ED] text-[#2E7D32]'
                                                            : order.status ===
                                                                'pending'
                                                                ? 'bg-[#FDF3E5] text-[#C07718]'
                                                                : 'bg-[#FDE8E8] text-[#C53030]'
                                                        }`}
                                                >
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3.5 pl-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        title="Cetak Struk"
                                                        onClick={() =>
                                                            setSelectedReceipt(
                                                                order,
                                                            )
                                                        }
                                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#D5C2B1] bg-white text-[#6B4028] transition hover:bg-[#F5EFEB]"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </button>
                                                    <Link
                                                        href={`/orders/${order.id}`}
                                                        title="Detail Pesanan"
                                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#D5C2B1] bg-white text-[#24140E] transition hover:bg-[#F5EFEB]"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    {order.status !==
                                                        'cancelled' && (
                                                            <button
                                                                type="button"
                                                                title="Batalkan Pesanan"
                                                                onClick={() =>
                                                                    handleCancelOrder(
                                                                        order.id,
                                                                        order.order_number,
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#FADCD9] bg-[#FDF7F7] text-[#C53030] transition hover:bg-[#FDE8E8]"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-[#F0E4D8] pt-4">
                            {orders.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${link.active
                                            ? 'bg-[#6B4028] text-white shadow-xs'
                                            : link.url
                                                ? 'border border-[#D5C2B1] bg-[#F7F2EB] text-[#6B574B] hover:bg-[#EAE0D4]'
                                                : 'cursor-not-allowed text-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-sm rounded-3xl border border-[#E2D4C6] bg-white p-6 shadow-2xl">
                        {/* Thermal Receipt Visual */}
                        <div
                            id="receipt-print-area"
                            className="thermal-receipt bg-white p-2 font-mono text-xs text-[#1A1A1A]"
                        >
                            <div className="pb-2 text-center">
                                <h3 className="font-sans text-base font-black tracking-wider text-black uppercase">
                                    ☕ POS CAFE
                                </h3>
                                <p className="text-[10px] text-gray-700">
                                    Jl. Kopi Harum No. 7, Jakarta
                                </p>
                                <p className="text-[10px] text-gray-700">
                                    Telp: (021) 555-CAFE • 0812-3456-7890
                                </p>
                                <p className="mt-1 font-mono text-[10px] tracking-widest text-gray-400">
                                    - - - - - - - - - - - - - - - - - - - - - - - -
                                </p>
                            </div>

                            <div className="space-y-0.5 text-[11px]">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">No. Nota:</span>
                                    <span className="font-bold text-black">
                                        {selectedReceipt.order_number}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Waktu:</span>
                                    <span>{selectedReceipt.created_at}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Kasir:</span>
                                    <span>{selectedReceipt.cashier_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pelanggan:</span>
                                    <span className="font-semibold text-black">
                                        {selectedReceipt.customer_name}
                                    </span>
                                </div>
                            </div>

                            <p className="my-1 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                - - - - - - - - - - - - - - - - - - - - - - - -
                            </p>

                            <div className="space-y-1.5 text-[11px]">
                                {selectedReceipt.items.map((it, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start justify-between"
                                    >
                                        <div className="min-w-0 pr-2">
                                            <p className="font-bold leading-tight text-black">
                                                {it.name}
                                                {it.temperature && (
                                                    <span className="ml-1 text-[10px] font-normal text-gray-600">
                                                        [{it.temperature === 'hot' ? 'PANAS' : 'DINGIN'}]
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-[10px] text-gray-600">
                                                {it.quantity} x Rp{' '}
                                                {new Intl.NumberFormat('id-ID').format(it.price)}
                                            </p>
                                        </div>
                                        <span className="font-bold whitespace-nowrap text-black">
                                            Rp {new Intl.NumberFormat('id-ID').format(it.subtotal)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <p className="my-1 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                - - - - - - - - - - - - - - - - - - - - - - - -
                            </p>

                            <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span>
                                        Rp {new Intl.NumberFormat('id-ID').format(selectedReceipt.subtotal)}
                                    </span>
                                </div>
                                {selectedReceipt.discount_amount > 0 && (
                                    <div className="flex justify-between font-medium text-red-600">
                                        <span>Diskon:</span>
                                        <span>
                                            -Rp {new Intl.NumberFormat('id-ID').format(selectedReceipt.discount_amount)}
                                        </span>
                                    </div>
                                )}
                                {selectedReceipt.tax_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">PPN (10%):</span>
                                        <span>
                                            Rp {new Intl.NumberFormat('id-ID').format(selectedReceipt.tax_amount)}
                                        </span>
                                    </div>
                                )}
                                <p className="my-0.5 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                    ========================================
                                </p>
                                <div className="flex justify-between text-xs font-black text-black">
                                    <span>TOTAL AKHIR:</span>
                                    <span>{selectedReceipt.total_formatted}</span>
                                </div>
                                <p className="my-0.5 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                    ========================================
                                </p>
                                <div className="flex justify-between text-[10px] text-gray-700">
                                    <span>Metode Bayar:</span>
                                    <span className="font-bold uppercase">{selectedReceipt.payment_method}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-700">
                                    <span>Status:</span>
                                    <span className="font-bold text-[#2E7D32] uppercase">{selectedReceipt.status}</span>
                                </div>
                            </div>

                            <div className="mt-3 space-y-0.5 border-t border-dashed border-gray-300 pt-2 text-center text-[10px] text-gray-600">
                                <p className="font-bold text-black">Terima Kasih Atas Kunjungan Anda!</p>
                                <p>WiFi: CafeArtisan_Guest / Pass: nikmatkopi</p>
                                <p className="text-[9px] text-gray-500">Instagram: @poscafe.artisan</p>
                            </div>
                        </div>

                        <div className="no-print mt-6 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl bg-[#6B4028] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#57331F]"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Cetak Struk</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedReceipt(null)}
                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] py-2.5 text-xs font-bold text-[#24140E] transition hover:bg-[#EAE0D4]"
                            >
                                <span>Tutup</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PosLayout>
    );
}
