import { Link, router } from '@inertiajs/react';
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';

interface CustomerRow {
    id: number;
    name: string;
    phone: string;
    email: string;
    notes: string;
    orders_count: number;
    total_spent: number;
    total_spent_formatted: string;
    created_at: string;
}

interface CustomersIndexProps {
    customers: {
        data: CustomerRow[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string | null;
    };
}

export default function CustomersIndex({
    customers,
    filters,
}: CustomersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(
        null,
    );
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
    });

    const openAddModal = () => {
        setEditingCustomer(null);
        setFormData({ name: '', phone: '', email: '', notes: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (c: CustomerRow) => {
        setEditingCustomer(c);
        setFormData({
            name: c.name,
            phone: c.phone !== '-' ? c.phone : '',
            email: c.email !== '-' ? c.email : '',
            notes: c.notes !== '-' ? c.notes : '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCustomer) {
            router.put(`/customers/${editingCustomer.id}`, formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            router.post('/customers', formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (c: CustomerRow) => {
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus data pelanggan '${c.name}'?`,
            )
        ) {
            router.delete(`/customers/${c.id}`);
        }
    };

    return (
        <PosLayout
            title="Manajemen Pelanggan - Pos Cafe"
            headerTitle="Daftar Pelanggan"
            headerSubtitle="Kelola basis data pelanggan, nomor telepon, dan riwayat loyalitas belanja"
            activeNav="customers"
            headerActions={
                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[#6B4028] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#57331F]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Pelanggan</span>
                </button>
            }
        >
            <div className="space-y-6">
                {/* Search Bar */}
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-4 shadow-xs">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8C6B56]" />
                        <input
                            type="text"
                            placeholder="Cari nama, no. HP, atau email pelanggan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' &&
                                router.get(
                                    '/customers',
                                    { search },
                                    { preserveState: true },
                                )
                            }
                            className="w-full rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] py-2.5 pr-4 pl-10 text-xs font-medium text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white focus:outline-none"
                        />
                    </div>
                </div>

                {/* Customers Table */}
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs sm:p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#24140E]">
                            <thead>
                                <tr className="border-b border-[#F0E4D8] text-[11px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                    <th className="py-3 pr-4">
                                        Nama Pelanggan
                                    </th>
                                    <th className="px-4 py-3">
                                        Kontak (HP/Email)
                                    </th>
                                    <th className="px-4 py-3">
                                        Jumlah Transaksi
                                    </th>
                                    <th className="px-4 py-3">Total Belanja</th>
                                    <th className="px-4 py-3">Catatan</th>
                                    <th className="py-3 pl-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5ECE2]">
                                {customers.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-10 text-center text-xs text-[#8C6B56]"
                                        >
                                            Tidak ada pelanggan yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.data.map((c) => (
                                        <tr
                                            key={c.id}
                                            className="transition hover:bg-[#FDFBF7]"
                                        >
                                            <td className="py-3.5 pr-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5A3726] text-xs font-bold text-[#FAF3EB]">
                                                        {c.name
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-[#24140E]">
                                                        {c.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-[#7A6353]">
                                                <div>{c.phone}</div>
                                                <div className="text-[10px] text-[#8C6B56]">
                                                    {c.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="rounded-lg bg-[#F7F2EB] px-2 py-0.5 text-[11px] font-semibold text-[#6B574B]">
                                                    {c.orders_count} pesanan
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-[#6B4028]">
                                                {c.total_spent_formatted}
                                            </td>
                                            <td className="px-4 py-3.5 text-[#7A6353]">
                                                {c.notes}
                                            </td>
                                            <td className="py-3.5 pl-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(c)
                                                        }
                                                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#D5C2B1] bg-white text-[#24140E] transition hover:bg-[#F5EFEB]"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(c)
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

                    {/* Pagination */}
                    {customers.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-[#F0E4D8] pt-4">
                            {customers.links.map((link, idx) => (
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

            {/* ================= MODAL: ADD / EDIT CUSTOMER ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-[#E2D4C6] bg-[#FFFDF9] p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                            <h3 className="font-serif text-xl font-bold text-[#24140E]">
                                {editingCustomer
                                    ? 'Edit Data Pelanggan'
                                    : 'Tambah Pelanggan Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="cursor-pointer text-[#8C6B56] hover:text-[#24140E]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-4 space-y-3.5"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="cth. Sarah Jenkins"
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Nomor Telepon / WhatsApp
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    placeholder="cth. 081234567890"
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Email (Opsional)
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="cth. sarah@example.com"
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Catatan / Preferensi Kopi
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    placeholder="Suka oat milk, langganan meja 4..."
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-[#EADCCE] pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="cursor-pointer rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-2.5 text-xs font-bold text-[#24140E] hover:bg-[#EAE0D4]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="cursor-pointer rounded-2xl bg-[#6B4028] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#57331F]"
                                >
                                    Simpan Pelanggan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PosLayout>
    );
}
