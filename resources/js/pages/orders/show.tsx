import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Printer, XCircle } from 'lucide-react';
import { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';

interface OrderShowProps {
    order: {
        id: number;
        order_number: string;
        customer: { id: number; name: string; phone: string | null } | null;
        cashier: { id: number; name: string } | null;
        subtotal: number;
        discount_amount: number;
        tax_amount: number;
        total_amount: number;
        status: string;
        payment_method: string;
        payment_status: string;
        notes: string | null;
        items: Array<{
            id: number;
            product_name: string;
            temperature?: string | null;
            quantity: number;
            price: number;
            subtotal: number;
        }>;
        payment: {
            payment_method: string;
            amount_due: number;
            amount_paid: number;
            change_due: number;
            status: string;
            reference_number: string | null;
            notes: string | null;
        } | null;
        created_at: string;
    };
}

export default function OrderShow({ order }: OrderShowProps) {
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    const handleCancelOrder = () => {
        if (
            confirm(
                `Apakah Anda yakin ingin membatalkan pesanan #${order.order_number}? Stok produk akan dikembalikan dan pesanan akan dihapus dari riwayat.`,
            )
        ) {
            router.post(`/orders/${order.id}/cancel`);
        }
    };

    const handleOpenPrint = () => {
        setShowReceiptModal(true);
    };

    return (
        <PosLayout
            title={`Detail Pesanan #${order.order_number} - Pos Cafe`}
            headerTitle={`Pesanan #${order.order_number}`}
            headerSubtitle={`Detail transaksi dan pembayaran`}
            activeNav="orders"
            headerActions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleOpenPrint}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[#6B4028] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#57331F]"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Struk</span>
                    </button>
                    {order.status !== 'cancelled' && (
                        <button
                            type="button"
                            onClick={handleCancelOrder}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border border-[#FADCD9] bg-[#FDF7F7] px-4 py-2 text-xs font-bold text-[#C53030] shadow-xs transition hover:bg-[#FDE8E8]"
                        >
                            <XCircle className="h-4 w-4" />
                            <span>Batalkan Pesanan</span>
                        </button>
                    )}
                    <Link
                        href="/orders"
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-2 text-xs font-bold text-[#24140E] hover:bg-[#EAE0D4]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali</span>
                    </Link>
                </div>
            }
        >
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Order Status Header Card */}
                <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-serif text-2xl font-bold text-[#24140E]">
                                #{order.order_number}
                            </h3>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === 'paid'
                                        ? 'bg-[#EAF7ED] text-[#2E7D32]'
                                        : order.status === 'pending'
                                            ? 'bg-[#FDF3E5] text-[#C07718]'
                                            : 'bg-[#FDE8E8] text-[#C53030]'
                                    }`}
                            >
                                {order.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[#7A6353]">
                            Waktu Transaksi: {order.created_at}
                        </p>
                    </div>

                    <div className="text-left sm:text-right">
                        <p className="text-xs text-[#7A6353]">Total Tagihan</p>
                        <h2 className="font-serif text-2xl font-bold text-[#6B4028]">
                            Rp{' '}
                            {new Intl.NumberFormat('id-ID').format(
                                order.total_amount,
                            )}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Customer & Cashier Info */}
                    <div className="space-y-6 md:col-span-1">
                        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs">
                            <h4 className="border-b border-[#EADCCE] pb-2 font-serif text-sm font-bold text-[#24140E]">
                                Informasi Transaksi
                            </h4>
                            <div className="mt-3 space-y-2.5 text-xs">
                                <div>
                                    <span className="text-[#8C6B56]">
                                        Pelanggan:
                                    </span>
                                    <p className="font-semibold text-[#24140E]">
                                        {order.customer?.name ||
                                            'Pelanggan Umum (Walk-in)'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[#8C6B56]">
                                        Kasir:
                                    </span>
                                    <p className="font-semibold text-[#24140E]">
                                        {order.cashier?.name || 'Kasir'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[#8C6B56]">
                                        Metode Pembayaran:
                                    </span>
                                    <p className="font-bold text-[#6B4028] uppercase">
                                        {order.payment_method}
                                    </p>
                                </div>
                                {order.notes && (
                                    <div>
                                        <span className="text-[#8C6B56]">
                                            Catatan:
                                        </span>
                                        <p className="rounded-xl bg-[#F7F2EB] p-2 font-medium text-[#24140E]">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {order.payment && (
                            <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs">
                                <h4 className="border-b border-[#EADCCE] pb-2 font-serif text-sm font-bold text-[#24140E]">
                                    Rincian Pembayaran
                                </h4>
                                <div className="mt-3 space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-[#8C6B56]">
                                            Total Bayar:
                                        </span>
                                        <span className="font-semibold text-[#24140E]">
                                            Rp{' '}
                                            {new Intl.NumberFormat(
                                                'id-ID',
                                            ).format(order.payment.amount_paid)}
                                        </span>
                                    </div>
                                    {order.payment.payment_method ===
                                        'cash' && (
                                            <div className="flex justify-between font-bold text-[#2E7D32]">
                                                <span>Kembalian:</span>
                                                <span>
                                                    Rp{' '}
                                                    {new Intl.NumberFormat(
                                                        'id-ID',
                                                    ).format(
                                                        order.payment.change_due,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    {order.payment.reference_number && (
                                        <div>
                                            <span className="text-[#8C6B56]">
                                                No. Referensi:
                                            </span>
                                            <p className="font-mono text-[11px] text-[#24140E]">
                                                {order.payment.reference_number}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Items Table */}
                    <div className="space-y-6 md:col-span-2">
                        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs">
                            <h4 className="border-b border-[#EADCCE] pb-3 font-serif text-base font-bold text-[#24140E]">
                                Item yang Dipesan
                            </h4>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left text-xs text-[#24140E]">
                                    <thead>
                                        <tr className="border-b border-[#F0E4D8] text-[11px] font-bold text-[#8C6B56] uppercase">
                                            <th className="py-2.5 pr-4">
                                                Produk
                                            </th>
                                            <th className="px-4 py-2.5 text-center">
                                                Qty
                                            </th>
                                            <th className="px-4 py-2.5 text-right">
                                                Harga
                                            </th>
                                            <th className="py-2.5 pl-4 text-right">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F5ECE2]">
                                        {order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="py-3 pr-4 font-semibold text-[#24140E]">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span>
                                                            {item.product_name}
                                                        </span>
                                                        {item.temperature ===
                                                            'hot' && (
                                                                <span className="rounded-full border border-[#FCD8CC] bg-[#FFF2ED] px-2 py-0.5 text-[10px] font-bold text-[#C84A23]">
                                                                    ☕ Panas
                                                                </span>
                                                            )}
                                                        {item.temperature ===
                                                            'ice' && (
                                                                <span className="rounded-full border border-[#CDEBF8] bg-[#EBF7FC] px-2 py-0.5 text-[10px] font-bold text-[#1F7EAA]">
                                                                    🧊 Dingin
                                                                </span>
                                                            )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-[#6B4028]">
                                                    {item.quantity}x
                                                </td>
                                                <td className="px-4 py-3 text-right text-[#7A6353]">
                                                    Rp{' '}
                                                    {new Intl.NumberFormat(
                                                        'id-ID',
                                                    ).format(item.price)}
                                                </td>
                                                <td className="py-3 pl-4 text-right font-bold text-[#24140E]">
                                                    Rp{' '}
                                                    {new Intl.NumberFormat(
                                                        'id-ID',
                                                    ).format(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Calculation */}
                            <div className="mt-6 border-t border-[#EADCCE] pt-4 text-xs">
                                <div className="ml-auto max-w-xs space-y-1.5">
                                    <div className="flex justify-between text-[#6B574B]">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-[#24140E]">
                                            Rp{' '}
                                            {new Intl.NumberFormat(
                                                'id-ID',
                                            ).format(order.subtotal)}
                                        </span>
                                    </div>
                                    {order.discount_amount > 0 && (
                                        <div className="flex justify-between text-[#A24D3D]">
                                            <span>Diskon</span>
                                            <span>
                                                -Rp{' '}
                                                {new Intl.NumberFormat(
                                                    'id-ID',
                                                ).format(order.discount_amount)}
                                            </span>
                                        </div>
                                    )}
                                    {order.tax_amount > 0 && (
                                        <div className="flex justify-between text-[#6B574B]">
                                            <span>PPN (10%)</span>
                                            <span>
                                                Rp{' '}
                                                {new Intl.NumberFormat(
                                                    'id-ID',
                                                ).format(order.tax_amount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-[#EADCCE] pt-2 text-sm font-bold text-[#24140E]">
                                        <span>TOTAL</span>
                                        <span className="text-base text-[#6B4028]">
                                            Rp{' '}
                                            {new Intl.NumberFormat(
                                                'id-ID',
                                            ).format(order.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thermal Receipt Print Modal */}
            {showReceiptModal && (
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
                                        {order.order_number}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Waktu:</span>
                                    <span>{order.created_at}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Kasir:</span>
                                    <span>{order.cashier?.name || 'Kasir'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pelanggan:</span>
                                    <span className="font-semibold text-black">
                                        {order.customer?.name || 'Pelanggan Umum (Walk-in)'}
                                    </span>
                                </div>
                            </div>

                            <p className="my-1 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                - - - - - - - - - - - - - - - - - - - - - - - -
                            </p>

                            <div className="space-y-1.5 text-[11px]">
                                {order.items.map((it, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start justify-between"
                                    >
                                        <div className="min-w-0 pr-2">
                                            <p className="font-bold leading-tight text-black">
                                                {it.product_name}
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
                                        Rp {new Intl.NumberFormat('id-ID').format(order.subtotal)}
                                    </span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between font-medium text-red-600">
                                        <span>Diskon:</span>
                                        <span>
                                            -Rp {new Intl.NumberFormat('id-ID').format(order.discount_amount)}
                                        </span>
                                    </div>
                                )}
                                {order.tax_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">PPN (10%):</span>
                                        <span>
                                            Rp {new Intl.NumberFormat('id-ID').format(order.tax_amount)}
                                        </span>
                                    </div>
                                )}
                                <p className="my-0.5 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                    ========================================
                                </p>
                                <div className="flex justify-between text-xs font-black text-black">
                                    <span>TOTAL AKHIR:</span>
                                    <span>Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</span>
                                </div>
                                <p className="my-0.5 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                    ========================================
                                </p>
                                <div className="flex justify-between text-[10px] text-gray-700">
                                    <span>Metode Bayar:</span>
                                    <span className="font-bold uppercase">{order.payment?.payment_method || order.payment_method}</span>
                                </div>
                                {order.payment && (
                                    <>
                                        <div className="flex justify-between text-[10px] text-gray-700">
                                            <span>Bayar:</span>
                                            <span className="font-bold">
                                                Rp {new Intl.NumberFormat('id-ID').format(order.payment.amount_paid)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-700">
                                            <span>Kembalian:</span>
                                            <span className="font-bold">
                                                Rp {new Intl.NumberFormat('id-ID').format(order.payment.change_due)}
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between text-[10px] text-gray-700">
                                    <span>Status:</span>
                                    <span className="font-bold text-[#2E7D32] uppercase">{order.status}</span>
                                </div>
                            </div>

                            <div className="mt-3 space-y-0.5 border-t border-dashed border-gray-300 pt-2 text-center text-[10px] text-gray-600">
                                <p className="font-bold text-black">Terima Kasih Atas Kunjungan Anda!</p>
                                <p>WiFi: Cafe_Guest / Pass: nikmatkopi</p>
                                <p className="text-[9px] text-gray-500">Instagram: @poscafe</p>
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
                                onClick={() => setShowReceiptModal(false)}
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
