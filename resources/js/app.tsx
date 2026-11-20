import { createInertiaApp } from '@inertiajs/react';
import { AnimateUIProvider } from '@animate-ui/react/provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'POS Kasir';

void createInertiaApp({
    title: (title) => (title ? `${title}` : appName),
    defaults: {
        visitOptions: () => ({
            viewTransition: true,
        }),
    },
    strictMode: true,
    withApp(app) {
        return (
            <AnimateUIProvider tempo={1}>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </AnimateUIProvider>
        );
    },
    progress: {
        color: '#c28a4d',
    },
});

// Set light / dark mode on load
initializeTheme();
