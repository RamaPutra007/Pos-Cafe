import { Form, Head } from '@inertiajs/react';
import { Check, Lock, Save } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Keamanan & Kata Sandi - Pengaturan Akun" />

            <div className="space-y-6">
                {/* Update Password Card */}
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs sm:p-8">
                    <div className="border-b border-[#EADCCE] pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8D7C8] bg-[#FAF3EC] text-[#6B4028]">
                                <Lock className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                    Perbarui Kata Sandi
                                </h3>
                                <p className="text-xs text-[#7A6353]">
                                    Pastikan akun Anda menggunakan kombinasi
                                    kata sandi yang kuat dan aman.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="mt-6 space-y-5"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="current_password"
                                        className="block text-xs font-bold tracking-wider text-[#24140E] uppercase"
                                    >
                                        Kata Sandi Saat Ini
                                    </label>

                                    <PasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        className="w-full rounded-2xl border-[#E2D4C6] bg-[#F7F2EB] py-2.5 text-xs font-semibold text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white"
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi lama..."
                                    />

                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-bold tracking-wider text-[#24140E] uppercase"
                                    >
                                        Kata Sandi Baru
                                    </label>

                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="w-full rounded-2xl border-[#E2D4C6] bg-[#F7F2EB] py-2.5 text-xs font-semibold text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white"
                                        autoComplete="new-password"
                                        placeholder="Minimal 8 karakter unik..."
                                        passwordrules={props.passwordRules}
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="password_confirmation"
                                        className="block text-xs font-bold tracking-wider text-[#24140E] uppercase"
                                    >
                                        Ulangi Kata Sandi Baru
                                    </label>

                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="w-full rounded-2xl border-[#E2D4C6] bg-[#F7F2EB] py-2.5 text-xs font-semibold text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white"
                                        autoComplete="new-password"
                                        placeholder="Ketik ulang kata sandi baru..."
                                        passwordrules={props.passwordRules}
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        data-test="update-password-button"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#6B4028] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#57331F] disabled:opacity-60"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>
                                            {processing
                                                ? 'Menyimpan...'
                                                : 'Simpan Kata Sandi'}
                                        </span>
                                    </button>

                                    {recentlySuccessful && (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32]">
                                            <Check className="h-4 w-4" />
                                            Kata Sandi Diperbarui
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* 2FA Card */}
                <ManageTwoFactor
                    canManageTwoFactor={props.canManageTwoFactor}
                    requiresConfirmation={props.requiresConfirmation}
                    twoFactorEnabled={props.twoFactorEnabled}
                />

                {/* Passkeys Card */}
                <ManagePasskeys
                    canManagePasskeys={props.canManagePasskeys}
                    passkeys={props.passkeys}
                />
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan Akun',
            href: edit(),
        },
    ],
};
