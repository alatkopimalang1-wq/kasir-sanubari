import React, { useEffect, useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { CoffeeBeanIcon } from '@/components/coffee-bean-icon';

export const GlobalCoffeeBeanLoader: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const minDisplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        const handleStart = () => {
            // Small debounce (80ms) so instantaneous cache hits don't cause a jarring flash
            timeoutRef.current = setTimeout(() => {
                startTimeRef.current = Date.now();
                setIsLoading(true);
                setVisible(true);
            }, 80);
        };

        const handleFinish = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            if (isLoading) {
                // Ensure at least 250ms display duration for smooth eye-tracking animation
                const elapsed = Date.now() - startTimeRef.current;
                const remaining = Math.max(0, 250 - elapsed);

                minDisplayTimeoutRef.current = setTimeout(() => {
                    setVisible(false);
                    // allow transition out
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 200);
                }, remaining);
            } else {
                setVisible(false);
                setIsLoading(false);
            }
        };

        const removeStart = router.on('start', handleStart);
        const removeFinish = router.on('finish', handleFinish);
        const removeError = router.on('error', handleFinish);
        const removeCancel = router.on('cancel', handleFinish);

        return () => {
            removeStart();
            removeFinish();
            removeError();
            removeCancel();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (minDisplayTimeoutRef.current)
                clearTimeout(minDisplayTimeoutRef.current);
        };
    }, [isLoading]);

    if (!isLoading && !visible) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {/* Pure Coffee Bean Icon Only - Tanpa Background Putih */}
            <div
                className={`transform transition-all duration-300 ${
                    visible
                        ? 'translate-y-0 scale-100'
                        : 'translate-y-2 scale-90'
                }`}
            >
                <img
                    src="/brand/coffee-beans.png"
                    alt="Loading..."
                    className="h-20 w-20 animate-pulse object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)] select-none sm:h-24 sm:w-24 md:h-28 md:w-28"
                />
            </div>
        </div>
    );
};
