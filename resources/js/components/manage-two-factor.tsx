import { Form } from '@inertiajs/react';
import { Shield, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs sm:p-8">
            <div className="border-b border-[#EADCCE] pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3EC] text-[#6B4028] border border-[#E8D7C8]">
                            <Shield className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                Autentikasi Dua Faktor (2FA)
                            </h3>
                            <p className="text-xs text-[#7A6353]">
                                Tambahkan lapisan keamanan ekstra dengan aplikasi authenticator (Google Authenticator / Authy).
                            </p>
                        </div>
                    </div>

                    <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                            twoFactorEnabled
                                ? 'bg-[#EAF7ED] text-[#2E7D32]'
                                : 'bg-[#F7F2EB] text-[#8C6B56]'
                        }`}
                    >
                        {twoFactorEnabled ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                </div>
            </div>

            <div className="mt-5">
                {twoFactorEnabled ? (
                    <div className="flex flex-col items-start justify-start space-y-4">
                        <p className="text-xs text-[#7A6353] leading-relaxed">
                            Autentikasi dua faktor saat ini aktif. Anda akan diminta memasukkan 6 digit kode keamanan dari aplikasi authenticator ponsel Anda saat melakukan login.
                        </p>

                        <div className="relative inline">
                            <Form {...disable.form()}>
                                {({ processing }) => (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="cursor-pointer rounded-2xl bg-[#C53030] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#A82323] disabled:opacity-60"
                                    >
                                        {processing ? 'Menonaktifkan...' : 'Nonaktifkan 2FA'}
                                    </button>
                                )}
                            </Form>
                        </div>

                        <TwoFactorRecoveryCodes
                            recoveryCodesList={recoveryCodesList}
                            fetchRecoveryCodes={fetchRecoveryCodes}
                            errors={errors}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-start justify-start space-y-4">
                        <p className="text-xs text-[#7A6353] leading-relaxed">
                            Saat mengaktifkan 2FA, sistem akan meminta token waktu nyata dari ponsel Anda setiap kali Anda masuk ke akun POS Cafe untuk mencegah akses tanpa izin.
                        </p>

                        <div>
                            {hasSetupData ? (
                                <button
                                    type="button"
                                    onClick={() => setShowSetupModal(true)}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#6B4028] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#57331F]"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Lanjutkan Konfigurasi 2FA</span>
                                </button>
                            ) : (
                                <Form
                                    {...enable.form()}
                                    onSuccess={() => setShowSetupModal(true)}
                                >
                                    {({ processing }) => (
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#6B4028] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#57331F] disabled:opacity-60"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            <span>
                                                {processing
                                                    ? 'Menyiapkan...'
                                                    : 'Aktifkan 2FA Sekarang'}
                                            </span>
                                        </button>
                                    )}
                                </Form>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </div>
    );
}
