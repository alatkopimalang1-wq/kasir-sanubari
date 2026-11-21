import React, { useState, useMemo, useRef } from 'react';
import {
    Coffee,
    Plus,
    Pencil,
    Trash2,
    Search,
    Save,
    RefreshCw,
    AlertCircle,
    UtensilsCrossed,
    CheckCircle2,
    XCircle,
    ImageIcon,
    SlidersHorizontal,
    Upload,
    X,
} from 'lucide-react';
import { PosCategoryItem } from './category-settings';

export const getSafeCategoryName = (cat: any): string => {
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'object') {
        return cat.id || cat.en || cat.name || Object.values(cat)[0] || '';
    }
    return String(cat);
};

export interface PosProductVariant {
    id?: number;
    label: string;
    price: number;
    original_price?: number | null;
    cost_price?: number | null;
    stock_status?: string;
    weight_grams?: number;
    sku?: string | null;
}

export interface PosProductItem {
    id: number;
    name: string;
    slug: string;
    series?: string | null;
    category_id?: number | null;
    category_name?: string | null;
    category_ids: number[];
    image: string;
    price: number;
    min_price: number;
    max_price: number;
    description?: string | null;
    stock_status: string;
    is_out_of_stock: boolean;
    variants: PosProductVariant[];
}

interface MenuSettingsProps {
    products: PosProductItem[];
    categories: PosCategoryItem[];
    onProductsChange: (products: PosProductItem[]) => void;
    showToast: (message: string) => void;
}

interface VariantFormItem {
    id?: number;
    label: string;
    price: number | '';
    cost_price?: number | '';
    stock_status: 'in_stock' | 'out_of_stock';
}

