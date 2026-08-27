import { Head } from '@inertiajs/react';
import { Palette } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Tampilan & Tema - Pengaturan Akun" />

            <div className="space-y-6">
                <div className="rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-6 shadow-xs sm:p-8">
                    <div className="border-b border-[#EADCCE] pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3EC] text-[#6B4028] border border-[#E8D7C8]">
                                <Palette className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                    Preferensi Tampilan & Tema
                                </h3>
                                <p className="text-xs text-[#7A6353]">
                                    Sesuaikan tema visual sistem POS Cafe sesuai kenyamanan mata Anda saat bertugas di kasir.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <AppearanceTabs />
                    </div>
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Tampilan & Tema',
            href: editAppearance(),
        },
    ],
};
