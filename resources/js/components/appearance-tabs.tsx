import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: {
        value: Appearance;
        icon: LucideIcon;
        label: string;
        desc: string;
    }[] = [
        {
            value: 'light',
            icon: Sun,
            label: 'Terang (Light)',
            desc: 'Nuansa cerah krem artisan hangat',
        },
        {
            value: 'dark',
            icon: Moon,
            label: 'Gelap (Dark)',
            desc: 'Nuansa kopi espresso malam hari',
        },
        {
            value: 'system',
            icon: Monitor,
            label: 'Sistem (Auto)',
            desc: 'Menyesuaikan tema perangkat Anda',
        },
    ];

    return (
        <div
            className={cn('grid grid-cols-1 gap-3 sm:grid-cols-3', className)}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label, desc }) => {
                const isSelected = appearance === value;

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex cursor-pointer flex-col items-start rounded-2xl border p-4 text-left transition duration-200',
                            isSelected
                                ? 'border-[#6B4028] bg-[#FAF3EC] shadow-xs'
                                : 'border-[#E2D4C6] bg-[#F7F2EB]/60 hover:border-[#6B4028]/50 hover:bg-[#F7F2EB]',
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl transition',
                                isSelected
                                    ? 'bg-[#6B4028] text-white shadow-xs'
                                    : 'bg-[#E5D6C7] text-[#6B574B]',
                            )}
                        >
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="mt-3">
                            <h4 className="text-xs font-bold text-[#24140E]">
                                {label}
                            </h4>
                            <p className="mt-0.5 text-[11px] text-[#7A6353]">
                                {desc}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
