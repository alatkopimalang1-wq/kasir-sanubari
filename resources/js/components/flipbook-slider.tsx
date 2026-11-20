import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface FlipBookPageItem {
    image?: string | null;
    image_url?: string | null;
    page_number?: string | null;
    title?: string | null;
    caption?: string | null;
    text_style?: string | null;
}

export interface FlipBookSliderProps {
    pages: (FlipBookPageItem | string)[];
    title?: string | null;
    subtitle?: string | null;
    theme?: string;
    autoplay?: boolean;
    autoplayIntervalMs?: number;
    className?: string;
}

const resolveImageUrl = (img?: string | null): string => {
    if (!img) {
        return '';
    }
    if (
        img.startsWith('http://') ||
        img.startsWith('https://') ||
        img.startsWith('data:')
    ) {
        return img;
    }
    const clean = img.replace(/^\/?(public\/|storage\/)?/, '');
    return `/storage/${clean}`;
};

interface NormalizedPage {
    imageUrl: string;
    index: number;
}

export default function FlipBookSlider({
    pages = [],
    autoplay = false,
    autoplayIntervalMs = 6000,
    className = '',
}: FlipBookSliderProps) {
    // Normalize pages (1 image = 1 page across Desktop, Tablet, and Mobile)
    const normalizedPages: NormalizedPage[] = React.useMemo(() => {
        const rawList = Array.isArray(pages) ? pages : [];
        const mapped: NormalizedPage[] = [];

        rawList.forEach((item, idx) => {
            const rawImg =
                typeof item === 'string'
                    ? item
                    : item?.image || item?.image_url || '';
            const resolved = resolveImageUrl(rawImg);
            if (resolved) {
                mapped.push({
                    imageUrl: resolved,
                    index: idx,
                });
            }
        });

        return mapped;
    }, [pages]);

    const totalPages = normalizedPages.length;

    const [pageIndex, setPageIndex] = useState(0);
    const [targetIndex, setTargetIndex] = useState<number | null>(null);
    const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(
        null,
    );
    const [flipProgress, setFlipProgress] = useState(0); // 0 -> 1

    const touchStartX = useRef<number | null>(null);
    const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number | null>(null);

    const FLIP_DURATION_MS = 740;

    useEffect(() => {
        return () => {
            if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    useEffect(() => {
        if (pageIndex >= totalPages && totalPages > 0) {
            setPageIndex(0);
        }
    }, [totalPages, pageIndex]);

    const triggerFlip = useCallback(
        (direction: 'next' | 'prev', customTarget?: number) => {
            if (flipDirection !== null || totalPages <= 1) return;

            const nextIdx =
                customTarget !== undefined
                    ? customTarget
                    : direction === 'next'
                      ? (pageIndex + 1) % totalPages
                      : (pageIndex - 1 + totalPages) % totalPages;

            if (nextIdx === pageIndex) return;

            setTargetIndex(nextIdx);
            setFlipDirection(direction);
            setFlipProgress(0);

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = requestAnimationFrame(() => {
                    setFlipProgress(1);
                });
            });

            animTimeoutRef.current = setTimeout(() => {
                setPageIndex(nextIdx);
                setTargetIndex(null);
                setFlipDirection(null);
                setFlipProgress(0);
            }, FLIP_DURATION_MS);
        },
        [flipDirection, totalPages, pageIndex],
    );

    const handleNext = useCallback(() => {
        triggerFlip('next');
    }, [triggerFlip]);

    const handlePrev = useCallback(() => {
        triggerFlip('prev');
    }, [triggerFlip]);

    useEffect(() => {
        if (!autoplay || totalPages <= 1) return;
        const interval = setInterval(() => {
            handleNext();
        }, autoplayIntervalMs);
        return () => clearInterval(interval);
    }, [autoplay, autoplayIntervalMs, totalPages, handleNext]);

    if (totalPages === 0) {
        return null;
    }

    const currentPage = normalizedPages[pageIndex] || normalizedPages[0];
    const targetPage =
        targetIndex !== null
            ? normalizedPages[targetIndex] || normalizedPages[0]
            : currentPage;

    // Render pure full-bleed 4:5 single image page
    const renderFullImagePage = (page: NormalizedPage) => {
        return (
            <div className="relative aspect-4/5 w-full overflow-hidden bg-neutral-900 select-none">
                <img
                    src={page.imageUrl}
                    alt={`Halaman ${page.index + 1}`}
                    draggable={false}
                    className="block h-full w-full object-cover"
                />
            </div>
        );
    };

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        touchStartX.current = clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
        if (touchStartX.current === null) return;
        const clientX =
            'changedTouches' in e
                ? e.changedTouches[0].clientX
                : (e as React.MouseEvent).clientX;
        const deltaX = clientX - touchStartX.current;
        touchStartX.current = null;

        if (Math.abs(deltaX) > 40) {
            if (deltaX < 0) {
                handleNext();
            } else {
                handlePrev();
            }
        }
    };

    const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (totalPages <= 1) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        // Clicking the left 30% flips backward; clicking the right 70% flips forward
        if (clickX < rect.width * 0.3) {
            handlePrev();
        } else {
            handleNext();
        }
    };

    // Base page visible underneath the flipping leaf:
    // - When flipping 'next', the current page lifts from right to left, revealing targetPage underneath.
    // - When flipping 'prev', the previous page swings back from left (-180deg) to right (0deg) over currentPage.
    const underneathPage =
        flipDirection === 'next' && targetIndex !== null
            ? targetPage
            : currentPage;

    const flippingLeafPage =
        flipDirection === 'next' ? currentPage : targetPage;

    return (
        <div
            className={`relative mx-auto my-8 max-w-xl select-none ${className}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* SINGLE 4:5 FULL-IMAGE 3D PAGE-FLIP CONTAINER (Desktop, Tablet & Mobile) */}
            <div className="relative w-full" style={{ perspective: '2400px' }}>
                <div
                    onClick={handlePageClick}
                    title={
                        totalPages > 1
                            ? 'Klik untuk membalik halaman'
                            : undefined
                    }
                    className={`relative w-full overflow-hidden rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.45)] ${
                        totalPages > 1 ? 'cursor-pointer' : ''
                    }`}
                >
                    {renderFullImagePage(underneathPage)}

                    {/* Subtle book spine crease along the left edge */}
                    <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-7"
                        style={{
                            background:
                                'linear-gradient(to right, rgba(0,0,0,0.38) 0%, rgba(255,255,255,0.06) 35%, rgba(0,0,0,0) 100%)',
                        }}
                    />

                    {/* Dynamic cast shadow on underneath page during flip */}
                    {flipDirection !== null && (
                        <div
                            className="pointer-events-none absolute inset-0 transition-opacity"
                            style={{
                                transitionDuration: `${FLIP_DURATION_MS}ms`,
                                background: 'rgba(0,0,0,0.42)',
                                opacity:
                                    flipDirection === 'next'
                                        ? (1 - flipProgress) * 0.85
                                        : flipProgress * 0.85,
                            }}
                        />
                    )}
                </div>

                {/* 3D Flipping Page Leaf (Rotates around the left book spine) */}
                {flipDirection !== null && targetIndex !== null && (
                    <div
                        className="pointer-events-none absolute inset-0 z-20"
                        style={{
                            transformOrigin: 'left center',
                            transformStyle: 'preserve-3d',
                            transition: `transform ${FLIP_DURATION_MS}ms cubic-bezier(0.645, 0.045, 0.355, 1.000)`,
                            transform:
                                flipDirection === 'next'
                                    ? flipProgress === 1
                                        ? 'rotateY(-180deg)'
                                        : 'rotateY(0deg)'
                                    : flipProgress === 1
                                      ? 'rotateY(0deg)'
                                      : 'rotateY(-180deg)',
                        }}
                    >
                        {/* Front face of the turning leaf */}
                        <div
                            className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl shadow-2xl"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                            }}
                        >
                            {renderFullImagePage(flippingLeafPage)}

                            {/* Spine shadow on left edge of turning leaf */}
                            <div
                                className="pointer-events-none absolute inset-y-0 left-0 w-7"
                                style={{
                                    background:
                                        'linear-gradient(to right, rgba(0,0,0,0.38) 0%, rgba(255,255,255,0.06) 35%, rgba(0,0,0,0) 100%)',
                                }}
                            />
                        </div>

                        {/* Back face of the turning leaf (subtle paper backing while passing 90deg) */}
                        <div
                            className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl bg-neutral-900/95 shadow-2xl"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }}
                        >
                            <div className="h-full w-full scale-x-[-1] opacity-25">
                                {renderFullImagePage(flippingLeafPage)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Prev / Dots / Next Controls */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Halaman Sebelumnya"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#1e222d]/90 text-white shadow-lg transition-all hover:bg-[#2a3040] active:scale-95"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1.5 px-2">
                        {normalizedPages.map((_, idx) => {
                            const isActive = idx === pageIndex;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        if (idx !== pageIndex) {
                                            triggerFlip(
                                                idx > pageIndex
                                                    ? 'next'
                                                    : 'prev',
                                                idx,
                                            );
                                        }
                                    }}
                                    aria-label={`Halaman ${idx + 1}`}
                                    className={`h-2 cursor-pointer rounded-full transition-all ${
                                        isActive
                                            ? 'w-6 bg-accent-copper'
                                            : 'w-2 bg-sand-300 hover:bg-brand-400'
                                    }`}
                                />
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Halaman Berikutnya"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#1e222d]/90 text-white shadow-lg transition-all hover:bg-[#2a3040] active:scale-95"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
