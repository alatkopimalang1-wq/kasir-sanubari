import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Compass,
    Expand,
    Layers,
    Maximize2,
    X,
} from 'lucide-react';

export interface GalleryMomentItem {
    id: string;
    title: string;
    location: string;
    category: string;
    image: string;
    aspectHint?: 'landscape' | 'portrait' | 'square';
}

export type GalleryColumnType =
    | { type: 'single'; item: GalleryMomentItem; widthClass: string }
    | {
          type: 'stacked';
          topItem: GalleryMomentItem;
          bottomItem: GalleryMomentItem;
          widthClass: string;
      };

export const MOMENT_COLUMNS: GalleryColumnType[] = [
    // Kolom 1: 1 Card besar lanskap (4:3 / square besar) - Pegunungan bersalju dan padang rumput emas
    {
        type: 'single',
        widthClass: 'w-[360px] sm:w-[460px]',
        item: {
            id: 'moment-1',
            title: 'Mount Rainier & Golden Meadow',
            location: 'Alpine Ridge, Washington',
            category: 'Alpine Wilds',
            image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
            aspectHint: 'landscape',
        },
    },
    // Kolom 2: 2 Card bertumpuk vertikal (atas: sunset pantai berpasir; bawah: jalan setapak hutan berkabut)
    {
        type: 'stacked',
        widthClass: 'w-[280px] sm:w-[320px]',
        topItem: {
            id: 'moment-2',
            title: 'Golden Hour Coastline',
            location: 'Tropical Shoreline, Hawaii',
            category: 'Ocean Shore',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
            aspectHint: 'landscape',
        },
        bottomItem: {
            id: 'moment-3',
            title: 'Misty Pine Woodlands',
            location: 'Black Forest Trail, Germany',
            category: 'Ancient Woods',
            image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85',
            aspectHint: 'landscape',
        },
    },
    // Kolom 3: 1 Card vertikal tinggi/portrait (rasio 9:16) - Bukit gurun pasir
    {
        type: 'single',
        widthClass: 'w-[260px] sm:w-[300px]',
        item: {
            id: 'moment-4',
            title: 'Sahara Winds & Golden Dunes',
            location: 'Erg Chebbi, Morocco',
            category: 'Desert Solitude',
            image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85',
            aspectHint: 'portrait',
        },
    },
    // Kolom 4: 2 Card bertumpuk vertikal (atas: lampu malam skyline; bawah: danau berkabut gelap)
    {
        type: 'stacked',
        widthClass: 'w-[280px] sm:w-[320px]',
        topItem: {
            id: 'moment-5',
            title: 'Neon Metropolis Skyline',
            location: 'Tokyo Central, Japan',
            category: 'Urban Lights',
            image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85',
            aspectHint: 'landscape',
        },
        bottomItem: {
            id: 'moment-6',
            title: 'Mirror Mist Lake',
            location: 'Yosemite Valley, California',
            category: 'Still Waters',
            image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
            aspectHint: 'landscape',
        },
    },
    // Kolom 5: 1 Card besar lanskap aurora malam
    {
        type: 'single',
        widthClass: 'w-[360px] sm:w-[440px]',
        item: {
            id: 'moment-7',
            title: 'Celestial Aurora Borealis',
            location: 'Tromsø Fjord, Norway',
            category: 'Night Skies',
            image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=85',
            aspectHint: 'landscape',
        },
    },
    // Kolom 6: 2 Card bertumpuk vertikal (kebun lereng hijau & air terjun ngarai)
    {
        type: 'stacked',
        widthClass: 'w-[280px] sm:w-[320px]',
        topItem: {
            id: 'moment-8',
            title: 'Verdant Highland Slopes',
            location: 'Mount Kawi Foothills, East Java',
            category: 'Terroir Kawi',
            image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85',
            aspectHint: 'landscape',
        },
        bottomItem: {
            id: 'moment-9',
            title: 'Emerald Cascades & Canyon',
            location: 'Tumpak Sewu Ravine, Indonesia',
            category: 'Cascading Waters',
            image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=85',
            aspectHint: 'landscape',
        },
    },
    // Kolom 7: 1 Card vertikal portrait - Crimson Red Rock Canyon
    {
        type: 'single',
        widthClass: 'w-[260px] sm:w-[300px]',
        item: {
            id: 'moment-10',
            title: 'Crimson Red Rock Canyon',
            location: 'Sedona Valley, Arizona',
            category: 'Canyon Formations',
            image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=85',
            aspectHint: 'portrait',
        },
    },
];

