import { router } from '@inertiajs/react';
import {
    Coffee,
    Edit2,
    Flame,
    FolderPlus,
    Plus,
    Power,
    Search,
    Snowflake,
    Trash2,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    products_count: number;
}

interface ProductItem {
    id: number;
    category_id: number;
    category_name: string;
    name: string;
    sku: string;
    description: string | null;
    purchase_price: number;
    selling_price: number;
    unit: string;
    temperature_option: 'none' | 'both' | 'hot_only' | 'ice_only';
    image: string | null;
    is_active: boolean;
    current_stock: number;
    min_stock: number;
    rack_location: string | null;
}

interface MenusIndexProps {
    products: ProductItem[];
    categories: CategoryItem[];
    filters: {
        search: string | null;
        category_id: string;
    };
}

export default function MenusIndex({
    products,
    categories,
    filters,
}: MenusIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category_id || 'all',
    );

    // Modal Add / Edit Product State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
        null,
    );
    const [productForm, setProductForm] = useState<{
        category_id: number;
        name: string;
        sku: string;
        description: string;
        purchase_price: number;
        selling_price: number;
        unit: string;
        temperature_option: 'none' | 'both' | 'hot_only' | 'ice_only';
        current_stock: number;
        min_stock: number;
        rack_location: string;
        is_active: boolean;
    }>({
        category_id: categories[0]?.id || 1,
        name: '',
        sku: '',
        description: '',
        purchase_price: 0,
        selling_price: 0,
        unit: 'cup',
        temperature_option: 'both',
        current_stock: 10,
        min_stock: 5,
        rack_location: 'Bar 1',
        is_active: true,
    });

    // Modal Add Category State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDesc, setCategoryDesc] = useState('');

    const openAddProductModal = () => {
        setEditingProduct(null);
        setProductForm({
            category_id: categories[0]?.id || 1,
            name: '',
            sku: `COF-${Date.now().toString().slice(-4)}`,
            description: '',
            purchase_price: 12000,
            selling_price: 30000,
            unit: 'cup',
            temperature_option: 'both',
            current_stock: 20,
            min_stock: 5,
            rack_location: 'Bar 1',
            is_active: true,
        });
        setIsProductModalOpen(true);
    };

    const openEditProductModal = (prod: ProductItem) => {
        setEditingProduct(prod);
        setProductForm({
            category_id: prod.category_id,
            name: prod.name,
            sku: prod.sku,
            description: prod.description || '',
            purchase_price: prod.purchase_price,
            selling_price: prod.selling_price,
            unit: prod.unit,
            temperature_option: prod.temperature_option || 'none',
            current_stock: prod.current_stock,
            min_stock: prod.min_stock,
            rack_location: prod.rack_location || 'Bar 1',
            is_active: prod.is_active,
        });
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            router.put(`/menus/${editingProduct.id}`, productForm, {
                onSuccess: () => setIsProductModalOpen(false),
            });
        } else {
            router.post('/menus', productForm, {
                onSuccess: () => setIsProductModalOpen(false),
            });
        }
    };

    const handleToggleStatus = (prod: ProductItem) => {
        router.post(`/menus/${prod.id}/toggle`);
    };

    const handleDeleteProduct = (prod: ProductItem) => {
        if (confirm(`Apakah Anda yakin ingin menghapus menu '${prod.name}'?`)) {
            router.delete(`/menus/${prod.id}`);
        }
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryName) {
            return;
        }

        router.post(
            '/categories',
            { name: categoryName, description: categoryDesc },
            {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    setCategoryName('');
                    setCategoryDesc('');
                },
            },
        );
    };

    // Filter products
    const filteredProducts = products.filter((p) => {
        const matchCat =
            selectedCategory === 'all' ||
            p.category_id.toString() === selectedCategory;
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());

        return matchCat && matchSearch;
    });

    const getTempBadge = (opt: string) => {
        switch (opt) {
            case 'both':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#E8D7C8] bg-[#FAF3EC] px-2.5 py-0.5 text-[11px] font-bold text-[#8C4A27]">
                        <span>☕ Panas</span>
                        <span className="text-[#A47E65]">/</span>
                        <span>🧊 Dingin</span>
                    </span>
                );
            case 'hot_only':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#FCD8CC] bg-[#FFF2ED] px-2 py-0.5 text-[10px] font-bold text-[#C84A23]">
                        <Flame className="h-3 w-3" />
                        <span>Hanya Panas</span>
                    </span>
                );
            case 'ice_only':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#CDEBF8] bg-[#EBF7FC] px-2 py-0.5 text-[10px] font-bold text-[#1F7EAA]">
                        <Snowflake className="h-3 w-3" />
                        <span>Hanya Dingin</span>
                    </span>
                );
            default:
                return <span className="text-[11px] text-[#A69182]">—</span>;
        }
    };

    return (
        <PosLayout
            title="Manajemen Menu & Kategori - Pos Cafe"
            headerTitle="Manajemen Menu & Kategori"
            headerSubtitle="Kelola daftar produk minuman, makanan, opsi suhu (panas/dingin) & harga"
            activeNav="menus"
            headerActions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-3.5 py-2 text-xs font-bold text-[#24140E] transition hover:bg-[#EAE0D4]"
                    >
                        <FolderPlus className="h-4 w-4 text-[#6B4028]" />
                        <span>Kategori</span>
                    </button>
                    <button
                        type="button"
                        onClick={openAddProductModal}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[#6B4028] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#57331F]"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Tambah Menu</span>
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Filter and Categories Overview */}
                <div className="flex flex-col gap-3 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8C6B56]" />
                        <input
                            type="text"
                            placeholder="Cari nama menu atau SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] py-2.5 pr-4 pl-10 text-xs font-medium text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white focus:outline-none"
                        />
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                selectedCategory === 'all'
                                    ? 'bg-[#6B4028] text-white shadow-xs'
                                    : 'border border-[#E2D4C6] bg-[#F7F2EB] text-[#6B574B] hover:bg-[#EFE8DF]'
                            }`}
                        >
                            Semua ({products.length})
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() =>
                                    setSelectedCategory(cat.id.toString())
                                }
                                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                    selectedCategory === cat.id.toString()
                                        ? 'bg-[#6B4028] text-white shadow-xs'
                                        : 'border border-[#E2D4C6] bg-[#F7F2EB] text-[#6B574B] hover:bg-[#EFE8DF]'
                                }`}
                            >
                                {cat.name} ({cat.products_count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Table */}
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs sm:p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#24140E]">
                            <thead>
                                <tr className="border-b border-[#F0E4D8] text-[11px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                    <th className="py-3 pr-4">Menu & SKU</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">Opsi Suhu</th>
                                    <th className="px-4 py-3">Harga Modal</th>
                                    <th className="px-4 py-3">Harga Jual</th>
                                    <th className="px-4 py-3">Stok</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="py-3 pl-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5ECE2]">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="py-12 text-center"
                                        >
                                            <Coffee className="mx-auto mb-3 h-10 w-10 text-[#C5B4A5]" />
                                            <h4 className="font-serif text-base font-bold text-[#24140E]">
                                                Belum Ada Menu Terdaftar
                                            </h4>
                                            <p className="mx-auto mt-1 mb-4 max-w-sm text-xs text-[#8C6B56]">
                                                Daftarkan menu pertama cafe Anda
                                                beserta opsi suhu, harga jual,
                                                dan stok awal.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={openAddProductModal}
                                                className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#6B4028] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#57331F]"
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span>
                                                    Tambah Menu & Stok Pertama
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="transition hover:bg-[#FDFBF7]"
                                        >
                                            <td className="py-3.5 pr-4">
                                                <div>
                                                    <span className="font-bold text-[#24140E]">
                                                        {p.name}
                                                    </span>
                                                    <p className="font-mono text-[10px] text-[#8C6B56]">
                                                        {p.sku}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-[#7A6353]">
                                                {p.category_name}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {getTempBadge(
                                                    p.temperature_option,
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-[#7A6353]">
                                                Rp{' '}
                                                {new Intl.NumberFormat(
                                                    'id-ID',
                                                ).format(p.purchase_price)}
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-[#6B4028]">
                                                Rp{' '}
                                                {new Intl.NumberFormat(
                                                    'id-ID',
                                                ).format(p.selling_price)}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span
                                                    className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                                                        p.current_stock <=
                                                        p.min_stock
                                                            ? 'bg-[#FDE8E8] text-[#C53030]'
                                                            : 'bg-[#F7F2EB] text-[#2E7D32]'
                                                    }`}
                                                >
                                                    {p.current_stock} {p.unit}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleStatus(p)
                                                    }
                                                    className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                                                        p.is_active
                                                            ? 'bg-[#EAF7ED] text-[#2E7D32] hover:bg-[#D5EEDB]'
                                                            : 'bg-[#F5ECE2] text-[#8C6B56] hover:bg-[#EAE0D4]'
                                                    }`}
                                                >
                                                    <Power className="h-3 w-3" />
                                                    <span>
                                                        {p.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="py-3.5 pl-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditProductModal(
                                                                p,
                                                            )
                                                        }
                                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#D5C2B1] bg-white text-[#24140E] transition hover:bg-[#F5EFEB]"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteProduct(
                                                                p,
                                                            )
                                                        }
                                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#FADCD9] bg-[#FDF7F7] text-[#C53030] transition hover:bg-[#FDE8E8]"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
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

            {/* ================= MODAL 1: ADD/EDIT PRODUCT ================= */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#E2D4C6] bg-[#FFFDF9] p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                            <h3 className="font-serif text-xl font-bold text-[#24140E]">
                                {editingProduct
                                    ? 'Edit Menu'
                                    : 'Tambah Menu Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsProductModalOpen(false)}
                                className="cursor-pointer text-[#8C6B56] hover:text-[#24140E]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveProduct}
                            className="mt-4 space-y-3.5"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Nama Menu
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.name}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="cth. Flat White / Matcha Latte"
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        SKU (Kode Unik)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.sku}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                sku: e.target.value,
                                            })
                                        }
                                        placeholder="cth. COF-FLW-01"
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Kategori
                                    </label>
                                    <select
                                        value={productForm.category_id}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                category_id: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Satuan
                                    </label>
                                    <select
                                        value={productForm.unit}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                unit: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    >
                                        <option value="cup">cup</option>
                                        <option value="pcs">pcs</option>
                                        <option value="porsi">porsi</option>
                                        <option value="botol">botol</option>
                                        <option value="unit">unit</option>
                                        <option value="kg">kg</option>
                                    </select>
                                </div>
                            </div>

                            {/* Fitur Opsi Suhu (Hot / Ice) */}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-[#24140E]">
                                    Fitur Opsi Suhu Minuman (Panas / Dingin)
                                </label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setProductForm({
                                                ...productForm,
                                                temperature_option: 'both',
                                            })
                                        }
                                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border p-2.5 text-center transition ${
                                            productForm.temperature_option ===
                                            'both'
                                                ? 'border-[#6B4028] bg-[#FAF3EC] font-bold text-[#6B4028] shadow-xs'
                                                : 'border-[#E2D4C6] bg-white text-[#7A6353] hover:bg-[#FAF6F2]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-0.5 text-xs">
                                            <span>☕</span>
                                            <span>/</span>
                                            <span>🧊</span>
                                        </div>
                                        <span className="text-[11px]">
                                            Bisa Panas & Dingin
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setProductForm({
                                                ...productForm,
                                                temperature_option: 'hot_only',
                                            })
                                        }
                                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border p-2.5 text-center transition ${
                                            productForm.temperature_option ===
                                            'hot_only'
                                                ? 'border-[#C84A23] bg-[#FFF2ED] font-bold text-[#C84A23] shadow-xs'
                                                : 'border-[#E2D4C6] bg-white text-[#7A6353] hover:bg-[#FAF6F2]'
                                        }`}
                                    >
                                        <Flame className="h-4 w-4 text-[#C84A23]" />
                                        <span className="text-[11px]">
                                            Hanya Panas
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setProductForm({
                                                ...productForm,
                                                temperature_option: 'ice_only',
                                            })
                                        }
                                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border p-2.5 text-center transition ${
                                            productForm.temperature_option ===
                                            'ice_only'
                                                ? 'border-[#1F7EAA] bg-[#EBF7FC] font-bold text-[#1F7EAA] shadow-xs'
                                                : 'border-[#E2D4C6] bg-white text-[#7A6353] hover:bg-[#FAF6F2]'
                                        }`}
                                    >
                                        <Snowflake className="h-4 w-4 text-[#1F7EAA]" />
                                        <span className="text-[11px]">
                                            Hanya Dingin
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setProductForm({
                                                ...productForm,
                                                temperature_option: 'none',
                                            })
                                        }
                                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border p-2.5 text-center transition ${
                                            productForm.temperature_option ===
                                            'none'
                                                ? 'border-[#8C7565] bg-[#F5ECE2] font-bold text-[#4A372C] shadow-xs'
                                                : 'border-[#E2D4C6] bg-white text-[#7A6353] hover:bg-[#FAF6F2]'
                                        }`}
                                    >
                                        <span className="font-mono text-xs">
                                            —
                                        </span>
                                        <span className="text-[11px]">
                                            Non-Minuman
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Harga Modal (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={productForm.purchase_price}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
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
                                        Harga Jual (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={productForm.selling_price}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                selling_price:
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Stok Awal
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={productForm.current_stock}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                current_stock:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                        Batas Stok Minimum
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={productForm.min_stock}
                                        onChange={(e) =>
                                            setProductForm({
                                                ...productForm,
                                                min_stock:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            })
                                        }
                                        className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Deskripsi Singkat
                                </label>
                                <textarea
                                    rows={2}
                                    value={productForm.description}
                                    onChange={(e) =>
                                        setProductForm({
                                            ...productForm,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="cth. Perpaduan espresso ganda dengan susu segar..."
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#EADCCE] pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="cursor-pointer rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-2.5 text-xs font-bold text-[#24140E] hover:bg-[#EAE0D4]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="cursor-pointer rounded-2xl bg-[#6B4028] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#57331F]"
                                >
                                    {editingProduct
                                        ? 'Simpan Perubahan'
                                        : 'Simpan Menu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL 2: ADD CATEGORY ================= */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-[#E2D4C6] bg-[#FFFDF9] p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                            <h3 className="font-serif text-xl font-bold text-[#24140E]">
                                Tambah Kategori Baru
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="cursor-pointer text-[#8C6B56] hover:text-[#24140E]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveCategory}
                            className="mt-4 space-y-3.5"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Nama Kategori
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={categoryName}
                                    onChange={(e) =>
                                        setCategoryName(e.target.value)
                                    }
                                    placeholder="cth. Manual Brew / Dessert"
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={categoryDesc}
                                    onChange={(e) =>
                                        setCategoryDesc(e.target.value)
                                    }
                                    placeholder="Penjelasan singkat kategori..."
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#EADCCE] pt-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsCategoryModalOpen(false)
                                    }
                                    className="cursor-pointer rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-2.5 text-xs font-bold text-[#24140E] hover:bg-[#EAE0D4]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="cursor-pointer rounded-2xl bg-[#6B4028] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#57331F]"
                                >
                                    Simpan Kategori
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PosLayout>
    );
}
