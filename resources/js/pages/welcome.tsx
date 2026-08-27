import { Head, Link, usePage } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    Clock,
    Coffee,
    ExternalLink,
    Flame,
    Heart,
    Instagram,
    Laptop,
    LayoutDashboard,
    LogIn,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    Sparkles,
    Store,
    UtensilsCrossed,
    Wifi,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { dashboard, login } from '@/routes';
import type { Auth } from '@/types';

// Custom Coffee Bean SVG Icon matching reference style
function CoffeeBeanIcon({ className = 'w-4 h-4' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18.5 5.5a7 7 0 0 0-9.9 0L4.8 9.3a7 7 0 0 0 9.9 9.9l3.8-3.8a7 7 0 0 0 0-9.9z" />
            <path d="M8.5 8.5c1.5 1.5 2.5 3.5 2.5 5.5s1 4 2.5 5.5" />
        </svg>
    );
}

// 6-dots matrix icon from the top right of the reference
function DotGridIcon({ className = 'w-6 h-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <circle cx="5" cy="5" r="2" />
            <circle cx="12" cy="5" r="2" />
            <circle cx="19" cy="5" r="2" />
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
        </svg>
    );
}

export default function Welcome() {
    const { auth } = usePage<{ auth: Auth }>().props;

    // Scroll state for sticky header
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('beranda');

    // Contact Form State
    const [contactForm, setContactForm] = useState({
        name: '',
        contact: '',
        subject: 'Reservasi Tempat & Meja',
        message: '',
    });
    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 25) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            // Determine active section based on scroll position
            const sections = ['beranda', 'cerita', 'lokasi', 'kontak'];
            const scrollPosition = window.scrollY + 180;

            for (let i = sections.length - 1; i >= 0; i--) {
                const sectionId = sections[i];
                const el = document.getElementById(sectionId);

                if (el) {
                    const top = el.offsetTop;

                    if (scrollPosition >= top) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Precise scroll function that calculates dynamic sticky navbar height
    const scrollToSection = (id: string) => {
        if (id === 'beranda') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });

            return;
        }

        const element = document.getElementById(id);

        if (element) {
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 70;
            // Add comfortable breathing room so the section header aligns perfectly
            const extraPadding = 20;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition +
                window.pageYOffset -
                (headerHeight + extraPadding);

            window.scrollTo({
                top: Math.max(0, offsetPosition),
                behavior: 'smooth',
            });
        }
    };

    const handleContactSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Construct WhatsApp message URL for direct instant contact
        const waNumber = '6281234567890';
        const waText = encodeURIComponent(
            `Halo Pos Cafe! Saya ${contactForm.name || 'Pelanggan'}.\nKeperluan: ${contactForm.subject}\nKontak saya: ${contactForm.contact}\nPesan: ${contactForm.message || 'Saya ingin bertanya seputar layanan Pos Cafe.'}`,
        );
        window.open(`https://wa.me/${waNumber}?text=${waText}`, '_blank');

        setFormSubmitted(true);
        setTimeout(() => {
            setFormSubmitted(false);
            setContactForm({
                name: '',
                contact: '',
                subject: 'Reservasi Tempat & Meja',
                message: '',
            });
        }, 3000);
    };

    return (
        <>
            <Head title="Pos Cafe - Seni & Ritual Kopi">
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

            {/* Whole Page Container with seamless Coffee Theme */}
            <div className="relative min-h-screen w-full scroll-smooth bg-[#F7F2EB] font-sans text-[#2A1810]">
                {/* ================= STICKY HEADER ================= */}
                <header
                    className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
                        isScrolled
                            ? 'border-b border-[#D5C2B1]/80 bg-[#F7F2EB]/95 py-3 shadow-md shadow-[#2A1810]/5 backdrop-blur-md'
                            : 'border-b border-[#D5C2B1]/40 bg-transparent py-5 sm:py-6'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 md:px-12 lg:px-16">
                        {/* Brand Logo */}
                        <button
                            type="button"
                            onClick={() => scrollToSection('beranda')}
                            className="flex cursor-pointer items-center gap-3 text-left transition hover:opacity-90"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2A1810] text-[#E8DCCF] shadow-md shadow-[#2A1810]/20 transition-transform duration-300 hover:scale-105 sm:h-11 sm:w-11">
                                <CoffeeBeanIcon className="h-5 w-5 rotate-[-15deg] sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <span className="font-serif text-xl font-bold tracking-tight text-[#24140E] sm:text-2xl">
                                    Pos Cafe
                                </span>
                                <span className="hidden text-[10px] tracking-widest text-[#876D5B] uppercase sm:block">
                                    Artisan Coffee &amp; POS
                                </span>
                            </div>
                        </button>

                        {/* Middle Navigation Links (Desktop Smooth Scroll) */}
                        <nav className="hidden items-center gap-7 md:flex">
                            <button
                                type="button"
                                onClick={() => scrollToSection('beranda')}
                                className={`cursor-pointer text-sm font-medium transition ${
                                    activeSection === 'beranda'
                                        ? 'font-bold text-[#24140E] underline decoration-[#7A4B2F] decoration-2 underline-offset-8'
                                        : 'text-[#6B574B] hover:text-[#24140E]'
                                }`}
                            >
                                Beranda
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToSection('cerita')}
                                className={`cursor-pointer text-sm font-medium transition ${
                                    activeSection === 'cerita'
                                        ? 'font-bold text-[#24140E] underline decoration-[#7A4B2F] decoration-2 underline-offset-8'
                                        : 'text-[#6B574B] hover:text-[#24140E]'
                                }`}
                            >
                                Cerita Kami
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToSection('lokasi')}
                                className={`cursor-pointer text-sm font-medium transition ${
                                    activeSection === 'lokasi'
                                        ? 'font-bold text-[#24140E] underline decoration-[#7A4B2F] decoration-2 underline-offset-8'
                                        : 'text-[#6B574B] hover:text-[#24140E]'
                                }`}
                            >
                                Lokasi &amp; Jam
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToSection('kontak')}
                                className={`inline-flex cursor-pointer items-center gap-1.5 text-sm transition ${
                                    activeSection === 'kontak'
                                        ? 'font-bold text-[#24140E] underline decoration-[#7A4B2F] decoration-2 underline-offset-8'
                                        : 'font-semibold text-[#7A4B2F] hover:text-[#24140E]'
                                }`}
                            >
                                <MessageCircle className="h-4 w-4 text-[#7A4B2F]" />
                                <span>Kontak Kami</span>
                            </button>
                        </nav>

                        {/* Right Actions / Auth */}
                        <div className="flex items-center gap-2.5 sm:gap-4">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#24140E] px-3.5 py-1.5 text-xs font-medium text-[#FAF4ED] shadow-sm transition hover:bg-[#3D2319] hover:shadow-md active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard POS</span>
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5C2B1] bg-[#F7F2EB]/80 px-3.5 py-1.5 text-xs font-semibold text-[#24140E] backdrop-blur-sm transition hover:bg-[#EFE8DF] active:scale-95 sm:text-sm"
                                >
                                    <LogIn className="h-3.5 w-3.5" />
                                    <span>Masuk</span>
                                </Link>
                            )}

                            {/* 6-Dots Matrix Icon (Scrolls to Contact) */}
                            <button
                                type="button"
                                onClick={() => scrollToSection('kontak')}
                                title="Hubungi Kami"
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[#7E6351] transition hover:bg-[#EFE8DF]/80 hover:text-[#24140E]"
                            >
                                <DotGridIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* ================= HERO (Section 1) ================= */}
                <div
                    id="beranda"
                    className="relative min-h-screen w-full scroll-mt-24 overflow-x-hidden bg-[url('/images/bgmenu.png')] bg-cover bg-center bg-no-repeat pt-24 lg:pt-28"
                >
                    {/* Subtle warm overlay */}
                    <div className="absolute inset-0 bg-[#f9f5ee]/25 backdrop-blur-[0.5px]" />

                    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col justify-between px-5 py-6 sm:px-8 md:px-12 lg:px-16 lg:py-10">
                        {/* Hero Main Content */}
                        <main className="my-auto grid grid-cols-1 items-center gap-10 py-6 lg:grid-cols-12 lg:gap-14 lg:py-10">
                            {/* Left Column: Typography & CTAs */}
                            <div className="flex flex-col items-start lg:col-span-6 xl:col-span-7">
                                {/* Pill Badge */}
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#D5C2B1] bg-[#EFE8DF]/85 px-4 py-1.5 text-xs font-medium text-[#5C3D2E] shadow-sm backdrop-blur-sm transition hover:bg-[#E9DEC9]">
                                    <Coffee className="h-3.5 w-3.5 text-[#7A4B2F]" />
                                    <span>Experience Premium Coffee</span>
                                </div>

                                {/* Big Serif Heading */}
                                <h1 className="mt-5 font-serif text-5xl leading-[1.06] font-bold tracking-tight text-[#24140E] sm:text-6xl md:text-7xl lg:text-[5rem]">
                                    Seni &amp;
                                    <br />
                                    Ritual Kopi.
                                </h1>

                                {/* Decorative Divider with Coffee Bean Icon */}
                                <div className="my-6 flex w-full max-w-[280px] items-center gap-3">
                                    <div className="h-[1px] flex-1 bg-[#D3BEAD]" />
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#C5AE9C] bg-[#F7F2EB]/90 text-[#6E4F3B] shadow-sm">
                                        <CoffeeBeanIcon className="h-3.5 w-3.5 rotate-45" />
                                    </div>
                                    <div className="h-[1px] flex-1 bg-[#D3BEAD]" />
                                </div>

                                {/* Subtitle / Paragraph */}
                                <p className="max-w-xl text-base leading-relaxed text-[#6B574B] sm:text-lg">
                                    Rasakan pengalaman kedai kopi premium di
                                    setiap cangkir. Kami memanggang, menyeduh,
                                    dan menyajikan kesempurnaan.
                                </p>

                                {/* Action Buttons: Scroll to Contact & Location */}
                                <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            scrollToSection('kontak')
                                        }
                                        className="group inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#24140E] px-6 py-3.5 text-sm font-semibold text-[#FDF8F3] shadow-lg shadow-[#24140E]/20 transition duration-200 hover:scale-[1.02] hover:bg-[#3D2319] active:scale-[0.98]"
                                    >
                                        <MessageCircle className="h-4 w-4 text-[#E8DCCF] transition-transform group-hover:scale-110" />
                                        <span>Kontak &amp; Reservasi</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            scrollToSection('lokasi')
                                        }
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#C5AE9C] bg-[#EFE8DF]/80 px-6 py-3.5 text-sm font-semibold text-[#24140E] backdrop-blur-sm transition duration-200 hover:scale-[1.02] hover:bg-[#E8DDCF] active:scale-[0.98]"
                                    >
                                        <MapPin className="h-4 w-4 text-[#7A4B2F]" />
                                        <span>Lokasi Kami</span>
                                    </button>
                                </div>

                                {/* 3 Bottom Value Props / Highlights (Clickable -> Smooth Scroll to respective section) */}
                                <div className="mt-12 grid w-full grid-cols-1 gap-4 border-t border-[#D5C2B1]/50 pt-8 sm:grid-cols-3 sm:gap-6">
                                    {/* Item 1 */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            scrollToSection('cerita')
                                        }
                                        className="group flex cursor-pointer items-center gap-3 text-left transition hover:opacity-80"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D5C2B1] bg-[#EFE8DF]/90 text-[#6B4B36] shadow-sm transition group-hover:scale-105 group-hover:bg-[#E5D6C7]">
                                            <CoffeeBeanIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold tracking-tight text-[#24140E] sm:text-sm">
                                                Biji Kopi Pilihan
                                            </h4>
                                            <p className="text-[11px] text-[#7A6353]">
                                                100% Arabica Premium
                                            </p>
                                        </div>
                                    </button>

                                    {/* Item 2 */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            scrollToSection('cerita')
                                        }
                                        className="group flex cursor-pointer items-center gap-3 text-left transition hover:opacity-80"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D5C2B1] bg-[#EFE8DF]/90 text-[#6B4B36] shadow-sm transition group-hover:scale-105 group-hover:bg-[#E5D6C7]">
                                            <Coffee className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold tracking-tight text-[#24140E] sm:text-sm">
                                                Diseduh dengan Hati
                                            </h4>
                                            <p className="text-[11px] text-[#7A6353]">
                                                Ritual &amp; Presisi
                                            </p>
                                        </div>
                                    </button>

                                    {/* Item 3 */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            scrollToSection('lokasi')
                                        }
                                        className="group flex cursor-pointer items-center gap-3 text-left transition hover:opacity-80"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D5C2B1] bg-[#EFE8DF]/90 text-[#6B4B36] shadow-sm transition group-hover:scale-105 group-hover:bg-[#E5D6C7]">
                                            <Heart className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold tracking-tight text-[#24140E] sm:text-sm">
                                                Pengalaman Berkesan
                                            </h4>
                                            <p className="text-[11px] text-[#7A6353]">
                                                Untuk Setiap Momen
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Hero Image Card & Floating Badge */}
                            <div className="relative flex items-center justify-center lg:col-span-6 xl:col-span-5">
                                <div className="group relative aspect-[4/4.6] w-full max-w-[480px] overflow-hidden rounded-[2.5rem] border-4 border-[#FFFDF9]/80 bg-[#351e13] shadow-2xl shadow-[#24140E]/25 transition duration-500 hover:shadow-[#24140E]/35 lg:rounded-[3rem]">
                                    <img
                                        src="/images/espresso-hero.jpg"
                                        alt="Espresso Extraction Pos Cafe"
                                        className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                                    />

                                    {/* Soft warm gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                                    {/* Floating Badge at Bottom */}
                                    <div className="absolute right-5 bottom-5 left-5 sm:right-6 sm:bottom-6 sm:left-6">
                                        <div className="flex items-center gap-3.5 rounded-2xl border border-white/15 bg-[#3B2215]/95 p-3.5 text-[#FDF8F3] shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-[#341d11] sm:p-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-200/20 bg-[#593622] text-[#F3E3D3]">
                                                <CoffeeBeanIcon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs leading-tight font-semibold tracking-wide text-amber-50 sm:text-sm">
                                                    Dipanggang Segar,
                                                </p>
                                                <p className="text-[11px] font-normal text-amber-200/80 sm:text-xs">
                                                    Disajikan dengan Cinta.
                                                </p>
                                            </div>
                                            <Sparkles className="hidden h-4 w-4 text-amber-300/80 sm:block" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                {/* ================= SECTION 2: CERITA & FILOSOFI ================= */}
                <section
                    id="cerita"
                    className="relative scroll-mt-24 border-t border-[#D5C2B1]/60 bg-[#FAF6F0] py-20 md:scroll-mt-28 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16">
                        {/* Section Header */}
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#D5C2B1] bg-[#EFE8DF]/80 px-4 py-1 text-xs font-semibold text-[#6B4B36]">
                                <CoffeeBeanIcon className="h-3.5 w-3.5" />
                                <span>Cerita di Balik Pos Cafe</span>
                            </div>
                            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#24140E] sm:text-4xl lg:text-5xl">
                                Harmoni Antara Seni Seduh &amp; Ketepatan Rasa
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-[#6B574B]">
                                Di Pos Cafe, setiap cangkir adalah manifestasi
                                dari proses panjang: mulai dari pemilihan biji
                                kopi berkualitas, teknik pemanggangan teliti,
                                hingga keramahan barista dalam melayani Anda
                                dengan teknologi POS terkini.
                            </p>
                        </div>

                        {/* 4 Feature Highlights Grid */}
                        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Card 1 */}
                            <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-sm transition hover:border-[#C5AE9C] hover:shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24140E] text-[#FAF4ED] shadow-sm">
                                    <CoffeeBeanIcon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-base font-bold text-[#24140E]">
                                    100% Single Origin &amp; Blend
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-[#7A6353]">
                                    Biji kopi pilihan Nusantara (Gayo, Toraja,
                                    Flores) hingga biji dunia dengan profil rasa
                                    unik.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-sm transition hover:border-[#C5AE9C] hover:shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24140E] text-[#FAF4ED] shadow-sm">
                                    <Flame className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-base font-bold text-[#24140E]">
                                    Artisan Roasting Profile
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-[#7A6353]">
                                    Disangrai dalam batch kecil secara berkala
                                    demi menjamin kesegaran aroma dan keasaman
                                    seimbang.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-sm transition hover:border-[#C5AE9C] hover:shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24140E] text-[#FAF4ED] shadow-sm">
                                    <Coffee className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-base font-bold text-[#24140E]">
                                    Ritual Seduh Terkalibrasi
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-[#7A6353]">
                                    Barista kami menjaga rasio air, suhu, dan
                                    waktu ekstraksi dengan standar ketat untuk
                                    cita rasa optimal.
                                </p>
                            </div>

                            {/* Card 4 */}
                            <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-sm transition hover:border-[#C5AE9C] hover:shadow-md">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24140E] text-[#FAF4ED] shadow-sm">
                                    <Laptop className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-base font-bold text-[#24140E]">
                                    Sistem POS Cepat &amp; Akurat
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-[#7A6353]">
                                    Didukung sistem Point of Sale modern untuk
                                    pemesanan instan, pembayaran fleksibel,
                                    tanpa antrean panjang.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= SECTION 3: LOKASI & JAM OPERASIONAL ================= */}
                <section
                    id="lokasi"
                    className="relative scroll-mt-24 border-t border-[#D5C2B1]/60 bg-[#F4EDE2] py-20 md:scroll-mt-28 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16">
                        {/* Section Header */}
                        <div className="mx-auto max-w-2xl text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#D5C2B1] bg-[#EFE8DF]/80 px-4 py-1 text-xs font-semibold text-[#6B4B36]">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>Kunjungi Kedai Kami</span>
                            </div>
                            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#24140E] sm:text-4xl lg:text-5xl">
                                Suasana Hangat Menanti Anda
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-[#6B574B]">
                                Temukan tempat yang ideal untuk menikmati
                                secangkir kopi, menyelesaikan pekerjaan, atau
                                bercengkerama bersama sahabat.
                            </p>
                        </div>

                        {/* Location & Facility Info Cards */}
                        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Card 1: Alamat */}
                            <div className="flex flex-col justify-between rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-7 shadow-sm">
                                <div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24140E] text-[#FAF4ED]">
                                        <Store className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold text-[#24140E]">
                                        Pos Cafe Sanctuary
                                    </h3>
                                    <p className="mt-2 text-xs leading-relaxed text-[#6B574B]">
                                        Jl. Senopati Raya No. 42, Kebayoran
                                        Baru, Jakarta Selatan, DKI Jakarta 12190
                                    </p>
                                </div>
                                <div className="mt-6 border-t border-[#E5D6C7] pt-4">
                                    <a
                                        href="https://maps.google.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-bold text-[#7A4B2F] transition hover:text-[#24140E]"
                                    >
                                        <span>
                                            Buka Petunjuk di Google Maps
                                        </span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Card 2: Jam Operasional */}
                            <div className="flex flex-col justify-between rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-7 shadow-sm">
                                <div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24140E] text-[#FAF4ED]">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold text-[#24140E]">
                                        Jam Operasional
                                    </h3>
                                    <div className="mt-3 space-y-2 text-xs text-[#6B574B]">
                                        <div className="flex items-center justify-between border-b border-[#F0E4D8] pb-2">
                                            <span className="font-semibold text-[#24140E]">
                                                Senin - Jumat
                                            </span>
                                            <span>07:00 - 22:00 WIB</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-[#F0E4D8] pb-2">
                                            <span className="font-semibold text-[#24140E]">
                                                Sabtu - Minggu
                                            </span>
                                            <span>07:00 - 23:00 WIB</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="font-semibold text-[#24140E]">
                                                Hari Libur Nasional
                                            </span>
                                            <span>Tetap Buka</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 border-t border-[#E5D6C7] pt-4">
                                    <p className="text-[11px] text-[#876D5B]">
                                        *Layanan takeaway &amp; dine-in tersedia
                                        setiap hari.
                                    </p>
                                </div>
                            </div>

                            {/* Card 3: Fasilitas Lengkap */}
                            <div className="flex flex-col justify-between rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-7 shadow-sm">
                                <div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24140E] text-[#FAF4ED]">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-5 text-lg font-bold text-[#24140E]">
                                        Fasilitas Kedai
                                    </h3>
                                    <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs text-[#5C3D2E]">
                                        <div className="flex items-center gap-2">
                                            <Wifi className="h-3.5 w-3.5 text-[#7A4B2F]" />
                                            <span>Wi-Fi 100 Mbps</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Flame className="h-3.5 w-3.5 text-[#7A4B2F]" />
                                            <span>AC &amp; Smoking</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-3.5 w-3.5 text-[#7A4B2F]" />
                                            <span>Stopkontak</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UtensilsCrossed className="h-3.5 w-3.5 text-[#7A4B2F]" />
                                            <span>Musholla</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 border-t border-[#E5D6C7] pt-4">
                                    <p className="text-[11px] text-[#876D5B]">
                                        Parkir mobil &amp; motor luas dengan
                                        keamanan 24 jam.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= SECTION 4: FITUR KONTAK & FORM RESERVASI ================= */}
                <section
                    id="kontak"
                    className="relative scroll-mt-24 border-t border-[#D5C2B1]/60 bg-[#FAF6F0] py-20 md:scroll-mt-28 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12 lg:px-16">
                        {/* Section Header */}
                        <div className="mx-auto max-w-2xl text-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#D5C2B1] bg-[#EFE8DF]/80 px-4 py-1 text-xs font-semibold text-[#6B4B36]">
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>Fitur Kontak &amp; Reservasi</span>
                            </div>
                            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#24140E] sm:text-4xl lg:text-5xl">
                                Hubungi Kami Kapan Saja
                            </h2>
                            <p className="mt-4 text-base leading-relaxed text-[#6B574B]">
                                Ingin memesan tempat untuk meeting, mengadakan
                                gathering, atau sekadar bertanya seputar Pos
                                Cafe? Tim kami siap membantu Anda.
                            </p>
                        </div>

                        {/* Contact Layout: Info & Form */}
                        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                            {/* Left Column: Direct Channels */}
                            <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
                                <div className="space-y-4">
                                    {/* WhatsApp Card */}
                                    <a
                                        href="https://wa.me/6281234567890?text=Halo%20Pos%20Cafe,%20saya%20ingin%20bertanya..."
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center gap-4 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-sm transition hover:border-[#25D366] hover:bg-[#F2FBF5]"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/15 text-[#128C7E] transition group-hover:scale-105">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-bold text-[#24140E]">
                                                WhatsApp Customer Care
                                            </h4>
                                            <p className="text-xs text-[#7A6353]">
                                                +62 812-3456-7890
                                            </p>
                                            <span className="mt-1 inline-block text-[11px] font-semibold text-[#128C7E]">
                                                Chat Sekarang →
                                            </span>
                                        </div>
                                    </a>

                                    {/* Email Card */}
                                    <a
                                        href="mailto:halo@poscafe.id"
                                        className="group flex items-center gap-4 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-sm transition hover:border-[#7A4B2F] hover:bg-[#FBF8F5]"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A4B2F]/15 text-[#7A4B2F] transition group-hover:scale-105">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-bold text-[#24140E]">
                                                Email Resmi
                                            </h4>
                                            <p className="text-xs text-[#7A6353]">
                                                halo@poscafe.id
                                            </p>
                                            <span className="mt-1 inline-block text-[11px] font-semibold text-[#7A4B2F]">
                                                Kirim Email →
                                            </span>
                                        </div>
                                    </a>

                                    {/* Instagram Card */}
                                    <a
                                        href="https://instagram.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center gap-4 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-sm transition hover:border-[#E1306C] hover:bg-[#FDF4F7]"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E1306C]/15 text-[#E1306C] transition group-hover:scale-105">
                                            <Instagram className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-bold text-[#24140E]">
                                                Instagram
                                            </h4>
                                            <p className="text-xs text-[#7A6353]">
                                                @poscafe.official
                                            </p>
                                            <span className="mt-1 inline-block text-[11px] font-semibold text-[#E1306C]">
                                                Ikuti Kami →
                                            </span>
                                        </div>
                                    </a>
                                </div>

                                <div className="rounded-3xl border border-[#E5D6C7] bg-[#EFE8DF]/60 p-5 text-xs text-[#6B574B]">
                                    <p className="font-semibold text-[#24140E]">
                                        Butuh Bantuan Cepat Kasir / POS?
                                    </p>
                                    <p className="mt-1">
                                        Untuk staf dan manajer kedai, silakan
                                        masuk ke dashboard POS melalui tombol di
                                        sudut kanan atas.
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: In-page Contact / Reservation Form */}
                            <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-sm sm:p-8 lg:col-span-7">
                                <h3 className="font-serif text-2xl font-bold text-[#24140E]">
                                    Form Pesan &amp; Reservasi
                                </h3>
                                <p className="mt-1 text-xs text-[#7A6353]">
                                    Isi formulir di bawah ini, kami akan
                                    langsung memprosesnya ke customer service
                                    via WhatsApp.
                                </p>

                                {formSubmitted ? (
                                    <div className="my-8 flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-6 text-center text-[#2A1810]">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                            <CheckCircle2 className="h-7 w-7" />
                                        </div>
                                        <h4 className="mt-3 text-base font-bold text-emerald-950">
                                            Pesan Berhasil Diteruskan ke
                                            WhatsApp!
                                        </h4>
                                        <p className="mt-1 text-xs text-emerald-800">
                                            Terima kasih telah menghubungi Pos
                                            Cafe. Kami akan merespons dalam
                                            hitungan menit.
                                        </p>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={handleContactSubmit}
                                        className="mt-6 space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-[#5C3D2E]">
                                                    Nama Lengkap
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Nama Anda"
                                                    value={contactForm.name}
                                                    onChange={(e) =>
                                                        setContactForm({
                                                            ...contactForm,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-[#FDFDFC] px-4 py-3 text-xs text-[#24140E] placeholder:text-[#A89687] focus:border-[#24140E] focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-[#5C3D2E]">
                                                    No. WhatsApp / Email
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="0812xxxx / email@anda.com"
                                                    value={contactForm.contact}
                                                    onChange={(e) =>
                                                        setContactForm({
                                                            ...contactForm,
                                                            contact:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-2xl border border-[#D5C2B1] bg-[#FDFDFC] px-4 py-3 text-xs text-[#24140E] placeholder:text-[#A89687] focus:border-[#24140E] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-[#5C3D2E]">
                                                Keperluan / Topik
                                            </label>
                                            <select
                                                value={contactForm.subject}
                                                onChange={(e) =>
                                                    setContactForm({
                                                        ...contactForm,
                                                        subject: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-2xl border border-[#D5C2B1] bg-[#FDFDFC] px-4 py-3 text-xs text-[#24140E] focus:border-[#24140E] focus:outline-none"
                                            >
                                                <option value="Reservasi Tempat & Meja">
                                                    Reservasi Tempat &amp; Meja
                                                </option>
                                                <option value="Event / Private Gathering">
                                                    Event &amp; Private
                                                    Gathering
                                                </option>
                                                <option value="Pertanyaan Layanan & Menu">
                                                    Pertanyaan Layanan Kedai
                                                </option>
                                                <option value="Kerjasama & Kolaborasi Bisnis">
                                                    Kerjasama &amp; Kolaborasi
                                                </option>
                                                <option value="Saran & Masukan">
                                                    Saran &amp; Masukan
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-[#5C3D2E]">
                                                Detail Pesan / Jumlah Orang
                                                &amp; Waktu
                                            </label>
                                            <textarea
                                                rows={4}
                                                required
                                                placeholder="Tuliskan keterangan detail reservasi atau pertanyaan Anda di sini..."
                                                value={contactForm.message}
                                                onChange={(e) =>
                                                    setContactForm({
                                                        ...contactForm,
                                                        message: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-2xl border border-[#D5C2B1] bg-[#FDFDFC] px-4 py-3 text-xs text-[#24140E] placeholder:text-[#A89687] focus:border-[#24140E] focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
                                            <p className="text-[11px] text-[#7A6353]">
                                                *Pesan langsung diteruskan
                                                secara otomatis ke WhatsApp CS
                                                Pos Cafe.
                                            </p>
                                            <button
                                                type="submit"
                                                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#24140E] px-8 py-3.5 text-xs font-semibold text-[#FAF4ED] shadow-md transition hover:bg-[#3D2319] sm:w-auto"
                                            >
                                                <Send className="h-4 w-4" />
                                                <span>Kirim via WhatsApp</span>
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= FOOTER ================= */}
                <footer className="border-t border-[#D5C2B1]/60 bg-[#24140E] py-10 text-[#FAF4ED]">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8 md:px-12 lg:px-16">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF4ED] text-[#24140E]">
                                <CoffeeBeanIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-serif text-xl font-bold tracking-tight text-[#FAF4ED]">
                                    Pos Cafe
                                </span>
                                <p className="text-[10px] text-[#D5C2B1]">
                                    Seni &amp; Ritual Kopi Indonesia
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#D5C2B1]">
                            <button
                                type="button"
                                onClick={() => scrollToSection('beranda')}
                                className="cursor-pointer transition hover:text-[#FAF4ED]"
                            >
                                Beranda
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToSection('cerita')}
                                className="cursor-pointer transition hover:text-[#FAF4ED]"
                            >
                                Cerita Kami
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToSection('lokasi')}
                                className="cursor-pointer transition hover:text-[#FAF4ED]"
                            >
                                Lokasi &amp; Jam
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToSection('kontak')}
                                className="cursor-pointer transition hover:text-[#FAF4ED]"
                            >
                                Kontak Kami
                            </button>
                            <Link
                                href={auth?.user ? dashboard() : login()}
                                className="font-semibold text-amber-200 hover:text-amber-100"
                            >
                                Portal Kasir (POS)
                            </Link>
                        </div>

                        <p className="text-xs text-[#A89687]">
                            © {new Date().getFullYear()} Pos Cafe. All rights
                            reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