// Flatten all items for seamless lightbox index browsing
export const ALL_GALLERY_ITEMS: GalleryMomentItem[] = MOMENT_COLUMNS.flatMap(
    (col) =>
        col.type === 'single' ? [col.item] : [col.topItem, col.bottomItem],
);

interface BentoCardProps {
    item: GalleryMomentItem;
    className?: string;
    onSelect: (item: GalleryMomentItem) => void;
}

function BentoCard({ item, className = '', onSelect }: BentoCardProps) {
    return (
        <div
            onClick={() => onSelect(item)}
            className={`group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 shadow-lg transition-all duration-500 select-none hover:border-white/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.8)] ${className}`}
        >
            {/* Background Image with Zoom on Hover */}
            <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                draggable={false}
                className="pointer-events-none h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Gradient Overlays for Readability & Cinematic Look */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />

            {/* Top Category Badge & Expand Icon */}
            <div className="pointer-events-none absolute top-3.5 right-3.5 left-3.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] font-semibold tracking-wider text-zinc-200 uppercase shadow-sm backdrop-blur-md">
                    <Compass className="h-3 w-3 text-amber-400" />
                    {item.category}
                </span>

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/80 opacity-0 shadow-md backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5" />
                </div>
            </div>

            {/* Bottom Captions */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 transition-transform duration-300 group-hover:-translate-y-0.5 sm:p-5">
                <h4 className="text-sm leading-snug font-bold text-white drop-shadow-sm transition-colors group-hover:text-amber-200 sm:text-base">
                    {item.title}
                </h4>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-zinc-300/90 drop-shadow-sm">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400/80" />
                    {item.location}
                </p>
            </div>
        </div>
    );
}

export function CuratedMomentsGallery() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [selectedItem, setSelectedItem] = useState<GalleryMomentItem | null>(
        null,
    );

    // Drag-to-scroll state
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollStartLeft, setScrollStartLeft] = useState(0);
    const [hasDragged, setHasDragged] = useState(false);

    // Scroll buttons state
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollButtons = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 20);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 20);
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        updateScrollButtons();
        el.addEventListener('scroll', updateScrollButtons, { passive: true });
        window.addEventListener('resize', updateScrollButtons);
        return () => {
            el.removeEventListener('scroll', updateScrollButtons);
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [updateScrollButtons]);

    // Handle Smooth Scroll Navigation
    const handleScroll = (direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const scrollDistance = el.clientWidth * 0.75;
        el.scrollBy({
            left: direction === 'left' ? -scrollDistance : scrollDistance,
            behavior: 'smooth',
        });
    };

    // Drag-to-scroll handlers
    const onMouseDown = (e: React.MouseEvent) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setIsMouseDown(true);
        setHasDragged(false);
        setStartX(e.pageX - el.offsetLeft);
        setScrollStartLeft(el.scrollLeft);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isMouseDown) return;
        const el = scrollContainerRef.current;
        if (!el) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.35;
        if (Math.abs(walk) > 6) {
            setHasDragged(true);
        }
        el.scrollLeft = scrollStartLeft - walk;
    };

    const onMouseUp = () => {
        setIsMouseDown(false);
    };

    const handleCardSelect = (item: GalleryMomentItem) => {
        // Prevent opening modal if user was dragging
        if (hasDragged) return;
        setSelectedItem(item);
    };

    // Lightbox keyboard navigation
    const currentIndex = selectedItem
        ? ALL_GALLERY_ITEMS.findIndex((it) => it.id === selectedItem.id)
        : -1;

    const showPrev = useCallback(() => {
        if (currentIndex > 0) {
            setSelectedItem(ALL_GALLERY_ITEMS[currentIndex - 1]);
        } else {
            setSelectedItem(ALL_GALLERY_ITEMS[ALL_GALLERY_ITEMS.length - 1]);
        }
    }, [currentIndex]);

    const showNext = useCallback(() => {
        if (currentIndex < ALL_GALLERY_ITEMS.length - 1) {
            setSelectedItem(ALL_GALLERY_ITEMS[currentIndex + 1]);
        } else {
            setSelectedItem(ALL_GALLERY_ITEMS[0]);
        }
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedItem) return;
            if (e.key === 'Escape') setSelectedItem(null);
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItem, showPrev, showNext]);

    // Lock body scroll when modal is active
    useEffect(() => {
        if (selectedItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedItem]);

    return (
        <section className="mx-auto my-8 w-full max-w-7xl px-2.5 sm:my-14 sm:px-6 lg:px-8">
            {/* Outer Bento Container with Dark Ultra-Sleek Theme */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0c] p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] sm:rounded-[36px] sm:p-8 lg:p-10">
                {/* Subtle Ambient Radial Glows */}
                <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

                {/* Header Section */}
                <div className="relative z-10 mb-6 flex flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-end">
                    <div>
                        <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-amber-300 uppercase">
                            <Layers className="h-3.5 w-3.5 text-amber-400" />
                            <span>Visual Expedition</span>
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.22)] sm:text-3xl lg:text-4xl">
                            Curated Moments
                        </h2>
                        <p className="mt-1.5 max-w-xl text-xs leading-relaxed font-normal text-zinc-400 sm:text-sm">
                            A collection of stunning landscapes. Drag to
                            explore, click to expand.
                        </p>
                    </div>

                    {/* Navigation Buttons (Desktop Floating Controls) */}
                    <div className="flex items-center gap-2.5 self-start md:self-end">
                        <span className="mr-2 hidden text-[11px] font-medium text-zinc-500 sm:inline">
                            Drag or swipe horizontally
                        </span>
                        <button
                            type="button"
                            onClick={() => handleScroll('left')}
                            disabled={!canScrollLeft}
                            aria-label="Previous Moments"
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-md backdrop-blur-md transition-all hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleScroll('right')}
                            disabled={!canScrollRight}
                            aria-label="Next Moments"
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-md backdrop-blur-md transition-all hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Bento Masonry Track (Drag-to-Scroll) */}
                <div
                    ref={scrollContainerRef}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    className={`no-scrollbar relative z-10 flex items-stretch gap-4 overflow-x-auto scroll-smooth py-1 select-none sm:gap-5 ${
                        isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {MOMENT_COLUMNS.map((column, idx) => {
                        if (column.type === 'single') {
                            return (
                                <div
                                    key={column.item.id}
                                    className={`shrink-0 ${column.widthClass} h-[460px] sm:h-[480px]`}
                                >
                                    <BentoCard
                                        item={column.item}
                                        onSelect={handleCardSelect}
                                        className="h-full w-full"
                                    />
                                </div>
                            );
                        }

                        // Stacked: 2 cards stacked vertically with proportional heights
                        return (
                            <div
                                key={`col-${idx}`}
                                className={`shrink-0 ${column.widthClass} flex h-[460px] flex-col gap-4 sm:h-[480px] sm:gap-5`}
                            >
                                <BentoCard
                                    item={column.topItem}
                                    onSelect={handleCardSelect}
                                    className="w-full flex-1"
                                />
                                <BentoCard
                                    item={column.bottomItem}
                                    onSelect={handleCardSelect}
                                    className="w-full flex-1"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fullscreen Lightbox Modal (Click to Expand) */}
            {selectedItem && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/90 p-4 backdrop-blur-md duration-300 fade-in sm:p-6 md:p-10"
                    onClick={() => setSelectedItem(null)}
                >
                    {/* Top Bar Controls */}
                    <div
                        className="pointer-events-auto absolute inset-x-4 top-4 z-50 flex items-center justify-between text-white sm:inset-x-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider text-amber-300 uppercase backdrop-blur-sm">
                                {selectedItem.category}
                            </span>
                            <span className="hidden text-xs font-medium text-zinc-400 sm:inline">
                                {currentIndex + 1} of {ALL_GALLERY_ITEMS.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25"
                            >
                                <X className="h-4 w-4" />
                                <span>Tutup (ESC)</span>
                            </button>
                        </div>
                    </div>

                    {/* Left & Right In-Modal Navigation Arrows */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            showPrev();
                        }}
                        aria-label="Previous photo"
                        className="absolute top-1/2 left-3 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-2xl backdrop-blur-md transition-transform hover:scale-110 hover:bg-black/90 active:scale-95 sm:left-6 sm:h-13 sm:w-13"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            showNext();
                        }}
                        aria-label="Next photo"
                        className="absolute top-1/2 right-3 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-2xl backdrop-blur-md transition-transform hover:scale-110 hover:bg-black/90 active:scale-95 sm:right-6 sm:h-13 sm:w-13"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Main Image Container */}
                    <div
                        className="relative flex max-h-[82vh] w-full max-w-5xl flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedItem.image}
                            alt={selectedItem.title}
                            className="h-auto max-h-[72vh] w-auto max-w-full rounded-2xl border border-white/15 object-contain shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
                        />

                        {/* Caption under Lightbox */}
                        <div className="mt-4 max-w-2xl px-4 text-center">
                            <h3 className="text-lg font-bold tracking-tight text-white sm:text-2xl">
                                {selectedItem.title}
                            </h3>
                            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-zinc-400 sm:text-sm">
                                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                                {selectedItem.location}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default CuratedMomentsGallery;
