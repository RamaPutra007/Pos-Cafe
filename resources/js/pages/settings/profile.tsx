import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Check, Mail, Save, User } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Profil Pengguna - Pengaturan Akun" />

            <div className="space-y-6">
                {/* Profile Information Card */}
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs sm:p-8">
                    <div className="border-b border-[#EADCCE] pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8D7C8] bg-[#FAF3EC] text-[#6B4028]">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                    Informasi Profil
                                </h3>
                                <p className="text-xs text-[#7A6353]">
                                    Perbarui nama lengkap dan alamat email akun
                                    kasir / staf Anda.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="mt-6 space-y-5"
                    >
                        {({ processing, errors, recentlySuccessful }) => (
                            <>
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="name"
                                        className="block text-xs font-bold tracking-wider text-[#24140E] uppercase"
                                    >
                                        Nama Lengkap
                                    </label>
                                    <div className="relative">
                                        <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8C6B56]" />
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            defaultValue={auth.user.name}
                                            autoComplete="name"
                                            placeholder="cth. Rama Putra"
                                            className="w-full rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] py-2.5 pr-4 pl-10 text-xs font-semibold text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                    <InputError
                                        className="mt-1"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="email"
                                        className="block text-xs font-bold tracking-wider text-[#24140E] uppercase"
                                    >
                                        Alamat Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8C6B56]" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            defaultValue={auth.user.email}
                                            autoComplete="username"
                                            placeholder="cth. nama@cafe.com"
                                            className="w-full rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] py-2.5 pr-4 pl-10 text-xs font-semibold text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white focus:outline-none"
                                        />
                                    </div>
                                    <InputError
                                        className="mt-1"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="rounded-2xl border border-[#FCD8CC] bg-[#FFF2ED] p-4 text-xs">
                                            <p className="text-[#A45E45]">
                                                Alamat email Anda belum
                                                diverifikasi.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="font-bold text-[#C84A23] underline underline-offset-2 hover:text-[#8C3315]"
                                                >
                                                    Kirim ulang email verifikasi
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 font-bold text-[#2E7D32]">
                                                    ✓ Tautan verifikasi baru
                                                    telah dikirim ke email Anda.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#6B4028] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#57331F] disabled:opacity-60"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>
                                            {processing
                                                ? 'Menyimpan...'
                                                : 'Simpan Perubahan'}
                                        </span>
                                    </button>

                                    {recentlySuccessful && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32]">
                                            <Check className="h-4 w-4" />
                                            Berhasil Disimpan
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* Delete Account Card */}
                <DeleteUser />
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Profil',
            href: edit(),
        },
    ],
};
