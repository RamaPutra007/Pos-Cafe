import { Form } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="rounded-3xl border border-[#FCD8CC] bg-[#FFF8F6] p-6 shadow-xs sm:p-8">
            <div className="border-b border-[#FCD8CC] pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#FCD8CC] bg-[#FDE8E8] text-[#C53030]">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#C53030]">
                            Zona Berbahaya: Hapus Akun
                        </h3>
                        <p className="text-xs text-[#9C3030]">
                            Tindakan ini permanen. Semua data akun, riwayat
                            login, dan akses sistem akan dihapus.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs leading-relaxed text-[#7A6353]">
                    Setelah akun Anda dihapus, seluruh data tidak dapat
                    dipulihkan kembali. Pastikan Anda telah mengonfirmasi dengan
                    pemilik kafe sebelum melanjutkan.
                </p>

                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            data-test="delete-user-button"
                            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl bg-[#C53030] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#A82323]"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Hapus Akun Saya</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 sm:max-w-md">
                        <DialogTitle className="font-serif text-lg font-bold text-[#24140E]">
                            Apakah Anda yakin ingin menghapus akun?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#7A6353]">
                            Masukkan kata sandi Anda saat ini untuk
                            mengonfirmasi bahwa Anda benar-benar ingin menghapus
                            akun ini secara permanen.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="mt-4 space-y-4"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor="delete_password"
                                            className="block text-xs font-bold text-[#24140E]"
                                        >
                                            Konfirmasi Kata Sandi
                                        </label>

                                        <PasswordInput
                                            id="delete_password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Masukkan kata sandi Anda..."
                                            autoComplete="current-password"
                                            className="rounded-2xl border-[#E2D4C6] bg-[#F7F2EB] py-2 text-xs focus:border-[#C53030] focus:bg-white"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
                                        <DialogClose asChild>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                                className="cursor-pointer rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-2 text-xs font-bold text-[#24140E] hover:bg-[#EAE0D4]"
                                            >
                                                Batal
                                            </button>
                                        </DialogClose>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="confirm-delete-user-button"
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[#C53030] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#A82323] disabled:opacity-60"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span>
                                                {processing
                                                    ? 'Menghapus...'
                                                    : 'Ya, Hapus Akun'}
                                            </span>
                                        </button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
