import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export interface PartnerSlide {
    id: string;
    title: string;
    city: string;
    image: string;
    href?: string;
    url?: string;
    open_in_new_tab?: boolean;
}

export const DEFAULT_PARTNER_SLIDES: PartnerSlide[] = [
    {
        id: 'gartenhaus',
        title: 'Gartenhaus Malang',
        city: 'MALANG',
        image: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80',
        href: 'https://www.instagram.com/gartenhaus_co/',
        open_in_new_tab: true,
    },
    {
        id: 'sanubari-roastery',
        title: 'Sanubari Roasting Studio',
        city: 'MALANG',
        image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
        href: '/kunjungi',
        open_in_new_tab: false,
    },
    {
        id: 'bataputih',
        title: 'Bataputih Coffee',
        city: 'MALANG',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        href: 'https://www.instagram.com/bataputihkopi/',
        open_in_new_tab: true,
    },
    {
        id: 'lafayette',
        title: 'Lafayette Coffee & Eatery',
        city: 'MALANG',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        href: 'https://www.instagram.com/lafayettecoffee/',
        open_in_new_tab: true,
    },
    {
        id: 'coffee-heritage',
        title: 'Coffee Heritage',
        city: 'MALANG',
        image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
        href: 'https://www.instagram.com/coffeeheritagemlg/',
        open_in_new_tab: true,
    },
    {
        id: 'fee-space',
        title: 'Oura Fee & Space',
        city: 'MALANG',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        href: 'https://www.instagram.com/ourafeesinema/',
        open_in_new_tab: true,
    },
    {
        id: 'dialoog',
        title: 'Dialoog Coffee',
        city: 'MALANG',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
        href: 'https://www.instagram.com/dialoog.coffee/',
        open_in_new_tab: true,
    },
];

interface CoverflowSliderProps {
    slides?: PartnerSlide[];
    title?: string;
    subtitle?: string;
    className?: string;
}

