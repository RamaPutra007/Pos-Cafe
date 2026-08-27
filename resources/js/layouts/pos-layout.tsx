import { Head, Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Bell,
    CheckCheck,
    ClipboardList,
    Coffee,
    ExternalLink,
    FolderKanban,
    History,
    LayoutGrid,
    LogOut,
    Menu,
    Package,
    Settings,
    Store,
    Users,
    UtensilsCrossed,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { logout } from '@/routes';
import type { Auth } from '@/types';

interface LiveNotification {
    id: string;
    type: 'order_success' | 'stock_warning' | 'out_of_stock';
    title: string;
    message: string;
    time: string;
    timestamp: number;
    link: string;
    severity: 'success' | 'warning' | 'danger';
}

interface PosLayoutProps {
    title?: string;
    headerTitle?: string;
    headerSubtitle?: string;
    children: React.ReactNode;
    activeNav?:
        | 'dashboard'
        | 'pos'
        | 'orders'
        | 'customers'
        | 'menus'
        | 'inventory'
        | 'movements'
        | 'reports'
        | 'cashiers'
        | 'settings';
    headerActions?: React.ReactNode;
}

export default function PosLayout({
    title = 'POS Cafe - Artisan Coffee',
    headerTitle = 'POS Cafe',
    headerSubtitle,
    children,
    activeNav = 'dashboard',
    headerActions,
}: PosLayoutProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    // Live Real-Time Notifications State
    const [notifications, setNotifications] = useState<LiveNotification[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'stock'>(
        'all',
    );
    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        return localStorage.getItem('pos_cafe_sound_enabled') !== 'false';
    });
    const [liveToast, setLiveToast] = useState<LiveNotification | null>(null);
    const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
    const isFirstLoad = useRef(true);
    const previousLatestId = useRef<string | null>(null);

    // Synthesize gentle cafe chime sound via Web Audio API
    const playCafeChime = () => {
        try {
            const AudioCtx =
                window.AudioContext ||
                (
                    window as unknown as {
                        webkitAudioContext: typeof AudioContext;
                    }
                ).webkitAudioContext;

            if (!AudioCtx) {
                return;
            }

            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(659.25, now); // E5
            osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(880, now + 0.06); // A5
            osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.22); // E6

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now + 0.06);
            osc1.stop(now + 0.85);
            osc2.stop(now + 0.85);
        } catch {
            // Audio context may be restricted before user gesture
        }
    };

    // Live polling function
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/notifications/live', {
                headers: { Accept: 'application/json' },
            });

            if (!res.ok) {
                return;
            }

            const data = await res.json();

            if (
                data.status === 'success' &&
                Array.isArray(data.notifications)
            ) {
                const list: LiveNotification[] = data.notifications;
                setNotifications(list);

                // Detect new incoming order for live toast & sound chime
                const newest = list[0];

                if (
                    newest &&
                    !isFirstLoad.current &&
                    previousLatestId.current &&
                    newest.id !== previousLatestId.current
                ) {
                    if (newest.type === 'order_success') {
                        if (soundEnabled) {
                            playCafeChime();
                        }

                        setLiveToast(newest);
                        setTimeout(() => setLiveToast(null), 6000);
                    }
                }

                if (newest) {
                    previousLatestId.current = newest.id;
                }

                isFirstLoad.current = false;
            }
        } catch {
            // Silently fallback if offline
        }
    }, [soundEnabled]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchNotifications();
        }, 0);
        const interval = setInterval(fetchNotifications, 5000); // 5s live polling

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [fetchNotifications]);

    const toggleSound = () => {
        const nextState = !soundEnabled;
        setSoundEnabled(nextState);
        localStorage.setItem('pos_cafe_sound_enabled', String(nextState));

        if (nextState) {
            playCafeChime();
        }
    };

    const markAllAsRead = () => {
        const allIds = new Set(notifications.map((n) => n.id));
        setSeenIds(allIds);
    };

    const unreadCount = notifications.filter((n) => !seenIds.has(n.id)).length;

    const filteredNotifications = notifications.filter((n) => {
        if (activeTab === 'orders') {
            return n.type === 'order_success';
        }

        if (activeTab === 'stock') {
            return n.type === 'stock_warning' || n.type === 'out_of_stock';
        }

        return true;
    });

    const navItems = [
        {
            group: 'Utama',
            items: [
                {
                    key: 'dashboard',
                    name: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutGrid,
                    adminOnly: false,
                },
                {
                    key: 'pos',
                    name: 'POS Kasir',
                    href: '/pos',
                    icon: Store,
                    badge: 'Kasir',
                    adminOnly: false,
                },
                {
                    key: 'orders',
                    name: 'Riwayat Pesanan',
                    href: '/orders',
                    icon: ClipboardList,
                    adminOnly: false,
                },
                {
                    key: 'customers',
                    name: 'Pelanggan',
                    href: '/customers',
                    icon: Users,
                    adminOnly: false,
                },
            ],
        },
        {
            group: 'Inventaris & Menu',
            items: [
                {
                    key: 'menus',
                    name: 'Manajemen Menu',
                    href: '/menus',
                    icon: UtensilsCrossed,
                    adminOnly: true,
                },
                {
                    key: 'inventory',
                    name: 'Stok & Batch',
                    href: '/inventory',
                    icon: Package,
                    adminOnly: true,
                },
                {
                    key: 'movements',
                    name: 'Pergerakan Stok',
                    href: '/inventory/movements',
                    icon: History,
                    adminOnly: true,
                },
            ],
        },
        {
            group: 'Laporan & Pengaturan',
            items: [
                {
                    key: 'reports',
                    name: 'Laporan & Finansial',
                    href: '/reports',
                    icon: BarChart3,
                    adminOnly: true,
                },
                {
                    key: 'cashiers',
                    name: 'Manajemen Kasir',
                    href: '/cashiers',
                    icon: FolderKanban,
                    adminOnly: true,
                },
                {
                    key: 'settings',
                    name: 'Pengaturan Akun',
                    href: '/settings/profile',
                    icon: Settings,
                    adminOnly: false,
                },
            ],
        },
    ];

    const isAdmin = auth?.user?.role === 'admin' || !auth?.user?.role;

    return (
        <>
            <Head title={title}>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen bg-[#F5EFEB] font-sans text-[#2A1810]">
                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isMobileSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
                            onClick={() => setIsMobileSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* ================= LEFT SIDEBAR ================= */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-[#E2D4C6] bg-[#F7F2EB] p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
                        isMobileSidebarOpen
                            ? 'translate-x-0'
                            : '-translate-x-full'
                    }`}
                >
                    <div className="overflow-y-auto pr-1">
                        {/* Sidebar Brand */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#5A3726] px-3.5 py-1 text-xs font-semibold tracking-wider text-[#FAF3EB] shadow-xs transition hover:scale-105"
                                >
                                    <span className="font-serif text-sm italic">
                                        coffee
                                    </span>
                                </Link>
                                <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#24140E]">
                                    Pos Cafe
                                </h1>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#7A6353] lg:hidden"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Navigation Groups */}
                        <nav className="space-y-5">
                            {navItems.map((group) => {
                                const visibleItems = group.items.filter(
                                    (item) => !item.adminOnly || isAdmin,
                                );

                                if (visibleItems.length === 0) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={group.group}
                                        className="space-y-1.5"
                                    >
                                        <div className="px-4 text-[10px] font-bold tracking-wider text-[#9E8372] uppercase">
                                            {group.group}
                                        </div>
                                        {visibleItems.map((item) => {
                                            const isActive =
                                                activeNav === item.key;
                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.key}
                                                    href={item.href}
                                                    className={`flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-150 ${
                                                        isActive
                                                            ? 'bg-[#6B4028] text-white shadow-sm'
                                                            : 'text-[#6B574B] hover:bg-[#EFE8DF] hover:text-[#24140E]'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon
                                                            className={`h-4 w-4 ${
                                                                isActive
                                                                    ? 'text-white'
                                                                    : 'text-[#8C6B56]'
                                                            }`}
                                                        />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {item.badge && (
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                isActive
                                                                    ? 'bg-white/20 text-white'
                                                                    : 'bg-[#E5D6C7] text-[#5A3726]'
                                                            }`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom User Info & Logout Button */}
                    <div className="mt-4 border-t border-[#E2D4C6]/80 pt-4">
                        <div className="mb-2 flex items-center gap-3 px-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5A3726] text-xs font-bold text-[#FAF3EB]">
                                {auth?.user?.name
                                    ?.split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2) || 'AD'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-[#24140E]">
                                    {auth?.user?.name || 'Admin Pos Cafe'}
                                </p>
                                <p className="text-[10px] font-medium text-[#8C6B56] capitalize">
                                    {auth?.user?.role || 'Admin'}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={logout()}
                            as="button"
                            method="post"
                            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-[#A24D3D] transition hover:bg-[#FBEBE8]"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Keluar Sistem</span>
                        </Link>
                    </div>
                </aside>

                {/* ================= MAIN CONTENT AREA ================= */}
                <div className="flex flex-1 flex-col overflow-x-hidden">
                    {/* Top Bar Header */}
                    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E2D4C6]/80 bg-[#F5EFEB]/90 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-10">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsMobileSidebarOpen(true)}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#D5C2B1] bg-[#FFFDF9] text-[#24140E] lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div>
                                <h2 className="font-serif text-2xl font-bold tracking-tight text-[#24140E] sm:text-3xl">
                                    {headerTitle}
                                </h2>
                                {headerSubtitle && (
                                    <p className="text-xs text-[#7A6353]">
                                        {headerSubtitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Top Right User Profile, Header Actions & Notifications */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            {headerActions}

                            {/* Notification Bell with Real-Time Dropdown */}
                            <div className="relative">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() =>
                                        setNotificationOpen(!notificationOpen)
                                    }
                                    title="Notifikasi Real-Time"
                                    className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-[#D5C2B1]/80 bg-[#FFFDF9] text-[#6B574B] shadow-xs transition hover:bg-[#EFE8DF] hover:text-[#24140E]"
                                >
                                    <Bell className="h-4 w-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 animate-pulse items-center justify-center rounded-full bg-[#C53030] px-1 text-[9px] font-black text-white shadow-xs">
                                            {unreadCount > 9
                                                ? '9+'
                                                : unreadCount}
                                        </span>
                                    )}
                                </motion.button>

                                <AnimatePresence>
                                    {notificationOpen && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 z-50 mt-2 w-84 rounded-3xl border border-[#E2D4C6] bg-[#FFFDF9] p-4 shadow-2xl sm:w-96"
                                        >
                                            {/* Dropdown Header */}
                                            <div className="flex items-center justify-between border-b border-[#F0E4D8] pb-3">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-xs font-bold text-[#24140E]">
                                                        Notifikasi Sistem
                                                    </h4>
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7ED] px-2 py-0.5 text-[9px] font-bold text-[#2E7D32]">
                                                        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#2E7D32]" />
                                                        Live
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={toggleSound}
                                                        title={
                                                            soundEnabled
                                                                ? 'Matikan Suara Notifikasi'
                                                                : 'Nyalakan Suara Notifikasi'
                                                        }
                                                        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition ${
                                                            soundEnabled
                                                                ? 'bg-[#F2E8DC] text-[#6B4028] hover:bg-[#E5D7C7]'
                                                                : 'bg-[#F7F2EB] text-[#A69182] hover:bg-[#EBE2D7]'
                                                        }`}
                                                    >
                                                        {soundEnabled ? (
                                                            <Volume2 className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <VolumeX className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                markAllAsRead
                                                            }
                                                            title="Tandai Semua Dibaca"
                                                            className="flex items-center gap-1 rounded-lg border border-[#E8D7C8] bg-[#FAF4EE] px-2 py-1 text-[10px] font-bold text-[#6B4028] hover:bg-[#F2E5D8]"
                                                        >
                                                            <CheckCheck className="h-3 w-3" />
                                                            <span>
                                                                Baca Semua
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Filter Tabs */}
                                            <div className="mt-2.5 flex items-center gap-1 rounded-2xl bg-[#F7F2EB] p-1 text-[11px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveTab('all')
                                                    }
                                                    className={`flex-1 rounded-xl py-1 text-center transition ${
                                                        activeTab === 'all'
                                                            ? 'bg-white text-[#24140E] shadow-xs'
                                                            : 'text-[#8C6B56] hover:text-[#24140E]'
                                                    }`}
                                                >
                                                    Semua (
                                                    {notifications.length})
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveTab('orders')
                                                    }
                                                    className={`flex-1 rounded-xl py-1 text-center transition ${
                                                        activeTab === 'orders'
                                                            ? 'bg-white text-[#24140E] shadow-xs'
                                                            : 'text-[#8C6B56] hover:text-[#24140E]'
                                                    }`}
                                                >
                                                    ☕ Pesanan
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveTab('stock')
                                                    }
                                                    className={`flex-1 rounded-xl py-1 text-center transition ${
                                                        activeTab === 'stock'
                                                            ? 'bg-white text-[#24140E] shadow-xs'
                                                            : 'text-[#8C6B56] hover:text-[#24140E]'
                                                    }`}
                                                >
                                                    ⚠️ Stok
                                                </button>
                                            </div>

                                            {/* Notification Items List */}
                                            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-0.5 text-xs">
                                                {filteredNotifications.length ===
                                                0 ? (
                                                    <div className="py-6 text-center text-[#8C6B56]">
                                                        <Coffee className="mx-auto mb-1.5 h-6 w-6 text-[#C9B5A5]" />
                                                        <p className="font-medium">
                                                            Tidak ada notifikasi
                                                            baru
                                                        </p>
                                                        <p className="text-[10px] text-[#A69182]">
                                                            Semua operasional &
                                                            stok dalam kondisi
                                                            prima
                                                        </p>
                                                    </div>
                                                ) : (
                                                    filteredNotifications.map(
                                                        (item) => {
                                                            const isUnread =
                                                                !seenIds.has(
                                                                    item.id,
                                                                );

                                                            return (
                                                                <Link
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    href={
                                                                        item.link
                                                                    }
                                                                    onClick={() => {
                                                                        setSeenIds(
                                                                            (
                                                                                prev,
                                                                            ) =>
                                                                                new Set(
                                                                                    [
                                                                                        ...prev,
                                                                                        item.id,
                                                                                    ],
                                                                                ),
                                                                        );
                                                                        setNotificationOpen(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className={`group flex items-start gap-2.5 rounded-2xl border p-2.5 transition hover:shadow-xs ${
                                                                        item.severity ===
                                                                        'danger'
                                                                            ? 'border-[#FADCD9] bg-[#FFF8F7] hover:bg-[#FDE8E8]/70'
                                                                            : item.severity ===
                                                                                'warning'
                                                                              ? 'border-[#F6E3B8] bg-[#FFFBF2] hover:bg-[#FDF3E5]/70'
                                                                              : 'border-[#E5D6C7] bg-[#FDFBF7] hover:bg-[#F5EFEB]'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-white ${
                                                                            item.severity ===
                                                                            'danger'
                                                                                ? 'bg-[#C53030]'
                                                                                : item.severity ===
                                                                                    'warning'
                                                                                  ? 'bg-[#C07718]'
                                                                                  : 'bg-[#2E7D32]'
                                                                        }`}
                                                                    >
                                                                        {item.severity ===
                                                                        'danger' ? (
                                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                                        ) : item.severity ===
                                                                          'warning' ? (
                                                                            <AlertTriangle className="h-3.5 w-3.5" />
                                                                        ) : (
                                                                            <Coffee className="h-3.5 w-3.5" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center justify-between gap-1">
                                                                            <p className="truncate font-bold text-[#24140E]">
                                                                                {
                                                                                    item.title
                                                                                }
                                                                            </p>
                                                                            {isUnread && (
                                                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C53030]" />
                                                                            )}
                                                                        </div>
                                                                        <p className="mt-0.5 text-[11px] leading-tight text-[#7A6353]">
                                                                            {
                                                                                item.message
                                                                            }
                                                                        </p>
                                                                        <div className="mt-1 flex items-center justify-between text-[10px] text-[#A69182]">
                                                                            <span>
                                                                                {
                                                                                    item.time
                                                                                }
                                                                            </span>
                                                                            <span className="flex items-center gap-0.5 font-bold text-[#6B4028] group-hover:underline">
                                                                                Buka{' '}
                                                                                <ExternalLink className="h-2.5 w-2.5" />
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            );
                                                        },
                                                    )
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* User Profile Pill */}
                            <div className="flex items-center gap-1.5 rounded-2xl border border-[#D5C2B1]/80 bg-[#FFFDF9] p-1.5 pr-2 shadow-xs">
                                <Link
                                    href="/settings/profile"
                                    title="Buka Pengaturan Akun"
                                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-1.5 py-0.5 transition hover:bg-[#F7F2EB]"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5A3726] text-xs font-bold text-[#FAF3EB]">
                                        {auth?.user?.name
                                            ?.split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .slice(0, 2) || 'AD'}
                                    </div>
                                    <div className="hidden text-left sm:block">
                                        <div className="text-xs font-bold text-[#24140E]">
                                            {auth?.user?.name ||
                                                'Admin Pos Cafe'}
                                        </div>
                                        <div className="text-[10px] text-[#8C6B56] capitalize">
                                            {auth?.user?.role || 'Admin'}
                                        </div>
                                    </div>
                                </Link>
                                <Link
                                    href="/settings/profile"
                                    title="Pengaturan Akun"
                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[#8C6B56] transition hover:bg-[#F5EFEB] hover:text-[#24140E]"
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                </Link>
                                <Link
                                    href={logout()}
                                    as="button"
                                    method="post"
                                    title="Keluar ke Landing Page"
                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[#9E8372] transition hover:bg-[#FBEBE8] hover:text-[#A24D3D]"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Floating Real-Time Toast Banner on Incoming Transaction */}
                    <AnimatePresence>
                        {liveToast && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, x: 20 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, y: -20, x: 20 }}
                                className="fixed top-20 right-6 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-[#2E7D32]/30 bg-[#FFFDF9] p-4 shadow-2xl"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2E7D32] text-white">
                                    <Coffee className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <h5 className="text-xs font-bold text-[#24140E]">
                                            {liveToast.title}
                                        </h5>
                                        <span className="py-0.2 rounded-full bg-[#EAF7ED] px-1.5 text-[9px] font-bold text-[#2E7D32]">
                                            Baru!
                                        </span>
                                    </div>
                                    <p className="mt-0.5 line-clamp-1 text-[11px] text-[#7A6353]">
                                        {liveToast.message}
                                    </p>
                                </div>
                                <Link
                                    href={liveToast.link}
                                    onClick={() => setLiveToast(null)}
                                    className="rounded-lg bg-[#6B4028] px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-[#57331F]"
                                >
                                    Lihat
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setLiveToast(null)}
                                    className="text-[#9E8372] hover:text-[#24140E]"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Animated Main Content Body */}
                    <motion.main
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 p-5 sm:p-8 lg:p-10"
                    >
                        {children}
                    </motion.main>
                </div>
            </div>
        </>
    );
}
