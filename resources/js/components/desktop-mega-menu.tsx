import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import {
    DESKTOP_MEGA_MENU_CATEGORIES,
    MegaMainCategory,
} from '@/data/desktop-mega-menu';
import { SubcategoryIcon } from '@/components/category-illustrations';
import { SanubariSharedProps } from '@/types/sanubari';

interface DesktopMegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
    categories?: MegaMainCategory[];
}

export const DesktopMegaMenu: React.FC<DesktopMegaMenuProps> = ({
    isOpen,
    onClose,
    categories: propCategories,
}) => {
    const pageProps = usePage<SanubariSharedProps>().props;

    const dynamicFromProps =
        propCategories ||
        (pageProps.desktopMegaMenuCategories as
            | MegaMainCategory[]
            | undefined) ||
        (pageProps.settings?.desktop_mega_menu_categories as
            | MegaMainCategory[]
            | undefined);

    const rawCategories: MegaMainCategory[] =
        Array.isArray(dynamicFromProps) && dynamicFromProps.length > 0
            ? dynamicFromProps
            : DESKTOP_MEGA_MENU_CATEGORIES;

    // Filter active categories
    const categoriesList = rawCategories.filter(
        (cat) => (cat as any).is_active !== false,
    );
    const finalCategories =
        categoriesList.length > 0
            ? categoriesList
            : DESKTOP_MEGA_MENU_CATEGORIES;

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
        finalCategories[0]?.id || 'coffee',
    );

    // Ensure selected category is valid
    const currentSelectedId = finalCategories.some(
        (cat) => cat.id === selectedCategoryId,
    )
        ? selectedCategoryId
        : finalCategories[0]?.id || 'coffee';

    const activeCategory: MegaMainCategory =
        finalCategories.find((cat) => cat.id === currentSelectedId) ||
        finalCategories[0];

    const rawSubcategories = activeCategory?.subcategories || [];
    const activeSubcategories = rawSubcategories.filter(
        (sub) => (sub as any).is_active !== false,
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        className="fixed inset-0 z-30 hidden bg-black/40 backdrop-blur-xs lg:block"
                    />

                    {/* Mega Menu Container */}
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-x-0 top-full z-40 hidden border-b border-sand-200 bg-white font-sans text-brand-950 shadow-2xl lg:block"
                    >
                        <div className="mx-auto flex min-h-[440px] max-w-7xl items-stretch">
                            {/* Left Sidebar: Main Categories (Fixed width ~270px) */}
                            <aside className="max-h-[480px] w-[270px] shrink-0 scrollbar-thin overflow-y-auto border-r border-sand-200 bg-cream-50/70 p-3">
                                <div className="space-y-1">
                                    {finalCategories.map((cat) => {
                                        const isActive =
                                            cat.id === currentSelectedId;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onMouseEnter={() =>
                                                    setSelectedCategoryId(
                                                        cat.id,
                                                    )
                                                }
                                                onClick={() =>
                                                    setSelectedCategoryId(
                                                        cat.id,
                                                    )
                                                }
                                                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all duration-150 ${
                                                    isActive
                                                        ? 'bg-sand-200/90 font-bold text-accent-copper shadow-xs'
                                                        : 'text-brand-800 hover:bg-cream-100/90 hover:text-brand-950'
                                                }`}
                                            >
                                                <span>{cat.name}</span>
                                                <ChevronRight
                                                    className={`h-4 w-4 transition-transform ${
                                                        isActive
                                                            ? 'translate-x-0.5 text-accent-copper'
                                                            : 'text-brand-300'
                                                    }`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </aside>

                            {/* Right Content Area: 4-Column Subcategory Grid */}
                            <main className="max-h-[480px] flex-1 overflow-y-auto bg-white p-6 lg:p-8">
                                <div className="mb-4 flex items-center justify-between border-b border-sand-200/60 pb-4">
                                    <h3 className="text-base font-extrabold tracking-tight text-brand-950">
                                        {activeCategory.name}
                                    </h3>
                                    <Link
                                        href={activeCategory.url || '/shop'}
                                        onClick={onClose}
                                        className="group flex items-center gap-1 text-xs font-bold text-accent-copper transition-colors hover:text-accent-copper-hover"
                                    >
                                        <span>
                                            Lihat Semua di {activeCategory.name}
                                        </span>
                                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </div>

                                <motion.div
                                    key={activeCategory.id}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.18,
                                        ease: 'easeOut',
                                    }}
                                    className="grid grid-cols-4 gap-3.5"
                                >
                                    {activeSubcategories.map((sub) => {
                                        const isExternal =
                                            sub.url?.startsWith('http://') ||
                                            sub.url?.startsWith('https://');
                                        const content = (
                                            <>
                                                {/* Thumbnail illustration / image */}
                                                <div className="bg-sand-100 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sand-200/60 p-1.5 shadow-[inset_0_1px_2px_rgba(18,30,33,0.02)]">
                                                    {sub.image ? (
                                                        <img
                                                            src={
                                                                sub.image.startsWith(
                                                                    'http://',
                                                                ) ||
                                                                sub.image.startsWith(
                                                                    'https://',
                                                                )
                                                                    ? sub.image
                                                                    : `/storage/${sub.image.replace(/^\/?(public\/|storage\/)?/, '')}`
                                                            }
                                                            alt={sub.name}
                                                            className="h-full w-full rounded-md object-cover transition-transform duration-200 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <SubcategoryIcon
                                                            name={sub.icon}
                                                            className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105"
                                                        />
                                                    )}
                                                </div>

                                                {/* Subcategory title */}
                                                <span className="line-clamp-2 text-xs leading-snug font-semibold text-brand-900 transition-colors group-hover:text-accent-copper sm:text-sm">
                                                    {sub.name}
                                                </span>
                                            </>
                                        );

                                        const linkClass =
                                            'group border border-sand-200/90 hover:border-brand-300 rounded-xl p-2.5 flex items-center gap-3 bg-white hover:bg-cream-50/80 transition-all duration-150 shadow-[0_1px_2px_rgba(18,30,33,0.02)] hover:shadow-xs active:scale-[0.98]';

                                        return isExternal ? (
                                            <a
                                                key={sub.id}
                                                href={sub.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={onClose}
                                                className={linkClass}
                                            >
                                                {content}
                                            </a>
                                        ) : (
                                            <Link
                                                key={sub.id}
                                                href={sub.url}
                                                onClick={onClose}
                                                className={linkClass}
                                            >
                                                {content}
                                            </Link>
                                        );
                                    })}
                                </motion.div>
                            </main>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
