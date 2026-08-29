import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Shield, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import PosLayout from '@/layouts/pos-layout';
import type { Auth } from '@/types';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const { auth } = usePage<{ auth: Auth }>().props;

    const navTabs = [
        {
            title: 'Profil Pengguna',
            subtitle: 'Nama, email & info akun',
            href: '/settings/profile',
            icon: User,
            isActive: url.startsWith('/settings/profile'),
        },
        {
            title: 'Keamanan & Sandi',
            subtitle: 'Password, 2FA & Passkey',
            href: '/settings/security',
            icon: Shield,
            isActive: url.startsWith('/settings/security'),
        },
    ];

    return (
        <PosLayout
            title="Pengaturan Akun - POS Cafe Artisan"
            headerTitle="Pengaturan Akun"
            headerSubtitle="Kelola profil kasir/admin, keamanan sandi, dan preferensi antarmuka"
            activeNav="settings"
        >
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Account Summary Banner */}
                <div className="flex flex-col gap-4 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5A3726] text-base font-bold text-[#FAF3EB] shadow-xs">
                            {auth?.user?.name
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2) || 'AD'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                    {auth?.user?.name || 'Pengguna POS Cafe'}
                                </h3>
                                <span className="rounded-full border border-[#E8D7C8] bg-[#FAF3EC] px-2.5 py-0.5 text-[10px] font-extrabold text-[#8C4A27] uppercase">
                                    {auth?.user?.role || 'Admin'}
                                </span>
                            </div>
                            <p className="text-xs text-[#7A6353]">
                                {auth?.user?.email || 'admin@gmail.com'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-xl bg-[#EAF7ED] px-3 py-1 text-xs font-semibold text-[#2E7D32]">
                            <span className="h-2 w-2 rounded-full bg-[#2E7D32]" />
                            Akun Aktif & Terverifikasi
                        </span>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-[#E5D6C7] pb-2">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`group relative flex cursor-pointer items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition duration-200 ${
                                    tab.isActive
                                        ? 'bg-[#6B4028] text-white shadow-sm'
                                        : 'border border-[#E5D6C7] bg-[#FFFDF9] text-[#6B574B] hover:border-[#6B4028] hover:bg-[#F7F2EB] hover:text-[#24140E]'
                                }`}
                            >
                                <Icon
                                    className={`h-4 w-4 ${
                                        tab.isActive
                                            ? 'text-white'
                                            : 'text-[#8C6B56] group-hover:text-[#6B4028]'
                                    }`}
                                />
                                <div className="text-left">
                                    <div className="leading-tight font-bold">
                                        {tab.title}
                                    </div>
                                    <div
                                        className={`text-[10px] font-normal ${
                                            tab.isActive
                                                ? 'text-[#FAF3EB]/80'
                                                : 'text-[#8C6B56]'
                                        }`}
                                    >
                                        {tab.subtitle}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Main Settings Sub-Page Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                >
                    {children}
                </motion.div>
            </div>
        </PosLayout>
    );
}
