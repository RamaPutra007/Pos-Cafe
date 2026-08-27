import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Lock,
    Mail,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { home, login } from '@/routes';
import { store } from '@/routes/register';

// Coffee bean vector decorative outline icon
function CoffeeBeanOutlineIcon({
    className = 'w-5 h-5',
}: {
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18.5 5.5a7 7 0 0 0-9.9 0L4.8 9.3a7 7 0 0 0 9.9 9.9l3.8-3.8a7 7 0 0 0 0-9.9z" />
            <path d="M8.5 8.5c1.5 1.5 2.5 3.5 2.5 5.5s1 4 2.5 5.5" />
        </svg>
    );
}

// Botanical leaf decorative sketch
function LeafSketchIcon({ className = 'w-24 h-24' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M10 90 Q 40 50 90 10" />
            <path d="M90 10 Q 70 30 50 45" />
            <path d="M50 45 Q 65 35 75 25" />
            <path d="M35 60 Q 55 45 70 40" />
            <path d="M20 75 Q 40 60 55 58" />
            <path
                d="M90 10 Q 50 20 40 40 Q 30 60 10 90 Q 40 80 60 60 Q 80 40 90 10 Z"
                opacity="0.3"
            />
        </svg>
    );
}

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <>
            <Head title="Daftar Akun - Pos Cafe">
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

            {/* Full-screen wrapper */}
            <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#F7F2EB] bg-[url('/images/bgmenu.png')] bg-cover bg-center bg-no-repeat p-4 font-sans text-[#2A1810] sm:p-6 md:p-10 lg:p-12">
                <div className="absolute inset-0 bg-[#f9f5ee]/25 backdrop-blur-[0.5px]" />

                {/* Back to Home floating link */}
                <div className="absolute top-5 left-5 z-20 sm:top-8 sm:left-8">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#D5C2B1]/80 bg-[#F7F2EB]/85 px-4 py-2 text-xs font-semibold text-[#24140E] shadow-sm backdrop-blur-sm transition hover:scale-105 hover:bg-[#EFE8DF] active:scale-95"
                    >
                        <ArrowLeft className="h-4 w-4 text-[#7A4B2F]" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-[#E3D4C4]/80 bg-[#FBF7F0]/95 p-6 shadow-2xl shadow-[#2A1810]/20 backdrop-blur-md sm:p-10 md:rounded-[3rem] lg:max-w-5xl lg:p-12">
                    <div className="mb-6 flex items-center justify-between sm:mb-8">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-[#5A3726] px-4 py-1.5 text-xs font-semibold tracking-wider text-[#FAF3EB] shadow-sm transition hover:scale-105"
                        >
                            <span className="font-serif text-sm italic">
                                Pos
                            </span>
                            <span className="text-[10px] text-amber-200/80 uppercase">
                                Cafe
                            </span>
                        </Link>

                        <span className="hidden font-serif text-sm font-semibold tracking-wider text-[#9E8372] uppercase sm:block">
                            Registrasi Akun Baru
                        </span>
                    </div>

                    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-14">
                        {/* Left Column: Image */}
                        <div className="relative flex items-center justify-center md:col-span-6">
                            <div className="pointer-events-none absolute -top-8 -right-4 text-[#C9B29F]/50">
                                <LeafSketchIcon className="h-28 w-28 rotate-12" />
                            </div>
                            <div className="pointer-events-none absolute -bottom-6 -left-4 text-[#C9B29F]/40">
                                <LeafSketchIcon className="h-24 w-24 -rotate-45" />
                            </div>
                            <div className="pointer-events-none absolute top-4 right-10 text-[#A88C78]/60">
                                <CoffeeBeanOutlineIcon className="h-6 w-6 rotate-45" />
                            </div>
                            <div className="pointer-events-none absolute bottom-8 left-12 text-[#A88C78]/60">
                                <CoffeeBeanOutlineIcon className="h-5 w-5 -rotate-12" />
                            </div>

                            <div className="relative aspect-[4/3.6] w-full max-w-[380px] overflow-hidden rounded-[2.8rem_1.5rem_3.8rem_2rem] border-[10px] border-[#8C5B3E] bg-[#3B2215] shadow-xl sm:border-[14px] md:max-w-[420px]">
                                <img
                                    src="/images/barista-login.jpg"
                                    alt="Barista Pos Cafe"
                                    className="h-full w-full object-cover object-center transition duration-700 hover:scale-105"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2A1810]/40 via-transparent to-transparent" />
                            </div>
                        </div>

                        {/* Right Column: Register Form */}
                        <div className="flex flex-col justify-center md:col-span-6">
                            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#24140E] sm:text-4xl">
                                Buat Akun Baru ✨
                            </h1>
                            <p className="mt-1 mb-6 text-sm font-medium text-[#8C6B56]">
                                Bergabunglah bersama komunitas Pos Cafe
                            </p>

                            <Form
                                {...store.form()}
                                resetOnSuccess={[
                                    'password',
                                    'password_confirmation',
                                ]}
                                className="flex flex-col gap-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {/* Name Field */}
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="name"
                                                className="text-xs font-bold text-[#3B2215]"
                                            >
                                                Nama Lengkap
                                            </Label>
                                            <div className="relative flex items-center">
                                                <div className="pointer-events-none absolute left-3.5 text-[#9E8372]">
                                                    <UserIcon className="h-4 w-4" />
                                                </div>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    name="name"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="name"
                                                    placeholder="Nama Anda"
                                                    className="w-full rounded-2xl border border-[#E0D0C1] bg-[#FFFDF9] py-3 pr-4 pl-10 text-xs text-[#24140E] shadow-xs transition placeholder:text-[#B59F8E] focus:border-[#8C5B3E] focus:ring-2 focus:ring-[#8C5B3E]/20 focus:outline-none sm:text-sm"
                                                />
                                            </div>
                                            <InputError message={errors.name} />
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="email"
                                                className="text-xs font-bold text-[#3B2215]"
                                            >
                                                Alamat Email
                                            </Label>
                                            <div className="relative flex items-center">
                                                <div className="pointer-events-none absolute left-3.5 text-[#9E8372]">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="email"
                                                    placeholder="email@contoh.com"
                                                    className="w-full rounded-2xl border border-[#E0D0C1] bg-[#FFFDF9] py-3 pr-4 pl-10 text-xs text-[#24140E] shadow-xs transition placeholder:text-[#B59F8E] focus:border-[#8C5B3E] focus:ring-2 focus:ring-[#8C5B3E]/20 focus:outline-none sm:text-sm"
                                                />
                                            </div>
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="password"
                                                className="text-xs font-bold text-[#3B2215]"
                                            >
                                                Kata Sandi
                                            </Label>
                                            <div className="relative flex items-center">
                                                <div className="pointer-events-none absolute left-3.5 text-[#9E8372]">
                                                    <Lock className="h-4 w-4" />
                                                </div>
                                                <input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    name="password"
                                                    required
                                                    tabIndex={3}
                                                    autoComplete="new-password"
                                                    placeholder="Minimal 8 karakter"
                                                    passwordrules={
                                                        passwordRules
                                                    }
                                                    className="w-full rounded-2xl border border-[#E0D0C1] bg-[#FFFDF9] py-3 pr-10 pl-10 text-xs text-[#24140E] shadow-xs transition placeholder:text-[#B59F8E] focus:border-[#8C5B3E] focus:ring-2 focus:ring-[#8C5B3E]/20 focus:outline-none sm:text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword,
                                                        )
                                                    }
                                                    className="absolute right-3.5 text-[#9E8372] transition hover:text-[#24140E]"
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        {/* Password Confirmation Field */}
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className="text-xs font-bold text-[#3B2215]"
                                            >
                                                Konfirmasi Kata Sandi
                                            </Label>
                                            <div className="relative flex items-center">
                                                <div className="pointer-events-none absolute left-3.5 text-[#9E8372]">
                                                    <Lock className="h-4 w-4" />
                                                </div>
                                                <input
                                                    id="password_confirmation"
                                                    type={
                                                        showConfirmPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    name="password_confirmation"
                                                    required
                                                    tabIndex={4}
                                                    autoComplete="new-password"
                                                    placeholder="Ulangi kata sandi"
                                                    passwordrules={
                                                        passwordRules
                                                    }
                                                    className="w-full rounded-2xl border border-[#E0D0C1] bg-[#FFFDF9] py-3 pr-10 pl-10 text-xs text-[#24140E] shadow-xs transition placeholder:text-[#B59F8E] focus:border-[#8C5B3E] focus:ring-2 focus:ring-[#8C5B3E]/20 focus:outline-none sm:text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword,
                                                        )
                                                    }
                                                    className="absolute right-3.5 text-[#9E8372] transition hover:text-[#24140E]"
                                                    tabIndex={-1}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            <InputError
                                                message={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            tabIndex={5}
                                            data-test="register-user-button"
                                            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#7C4F36] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#7C4F36]/25 transition hover:bg-[#683F2A] hover:shadow-lg active:scale-[0.99] disabled:opacity-70"
                                        >
                                            {processing && (
                                                <Spinner className="h-4 w-4 text-white" />
                                            )}
                                            <span>Daftar Sekarang</span>
                                        </button>

                                        <div className="mt-2 text-center text-xs text-[#7A6353]">
                                            Sudah memiliki akun?{' '}
                                            <Link
                                                href={login()}
                                                className="font-semibold text-[#7A4B2F] transition hover:text-[#24140E] hover:underline"
                                            >
                                                Masuk di sini
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
