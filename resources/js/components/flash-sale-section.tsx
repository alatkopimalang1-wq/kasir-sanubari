import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, ShoppingBag, Zap } from 'lucide-react';

export interface FlashSaleItem {
    id: string | number;
    name: string;
    slug?: string;
    price: number;
    original_price?: number | null;
    image: string;
    badge?: string | null;
    stock_status?: string;
}

interface FlashSaleSectionProps {
    products?: FlashSaleItem[];
    endTime?: string | null;
    title?: string;
    subtitle?: string;
    isActive?: boolean;
}

export function FlashSaleSection({
    products = [],
    endTime,
    title = 'FLASH SALE',
    subtitle = 'Penawaran terbatas harga terbaik hari ini',
    isActive = true,
}: FlashSaleSectionProps) {
    const calculateRemainingSeconds = () => {
        if (!endTime) return 0;
        try {
            const formatted = endTime.includes('T')
                ? endTime
                : endTime.replace(' ', 'T');
            const target = new Date(formatted).getTime();
            const now = new Date().getTime();
            if (isNaN(target)) return 0;
            return Math.max(0, Math.floor((target - now) / 1000));
        } catch {
            return 0;
        }
    };

    // Live countdown timer state
    const [secondsLeft, setSecondsLeft] = useState<number>(
        calculateRemainingSeconds,
    );

    useEffect(() => {
        setSecondsLeft(calculateRemainingSeconds());
        const interval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    const days = Math.floor(secondsLeft / 86400);
    const hours = String(Math.floor((secondsLeft % 86400) / 3600)).padStart(
        2,
        '0',
    );
    const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(
        2,
        '0',
    );
    const seconds = String(secondsLeft % 60).padStart(2, '0');

    const formatPrice = (val?: number | null) => {
        if (!val) return '0';
        return new Intl.NumberFormat('id-ID').format(val);
    };

    if (!isActive || !products || products.length === 0) {
        return null;
    }

    return (
        <section
            className="mx-auto w-full max-w-7xl px-2.5 sm:px-6 lg:px-8"
            aria-label="Promo Flash Sale"
        >
            <div className="to-brand-850 relative flex w-full flex-col items-stretch gap-3 overflow-hidden rounded-2xl border border-brand-700/40 bg-gradient-to-br from-brand-950 via-brand-900 p-2.5 shadow-xl shadow-brand-950/20 sm:gap-6 sm:rounded-3xl sm:p-6 md:flex-row md:items-center lg:p-7">
                {/* Decorative Subtle Background Glow */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent-copper/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />

                {/* Left Column: Brand Hero Banner (Desktop Only) */}
                <div className="relative z-10 hidden flex-shrink-0 flex-col items-start justify-center text-white md:flex md:w-52 lg:w-60">
                    <div className="space-y-2 sm:space-y-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-copper/40 bg-accent-copper/20 px-3 py-1 text-[11px] font-black tracking-wider text-accent-copper-light uppercase backdrop-blur-md sm:text-xs">
                            <Zap className="h-3.5 w-3.5 fill-accent-copper-light text-accent-copper-light" />
                            <span>PROMO SPESIAL</span>
                        </div>
                        <h2 className="text-3xl leading-[0.92] font-black tracking-tight text-white sm:text-4xl lg:text-[44px]">
                            {title.includes(' ') ? (
                                <>
                                    {title.split(' ')[0]}
                                    <br />
                                    <span className="bg-gradient-to-b from-[#f3c28b] via-[#e6a765] to-[#a06f32] bg-clip-text text-accent-copper-light text-transparent">
                                        {title.split(' ').slice(1).join(' ')}
                                    </span>
                                </>
                            ) : (
                                <span className="bg-gradient-to-b from-[#f3c28b] via-[#e6a765] to-[#a06f32] bg-clip-text text-accent-copper-light text-transparent">
                                    {title}
                                </span>
                            )}
                        </h2>
                        <p className="max-w-[200px] text-xs leading-snug font-medium text-brand-200 sm:text-sm">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Main Content Area: Mobile Header + Products Grid / Carousel */}
                <div className="relative z-10 flex w-full min-w-0 flex-1 flex-col justify-center gap-2.5 sm:gap-4">
                    {/* Mobile Header (matches reference screenshot): Pill Badge + Countdown + Arrow Button */}
                    <div className="flex w-full items-center justify-between gap-1.5 md:hidden">
                        {/* 1. Left Pill: FLASH SALE with bolt icon */}
                        <div className="inline-flex items-center gap-1 rounded-full border border-accent-copper/50 bg-brand-950/90 px-2.5 py-1 text-[11px] font-black tracking-wider text-accent-copper-light uppercase shadow-xs">
                            <Zap className="h-3 w-3 fill-accent-copper text-accent-copper" />
                            <span>FLASH SALE</span>
                        </div>

                        {/* 2. Center: Berakhir dalam + countdown boxes */}
                        <div className="inline-flex items-center gap-1.5">
                            <span className="text-[11px] font-bold whitespace-nowrap text-sand-200">
                                Berakhir dalam
                            </span>
                            <div className="inline-flex items-center gap-1">
                                {days > 0 && (
                                    <span className="min-w-[22px] rounded-md bg-[#b43425] px-1.5 py-0.5 text-center text-xs font-black text-white shadow-xs">
                                        {days}h
                                    </span>
                                )}
                                <span className="min-w-[22px] rounded-md bg-[#b43425] px-1.5 py-0.5 text-center text-xs font-black text-white shadow-xs">
                                    {hours}
                                </span>
                                <span className="min-w-[22px] rounded-md bg-[#b43425] px-1.5 py-0.5 text-center text-xs font-black text-white shadow-xs">
                                    {minutes}
                                </span>
                                <span className="min-w-[22px] rounded-md bg-[#b43425] px-1.5 py-0.5 text-center text-xs font-black text-white shadow-xs">
                                    {seconds}
                                </span>
                            </div>
                        </div>

                        {/* 3. Right: Circular arrow button to /flash-sale */}
                        <Link
                            href="/flash-sale"
                            aria-label="Lihat Semua Flash Sale"
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-brand-700/60 bg-brand-800/90 text-white shadow-xs transition-colors hover:bg-accent-copper"
                        >
                            <ChevronRight className="h-4 w-4 stroke-[2.5] text-white" />
                        </Link>
                    </div>

                    {/* Top Info Bar (Desktop / Tablet) */}
                    <div className="hidden w-full items-center justify-between md:flex">
                        <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-white lg:text-base">
                                Berakhir dalam
                            </span>
                            <div className="inline-flex items-center gap-1.5">
                                {days > 0 && (
                                    <span className="min-w-[30px] rounded-md border border-accent-copper-hover bg-accent-copper px-2.5 py-1 text-center text-xs font-black tracking-wider text-white shadow-xs sm:text-sm">
                                        {days} hari
                                    </span>
                                )}
                                <span className="min-w-[30px] rounded-md border border-accent-copper-hover bg-accent-copper px-2.5 py-1 text-center text-xs font-black tracking-wider text-white shadow-xs sm:text-sm">
                                    {hours}
                                </span>
                                <span className="min-w-[30px] rounded-md border border-accent-copper-hover bg-accent-copper px-2.5 py-1 text-center text-xs font-black tracking-wider text-white shadow-xs sm:text-sm">
                                    {minutes}
                                </span>
                                <span className="min-w-[30px] rounded-md border border-accent-copper-hover bg-accent-copper px-2.5 py-1 text-center text-xs font-black tracking-wider text-white shadow-xs sm:text-sm">
                                    {seconds}
                                </span>
                            </div>
                        </div>

                        <Link
                            href="/flash-sale"
                            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-white transition-all hover:translate-x-1 hover:text-accent-copper-light sm:text-sm"
                        >
                            <span>Lihat Semua</span>
                            <ChevronRight className="h-4 w-4 stroke-[2.5] text-white" />
                        </Link>
                    </div>

                    {/* Cards Carousel: ~2 cards visible + 3rd peeking on mobile, 4 columns on desktop */}
                    <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:gap-3.5 lg:grid lg:grid-cols-4">
                        {products.map((item) => {
                            const linkHref = item.slug
                                ? `/shop/${item.slug}`
                                : `/shop?search=${encodeURIComponent(item.name)}`;
                            return (
                                <Link
                                    key={item.id}
                                    href={linkHref}
                                    className="group flex w-[155px] flex-shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-xl border border-brand-700/20 bg-white shadow-sm transition-all duration-200 hover:shadow-xl sm:w-48 sm:rounded-2xl lg:w-auto"
                                >
                                    {/* Image Container with 1:1 Aspect Ratio */}
                                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-sand-200/40">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <span className="pointer-events-none absolute top-2 left-2 rounded-md bg-[#e03131] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                            {item.badge || 'Flash Sale'}
                                        </span>
                                    </div>

                                    {/* Card Info */}
                                    <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
                                        <h4 className="mb-1.5 line-clamp-2 min-h-[32px] text-xs leading-snug font-semibold text-brand-950 transition-colors group-hover:text-accent-copper sm:min-h-[34px] sm:text-[13px]">
                                            {item.name}
                                        </h4>

                                        <div className="mt-auto space-y-0.5">
                                            {item.original_price &&
                                                item.original_price >
                                                    item.price && (
                                                    <div className="text-[10px] leading-none font-medium text-brand-400 line-through sm:text-[11px]">
                                                        Rp{' '}
                                                        {formatPrice(
                                                            item.original_price,
                                                        )}
                                                    </div>
                                                )}
                                            <div className="text-sm leading-tight font-extrabold text-[#b43425] sm:text-base sm:text-accent-copper">
                                                Rp {formatPrice(item.price)}
                                            </div>
                                        </div>

                                        {/* Bottom Action Button matching shop page */}
                                        <div className="mt-auto pt-2">
                                            <div className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition-colors hover:bg-brand-800 sm:py-2 sm:text-xs">
                                                <ShoppingBag className="h-3.5 w-3.5 stroke-[2.2]" />
                                                <span>+ Keranjang</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
