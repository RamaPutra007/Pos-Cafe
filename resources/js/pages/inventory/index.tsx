import { Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Boxes,
    Download,
    Package,
    Plus,
    Search,
    Upload,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';

interface BatchItem {
    id: number;
    batch_number: string;
    current_qty: number;
    expired_at: string;
    supplier: string;
}

interface InventoryProduct {
    id: number;
    name: string;
    sku: string;
    category_name: string;
    current_stock: number;
    min_stock: number;
    unit: string;
    purchase_price: number;
    selling_price: number;
    rack_location: string;
    is_low_stock: boolean;
    batches_count: number;
    batches: BatchItem[];
}

interface InventoryIndexProps {
    products: InventoryProduct[];
    summary: {
        total_items: number;
        low_stock_count: number;
        total_valuation: number;
        total_valuation_formatted: string;
    };
    filters: {
        search: string | null;
        filter: string;
    };
}

export default function InventoryIndex({
    products,
    summary,
    filters,
}: InventoryIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedFilter, setSelectedFilter] = useState(
        filters.filter || 'all',
    );

    // Modal Stock In (Stok Masuk) State
    const [isStockInOpen, setIsStockInOpen] = useState(false);
    const [stockInForm, setStockInForm] = useState({
        product_id: products[0]?.id || 1,
        quantity: 10,
        batch_number: '',
        purchase_price: 0,
        received_at: new Date().toISOString().slice(0, 10),
        expired_at: '',
        supplier: 'PT Suplai Kopi Nusantara',
        notes: '',
    });

    // Modal Stock Out (Stok Keluar) State
    const [isStockOutOpen, setIsStockOutOpen] = useState(false);
    const [stockOutForm, setStockOutForm] = useState({
        product_id: products[0]?.id || 1,
        quantity: 1,
        reason: 'damage',
        notes: '',
    });

    const openStockInModal = (productId?: number) => {
        if (products.length === 0) {
            router.visit('/menus');

            return;
        }

        const prod = products.find((p) => p.id === productId) || products[0];
        setStockInForm({
            product_id: prod?.id || 1,
            quantity: 10,
            batch_number: '',
            purchase_price: prod?.purchase_price || 0,
            received_at: '',
            expired_at: '',
            supplier: 'PT Suplai Kopi Nusantara',
            notes: 'Restok barang masuk',
        });
        setIsStockInOpen(true);
    };

    const openStockOutModal = (productId?: number) => {
        if (products.length === 0) {
            router.visit('/menus');

            return;
        }

        const prod = products.find((p) => p.id === productId) || products[0];
        setStockOutForm({
            product_id: prod?.id || 1,
            quantity: 1,
            reason: 'damage',
            notes: '',
        });
        setIsStockOutOpen(true);
    };

    const handleStockInSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/inventory/stock-in', stockInForm, {
            onSuccess: () => setIsStockInOpen(false),
        });
    };

    const handleStockOutSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/inventory/stock-out', stockOutForm, {
            onSuccess: () => setIsStockOutOpen(false),
        });
    };

    const handleFilterChange = (filterVal: string) => {
        setSelectedFilter(filterVal);
        router.get(
            '/inventory',
            { search, filter: filterVal },
            { preserveState: true },
        );
    };

    const filteredProducts = products.filter((p) => {
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());
        const matchLow = selectedFilter === 'low_stock' ? p.is_low_stock : true;

        return matchSearch && matchLow;
    });

    return (
        <PosLayout
            title="Inventaris & Batch - Pos Cafe"
            headerTitle="Inventaris & Stok"
            headerSubtitle="Pantau stok saat ini, kelola stok masuk/keluar, nomor batch & alert stok menipis"
            activeNav="inventory"
        >
            <div className="space-y-6">
                {/* 3 Top Summary Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Total Item Menu
                                </p>
                                <h3 className="mt-1 font-serif text-2xl font-bold text-[#24140E]">
                                    {summary.total_items} Menu Terdaftar
                                </h3>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFE5DA] text-[#6B4028]">
                                <Package className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Peringatan Stok Rendah
                                </p>
                                <h3 className="mt-1 font-serif text-2xl font-bold text-[#C53030]">
                                    {summary.low_stock_count} Item Menipis
                                </h3>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDE8E8] text-[#C53030]">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-[#7A6353]">
                                    Estimasi Valuasi Stok
                                </p>
                                <h3 className="mt-1 font-serif text-2xl font-bold text-[#2E7D32]">
                                    {summary.total_valuation_formatted}
                                </h3>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7ED] text-[#2E7D32]">
                                <Boxes className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-3 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8C6B56]" />
                        <input
                            type="text"
                            placeholder="Cari item inventaris atau SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] py-2.5 pr-4 pl-10 text-xs font-medium text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('all')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                selectedFilter === 'all'
                                    ? 'bg-[#6B4028] text-white shadow-xs'
                                    : 'border border-[#E2D4C6] bg-[#F7F2EB] text-[#6B574B]'
                            }`}
                        >
                            Semua Stok
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('low_stock')}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                selectedFilter === 'low_stock'
                                    ? 'bg-[#C53030] text-white shadow-xs'
                                    : 'border border-[#FADCD9] bg-[#FDF7F7] text-[#C53030]'
                            }`}
                        >
                            ⚠️ Stok Rendah ({summary.low_stock_count})
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs sm:p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#24140E]">
                            <thead>
                                <tr className="border-b border-[#F0E4D8] text-[11px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                    <th className="py-3 pr-4">Produk & SKU</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">Lokasi Rak</th>
                                    <th className="px-4 py-3">Stok Saat Ini</th>
                                    <th className="px-4 py-3">Min. Stok</th>
                                    <th className="px-4 py-3">
                                        Batch Terhubung
                                    </th>
                                    <th className="py-3 pl-4 text-center">
                                        Aksi Cepat
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5ECE2]">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-12 text-center"
                                        >
                                            <Boxes className="mx-auto mb-3 h-10 w-10 text-[#C5B4A5]" />
                                            <h4 className="font-serif text-base font-bold text-[#24140E]">
                                                Belum Ada Menu / Stok Produk
                                            </h4>
                                            <p className="mx-auto mt-1 mb-4 max-w-sm text-xs text-[#8C6B56]">
                                                Tambahkan menu baru lengkap
                                                dengan stok awal untuk mulai
                                                mencatat inventaris cafe Anda.
                                            </p>
                                            <Link
                                                href="/menus"
                                                className="inline-flex items-center gap-2 rounded-2xl bg-[#6B4028] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#57331F]"
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span>
                                                    Tambah Menu & Stok Sekarang
                                                </span>
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((prod) => (
                                        <tr
                                            key={prod.id}
                                            className="transition hover:bg-[#FDFBF7]"
                                        >
                                            <td className="py-3.5 pr-4">
                                                <div>
                                                    <span className="font-bold text-[#24140E]">
                                                        {prod.name}
                                                    </span>
                                                    <p className="font-mono text-[10px] text-[#8C6B56]">
                                                        {prod.sku}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-[#7A6353]">
                                                {prod.category_name}
                                            </td>
                                            <td className="px-4 py-3.5 text-[#7A6353]">
                                                {prod.rack_location}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`inline-block rounded-xl px-2.5 py-1 text-xs font-extrabold ${
                                                        prod.is_low_stock
                                                            ? 'bg-[#FDE8E8] text-[#C53030]'
                                                            : 'bg-[#EAF7ED] text-[#2E7D32]'
                                                    }`}
                                                >
                                                    {prod.current_stock}{' '}
                                                    {prod.unit}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold text-[#8C6B56]">
                                                {prod.min_stock} {prod.unit}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-[#F7F2EB] px-2 py-0.5 font-mono text-[11px] font-bold text-[#6B4028]">
                                                    {prod.batches_count} batch
                                                    aktif
                                                </span>
                                            </td>
                                            <td className="py-3.5 pl-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openStockInModal(
                                                                prod.id,
                                                            )
                                                        }
                                                        title="Tambah Stok Masuk"
                                                        className="flex h-8 items-center gap-1 rounded-xl bg-[#2E7D32] px-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#256629]"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                        <span>Restok</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openStockOutModal(
                                                                prod.id,
                                                            )
                                                        }
                                                        title="Catat Stok Keluar"
                                                        className="flex h-8 items-center gap-1 rounded-xl border border-[#FADCD9] bg-[#FFF8F8] px-2.5 text-xs font-bold text-[#C53030] transition hover:bg-[#FDE8E8]"
                                                    >
                                                        <Upload className="h-3.5 w-3.5" />
                                                        <span>Keluar</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ================= MODAL: STOK MASUK (STOCK IN) ================= */}
            {isStockInOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-[#E2D4C6] bg-[#FFFDF9] p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                            <h3 className="font-serif text-xl font-bold text-[#24140E]">
                                Catat Stok Masuk (Stock In)
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsStockInOpen(false)}
                                className="cursor-pointer text-[#8C6B56] hover:text-[#24140E]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleStockInSubmit}
                            className="mt-4 space-y-3.5"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Pilih Produk Menu
                                </label>
                                <select
                                    value={stockInForm.product_id}
                                    onChange={(e) => {
                                        const pid = parseInt(e.target.value);
                                        const prod = products.find(
                                            (p) => p.id === pid,
                                        );
                                        setStockInForm({
                                            ...stockInForm,
                                            product_id: pid,
                                            purchase_price:
                                                prod?.purchase_price || 0,
                                        });
                                    }}
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sku}) - Stok saat ini:{' '}
                                            {p.current_stock} {p.unit}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Jumlah Masuk
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={stockInForm.quantity}
                                        onChange={(e) =>
                                            setStockInForm({
                                                ...stockInForm,
                                                quantity:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Nomor Batch
                                    </label>
                                    <input
                                        type="text"
                                        value={stockInForm.batch_number}
                                        onChange={(e) =>
                                            setStockInForm({
                                                ...stockInForm,
                                                batch_number: e.target.value,
                                            })
                                        }
                                        placeholder="cth. BATCH-2026-08"
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Harga Beli / Unit (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={stockInForm.purchase_price}
                                        onChange={(e) =>
                                            setStockInForm({
                                                ...stockInForm,
                                                purchase_price:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Supplier
                                    </label>
                                    <input
                                        type="text"
                                        value={stockInForm.supplier}
                                        onChange={(e) =>
                                            setStockInForm({
                                                ...stockInForm,
                                                supplier: e.target.value,
                                            })
                                        }
                                        placeholder="Nama supplier..."
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Tanggal Diterima
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={stockInForm.received_at}
                                        onChange={(e) =>
                                            setStockInForm({
                                                ...stockInForm,
                                                received_at: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Expired Date (Opsional)
                                    </label>
                                    <input
                                        type="date"
                                        value={stockInForm.expired_at}
                                        onChange={(e) =>
                                            setStockInForm({
                                                ...stockInForm,
                                                expired_at: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Catatan / Keterangan
                                </label>
                                <textarea
                                    rows={2}
                                    value={stockInForm.notes}
                                    onChange={(e) =>
                                        setStockInForm({
                                            ...stockInForm,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="cth. Pengiriman PO #418..."
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#EADCCE] pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsStockInOpen(false)}
                                    className="cursor-pointer rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-2.5 text-xs font-bold text-[#24140E] hover:bg-[#EAE0D4]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="cursor-pointer rounded-2xl bg-[#6B4028] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#57331F]"
                                >
                                    Simpan Stok Masuk
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: STOK KELUAR (STOCK OUT) ================= */}
            {isStockOutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-[#E2D4C6] bg-[#FFFDF9] p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                            <h3 className="font-serif text-xl font-bold text-[#24140E]">
                                Catat Stok Keluar (Stock Out)
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsStockOutOpen(false)}
                                className="cursor-pointer text-[#8C6B56] hover:text-[#24140E]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleStockOutSubmit}
                            className="mt-4 space-y-3.5"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Pilih Produk Menu
                                </label>
                                <select
                                    value={stockOutForm.product_id}
                                    onChange={(e) =>
                                        setStockOutForm({
                                            ...stockOutForm,
                                            product_id: parseInt(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                >
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sku}) - Stok saat ini:{' '}
                                            {p.current_stock} {p.unit}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Jumlah Keluar
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={stockOutForm.quantity}
                                        onChange={(e) =>
                                            setStockOutForm({
                                                ...stockOutForm,
                                                quantity:
                                                    parseInt(e.target.value) ||
                                                    1,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Alasan Pengeluaran
                                    </label>
                                    <select
                                        value={stockOutForm.reason}
                                        onChange={(e) =>
                                            setStockOutForm({
                                                ...stockOutForm,
                                                reason: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    >
                                        <option value="damage">
                                            Barang Rusak / Pecah
                                        </option>
                                        <option value="expired">
                                            Kadaluarsa / Basi
                                        </option>
                                        <option value="internal_use">
                                            Konsumsi Internal / Trial
                                        </option>
                                        <option value="correction">
                                            Penyesuaian Opname
                                        </option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Catatan / Alasan Rinci
                                </label>
                                <textarea
                                    rows={2}
                                    value={stockOutForm.notes}
                                    onChange={(e) =>
                                        setStockOutForm({
                                            ...stockOutForm,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="cth. Kemasan bocor saat barista restok..."
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#EADCCE] pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsStockOutOpen(false)}
                                    className="cursor-pointer rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-2.5 text-xs font-bold text-[#24140E] hover:bg-[#EAE0D4]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="cursor-pointer rounded-2xl bg-[#C53030] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#9B2424]"
                                >
                                    Simpan Stok Keluar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PosLayout>
    );
}
