import { router } from '@inertiajs/react';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';

interface CashierRow {
    id: number;
    name: string;
    email: string;
    role: string;
    terminal: string;
    orders_count: number;
    created_at: string;
}

interface CashiersIndexProps {
    cashiers: CashierRow[];
}

export default function CashiersIndex({ cashiers }: CashiersIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<CashierRow | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: 'kasir123' });
        setIsModalOpen(true);
    };

    const openEditModal = (u: CashierRow) => {
        setEditingUser(u);
        setFormData({ name: u.name, email: u.email, password: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            router.put(`/cashiers/${editingUser.id}`, formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            router.post('/cashiers', formData, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (u: CashierRow) => {
        if (
            confirm(`Apakah Anda yakin ingin menghapus akun kasir '${u.name}'?`)
        ) {
            router.delete(`/cashiers/${u.id}`);
        }
    };

    return (
        <PosLayout
            title="Manajemen Kasir - Pos Cafe"
            headerTitle="Manajemen Staf Kasir"
            headerSubtitle="Kelola data staf kasir, kredensial login, dan penugasan meja kasir kafe"
            activeNav="cashiers"
            headerActions={
                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[#6B4028] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#57331F]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Kasir</span>
                </button>
            }
        >
            <div className="space-y-6">
                {/* Cashiers Table */}
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs sm:p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#24140E]">
                            <thead>
                                <tr className="border-b border-[#F0E4D8] text-[11px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                    <th className="py-3 pr-4">
                                        Nama Staf Kasir
                                    </th>
                                    <th className="px-4 py-3">Email Login</th>
                                    <th className="px-4 py-3">
                                        Posisi Meja Kasir
                                    </th>
                                    <th className="px-4 py-3">
                                        Total Pesanan Diproses
                                    </th>
                                    <th className="px-4 py-3">
                                        Terdaftar Sejak
                                    </th>
                                    <th className="py-3 pl-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5ECE2]">
                                {cashiers.map((c) => (
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
                                                <div>
                                                    <span className="font-bold text-[#24140E]">
                                                        {c.name}
                                                    </span>
                                                    <span className="block text-[10px] text-[#8C6B56] capitalize">
                                                        {c.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-[#7A6353]">
                                            {c.email}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#EAF7ED] px-2 py-0.5 text-[11px] font-bold text-[#2E7D32]">
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
                                                {c.terminal}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-[#6B4028]">
                                            {c.orders_count} transaksi
                                        </td>
                                        <td className="px-4 py-3.5 text-[#7A6353]">
                                            {c.created_at}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ================= MODAL: ADD / EDIT CASHIER ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-[#E2D4C6] bg-[#FFFDF9] p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                            <h3 className="font-serif text-xl font-bold text-[#24140E]">
                                {editingUser
                                    ? 'Edit Akun Kasir'
                                    : 'Tambah Akun Kasir Baru'}
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
                                    Nama Staf
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
                                    placeholder="cth. Michael Roy"
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Email Login
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="cth. michael@gmail.com"
                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-3 py-2 text-xs text-[#24140E] focus:border-[#6B4028] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                    Password{' '}
                                    {editingUser &&
                                        '(Kosongkan jika tidak diubah)'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder="Minimal 6 karakter..."
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
                                    Simpan Akun
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PosLayout>
    );
}
