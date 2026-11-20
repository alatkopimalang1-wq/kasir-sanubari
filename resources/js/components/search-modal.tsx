import React, { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    Coffee,
    Loader2,
    Search,
    SlidersHorizontal,
    TrendingUp,
    X,
} from 'lucide-react';
import type { BrewGuide, Product } from '@/types/sanubari';
import { formatRupiah, t } from '@/lib/trans';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const resolveProductImageUrl = (p: Product) => {
    const raw =
        p.images?.[0]?.path ||
        p.variants?.[0]?.image_url ||
        p.variants?.[0]?.image;
    if (!raw) return '/brand/logo-circle.png';
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    const clean = raw.replace(/^\/?(public\/|storage\/)?/, '');
    return `/storage/${clean}`;
};

export const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [trending, setTrending] = useState<string[]>([]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const [recommended, setRecommended] = useState<Product[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [guides, setGuides] = useState<BrewGuide[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Initial load for trending & recommended
    useEffect(() => {
        if (!isOpen) return;

        // Auto-focus input on open (Emil Kowalski: immediate keyboard readiness)
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        // Fetch zero-state data if empty
        if (trending.length === 0) {
            fetch('/api/search')
                .then((res) => res.json())
                .then((data) => {
                    if (data.trending) setTrending(data.trending);
                    if (data.recommended) setRecommended(data.recommended);
                })
                .catch(() => {});
        }

        return () => clearTimeout(timer);
    }, [isOpen]);

    // Handle ESC key to close immediately (Emil Kowalski: never delay keyboard-initiated dismiss)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Query fetch with snappy debounce (150ms)
    useEffect(() => {
        if (!isOpen) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        const trimmed = query.trim();
        if (!trimmed) {
            setProducts([]);
            setGuides([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(() => {
            fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
                .then((res) => res.json())
                .then((data) => {
                    setProducts(data.products || []);
                    setGuides(data.guides || []);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }, 150);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSelectTag = (tag: string) => {
        onClose();
        router.get('/shop', { q: tag }, { preserveState: false });
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
            onClose();
            router.get('/shop', { q: trimmed }, { preserveState: false });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Pencarian Kopi Sanubari"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={handleBackdropClick}
                    className="fixed inset-0 z-[70] flex items-start justify-center bg-brand-950/70 p-3 backdrop-blur-xs sm:p-4 md:p-6"
                >
                    {/* Modal Card with Animate UI spring & scale */}
                    <motion.div
                        data-ui="modal"
                        initial={{ opacity: 0, scale: 0.97, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -6 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-12 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-sand-300 sm:mt-16"
                    >
                        {/* Search Bar Input Row */}
                        <form
                            onSubmit={handleModalSubmit}
                            data-ui="search-header"
                            className="flex items-center gap-3 border-b border-sand-200/80 bg-cream-50 p-3 sm:p-4"
                        >
                            <Search className="h-5 w-5 flex-shrink-0 text-brand-600" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={
                                    isMobile
                                        ? ''
                                        : 'Cari kopi, tasting notes, proses, atau metode seduh...'
                                }
                                className="flex-1 border-0 bg-transparent text-[16px] font-medium text-brand-950 placeholder-transparent focus:ring-0 focus:outline-none sm:text-base sm:placeholder-brand-500"
                            />

                            {loading && (
                                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-accent-copper" />
                            )}

                            {query && !loading && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('');
                                        inputRef.current?.focus();
                                    }}
                                    className="rounded-full p-1 text-brand-400 transition-colors hover:bg-sand-200/60 hover:text-brand-800 active:scale-95"
                                    aria-label="Hapus pencarian"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}

                            <button
                                type="submit"
                                className="cursor-pointer rounded-lg bg-accent-copper px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-accent-copper-hover"
                            >
                                Cari
                            </button>

                            <div className="hidden items-center pl-1 text-[11px] font-semibold text-brand-500 sm:flex">
                                <kbd className="rounded-sm bg-sand-200/60 px-1.5 py-0.5 font-mono text-brand-600">
                                    ESC
                                </kbd>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full p-1.5 text-brand-700 transition-colors hover:bg-sand-200/60 sm:hidden"
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </form>

                        {/* Modal Scrollable Content Area */}
                        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-4 sm:p-6">
                            {/* ------------------------------------------------------------- */}
                            {/* ZERO STATE: Trending Tags & Recommended Roasts                */}
                            {/* ------------------------------------------------------------- */}
                            {!query.trim() && (
                                <>
                                    {/* Trending Search Tags (Artatix Pattern) */}
                                    <div>
                                        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-brand-700">
                                            <TrendingUp className="h-4 w-4 text-accent-copper" />
                                            <span>Pencarian Populer</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {trending.map((item) => (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectTag(item)
                                                    }
                                                    className="bg-sand-100 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-brand-900 transition-transform duration-100 hover:bg-sand-200 active:scale-[0.97] sm:text-sm"
                                                >
                                                    <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-accent-copper" />
                                                    <span>{item}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rekomendasi Kopi (Artatix 'Rekomendasi Event' Pattern) */}
                                    {recommended.length > 0 && (
                                        <div>
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="text-xs font-bold text-brand-700">
                                                    <span>
                                                        Rekomendasi Roaster
                                                        Pekan Ini
                                                    </span>
                                                </div>
                                                <Link
                                                    href="/shop"
                                                    onClick={onClose}
                                                    className="text-xs font-semibold text-accent-copper hover:underline"
                                                >
                                                    Lihat Semua Katalog
                                                </Link>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {recommended.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/shop/${product.slug}`}
                                                        onClick={onClose}
                                                        className="group bg-sand-50/70 hover:bg-sand-100 flex items-center gap-3 rounded-xl p-2.5 transition-colors duration-150 active:scale-[0.98]"
                                                    >
                                                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-sand-200">
                                                            <img
                                                                src={resolveProductImageUrl(
                                                                    product,
                                                                )}
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h4 className="truncate text-sm font-bold text-brand-950 transition-colors group-hover:text-accent-copper">
                                                                {product.name}
                                                            </h4>
                                                            <p className="truncate text-xs text-brand-700">
                                                                {product.tasting_notes ||
                                                                    product.origin}
                                                            </p>
                                                            <div className="mt-0.5 flex items-center gap-2">
                                                                <span className="text-xs font-extrabold text-brand-900">
                                                                    {formatRupiah(
                                                                        product.min_price,
                                                                    )}
                                                                </span>
                                                                {product.roast_level && (
                                                                    <span className="py-0.2 rounded-sm bg-sand-200 px-1.5 text-[10px] text-brand-700">
                                                                        {
                                                                            product.roast_level
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Shortcut to BYOB (Build Your Own Blend) */}
                                    <div className="bg-sand-100 flex items-center justify-between gap-3 rounded-xl p-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-copper text-white">
                                                <SlidersHorizontal className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-brand-950">
                                                    Ingin custom blend kopi
                                                    sendiri?
                                                </p>
                                                <p className="text-[11px] text-brand-700">
                                                    C.Y.B.R Studio: Padukan 2
                                                    biji kopi dengan slider
                                                    persentase.
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/cybr"
                                            onClick={onClose}
                                            className="flex-shrink-0 rounded-full bg-brand-900 px-3 py-1.5 text-xs font-bold text-white transition-transform duration-100 hover:bg-brand-800 active:scale-95"
                                        >
                                            C.Y.B.R Studio
                                        </Link>
                                    </div>
                                </>
                            )}

                            {/* ------------------------------------------------------------- */}
                            {/* LIVE QUERY STATE: Filtered Products & Guides                  */}
                            {/* ------------------------------------------------------------- */}
                            {query.trim() && (
                                <div className="space-y-6">
                                    {/* Direct shortcut to catalog with keyword */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            router.get(
                                                '/shop',
                                                { q: query.trim() },
                                                { preserveState: false },
                                            );
                                        }}
                                        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-accent-copper/30 bg-accent-copper/10 p-3 text-left text-xs font-bold text-accent-copper shadow-xs transition-all hover:bg-accent-copper/20 sm:text-sm"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Search className="h-4 w-4 shrink-0 text-accent-copper" />
                                            <span>
                                                Buka semua daftar produk untuk "
                                                {query}" →
                                            </span>
                                        </span>
                                        <ArrowRight className="h-4 w-4 shrink-0" />
                                    </button>
                                    {/* Coffee Beans Matches */}
                                    {products.length > 0 && (
                                        <div>
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-xs font-bold text-brand-700">
                                                    Koleksi Biji Kopi (
                                                    {products.length})
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {products.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/shop/${product.slug}`}
                                                        onClick={onClose}
                                                        className="group hover:bg-sand-100 flex items-center gap-3 rounded-xl p-3 transition-colors duration-150 active:scale-[0.98]"
                                                    >
                                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-sand-200">
                                                            <img
                                                                src={resolveProductImageUrl(
                                                                    product,
                                                                )}
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="truncate text-sm font-bold text-brand-950 transition-colors group-hover:text-accent-copper">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </h4>
                                                                {product.series && (
                                                                    <span className="py-0.2 flex-shrink-0 rounded-full bg-sand-200 px-1.5 text-[10px] font-semibold text-brand-800">
                                                                        {
                                                                            product.series
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-0.5 truncate text-xs text-brand-700">
                                                                {
                                                                    product.tasting_notes
                                                                }{' '}
                                                                •{' '}
                                                                {
                                                                    product.process
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="flex-shrink-0 text-right">
                                                            <span className="text-xs font-extrabold text-brand-950 sm:text-sm">
                                                                {formatRupiah(
                                                                    product.min_price,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Brew Guides Matches */}
                                    {guides.length > 0 && (
                                        <div>
                                            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-brand-700">
                                                <BookOpen className="h-4 w-4 text-accent-copper" />
                                                <span>
                                                    Panduan Seduh Terkait
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {guides.map((guide) => (
                                                    <Link
                                                        key={guide.id}
                                                        href={`/panduan-seduh/${guide.slug}`}
                                                        onClick={onClose}
                                                        className="group hover:bg-sand-100 flex items-center justify-between rounded-xl p-2.5 transition-colors duration-150 active:scale-[0.98]"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <Coffee className="h-4 w-4 text-accent-copper" />
                                                            <span className="text-sm font-semibold text-brand-950 transition-colors group-hover:text-accent-copper">
                                                                {t(guide.title)}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-medium text-brand-600">
                                                            {guide.method}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No Results Fallback */}
                                    {!loading &&
                                        products.length === 0 &&
                                        guides.length === 0 && (
                                            <div className="space-y-3 py-10 text-center">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand-200/60 text-brand-600">
                                                    <Search className="h-6 w-6" />
                                                </div>
                                                <h4 className="text-base font-bold text-brand-900">
                                                    Biji kopi atau panduan seduh
                                                    tidak ditemukan
                                                </h4>
                                                <p className="mx-auto max-w-sm text-xs text-brand-700 sm:text-sm">
                                                    Tidak ada hasil untuk kata
                                                    kunci "{query}". Coba cari
                                                    "Kawi", "Espresso",
                                                    "Filter", atau konsultasikan
                                                    langsung ke roaster kami.
                                                </p>
                                                <div className="flex justify-center gap-3 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setQuery('')
                                                        }
                                                        className="rounded-full bg-sand-200 px-4 py-2 text-xs font-bold text-brand-950 transition-transform duration-100 hover:bg-sand-300 active:scale-95"
                                                    >
                                                        Reset Pencarian
                                                    </button>
                                                    <a
                                                        href="https://wa.me/6285121930454?text=Halo%20Sanubari%20Roastery%2C%20saya%20mencari%20kopi%20spesifik"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-full bg-brand-900 px-4 py-2 text-xs font-bold text-white transition-transform duration-100 hover:bg-brand-800 active:scale-95"
                                                    >
                                                        Tanya Roaster di
                                                        WhatsApp
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Footer Quick Tip */}
                        <div
                            data-ui="search-footer"
                            className="flex items-center justify-between bg-cream-100 p-3 px-4 text-xs text-brand-600 sm:px-6"
                        >
                            <span className="truncate">
                                Ketik nama origin, metode seduh, atau tasting
                                notes favorit Anda.
                            </span>
                            <Link
                                href="/shop"
                                onClick={onClose}
                                className="flex-shrink-0 font-bold text-brand-900 hover:text-accent-copper hover:underline"
                            >
                                Buka Katalog Penuh →
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