export const CoverflowSlider: React.FC<CoverflowSliderProps> = ({
    slides = DEFAULT_PARTNER_SLIDES,
    title = 'Disajikan di Kedai Pilihan',
    subtitle = 'Temukan seduhan biji kopi sangrai Sanubari di berbagai kedai kopi dan coffee space terkurasi di Malang',
    className = '',
}) => {
    // Start centered on Lafayette (index 3 of 7)
    const [currentIndex, setCurrentIndex] = useState(3);
    const [isHovered, setIsHovered] = useState(false);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    const total = slides.length;

    const nextSlide = useCallback(() => {
        if (total === 0) return;
        setCurrentIndex((prev) => (prev + 1) % total);
    }, [total]);

    const prevSlide = useCallback(() => {
        if (total === 0) return;
        setCurrentIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    // Autoplay interval with pause on hover
    useEffect(() => {
        if (isHovered || total <= 1) {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
            return;
        }

        autoPlayRef.current = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [isHovered, nextSlide, total]);

    // Touch swipe support
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 40) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    };

    // Calculate circular relative distance (-3, -2, -1, 0, 1, 2, 3)
    const getSlidePosition = (idx: number) => {
        let diff = (idx - currentIndex) % total;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        return diff;
    };

    if (total === 0) return null;

    return (
        <section
            data-ui="partner-coverflow-slider"
            className={`mx-auto w-full max-w-7xl overflow-hidden px-4 py-6 select-none sm:px-6 sm:py-10 lg:px-8 ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Section Header */}
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-brand-950 sm:text-2xl">
                        {title}
                    </h2>
                    <p className="mt-0.5 max-w-2xl text-xs text-brand-700 sm:text-sm">
                        {subtitle}
                    </p>
                </div>

                {/* Mobile / Header arrows */}
                <div className="hidden items-center gap-2 self-end sm:flex sm:self-auto">
                    <button
                        type="button"
                        onClick={prevSlide}
                        aria-label="Geser ke kiri"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-sand-200/70 text-brand-900 shadow-xs transition-transform hover:bg-sand-200 active:scale-95"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={nextSlide}
                        aria-label="Geser ke kanan"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-sand-200/70 text-brand-900 shadow-xs transition-transform hover:bg-sand-200 active:scale-95"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* 3D Coverflow Container */}
            <div
                className="relative flex h-[340px] w-full items-center justify-center perspective-[1200px] sm:h-[420px] md:h-[460px]"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Floating Navigation Controls on Sides */}
                <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Sebelumnya"
                    className="absolute left-1 z-40 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-brand-950/80 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-brand-900 active:scale-95 sm:left-4 sm:h-11 sm:w-11"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Selanjutnya"
                    className="absolute right-1 z-40 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-brand-950/80 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-brand-900 active:scale-95 sm:right-4 sm:h-11 sm:w-11"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>

                {/* Slides Track */}
                <div className="relative flex h-full w-full items-center justify-center">
                    {slides.map((slide, idx) => {
                        const pos = getSlidePosition(idx);
                        const isCenter = pos === 0;

                        // Responsive translation step percentages
                        // pos: 0 (center), ±1, ±2, ±3
                        let translateX = '0%';
                        let scale = 1;
                        let zIndex = 30;
                        let opacity = 1;
                        let brightness = 1;

                        if (pos === 0) {
                            translateX = '0%';
                            scale = 1.05;
                            zIndex = 30;
                            opacity = 1;
                            brightness = 1;
                        } else if (pos === 1) {
                            translateX = '62%';
                            scale = 0.88;
                            zIndex = 20;
                            opacity = 0.9;
                            brightness = 0.8;
                        } else if (pos === -1) {
                            translateX = '-62%';
                            scale = 0.88;
                            zIndex = 20;
                            opacity = 0.9;
                            brightness = 0.8;
                        } else if (pos === 2) {
                            translateX = '116%';
                            scale = 0.76;
                            zIndex = 10;
                            opacity = 0.65;
                            brightness = 0.65;
                        } else if (pos === -2) {
                            translateX = '-116%';
                            scale = 0.76;
                            zIndex = 10;
                            opacity = 0.65;
                            brightness = 0.65;
                        } else if (pos === 3) {
                            translateX = '165%';
                            scale = 0.65;
                            zIndex = 5;
                            opacity = 0.35;
                            brightness = 0.5;
                        } else if (pos === -3) {
                            translateX = '-165%';
                            scale = 0.65;
                            zIndex = 5;
                            opacity = 0.35;
                            brightness = 0.5;
                        } else {
                            translateX = pos > 0 ? '200%' : '-200%';
                            scale = 0.5;
                            zIndex = 0;
                            opacity = 0;
                            brightness = 0.3;
                        }

                        const slideUrl = slide.href || slide.url;

                        const handleCardClick = () => {
                            if (isCenter && slideUrl) {
                                if (slideUrl.startsWith('http')) {
                                    window.open(
                                        slideUrl,
                                        slide.open_in_new_tab !== false
                                            ? '_blank'
                                            : '_self',
                                        'noopener,noreferrer',
                                    );
                                } else {
                                    window.location.href = slideUrl;
                                }
                            } else {
                                setCurrentIndex(idx);
                            }
                        };

                        return (
                            <div
                                key={slide.id}
                                onClick={handleCardClick}
                                style={{
                                    transform: `translateX(${translateX}) scale(${scale})`,
                                    zIndex,
                                    opacity,
                                    transition:
                                        'all 500ms cubic-bezier(0.25, 1, 0.5, 1)',
                                }}
                                className={`absolute aspect-[9/14] w-[180px] cursor-pointer overflow-hidden rounded-[24px] select-none sm:w-[220px] sm:rounded-[30px] md:w-[260px] ${
                                    isCenter
                                        ? 'shadow-[0_15px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(184,121,74,0.35)] ring-2 ring-accent-copper/90'
                                        : 'shadow-xl hover:opacity-100'
                                }`}
                            >
                                {/* Background Image */}
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="h-full w-full object-cover transition-transform duration-700 ease-out"
                                    style={{
                                        filter: `brightness(${brightness})`,
                                    }}
                                    loading={
                                        Math.abs(pos) <= 1 ? 'eager' : 'lazy'
                                    }
                                />

                                {/* Subtle Dark Vignette & Bottom Gradient for Typography */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

                                {/* Center Card: External Link Badge if link exists */}
                                {isCenter && slideUrl && (
                                    <div className="pointer-events-auto absolute top-3.5 right-3.5 z-20">
                                        <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-accent-copper">
                                            <span>Kunjungi</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </span>
                                    </div>
                                )}

                                {/* Card Text Content (Bottom) */}
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end p-3 text-center sm:p-5">
                                    <h3 className="line-clamp-2 text-sm leading-tight font-bold tracking-tight text-white drop-shadow-md sm:text-base md:text-lg">
                                        {slide.title}
                                    </h3>
                                    <span className="mt-1 text-[10px] font-semibold tracking-widest text-accent-copper uppercase drop-shadow-xs sm:text-xs">
                                        {slide.city}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
