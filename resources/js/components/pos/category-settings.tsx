import React, { useState, useMemo } from 'react';
import {
    Tag,
    Plus,
    Pencil,
    Trash2,
    Search,
    Save,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';

export interface PosCategoryItem {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    description?: string | null;
    sort_order?: number;
    products_count?: number;
}

interface CategorySettingsProps {
    categories: PosCategoryItem[];
    onCategoriesChange: (categories: PosCategoryItem[]) => void;
    showToast: (message: string) => void;
}

export const getCategoryLabel = (name: any): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    if (typeof name === 'object') {
        return name.id || name.en || Object.values(name)[0] || '';
    }
    return String(name);
};

export const CategorySettings: React.FC<CategorySettingsProps> = ({
    categories,
    onCategoriesChange,
    showToast,
}) => {
    const [categoryName, setCategoryName] = useState('');
    const [categorySlug, setCategorySlug] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [categoryIcon, setCategoryIcon] = useState('');
    const [categorySortOrder, setCategorySortOrder] = useState<number | ''>('');
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
    const [categorySearchQuery, setCategorySearchQuery] = useState('');
    const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

    const filteredCategoriesList = useMemo(() => {
        const query = categorySearchQuery.toLowerCase().trim();
        if (!query) return categories;
        return categories.filter(
            (c) =>
                getCategoryLabel(c.name).toLowerCase().includes(query) ||
                c.slug.toLowerCase().includes(query) ||
                (c.description && c.description.toLowerCase().includes(query)),
        );
    }, [categories, categorySearchQuery]);

    const handleStartEditCategory = (cat: PosCategoryItem) => {
        setEditingCategoryId(cat.id);
        setCategoryName(getCategoryLabel(cat.name));
        setCategorySlug(cat.slug);
        setCategoryDescription(cat.description || '');
        setCategoryIcon(cat.icon || '');
        setCategorySortOrder(cat.sort_order ?? 0);
        setCategoryFormError(null);
    };

    const handleCancelEditCategory = () => {
        setEditingCategoryId(null);
        setCategoryName('');
        setCategorySlug('');
        setCategoryDescription('');
        setCategoryIcon('');
        setCategorySortOrder('');
        setCategoryFormError(null);
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setCategoryFormError(null);

        if (!categoryName.trim()) {
            setCategoryFormError('Nama kategori wajib diisi.');
            return;
        }

        setIsSavingCategory(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';

            const isEdit = editingCategoryId !== null;
            const url = isEdit
                ? `/pos/categories/${editingCategoryId}`
                : '/pos/categories';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    name: categoryName.trim(),
                    slug: categorySlug.trim() || null,
                    description: categoryDescription.trim() || null,
                    icon: categoryIcon.trim() || null,
                    sort_order:
                        categorySortOrder !== ''
                            ? Number(categorySortOrder)
                            : null,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menyimpan kategori');
            }

            if (Array.isArray(data.categories)) {
                onCategoriesChange(data.categories);
            } else if (data.category) {
                if (isEdit) {
                    onCategoriesChange(
                        categories.map((c) =>
                            c.id === data.category.id
                                ? { ...c, ...data.category }
                                : c,
                        ),
                    );
                } else {
                    onCategoriesChange([...categories, data.category]);
                }
            }

            handleCancelEditCategory();
            showToast(
                data.message ||
                    (isEdit
                        ? 'Kategori berhasil diperbarui!'
                        : 'Kategori baru berhasil ditambahkan!'),
            );
        } catch (err: any) {
            setCategoryFormError(
                err.message || 'Terjadi kesalahan saat menyimpan kategori.',
            );
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (cat: PosCategoryItem) => {
        const productCountMsg =
            cat.products_count && cat.products_count > 0
                ? ` Terdapat ${cat.products_count} produk dalam kategori ini (produk tidak akan terhapus, hanya dilepas dari kategori ini).`
                : '';

        if (!confirm(`Hapus kategori "${cat.name}"?${productCountMsg}`)) {
            return;
        }

        setDeletingCategoryId(cat.id);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';

            const res = await fetch(`/pos/categories/${cat.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menghapus kategori');
            }

            if (Array.isArray(data.categories)) {
                onCategoriesChange(data.categories);
            } else {
                onCategoriesChange(categories.filter((c) => c.id !== cat.id));
            }

            if (editingCategoryId === cat.id) {
                handleCancelEditCategory();
            }

            showToast(data.message || `Kategori "${cat.name}" berhasil dihapus.`);
        } catch (err: any) {
            alert(err.message || 'Terjadi kesalahan saat menghapus kategori.');
        } finally {
            setDeletingCategoryId(null);
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Banner Info Kategori */}
            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 p-3.5 sm:p-4 dark:bg-brand-500/15">
                <Tag className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-300" />
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-brand-950 dark:text-brand-100">
                            Pengaturan Kategori Produk POS
                        </h3>
                        <span className="shrink-0 rounded-full bg-brand-700 px-2.5 py-0.5 text-[10px] font-bold text-white">
                            {categories.length} Kategori Terdaftar
                        </span>
                    </div>
                    <p className="text-xs leading-relaxed text-brand-900/80 dark:text-brand-200/80">
                        Kelola kategori untuk mengelompokkan menu dan barang di katalog kasir. Perubahan kategori (tambah, edit, hapus) langsung tersinkronisasi secara real-time pada filter kasir.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
                {/* KOLOM KIRI: FORM TAMBAH / EDIT KATEGORI */}
                <div className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:space-y-5 sm:p-6 lg:col-span-5 dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                        <div className="flex items-center gap-2">
                            <div
                                className={`rounded-xl p-2 ${
                                    editingCategoryId
                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        : 'bg-brand-500/10 text-brand-700 dark:text-brand-300'
                                }`}
                            >
                                {editingCategoryId ? (
                                    <Pencil className="h-4 w-4" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                    {editingCategoryId
                                        ? 'Edit Kategori'
                                        : 'Tambah Kategori Baru'}
                                </h4>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                    {editingCategoryId
                                        ? 'Perbarui informasi kategori yang dipilih'
                                        : 'Buat grup kategori baru untuk produk kasir'}
                                </p>
                            </div>
                        </div>
                        {editingCategoryId && (
                            <button
                                type="button"
                                onClick={handleCancelEditCategory}
                                className="cursor-pointer text-xs font-semibold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                            >
                                Batal Edit
                            </button>
                        )}
                    </div>

                    {categoryFormError && (
                        <div className="flex animate-in items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 fade-in dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300">
                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                            <span>{categoryFormError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                        {/* Nama Kategori */}
                        <div className="space-y-1">
                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                Nama Kategori <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="Contoh: Aneka Minuman, Pastry, Retail"
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            />
                        </div>

                        {/* Slug Kategori */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-stone-700 dark:text-stone-300">
                                    Slug / Kode Kategori
                                </label>
                                <span className="text-[10px] text-stone-400">
                                    Opsional (otomatis jika kosong)
                                </span>
                            </div>
                            <input
                                type="text"
                                value={categorySlug}
                                onChange={(e) => setCategorySlug(e.target.value)}
                                placeholder="Contoh: aneka-minuman"
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 font-mono text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            />
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1">
                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                Deskripsi Singkat (Opsional)
                            </label>
                            <textarea
                                rows={2}
                                value={categoryDescription}
                                onChange={(e) => setCategoryDescription(e.target.value)}
                                placeholder="Keterangan singkat kategori menu..."
                                className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            />
                        </div>

                        {/* Urutan Tampil (Sort Order) */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="font-semibold text-stone-700 dark:text-stone-300">
                                    Urutan Tampil (Sort Order)
                                </label>
                                <span className="text-[10px] text-stone-400">
                                    Angka lebih kecil tampil lebih awal
                                </span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                value={categorySortOrder}
                                onChange={(e) =>
                                    setCategorySortOrder(
                                        e.target.value === '' ? '' : Number(e.target.value),
                                    )
                                }
                                placeholder="0, 1, 2..."
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            />
                        </div>

                        {/* Tombol Simpan */}
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={isSavingCategory}
                                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition ${
                                    editingCategoryId
                                        ? 'bg-amber-600 hover:bg-amber-700'
                                        : 'bg-brand-700 hover:bg-brand-800'
                                } disabled:opacity-50`}
                            >
                                {isSavingCategory ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>
                                            {editingCategoryId
                                                ? 'Simpan Perubahan'
                                                : 'Tambah Kategori'}
                                        </span>
                                    </>
                                )}
                            </button>
                            {editingCategoryId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEditCategory}
                                    className="cursor-pointer rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* KOLOM KANAN: DAFTAR KATEGORI PRODUK */}
                <div className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:space-y-5 sm:p-6 lg:col-span-7 dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                Daftar Kategori Produk
                            </h4>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                Total {categories.length} kategori terdaftar di sistem POS
                            </p>
                        </div>

                        {/* Search Filter */}
                        <div className="relative w-full sm:w-56">
                            <Search className="pointer-events-none absolute top-2.5 left-3 h-3.5 w-3.5 text-stone-400" />
                            <input
                                type="text"
                                value={categorySearchQuery}
                                onChange={(e) => setCategorySearchQuery(e.target.value)}
                                placeholder="Cari kategori..."
                                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pr-3 pl-8 text-xs text-stone-900 placeholder:text-stone-400 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                            />
                        </div>
                    </div>

                    {filteredCategoriesList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 py-12 text-center dark:border-stone-800">
                            <Tag className="mb-2 h-8 w-8 text-stone-300 dark:text-stone-600" />
                            <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                                {categorySearchQuery
                                    ? 'Kategori tidak ditemukan'
                                    : 'Belum ada kategori'}
                            </p>
                            <p className="mt-1 text-[11px] text-stone-400">
                                {categorySearchQuery
                                    ? 'Coba gunakan kata kunci pencarian yang lain'
                                    : 'Gunakan formulir di sebelah kiri untuk menambah kategori baru'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {filteredCategoriesList.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
                                        editingCategoryId === cat.id
                                            ? 'border-amber-500/50 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-950/20'
                                            : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-800/40 dark:hover:bg-stone-800/70'
                                    }`}
                                >
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-stone-900 dark:text-white">
                                                {getCategoryLabel(cat.name)}
                                            </span>
                                            <span className="rounded bg-stone-200/80 px-1.5 py-0.5 font-mono text-[10px] text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                                                {cat.slug}
                                            </span>
                                            {cat.products_count !== undefined && (
                                                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-800 dark:bg-brand-950/80 dark:text-brand-300">
                                                    {cat.products_count} produk
                                                </span>
                                            )}
                                            {cat.sort_order !== undefined &&
                                                cat.sort_order > 0 && (
                                                    <span className="text-[10px] text-stone-400">
                                                        Urutan: #{cat.sort_order}
                                                    </span>
                                                )}
                                        </div>
                                        {cat.description && (
                                            <p className="line-clamp-1 text-[11px] text-stone-500 dark:text-stone-400">
                                                {cat.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handleStartEditCategory(cat)}
                                            className="cursor-pointer rounded-lg border border-stone-200 bg-white p-2 text-stone-600 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-amber-600 dark:hover:bg-amber-950/60 dark:hover:text-amber-300"
                                            title="Edit Kategori"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={deletingCategoryId === cat.id}
                                            onClick={() => handleDeleteCategory(cat)}
                                            className="cursor-pointer rounded-lg border border-stone-200 bg-white p-2 text-rose-600 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-rose-400 dark:hover:border-rose-800 dark:hover:bg-rose-950/60"
                                            title="Hapus Kategori"
                                        >
                                            {deletingCategoryId === cat.id ? (
                                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
