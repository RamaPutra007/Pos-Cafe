import { router } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { destroy } from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController';
import PasskeyItem from '@/components/passkey-item';
import PasskeyRegistration from '@/components/passkey-register';
import type { Passkey } from '@/types/auth';

export type Props = {
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

const EmptyState = () => {
    return (
        <div className="p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF3EC] text-[#6B4028] border border-[#E8D7C8]">
                <KeyRound className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-[#24140E]">
                Belum ada Kunci Masuk (Passkey)
            </p>
            <p className="mt-1 text-[11px] text-[#7A6353]">
                Tambahkan Passkey (Fingerprint / Face ID / Windows Hello) untuk login cepat tanpa mengetik kata sandi.
            </p>
        </div>
    );
};

export default function ManagePasskeys(props: Props) {
    const passkeys = props.passkeys ?? [];

    const handleDelete = (id: number, onError: () => void) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onError,
        });
    };

    const handleRegisterSuccess = () => {
        router.reload();
    };

    if (!(props.canManagePasskeys ?? false)) {
        return null;
    }

    return (
        <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs sm:p-8">
            <div className="border-b border-[#EADCCE] pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3EC] text-[#6B4028] border border-[#E8D7C8]">
                        <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#24140E]">
                            Kunci Masuk (Passkeys)
                        </h3>
                        <p className="text-xs text-[#7A6353]">
                            Kelola perangkat biometrik dan kunci fisik untuk autentikasi instan.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-5 space-y-4">
                <div className="overflow-hidden rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB]/50">
                    {passkeys.length > 0 ? (
                        passkeys.map((passkey) => (
                            <PasskeyItem
                                key={passkey.id}
                                passkey={passkey}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </div>

                <div>
                    <PasskeyRegistration onSuccess={handleRegisterSuccess} />
                </div>
            </div>
        </div>
    );
}
