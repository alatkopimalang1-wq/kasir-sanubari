import React from 'react';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import { transition } from '@animate-ui/react/utils/motion';
import { useCart } from '@/context/cart-context';
import { formatRupiah } from '@/lib/trans';

export const CartDrawer: React.FC = () => {
    const {
        items,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        updateQuantity,
        removeItem,
    } = useCart();

    // Lock body scroll when cart drawer is open on mobile
    React.useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen]);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <div className="fixed inset-0 z-[70] flex justify-end">
                    {/* Backdrop with Fade */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-brand-950/60 backdrop-blur-xs"
                        onClick={() => setIsCartOpen(false)}
                    />

                    {/* Slide-over panel with spring physics */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                            mass: 0.8,
                        }}
                        className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-sand-200 bg-cream-50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-brand-700" />
                                <h2 className="flex items-center gap-1.5 text-lg font-bold text-brand-950">
                                    <span>Keranjang Belanja</span>
                                    <span className="text-base font-semibold text-accent-copper">
                                        (<SlidingNumber number={itemCount} />)
                                    </span>
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCartOpen(false)}
                                className="cursor-pointer rounded-full p-1.5 text-brand-600 transition-colors hover:bg-sand-200/60 hover:text-brand-950 active:scale-95"
                                aria-label="Tutup keranjang"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Items List with Layout Animations */}
                        <div className="flex-1 space-y-4 overflow-y-auto p-6">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 text-brand-400">
                                        <ShoppingBag className="h-8 w-8" />
                                    </div>
                                    <p className="mb-1 text-base font-semibold text-brand-900">
                                        Keranjang Anda masih kosong
                                    </p>
                                    <p className="mb-6 max-w-xs text-xs text-brand-500">
                                        Temukan koleksi biji kopi terbaik dari
                                        lereng Gunung Kawi dan lini specialty
                                        blend kami.
                                    </p>
                                    <Link
                                        href="/shop"
                                        onClick={() => setIsCartOpen(false)}
                                        className="rounded-full bg-brand-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-800 active:scale-95"
                                    >
                                        Jelajahi Kopi Sekarang
                                    </Link>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {items.map((item, idx) => {
                                        const rawImg =
                                            item.variant?.image_url ||
                                            item.variant?.image ||
                                            item.product.images?.[0]?.path;
                                        const img = rawImg
                                            ? rawImg.startsWith('http://') ||
                                              rawImg.startsWith('https://')
                                                ? rawImg
                                                : `/storage/${rawImg.replace(/^\/?(public\/|storage\/)?/, '')}`
                                            : '/brand/logo-circle.png';
                                        return (
                                            <motion.div
                                                key={`${item.variant.id}-${item.grindOption}-${idx}`}
                                                layout
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{
                                                    opacity: 0,
                                                    height: 0,
                                                    overflow: 'hidden',
                                                }}
                                                transition={{ duration: 0.2 }}
                                                className="flex gap-3 border-b border-sand-200/60 pb-4 last:border-0"
                                            >
                                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-sand-200/50 bg-cream-50">
                                                    <img
                                                        src={img}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="truncate text-sm font-semibold text-brand-950">
                                                                {
                                                                    item.product
                                                                        .name
                                                                }
                                                            </h4>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeItem(
                                                                        item
                                                                            .variant
                                                                            .id,
                                                                        item.grindOption,
                                                                        item.customNotes,
                                                                    )
                                                                }
                                                                className="cursor-pointer p-0.5 text-gray-400 transition-colors hover:text-red-500 active:scale-95"
                                                                aria-label="Hapus produk"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        <p className="text-xs font-medium text-accent-copper">
                                                            {item.variant.label}{' '}
                                                            • {item.grindOption}
                                                        </p>
                                                        {item.customNotes && (
                                                            <p className="bg-sand-100/80 mt-1 rounded px-2 py-0.5 text-[11px] font-medium text-balance text-brand-600">
                                                                {
                                                                    item.customNotes
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="mt-2 flex items-center justify-between">
                                                        <div className="flex items-center overflow-hidden rounded-lg border border-sand-200 bg-white">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item
                                                                            .variant
                                                                            .id,
                                                                        item.grindOption,
                                                                        item.quantity -
                                                                            1,
                                                                        item.customNotes,
                                                                    )
                                                                }
                                                                className="hover:bg-sand-100 cursor-pointer p-1 text-brand-700 transition-transform active:scale-95"
                                                            >
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </button>
                                                            <span className="px-2 text-xs font-semibold text-brand-950">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item
                                                                            .variant
                                                                            .id,
                                                                        item.grindOption,
                                                                        item.quantity +
                                                                            1,
                                                                        item.customNotes,
                                                                    )
                                                                }
                                                                className="hover:bg-sand-100 cursor-pointer p-1 text-brand-700 transition-transform active:scale-95"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                        <span className="text-sm font-bold text-brand-900">
                                                            {formatRupiah(
                                                                item.variant
                                                                    .price *
                                                                    item.quantity,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="space-y-3.5 border-t border-sand-200 bg-cream-50 p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:p-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-brand-600">
                                        Subtotal
                                    </span>
                                    <span className="text-lg font-extrabold text-brand-950">
                                        {formatRupiah(subtotal)}
                                    </span>
                                </div>
                                <p className="text-[11px] leading-tight text-brand-500">
                                    Checkout langsung di website dengan{' '}
                                    <strong>QRIS Semua Bank & E-Wallet</strong>{' '}
                                    atau <strong>Transfer Bank</strong> resmi.
                                </p>
                                <Link
                                    href="/keranjang"
                                    onClick={() => setIsCartOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-800 active:scale-[0.98]"
                                >
                                    <span>
                                        Lanjut ke Pembayaran &amp; Checkout
                                    </span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
