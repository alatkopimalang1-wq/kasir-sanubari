import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, RefreshCw, ShoppingBag } from 'lucide-react';
import type { BackInStockItem } from '@/types/sanubari';

interface BackInStockSectionProps {
    products?: BackInStockItem[];
    title?: string;
    subtitle?: string;
    badge?: string;
    buttonText?: string;
    buttonUrl?: string;
    isActive?: boolean;
}

export function BackInStockSection({
    products = [],
    title = 'Back in Stock',
    subtitle = 'Koleksi biji kopi dan produk favorit yang kini kembali tersedia',
    badge = 'BACK IN STOCK',
    buttonText = 'Lihat Semua',
    buttonUrl = '/back-in-stock',
    isActive = true,
}: BackInStockSectionProps) {
    if (!isActive || !products || products.length === 0) {
        return null;
    }

    // Enforce maximum 4 products
    const displayProducts = products.slice(0, 4);

    const formatPrice = (val?: number | null) => {
        if (!val) return '0';
        return new Intl.NumberFormat('id-ID').format(val);
    };

    return (
        <section
            className="mx-auto w-full max-w-7xl px-2.5 sm:px-6 lg:px-8"
            aria-label="Menu Back in Stock"
        >
            <div className="to-brand-850 relative flex w-full flex-col items-stretch gap-3.5 overflow-hidden rounded-2xl border border-brand-700/40 bg-gradient-to-br from-brand-950 via-brand-900 p-3 shadow-xl shadow-brand-950/20 sm:gap-6 sm:rounded-3xl sm:p-6 md:flex-row md:items-center lg:p-7">
                {/* Decorative Subtle Background Glow */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-accent-copper/15 blur-3xl" />

                {/* Left Column: Brand Hero Title (Desktop Only) */}
                <div className="relative z-10 hidden flex-shrink-0 flex-col items-start justify-center text-white md:flex md:w-52 lg:w-60">
                    <div className="space-y-2 sm:space-y-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-copper/40 bg-accent-copper/20 px-3 py-1 text-[11px] font-black tracking-wider text-accent-copper-light uppercase backdrop-blur-md sm:text-xs">
                            <RefreshCw className="h-3.5 w-3.5 text-accent-copper-light" />
                            <span>{badge}</span>
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
                        <p className="max-w-[210px] text-xs leading-snug font-medium text-brand-200 sm:text-sm">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Main Content Area: Mobile Header + Products Grid / Carousel */}
                <div className="relative z-10 flex w-full min-w-0 flex-1 flex-col justify-center gap-2.5 sm:gap-4">
                    {/* Mobile Header: Pill Badge + Lihat Semua Link */}
                    <div className="flex w-full items-center justify-between gap-1.5 md:hidden">
                        <div className="inline-flex items-center gap-1 rounded-full border border-accent-copper/50 bg-brand-950/90 px-2.5 py-1 text-[11px] font-black tracking-wider text-accent-copper-light uppercase shadow-xs">
                            <RefreshCw className="h-3 w-3 text-accent-copper" />
                            <span>{badge}</span>
                        </div>

                        <Link
                            href={buttonUrl}
                            className="inline-flex items-center gap-1 text-xs font-bold text-white transition-colors hover:text-accent-copper-light"
                        >
                            <span>{buttonText}</span>
                            <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        </Link>
                    </div>

                    {/* Top Info Bar (Desktop / Tablet) */}
                    <div className="hidden w-full items-center justify-between md:flex">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-brand-300 sm:text-sm">
                                Stok Restock Siap Kirim Hari Ini
                            </span>
                        </div>

                        <Link
                            href={buttonUrl}
                            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-white transition-all hover:translate-x-1 hover:text-accent-copper-light sm:text-sm"
                        >
                            <span>{buttonText}</span>
                            <ChevronRight className="h-4 w-4 stroke-[2.5] text-white" />
                        </Link>
                    </div>

                    {/* Cards Carousel / Grid: Up to 4 products */}
                    <div className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 sm:gap-3.5 lg:grid lg:grid-cols-4">
                        {displayProducts.map((item) => {
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
                                        <span className="pointer-events-none absolute top-2 left-2 rounded-md bg-[#b43425] px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                                            {item.badge || 'BACK IN STOCK'}
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

                                        {/* Bottom Action Button */}
                                        <div className="mt-auto pt-2">
                                            <div className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition-colors group-hover:bg-brand-800 sm:py-2 sm:text-xs">
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