export const MenuSettings: React.FC<MenuSettingsProps> = ({
    products,
    categories,
    onProductsChange,
    showToast,
}) => {
    // Form State
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [stockStatus, setStockStatus] = useState<'in_stock' | 'out_of_stock'>('in_stock');
    const [hasVariants, setHasVariants] = useState<boolean>(false);
    const [variants, setVariants] = useState<VariantFormItem[]>([
        { label: 'Standar', price: '', cost_price: 0, stock_status: 'in_stock' },
    ]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingStockId, setTogglingStockId] = useState<number | null>(null);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
    const [filterStock, setFilterStock] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const formatRp = (val: number | string) => {
        const num = Number(val) || 0;
        return num.toLocaleString('id-ID');
    };

    const handleEnableVariants = () => {
        setHasVariants(true);
        if (variants.length <= 1) {
            const currentPrice = variants[0]?.price ?? '';
            setVariants([
                {
                    id: variants[0]?.id,
                    label: variants[0]?.label && variants[0]?.label !== 'Standar' ? variants[0].label : 'Reguler',
                    price: currentPrice,
                    cost_price: variants[0]?.cost_price ?? 0,
                    stock_status: variants[0]?.stock_status ?? 'in_stock',
                },
                {
                    label: 'Large',
                    price: '',
                    cost_price: 0,
                    stock_status: 'in_stock',
                },
            ]);
        }
    };

    const handleDisableVariants = () => {
        setHasVariants(false);
        setVariants((prev) => [
            {
                id: prev[0]?.id,
                label: 'Standar',
                price: prev[0]?.price ?? '',
                cost_price: prev[0]?.cost_price ?? 0,
                stock_status: prev[0]?.stock_status ?? 'in_stock',
            },
        ]);
    };

    const handleAddVariantRow = () => {
        setHasVariants(true);
        setVariants((prev) => [
            ...prev,
            { label: `Varian ${prev.length + 1}`, price: '', cost_price: 0, stock_status: 'in_stock' },
        ]);
    };

    const handleRemoveVariantRow = (index: number) => {
        if (variants.length <= 1) {
            handleDisableVariants();
            return;
        }
        const updated = variants.filter((_, i) => i !== index);
        setVariants(updated);
        if (updated.length <= 1) {
            setHasVariants(false);
        }
    };

    const handleVariantChange = (index: number, field: keyof VariantFormItem, val: any) => {
        setVariants((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)),
        );
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreview(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStartEdit = (product: PosProductItem) => {
        setEditingProductId(product.id);
        setName(product.name);
        setCategoryId(product.category_id || (product.category_ids?.[0] ?? ''));
        setDescription(product.description || '');
        setStockStatus(product.stock_status === 'out_of_stock' ? 'out_of_stock' : 'in_stock');
        setImageFile(null);
        setImagePreview(product.image || null);

        const hasMultipleVariants = Array.isArray(product.variants) && product.variants.length > 1;
        setHasVariants(hasMultipleVariants);

        if (Array.isArray(product.variants) && product.variants.length > 0) {
            setVariants(
                product.variants.map((v) => ({
                    id: v.id,
                    label: v.label || 'Standar',
                    price: v.price ?? '',
                    cost_price: v.cost_price ?? '',
                    stock_status: v.stock_status === 'out_of_stock' ? 'out_of_stock' : 'in_stock',
                })),
            );
        } else {
            setVariants([
                {
                    label: 'Standar',
                    price: product.price ?? product.min_price ?? '',
                    cost_price: '',
                    stock_status: 'in_stock',
                },
            ]);
        }
        setFormError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingProductId(null);
        setName('');
        setCategoryId('');
        setDescription('');
        setStockStatus('in_stock');
        setHasVariants(false);
        setVariants([{ label: 'Standar', price: '', cost_price: '', stock_status: 'in_stock' }]);
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim()) {
            setFormError('Nama menu cafe wajib diisi.');
            return;
        }

        // Validate variants
        if (!hasVariants) {
            const singlePrice = variants[0]?.price;
            if (singlePrice === '' || Number(singlePrice) < 0) {
                setFormError('Harga jual menu wajib diisi dengan benar.');
                return;
            }
        } else {
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                if (!v.label.trim()) {
                    setFormError(`Label varian baris #${i + 1} tidak boleh kosong.`);
                    return;
                }
                if (v.price === '' || Number(v.price) < 0) {
                    setFormError(`Harga jual varian "${v.label}" wajib diisi dengan benar.`);
                    return;
                }
            }
        }

        setIsSaving(true);
        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const formData = new FormData();
            formData.append('name', name.trim());
            if (categoryId) formData.append('category_id', String(categoryId));
            if (description.trim()) formData.append('description', description.trim());
            formData.append('stock_status', stockStatus);

            const variantsToSubmit = !hasVariants
                ? [
                      {
                          id: variants[0]?.id,
                          label: variants[0]?.label?.trim() || 'Standar',
                          price: variants[0]?.price ?? 0,
                          cost_price: variants[0]?.cost_price ?? '',
                          stock_status: stockStatus,
                      },
                  ]
                : variants;

            variantsToSubmit.forEach((v, idx) => {
                if (v.id) formData.append(`variants[${idx}][id]`, String(v.id));
                formData.append(`variants[${idx}][label]`, v.label.trim());
                formData.append(`variants[${idx}][price]`, String(Number(v.price) || 0));
                if (v.cost_price !== '') {
                    formData.append(`variants[${idx}][cost_price]`, String(Number(v.cost_price) || 0));
                }
                formData.append(`variants[${idx}][stock_status]`, v.stock_status || stockStatus);
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const isEdit = editingProductId !== null;
            const url = isEdit ? `/pos/products/${editingProductId}` : '/pos/products';

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menyimpan menu cafe.');
            }

            if (Array.isArray(data.products)) {
                onProductsChange(data.products);
            }

            handleCancelEdit();
            showToast(
                data.message || (isEdit ? 'Menu cafe berhasil diperbarui!' : 'Menu cafe baru berhasil ditambahkan!'),
            );
        } catch (err: any) {
            setFormError(err.message || 'Terjadi kesalahan saat menyimpan menu.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStock = async (product: PosProductItem) => {
        setTogglingStockId(product.id);
        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const res = await fetch(`/pos/products/${product.id}/toggle-stock`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal mengubah status menu.');
            }

            if (Array.isArray(data.products)) {
                onProductsChange(data.products);
            } else {
                const nextStatus = product.stock_status === 'in_stock' ? 'out_of_stock' : 'in_stock';
                onProductsChange(
                    products.map((p) =>
                        p.id === product.id
                            ? { ...p, stock_status: nextStatus, is_out_of_stock: nextStatus === 'out_of_stock' }
                            : p,
                    ),
                );
            }

            showToast(data.message || 'Status ketersediaan menu diperbarui.');
        } catch (err: any) {
            alert(err.message || 'Gagal mengubah ketersediaan menu.');
        } finally {
            setTogglingStockId(null);
        }
    };

    const handleDeleteProduct = async (product: PosProductItem) => {
        if (!confirm(`Hapus menu "${product.name}" dari sistem kasir? Tindakan ini tidak dapat dibatalkan.`)) {
            return;
        }

        setDeletingId(product.id);
        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const res = await fetch(`/pos/products/${product.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menghapus menu.');
            }

            if (Array.isArray(data.products)) {
                onProductsChange(data.products);
            } else {
                onProductsChange(products.filter((p) => p.id !== product.id));
            }

            if (editingProductId === product.id) {
                handleCancelEdit();
            }

            showToast(data.message || `Menu "${product.name}" berhasil dihapus.`);
        } catch (err: any) {
            alert(err.message || 'Gagal menghapus menu.');
        } finally {
            setDeletingId(null);
        }
    };

    // Filtered Products
    const filteredList = useMemo(() => {
        let list = Array.isArray(products) ? products : [];

        if (filterCategory !== 'all') {
            list = list.filter((p) =>
                Array.isArray(p.category_ids)
                    ? p.category_ids.includes(filterCategory)
                    : p.category_id === filterCategory,
            );
        }

        if (filterStock !== 'all') {
            list = list.filter((p) => p.stock_status === filterStock);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.category_name && getSafeCategoryName(p.category_name).toLowerCase().includes(q)) ||
                    (p.description && p.description.toLowerCase().includes(q)) ||
                    p.variants.some((v) => v.label.toLowerCase().includes(q)),
            );
        }

        return list;
    }, [products, filterCategory, filterStock, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-3.5 sm:p-4 dark:bg-brand-500/15">
                <Coffee className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-300" />
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-brand-950 dark:text-brand-100">
                            Atur Menu (Makanan & Minuman)
                        </h3>
                        <span className="shrink-0 rounded-full bg-brand-700 px-2.5 py-0.5 text-[10px] font-bold text-white">
                            {products.length} Menu Terdaftar
                        </span>
                    </div>
                    <p className="text-xs leading-relaxed text-brand-900/80 dark:text-brand-200/80">
                        Atur daftar hidangan makanan, kopi, dan aneka minuman cafe. Kelola harga jual, varian ukuran/suhu, serta status ketersediaan stok menu secara real-time.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* ========================================================= */}
                {/* KOLOM KIRI: FORM TAMBAH / EDIT MENU                      */}
                {/* ========================================================= */}
                <div className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:space-y-5 sm:p-6 lg:col-span-5 dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                        <div className="flex items-center gap-2">
                            <div
                                className={`rounded-xl p-2 ${
                                    editingProductId
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        : 'bg-brand-500/10 text-brand-700 dark:text-brand-300'
                                }`}
                            >
                                {editingProductId ? (
                                    <Pencil className="h-4 w-4" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                    {editingProductId ? 'Edit Menu Cafe' : 'Tambah Menu Baru'}
                                </h4>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                    {editingProductId
                                        ? 'Perbarui detail harga, varian, atau stok'
                                        : 'Input item makanan atau minuman baru'}
                                </p>
                            </div>
                        </div>
                        {editingProductId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="cursor-pointer text-xs font-semibold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                            >
                                Batal Edit
                            </button>
                        )}
                    </div>

                    {formError && (
                        <div className="flex animate-in items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 fade-in dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300">
                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">

                        {/* Nama Menu */}
                        <div className="space-y-1">
                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                Nama Menu <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: Kopi Susu Aren, Croissant..."
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            />
                        </div>

                        {/* Kategori */}
                        <div className="space-y-1">
                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                Kategori Menu
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) =>
                                    setCategoryId(e.target.value === '' ? '' : Number(e.target.value))
                                }
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            >
                                <option value="">-- Tanpa Kategori / Umum --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {getSafeCategoryName(c.name)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Ketersediaan */}
                        <div className="space-y-1">
                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                Status Stok Menu
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStockStatus('in_stock')}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition ${
                                        stockStatus === 'in_stock'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                            : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400'
                                    }`}
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">Tersedia (Ready)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStockStatus('out_of_stock')}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition ${
                                        stockStatus === 'out_of_stock'
                                            ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                            : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400'
                                    }`}
                                >
                                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">Habis (Sold Out)</span>
                                </button>
                            </div>
                        </div>

                        {/* HARGA JUAL ATAU TABEL VARIAN */}
                        {!hasVariants ? (
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                                        Harga Jual <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleEnableVariants}
                                        className="flex cursor-pointer items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>+ Tambah Varian Menu</span>
                                    </button>
                                </div>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-2 left-3 text-xs font-bold text-stone-400">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={variants[0]?.price ?? ''}
                                        onChange={(e) =>
                                            handleVariantChange(
                                                0,
                                                'price',
                                                e.target.value === '' ? '' : Number(e.target.value),
                                            )
                                        }
                                        placeholder="Contoh: 25000"
                                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pr-3 pl-9 text-xs font-bold text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                    />
                                </div>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                    Menu tanpa varian hanya perlu mengisi harga jual langsung di atas.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-stone-700 dark:text-stone-300">
                                        Varian & Harga Jual <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDisableVariants}
                                            className="cursor-pointer text-[11px] font-semibold text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
                                        >
                                            Hapus Varian (1 Harga Saja)
                                        </button>
                                        <span className="text-stone-300 dark:text-stone-700">•</span>
                                        <button
                                            type="button"
                                            onClick={handleAddVariantRow}
                                            className="flex cursor-pointer items-center gap-1 font-bold text-brand-700 hover:text-brand-800 dark:text-brand-400"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>+ Varian Lain</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {variants.map((v, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 sm:flex-row sm:items-center dark:border-stone-700 dark:bg-stone-800/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <span className="mb-1 block text-[10px] font-semibold text-stone-500 sm:hidden">
                                                    Nama Varian {variants.length > 1 ? `#${idx + 1}` : ''}
                                                </span>
                                                <input
                                                    type="text"
                                                    required
                                                    value={v.label}
                                                    onChange={(e) =>
                                                        handleVariantChange(idx, 'label', e.target.value)
                                                    }
                                                    placeholder={idx === 0 ? 'Standar / Reguler' : 'Hot, Ice, Large, dll'}
                                                    className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 sm:w-44">
                                                <div className="relative min-w-0 flex-1 sm:w-full">
                                                    <span className="pointer-events-none absolute top-1.5 left-2.5 text-xs font-semibold text-stone-400">
                                                        Rp
                                                    </span>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0"
                                                        value={v.price}
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                idx,
                                                                'price',
                                                                e.target.value === '' ? '' : Number(e.target.value),
                                                            )
                                                        }
                                                        placeholder="0"
                                                        className="w-full rounded-lg border border-stone-200 bg-white py-1.5 pr-2.5 pl-8 text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariantRow(idx)}
                                                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-stone-800 dark:text-rose-400 dark:hover:bg-rose-950/50 sm:border-0 sm:bg-transparent"
                                                    title="Hapus varian ini"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Deskripsi */}
                        <div className="space-y-1">
                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                Deskripsi / Catatan Rasa (Opsional)
                            </label>
                            <textarea
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Komposisi bahan, aroma, atau catatan penyajian..."
                                className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            />
                        </div>

                        {/* Foto Menu */}
                        <div className="space-y-1.5">
                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                Foto Menu Makanan / Minuman (Opsional)
                            </label>
                            <div className="flex items-center gap-3">
                                {imagePreview ? (
                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-2xs dark:border-stone-700 dark:bg-stone-800">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-1 right-1 cursor-pointer rounded-full bg-stone-900/80 p-0.5 text-white transition hover:bg-rose-600"
                                            title="Hapus gambar"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-400 dark:border-stone-700 dark:bg-stone-800">
                                        <ImageIcon className="h-6 w-6 stroke-1" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 active:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                    >
                                        <Upload className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                                        <span>{imageFile ? 'Ganti Foto' : 'Pilih Foto Menu'}</span>
                                    </button>
                                    <p className="truncate text-[10px] text-stone-400">
                                        {imageFile ? imageFile.name : 'Format: JPG, PNG, WEBP (Maks 5MB)'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Simpan */}
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition ${
                                    editingProductId
                                        ? 'bg-amber-600 hover:bg-amber-700'
                                        : 'bg-brand-700 hover:bg-brand-800'
                                } disabled:opacity-50`}
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>Menyimpan Menu...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>
                                            {editingProductId ? 'Simpan Perubahan' : 'Tambah ke Menu Kasir'}
                                        </span>
                                    </>
                                )}
                            </button>
                            {editingProductId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="cursor-pointer rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* ========================================================= */}
                {/* KOLOM KANAN: DAFTAR MENU CAFE                             */}
                {/* ========================================================= */}
                <div className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:space-y-5 sm:p-6 lg:col-span-7 dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex flex-col justify-between gap-3 border-b border-stone-100 pb-3 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                Daftar Menu Makanan & Minuman
                            </h4>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                Total {filteredList.length} menu sesuai filter
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-60">
                            <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-stone-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama menu / varian..."
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pr-3 pl-8 text-xs text-stone-900 placeholder:text-stone-400 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            />
                        </div>
                    </div>

                    {/* Filter Kategori & Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={filterCategory}
                            onChange={(e) =>
                                setFilterCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))
                            }
                            className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {getSafeCategoryName(c.name)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value as any)}
                            className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                        >
                            <option value="all">Semua Status</option>
                            <option value="in_stock">Tersedia Saja</option>
                            <option value="out_of_stock">Habis Saja</option>
                        </select>
                    </div>

                    {/* List Menu Items */}
                    {filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 py-12 text-center dark:border-stone-800">
                            <Coffee className="mb-2 h-8 w-8 text-stone-300 dark:text-stone-600" />
                            <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                                Menu tidak ditemukan
                            </p>
                            <p className="mt-1 text-[11px] text-stone-400">
                                Gunakan formulir di sebelah kiri untuk menambah menu makanan atau minuman baru
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredList.map((product) => {
                                const isReady = product.stock_status === 'in_stock';
                                const isToggling = togglingStockId === product.id;
                                const isDeleting = deletingId === product.id;

                                return (
                                    <div
                                        key={product.id}
                                        className={`flex items-center justify-between gap-2.5 rounded-xl border p-2.5 transition sm:p-3.5 ${
                                            editingProductId === product.id
                                                ? 'border-amber-500/50 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-950/20'
                                                : isReady
                                                  ? 'border-stone-200 bg-white hover:bg-stone-50/70 dark:border-stone-800 dark:bg-stone-800/40 dark:hover:bg-stone-800/70'
                                                  : 'border-stone-200 bg-stone-100/70 opacity-75 dark:border-stone-800 dark:bg-stone-900/60'
                                        }`}
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:items-start sm:gap-3">
                                            {/* Foto */}
                                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-2xs sm:h-12 sm:w-12 dark:border-stone-700 dark:bg-stone-800">
                                                <img
                                                    src={product.image || '/brand/logo-circle.png'}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/brand/logo-circle.png';
                                                    }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="truncate text-xs font-bold text-stone-900 sm:text-sm dark:text-white">
                                                        {product.name}
                                                    </span>
                                                    {getSafeCategoryName(product.category_name) ? (
                                                        <span className="hidden rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 sm:inline-block dark:bg-stone-800 dark:text-stone-300">
                                                            {getSafeCategoryName(product.category_name)}
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {/* Varian Prices - disembunyikan di mobile agar tidak memakan tempat */}
                                                <div className="hidden flex-wrap items-center gap-1.5 text-xs sm:flex">
                                                    {Array.isArray(product.variants) && product.variants.length > 0 ? (
                                                        product.variants.map((v, vIdx) => (
                                                            <span
                                                                key={vIdx}
                                                                className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                                                            >
                                                                {v.label}: <strong>Rp {formatRp(v.price)}</strong>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="font-bold text-stone-900 dark:text-white">
                                                            Rp {formatRp(product.price)}
                                                        </span>
                                                    )}
                                                </div>

                                                {product.description && (
                                                    <p className="hidden line-clamp-1 text-[11px] text-stone-400 sm:block">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Aksi & Status */}
                                        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                                            {/* Quick Toggle Stok */}
                                            <button
                                                type="button"
                                                disabled={isToggling}
                                                onClick={() => handleToggleStock(product)}
                                                className={`cursor-pointer rounded-lg px-2 py-1 text-[10px] font-bold transition sm:px-2.5 sm:text-[11px] ${
                                                    isReady
                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/70 dark:text-rose-300'
                                                }`}
                                                title="Klik untuk ubah Tersedia / Habis"
                                            >
                                                {isToggling ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
                                                ) : isReady ? (
                                                    '● Ready'
                                                ) : (
                                                    '○ Habis'
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleStartEdit(product)}
                                                className="cursor-pointer rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 sm:p-2 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-amber-600 dark:hover:bg-amber-950/60 dark:hover:text-amber-300"
                                                title="Edit Menu"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isDeleting}
                                                onClick={() => handleDeleteProduct(product)}
                                                className="cursor-pointer rounded-lg border border-stone-200 bg-white p-1.5 text-rose-600 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 sm:p-2 dark:border-stone-700 dark:bg-stone-800 dark:text-rose-400 dark:hover:border-rose-800 dark:hover:bg-rose-950/60"
                                                title="Hapus Menu"
                                            >
                                                {isDeleting ? (
                                                    <RefreshCw className="h-3.5 w-3.5 animate-spin sm:h-3.5 sm:w-3.5" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
