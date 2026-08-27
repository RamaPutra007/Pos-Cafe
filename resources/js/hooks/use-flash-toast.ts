import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

interface FlashData {
    toast?: FlashToast;
    status?: string;
    success?: string;
    error?: string;
}

export function useFlashToast(): void {
    const lastToastRef = useRef<string | null>(null);

    useEffect(() => {
        const processFlash = (props: Record<string, unknown> | undefined) => {
            if (!props) {
                return;
            }

            const flash = props.flash as FlashData | undefined;

            if (!flash) {
                return;
            }

            if (flash.toast) {
                const key = `${flash.toast.type}:${flash.toast.message}`;

                if (lastToastRef.current !== key) {
                    lastToastRef.current = key;
                    toast[flash.toast.type](flash.toast.message);
                }
            } else if (flash.success) {
                if (lastToastRef.current !== `success:${flash.success}`) {
                    lastToastRef.current = `success:${flash.success}`;
                    toast.success(flash.success);
                }
            } else if (flash.error) {
                if (lastToastRef.current !== `error:${flash.error}`) {
                    lastToastRef.current = `error:${flash.error}`;
                    toast.error(flash.error);
                }
            } else if (flash.status) {
                if (lastToastRef.current !== `info:${flash.status}`) {
                    lastToastRef.current = `info:${flash.status}`;
                    toast.info(flash.status);
                }
            }
        };

        // Process flash on initial page load if embedded in DOM
        try {
            const pageEl = document.querySelector('[data-page]');

            if (pageEl) {
                const raw = pageEl.getAttribute('data-page');

                if (raw) {
                    const parsed = JSON.parse(raw);
                    processFlash(parsed.props);
                }
            }
        } catch {
            // Ignore DOM parse failure
        }

        // Process flash on subsequent Inertia navigations
        const unregisterSuccess = router.on('success', (event) => {
            processFlash(event.detail.page.props);
        });

        const unregisterFlash = router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (data) {
                toast[data.type](data.message);
            }
        });

        return () => {
            unregisterSuccess();
            unregisterFlash();
        };
    }, []);
}
