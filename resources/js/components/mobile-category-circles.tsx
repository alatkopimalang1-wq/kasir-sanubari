import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Coffee,
    Flame,
    FlaskConical,
    Droplets,
    Mountain,
    Award,
    Package,
    Compass,
} from 'lucide-react';

interface CategoryItem {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
}

export const MobileCategoryCircles: React.FC = () => {
    const items: CategoryItem[] = [
        {
            id: 'kawi',
            label: 'Kopi Kawi',
            href: '/shop?series=kawi',
            icon: <Mountain className="h-6 w-6 text-accent-copper" />,
            badge: 'Signature',
        },
        {
            id: 'co-ferment',
            label: 'CO-Ferment',
            href: '/shop?series=co-ferment',
            icon: <FlaskConical className="h-6 w-6 text-brand-700" />,
            badge: 'Popular',
        },
        {
            id: 'classic',
            label: 'Classic Filter',
            href: '/shop?category=classic-process',
            icon: <Droplets className="h-6 w-6 text-brand-700" />,
        },
        {
            id: 'experimental',
            label: 'Eksperimen',
            href: '/shop?category=experimental-process',
            icon: <Coffee className="h-6 w-6 text-brand-700" />,
        },
        {
            id: 'espresso',
            label: 'Espresso',
            href: '/shop?category=espresso-beans',
            icon: <Flame className="h-6 w-6 text-amber-600" />,
        },
        {
            id: 'houseblend',
            label: 'Houseblend',
            href: '/shop?series=houseblend',
            icon: <Award className="h-6 w-6 text-brand-700" />,
        },
        {
            id: 'tester',
            label: 'Tester 15g',
            href: '/shop?q=tester',
            icon: <Package className="h-6 w-6 text-emerald-600" />,
        },
        {
            id: 'guide',
            label: 'Panduan',
            href: '/panduan-seduh',
            icon: <Compass className="h-6 w-6 text-brand-700" />,
        },
    ];

    return (
        <div className="px-4 py-2">
            <div className="grid grid-cols-4 gap-3">
                {items.slice(0, 4).map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className="group flex flex-col items-center text-center"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-200/60 transition-colors group-hover:bg-sand-200">
                            {item.icon}
                        </div>
                        <span className="mt-2 line-clamp-1 text-[13px] leading-snug font-medium text-brand-950">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
};
