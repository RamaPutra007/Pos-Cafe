import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';

interface MovementRow {
    id: number;
    product_name: string;
    sku: string;
    unit: string;
    batch_number: string;
    type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE';
    quantity: number;
    balance_after: number;
    reason: string | null;
    notes: string | null;
    user_name: string;
    created_at: string;
}

interface MovementsProps {
    movements: {
        data: MovementRow[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
    };
    filters: {
        type: string;
        search: string | null;
        date: string | null;
    };
}

export default function StockMovementsIndex({
    movements,
    filters,
}: MovementsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [date, setDate] = useState(filters.date || '');

    const handleFilter = (newOverrides: Record<string, string>) => {
        router.get(
            '/inventory/movements',
            { search, type, date, ...newOverrides },
            { preserveState: true },
        );
    };

    return (
        <PosLayout
            title="Riwayat Pergerakan Stok - Pos Cafe"
            headerTitle="Pergerakan Stok (Stock Movement)"
            headerSubtitle="Log mutasi stok otomatis untuk penjualan POS, stok masuk supplier, dan stok keluar"
            activeNav="movements"
            headerActions={
                <Link
                    href="/inventory"
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-2 text-xs font-bold text-[#24140E] hover:bg-[#EAE0D4]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Inventaris</span>
                </Link>
            }
        >
            <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="flex flex-col gap-3 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8C6B56]" />
                        <input
                            type="text"
                            placeholder="Cari nama produk atau SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleFilter({ search })
                            }
                            className="w-full rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] py-2.5 pr-4 pl-10 text-xs font-medium text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                handleFilter({ type: e.target.value });
                            }}
                            className="rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] px-3 py-2 text-xs font-medium text-[#24140E] focus:outline-none"
                        >
                            <option value="all">Semua Tipe Mutasi</option>
                            <option value="IN">Stok Masuk (IN)</option>
                            <option value="OUT">Stok Keluar (OUT)</option>
                            <option value="SALE">Penjualan POS (SALE)</option>
                            <option value="ADJUSTMENT">
                                Penyesuaian (ADJUSTMENT)
                            </option>
                        </select>

                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                handleFilter({ date: e.target.value });
                            }}
                            className="rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] px-3 py-2 text-xs font-medium text-[#24140E] focus:outline-none"
                        />

                        {(search || type !== 'all' || date) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setType('all');
                                    setDate('');
                                    router.get('/inventory/movements');
                                }}
                                className="cursor-pointer rounded-xl border border-[#D5C2B1] bg-[#F7F2EB] px-3 py-2 text-xs font-bold text-[#A24D3D] hover:bg-[#FBEBE8]"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {/* Movements Table */}
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs sm:p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#24140E]">
                            <thead>
                                <tr className="border-b border-[#F0E4D8] text-[11px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                    <th className="py-3 pr-4">Waktu</th>
                                    <th className="px-4 py-3">Produk</th>
                                    <th className="px-4 py-3">No. Batch</th>
                                    <th className="px-4 py-3">Tipe Mutasi</th>
                                    <th className="px-4 py-3">Jumlah</th>
                                    <th className="px-4 py-3">Sisa Stok</th>
                                    <th className="px-4 py-3">Oleh</th>
                                    <th className="py-3 pl-4">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5ECE2]">
                                {movements.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-10 text-center text-xs text-[#8C6B56]"
                                        >
                                            Belum ada catatan mutasi stok.
                                        </td>
                                    </tr>
                                ) : (
                                    movements.data.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="transition hover:bg-[#FDFBF7]"
                                        >
                                            <td className="py-3.5 pr-4 text-[#7A6353]">
                                                {m.created_at}
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold text-[#24140E]">
                                                {m.product_name}
                                                <span className="block font-mono text-[10px] text-[#8C6B56]">
                                                    {m.sku}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-[11px] text-[#6B574B]">
                                                {m.batch_number}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                        m.type === 'IN'
                                                            ? 'bg-[#EAF7ED] text-[#2E7D32]'
                                                            : m.type === 'OUT'
                                                              ? 'bg-[#FDE8E8] text-[#C53030]'
                                                              : m.type ===
                                                                  'SALE'
                                                                ? 'bg-[#EFE5DA] text-[#6B4028]'
                                                                : 'bg-[#FDF3E5] text-[#C07718]'
                                                    }`}
                                                >
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold">
                                                <span
                                                    className={
                                                        m.type === 'IN'
                                                            ? 'text-[#2E7D32]'
                                                            : 'text-[#C53030]'
                                                    }
                                                >
                                                    {m.type === 'IN'
                                                        ? '+'
                                                        : '-'}
                                                    {m.quantity} {m.unit}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold text-[#24140E]">
                                                {m.balance_after} {m.unit}
                                            </td>
                                            <td className="px-4 py-3.5 text-[#7A6353]">
                                                {m.user_name}
                                            </td>
                                            <td className="py-3.5 pl-4 text-[#6B574B]">
                                                {m.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {movements.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-[#F0E4D8] pt-4">
                            {movements.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                        link.active
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
        </PosLayout>
    );
}
