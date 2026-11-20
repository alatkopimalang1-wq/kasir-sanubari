import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag, Heart, Plus } from 'lucide-react';
import type { Product } from '@/types/sanubari';
import { formatRupiah } from '@/lib/trans';
import { CoffeeBeanIcon } from '@/components/coffee-bean-icon';

interface ProductCardProps {
    product: Product;
    variant?: 'mobile' | 'desktop' | 'auto';
    className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    variant = 'auto',
    className = '',
}) => {
    const primaryVariant = product.variants?.[0] || {
        id: product.id,
        product_id: product.id,
        label: '200 gr',
        weight_grams: 200,
        price: product.min_price || 15000,
        stock_status: 'in_stock' as const,
    };

    const rawImg =
        product.images?.[0]?.path ||
        primaryVariant?.image_url ||
        primaryVariant?.image;
    const imageUrl = rawImg
        ? rawImg.startsWith('http://') || rawImg.startsWith('https://')
            ? rawImg
            : `/storage/${rawImg.replace(/^\/?(public\/|storage\/)?/, '')}`
        : '/brand/logo-circle.png';
    const isDiscounted =
        !!primaryVariant.original_price &&
        primaryVariant.original_price > primaryVariant.price;
    const discountPercent = isDiscounted
        ? Math.round(
              ((primaryVariant.original_price! - primaryVariant.price) /
                  primaryVariant.original_price!) *
                  100,
          )
        : null;

    const isOutOfStock = Boolean(
        product.is_out_of_stock ||
        product.stock_status === 'out_of_stock' ||
        (product.variants &&
            product.variants.length > 0 &&
            product.variants.every((v) => v.stock_status === 'out_of_stock')),
    );

    // Full-Width Mobile Shape matching Otten Coffee reference (Image 2)
    const renderMobileShape = () => (
        <div
            className={`flex h-full flex-col justify-between overflow-hidden rounded-xl border transition-all duration-200 ${
                isOutOfStock
                    ? 'border-neutral-300 bg-neutral-900/5 shadow-xs'
                    : 'border-sand-200/80 bg-white shadow-xs hover:shadow-md'
            }`}
        >
            {/* Top Full-Width Image Container (Edge-to-Edge) */}
            <Link
                href={`/shop/${product.slug}`}
                className="group relative block aspect-square w-full overflow-hidden bg-sand-200/30"
            >
                <img
                    src={imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className={`h-full w-full object-cover transition-transform duration-300 ${
                        isOutOfStock
                            ? 'brightness-50 contrast-125 grayscale filter'
                            : 'group-hover:scale-105'
                    }`}
                />

                {/* Dark Overlay with Centered SOLD OUT Label */}
                {isOutOfStock && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-2 backdrop-blur-[1px]">
                        <span className="rounded-md border border-white/30 bg-black/90 px-3 py-1 text-xs font-black tracking-widest text-white uppercase shadow-md">
                            SOLD OUT
                        </span>
                        <span className="mt-1 text-[10px] font-medium text-white/80">
                            Stok Habis
                        </span>
                    </div>
                )}

                {/* Top-Left Badge (SOLD OUT / Discount / Flash Sale / Best Seller) */}
                {isOutOfStock ? (
                    <span className="absolute top-2 left-2 z-20 rounded-md border border-white/20 bg-black px-2 py-0.5 text-[10px] font-black tracking-wider text-white shadow-xs">
                        SOLD OUT
                    </span>
                ) : product.is_flash_sale ? (
                    <span className="absolute top-2 left-2 rounded-md bg-[#e03131] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Flash Sale
                    </span>
                ) : discountPercent ? (
                    <span className="absolute top-2 left-2 rounded-md bg-[#d97706] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Hemat {discountPercent}%
                    </span>
                ) : product.is_new ? (
                    <span className="absolute top-2 left-2 rounded-md bg-brand-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Baru
                    </span>
                ) : product.is_featured ? (
                    <span className="absolute top-2 left-2 rounded-md bg-brand-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Best Seller
                    </span>
                ) : null}

                {/* Top-Right Heart Wishlist Pill */}
                <div className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-brand-400 shadow-xs backdrop-blur-xs">
                    <Heart className="h-3.5 w-3.5 text-brand-400" />
                </div>
            </Link>

            {/* Content Body with Compact Padding */}
            <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
                <Link href={`/shop/${product.slug}`} className="block">
                    {/* Series / Category */}
                    <span
                        className={`mb-1 block truncate text-[11px] font-semibold tracking-wider uppercase ${
                            isOutOfStock
                                ? 'text-neutral-500'
                                : 'text-accent-copper'
                        }`}
                    >
                        {product.series_label ||
                            (product.series
                                ? product.series.replace('-', ' ')
                                : 'Specialty')}
                    </span>

                    {/* Product Name (2 Lines Max) */}
                    <h3
                        className={`line-clamp-2 min-h-[2.4rem] text-sm leading-snug font-bold transition-colors sm:text-base ${
                            isOutOfStock
                                ? 'text-neutral-600 line-through decoration-neutral-400'
                                : 'text-brand-950 group-hover:text-brand-700'
                        }`}
                    >
                        {product.name}
                    </h3>

                    {/* Price Area: Strikethrough + Selling Price */}
                    <div className="mt-1.5 space-y-0.5">
                        {isDiscounted && primaryVariant.original_price && (
                            <span className="block text-[11px] leading-none text-brand-400 line-through sm:text-xs">
                                {formatRupiah(primaryVariant.original_price)}
                            </span>
                        )}
                        <div
                            className={`text-[15px] font-black sm:text-base ${
                                isOutOfStock
                                    ? 'text-neutral-500'
                                    : 'text-brand-950'
                            }`}
                        >
                            {formatRupiah(primaryVariant.price)}
                        </div>
                    </div>
                </Link>

                {/* Bottom Action: Full-Width + Keranjang Button (or Disabled Sold Out) */}
                <div className="mt-auto pt-2.5">
                    {isOutOfStock ? (
                        <button
                            type="button"
                            disabled
                            className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-2 text-[12.5px] font-bold text-neutral-400 opacity-90 shadow-none sm:text-xs"
                        >
                            <span className="text-[11px] tracking-wide text-white/70 uppercase">
                                Stok Habis
                            </span>
                        </button>
                    ) : (
                        <Link
                            href={`/shop/${product.slug}`}
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-[12.5px] font-bold text-white shadow-xs transition-colors hover:bg-brand-800 active:bg-brand-900 sm:text-xs"
                        >
                            <ShoppingBag className="h-4 w-4 stroke-[2.2]" />
                            <span>+ Keranjang</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    // Desktop Editorial Shape (No slop, no rest shadows, clean typography)
    const renderDesktopShape = () => (
        <div
            className={`flex h-full flex-col justify-between rounded-2xl p-5 transition-colors duration-200 ${
                isOutOfStock
                    ? 'bg-neutral-900/5'
                    : 'bg-white hover:bg-sand-200/30'
            }`}
        >
            <Link href={`/shop/${product.slug}`} className="block">
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-sand-200/40">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className={`h-full w-full object-cover transition-transform duration-300 ${
                            isOutOfStock
                                ? 'brightness-50 contrast-125 grayscale filter'
                                : 'group-hover:scale-103'
                        }`}
                    />

                    {/* Dark Overlay with Centered SOLD OUT Label */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-3 backdrop-blur-[1px]">
                            <span className="rounded-lg border border-white/30 bg-black/90 px-4 py-1.5 text-sm font-black tracking-widest text-white uppercase shadow-xl">
                                SOLD OUT
                            </span>
                            <span className="mt-1 text-xs font-medium text-white/80">
                                Stok Habis
                            </span>
                        </div>
                    )}

                    {isOutOfStock ? (
                        <span className="absolute top-3 left-3 z-20 rounded-full border border-white/20 bg-black px-3 py-1 text-[12px] font-black tracking-wider text-white shadow-xs">
                            SOLD OUT
                        </span>
                    ) : product.is_flash_sale ? (
                        <span className="absolute top-3 left-3 rounded-full bg-[#e03131] px-3 py-1 text-[13px] font-bold text-white shadow-xs">
                            Flash Sale
                        </span>
                    ) : product.is_featured ? (
                        <span className="absolute top-3 left-3 rounded-full bg-brand-900 px-3 py-1 text-[13px] font-semibold text-white">
                            Best Seller
                        </span>
                    ) : null}
                </div>

                <div
                    className={`mb-1.5 text-[12px] font-semibold tracking-wider uppercase ${
                        isOutOfStock ? 'text-neutral-500' : 'text-accent-copper'
                    }`}
                >
                    <span className="capitalize">
                        {product.series_label ||
                            product.series?.replace('-', ' ')}
                    </span>
                </div>

                <h3
                    className={`mb-2 line-clamp-2 text-base leading-snug font-bold transition-colors ${
                        isOutOfStock
                            ? 'text-neutral-600 line-through decoration-neutral-400'
                            : 'text-brand-950 group-hover:text-brand-700'
                    }`}
                >
                    {product.name}
                </h3>

                {product.tasting_notes && (
                    <p
                        className={`mb-4 line-clamp-1 text-[13px] leading-relaxed ${
                            isOutOfStock ? 'text-neutral-400' : 'text-brand-700'
                        }`}
                    >
                        {product.tasting_notes}
                    </p>
                )}
            </Link>

            <div className="mt-auto flex items-center justify-between pt-3">
                <div>
                    <span
                        className={`block text-[13px] ${isOutOfStock ? 'text-neutral-400' : 'text-brand-700'}`}
                    >
                        Mulai
                    </span>
                    <span
                        className={`text-base font-bold ${isOutOfStock ? 'text-neutral-500' : 'text-brand-950'}`}
                    >
                        {formatRupiah(primaryVariant.price)}
                    </span>
                </div>

                {isOutOfStock ? (
                    <button
                        type="button"
                        disabled
                        className="flex cursor-not-allowed items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-2 text-[13px] font-semibold text-neutral-400 opacity-90 shadow-none"
                    >
                        <span className="text-white/70">Habis</span>
                    </button>
                ) : (
                    <Link
                        href={`/shop/${product.slug}`}
                        className="flex items-center gap-1.5 rounded-full bg-brand-900 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-950 active:scale-95"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Pilih</span>
                    </Link>
                )}
            </div>
        </div>
    );

    if (variant === 'mobile') {
        return (
            <div className={`group h-full ${className}`}>
                {renderMobileShape()}
            </div>
        );
    }
    if (variant === 'desktop') {
        return (
            <div className={`group h-full ${className}`}>
                {renderDesktopShape()}
            </div>
        );
    }

    return (
        <div className={`group h-full ${className}`}>
            <div className="h-full md:hidden">{renderMobileShape()}</div>
            <div className="hidden h-full md:block">{renderDesktopShape()}</div>
        </div>
    );
};
