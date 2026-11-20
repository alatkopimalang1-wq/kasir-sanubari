import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Search,
    ShoppingCart,
    Truck,
    MapPin,
    Plus,
    Minus,
    Trash2,
    Printer,
    Smartphone,
    CreditCard,
    QrCode,
    Banknote,
    Building2,
    RotateCcw,
    RefreshCw,
    X,
    Check,
    ChevronRight,
    ArrowLeft,
    Clock,
    Percent,
    SlidersHorizontal,
    Tag,
    Share2,
    Receipt,
    CheckCircle2,
    Coffee,
    Store,
    User,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Save,
    Settings,
    FileText,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    AlertCircle,
    BarChart3,
    ChevronDown,
    Eye,
    Menu,
    Package,
    LogOut,
    Sparkles,
    Copy,
    ExternalLink,
    Download,
    Sun,
    Moon,
    Monitor,
    Wifi,
    WifiOff,
    Upload,
    Database,
    Cloud,
    CloudOff,
    FileSpreadsheet,
    HardDrive,
    Users,
    UserPlus,
    Shield,
    MoreVertical,
    PieChart,
    Calculator,
    PlusCircle,
    Pencil,
    LayoutGrid,
    Columns,
} from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import {
    ReceiptData,
    PaperWidth,
    SalesReportData,
    ProfitLossReportData,
    PreBillData,
    BluetoothPrinterDevice,
    UsbPrinterDevice,
    WindowsPrinterItem,
    formatRp,
    printThermalWeb,
    printThermalBluetooth,
    printThermalUsbDirect,
    printSalesReportThermalWeb,
    printProfitLossThermalWeb,
    generateWhatsAppReceiptUrl,
    generatePreBillWhatsAppText,
    generatePreBillWhatsAppUrl,
    printPreBillThermalWeb,
    printA4InvoiceWeb,
    isAndroidNativeBluetoothAvailable,
    isWebBluetoothAvailable,
    isElectronDesktop,
    isWebUsbAvailable,
    getSavedBluetoothPrinter,
    getSavedUsbPrinter,
    scanAndConnectUsbPrinter,
    reconnectSavedUsbPrinter,
    disconnectUsbPrinter,
    getAvailableWindowsPrinters,
    getAndroidBluetoothDevices,
    startAndroidBluetoothScan,
    stopAndroidBluetoothScan,
    connectAndroidBluetoothPrinter,
    disconnectBluetoothPrinter,
    openAndroidBluetoothSettings,
    scanAndConnectWebBluetoothPrinter,
    generateRawBtPrintUrl,
} from '@/lib/thermal-printer';
import { ThermalReceiptPreview } from '@/components/pos/thermal-receipt-preview';
import { CategorySettings, PosCategoryItem } from '@/components/pos/category-settings';
import { MenuSettings } from '@/components/pos/menu-settings';

interface ProductVariant {
    id: number;
    label: string;
    price: number;
    original_price?: number | null;
    cost_price?: number | null;
    weight_grams: number;
    sku?: string | null;
    stock_status?: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    series: string | null;
    series_label?: string | null;
    series_badge_color?: string | null;
    category_ids: number[];
    image: string;
    min_price: number;
    max_price: number;
    stock_status: string;
    is_out_of_stock: boolean;
    variants: ProductVariant[];
    origin?: string | null;
    process?: string | null;
    price_per_10g?: number | null;
    cost_price_per_10g?: number | null;
}

interface Category extends PosCategoryItem {}

interface PosRecentOrder {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone?: string;
    customer_address?: string;
    shipping_cost?: number;
    shipping_courier?: string;
    shipping_service?: string;
    total_amount: number;
    subtotal: number;
    payment_method: string;
    payment_method_label: string;
    payment_status?: string;
    payment_status_label?: string;
    status?: string;
    status_label?: string;
    refunded_at?: string;
    refund_reason?: string;
    refunded_by_name?: string;
    refund_amount?: number;
    created_at: string;
    items_count: number;
    items: Array<{
        product_name: string;
        variant_label: string;
        price: number;
        quantity: number;
        subtotal: number;
    }>;
    payment_details?: any;
}

interface PrinterSettings {
    paper_width: PaperWidth;
    store_name: string;
    tagline?: string;
    address?: string;
    phone?: string;
    instagram?: string;
    receipt_footer?: string;
    auto_print: boolean;
    printer_name?: string;
    printer_driver?: string;
    receipt_columns?: number;
    receipt_columns_58mm?: number;
    receipt_columns_80mm?: number;
    custom_paper_width_mm?: number;
    custom_printable_width_mm?: number;
    custom_receipt_columns?: number;
    max_item_name_length?: number;
    margin_horizontal?: string;
    margin_feed_lines?: number;
    copies?: number;
    show_logo?: boolean;
    formatting?: string;
    open_cash_drawer?: boolean;
    line_display?: string;
    is_cashier_printer?: boolean;
    font_family?: 'monospace' | 'courier' | 'sans-serif' | 'consolas' | 'roboto-mono';
    font_size?: 'compact' | 'normal' | 'large';
    font_weight?: 'normal' | 'bold';
    usb_printer_name?: string;
    usb_device_name?: string;
    usb_vendor_id?: number;
    usb_product_id?: number;
    usb_serial_number?: string;
    connection_type?: 'usb' | 'bluetooth' | 'system' | 'usb_direct';
}

interface PosLayoutSettings {
    grid_density?: 'compact' | 'normal' | 'comfortable';
    grid_columns?: 'auto' | 2 | 3 | 4 | 5 | 6;
}

interface PaymentSettings {
    enable_cash: boolean;
    enable_qris: boolean;
    enable_debit: boolean;
    enable_bank_transfer: boolean;
    qris_instructions?: string;
    bank_info?: string;
}

interface PosCashFlowItem {
    id: number;
    type: 'in' | 'out';
    category: string;
    category_label: string;
    amount: number;
    description: string;
    user_name: string;
    recorded_at: string;
    date: string;
}

const defaultPrinterSettings: PrinterSettings = {
    paper_width: '80mm',
    store_name: 'Kasir Sanubari',
    tagline: 'Menyentuh Hati, Merangkai Cerita',
    address: 'Jl. Candi Mendut No. 3, Lowokwaru, Kota Malang',
    phone: '0851-2193-0454',
    instagram: '@kasir.sanubari',
    receipt_footer:
        'Terima kasih atas kunjungan Anda!\nFreshly Roasted with Heart.',
    auto_print: false,
    printer_name: 'Kassen BTP-3100',
    printer_driver: 'Kassen BTP-3100',
    receipt_columns: 44,
    receipt_columns_58mm: 32,
    receipt_columns_80mm: 44,
    custom_paper_width_mm: 80,
    custom_printable_width_mm: 72,
    custom_receipt_columns: 44,
    max_item_name_length: 30,
    margin_horizontal: '1mm',
    margin_feed_lines: 2,
    copies: 1,
    show_logo: true,
    formatting: 'formatted',
    open_cash_drawer: true,
    line_display: 'none',
    is_cashier_printer: true,
    font_family: 'monospace',
    font_size: 'normal',
    font_weight: 'bold',
    connection_type: 'usb',
    usb_printer_name: 'Kassen BTP-3100',
};

const defaultLayoutSettings: PosLayoutSettings = {
    grid_density: 'normal',
    grid_columns: 'auto',
};

const defaultPaymentSettings: PaymentSettings = {
    enable_cash: true,
    enable_qris: true,
    enable_debit: true,
    enable_bank_transfer: true,
    qris_instructions: 'Tunjukkan kode QRIS Kasir Sanubari di meja kasir.',
    bank_info: 'BCA 123-456-7890 a/n Sanubari Roastery',
};

interface CashDrawerState {
    cash_sales: number;
    total_in: number;
    total_out: number;
    net_cash: number;
    period_title?: string;
}

const defaultCashDrawer: CashDrawerState = {
    cash_sales: 0,
    total_in: 0,
    total_out: 0,
    net_cash: 0,
};

interface PosHeldOrderItem {
    id: number;
    queue_number?: string;
    customer_name: string;
    customer_phone?: string;
    customer_address?: string;
    shipping_cost?: number;
    shipping_courier?: string;
    notes?: string;
    items: Array<{
        product_id: number;
        product_name: string;
        variant_id: number;
        variant_label: string;
        price: number;
        quantity: number;
        image?: string;
        discount_type?: 'percent' | 'fixed';
        discount_value?: number;
        discount_amount?: number;
    }>;
    items_count: number;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    held_at: string;
    cashier_name?: string;
}

export interface PosStaffMember {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
    created_at?: string;
}

interface PosProps {
    products?: Product[];
    categories?: Category[];
    recentOrders?: PosRecentOrder[];
    heldOrders?: PosHeldOrderItem[];
    queueOrders?: PosHeldOrderItem[];
    cashier?: {
        id: number;
        name: string;
        email: string;
        role?: string;
        is_owner?: boolean;
        is_admin?: boolean;
        is_staff_restricted?: boolean;
        can_view_profit_loss?: boolean;
    };
    staffList?: PosStaffMember[];
    settings?: {
        printer?: PrinterSettings;
        payments?: PaymentSettings;
        layout?: PosLayoutSettings;
    };
    todayCashDrawer?: {
        cash_sales: number;
        total_in: number;
        total_out: number;
        net_cash: number;
    };
    printerSettings?: PrinterSettings;
    paymentSettings?: PaymentSettings;
    layoutSettings?: PosLayoutSettings;
    byobSettings?: ByobSettings;
    cashDrawerToday?: {
        cash_sales: number;
        total_in: number;
        total_out: number;
        net_cash: number;
    };
}

export interface ByobBean {
    product_id?: number | null;
    name: string;
    origin?: string;
    process?: string;
    price_per_10g: number;
    cost_price_per_10g?: number | null;
    tasting_notes?: string;
    is_active?: boolean;
}

export interface ByobVariant {
    id?: number;
    label: string;
    weight_grams: number;
    price?: number;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    is_default?: boolean;
}

export interface ByobSettings {
    hero_title?: string;
    studio_title?: string;
    default_ratio?: number;
    byob_beans?: ByobBean[];
    byob_variants?: ByobVariant[];
}

interface CartItem {
    id: string; // unique item id: productId-variantId or manual-timestamp
    product_id: number;
    product_name: string;
    variant_id: number;
    variant_label: string;
    price: number;
    quantity: number;
    image: string;
    cost_price?: number;
    notes?: string;
    is_manual?: boolean;
    discount_type?: 'fixed' | 'percent';
    discount_value?: number;
    discount_amount?: number;
}

type PosActiveTab =
    | 'cashier'
    | 'transactions'
    | 'queue'
    | 'inventory'
    | 'cash_flow'
    | 'reports'
    | 'profit_loss'
    | 'settings';

/**
 * Return date string in YYYY-MM-DD according to local client timezone (e.g. Asia/Jakarta).
 * Avoids the UTC offset bug where toISOString() yields yesterday's date during early morning hours (00:00 - 06:59 WIB).
 */
function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Return month string in YYYY-MM according to local client timezone.
 */
function getLocalMonthString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// Storage keys to persist cart state across page reload
const POS_CART_STORAGE_KEY = 'sanubari_pos_cart';
const POS_DISCOUNT_TYPE_STORAGE_KEY = 'sanubari_pos_cart_discount_type';
const POS_DISCOUNT_VALUE_STORAGE_KEY = 'sanubari_pos_cart_discount_value';
const POS_CUSTOMER_NAME_STORAGE_KEY = 'sanubari_pos_customer_name';
const POS_CUSTOMER_PHONE_STORAGE_KEY = 'sanubari_pos_customer_phone';
const POS_IS_DELIVERY_STORAGE_KEY = 'sanubari_pos_is_delivery';
const POS_SHIPPING_COST_STORAGE_KEY = 'sanubari_pos_shipping_cost';
const POS_SHIPPING_COURIER_STORAGE_KEY = 'sanubari_pos_shipping_courier';
const POS_CUSTOMER_ADDRESS_STORAGE_KEY = 'sanubari_pos_customer_address';
const POS_OFFLINE_ORDERS_STORAGE_KEY = 'sanubari_pos_offline_orders';
const POS_MANUAL_OFFLINE_STORAGE_KEY = 'sanubari_pos_manual_offline';
const POS_CACHED_CATALOG_STORAGE_KEY = 'sanubari_pos_cached_catalog_v6';

export const normalizePosCategory = (c: any): Category => {
    let name = '';
    if (typeof c?.name === 'string') {
        name = c.name;
    } else if (c?.name && typeof c.name === 'object') {
        name = c.name.id || c.name.en || Object.values(c.name)[0] || '';
    } else {
        name = c?.slug || '';
    }

    let description = '';
    if (typeof c?.description === 'string') {
        description = c.description;
    } else if (c?.description && typeof c.description === 'object') {
        description = c.description.id || c.description.en || Object.values(c.description)[0] || '';
    }

    return {
        ...c,
        id: Number(c?.id) || 0,
        name: String(name),
        slug: String(c?.slug || ''),
        description: String(description),
        sort_order: Number(c?.sort_order) || 0,
        products_count: Number(c?.products_count) || 0,
    };
};

export const normalizePosProduct = (p: any): Product => {
    const variants = Array.isArray(p.variants)
        ? p.variants.map((v: any) => ({
              ...v,
              price: Number(v.price) || 0,
              cost_price:
                  v.cost_price !== null && v.cost_price !== undefined
                      ? Number(v.cost_price) || 0
                      : 0,
          }))
        : [];
    const minPrice =
        Number(p.min_price) > 0
            ? Number(p.min_price)
            : variants.length > 0
              ? Math.min(...variants.map((v: any) => Number(v.price) || 0))
              : Number(p.price) || 0;

    const maxPrice =
        Number(p.max_price) > 0
            ? Number(p.max_price)
            : variants.length > 0
              ? Math.max(...variants.map((v: any) => Number(v.price) || 0))
              : minPrice;

    const isCybr =
        p.slug === 'byob' ||
        p.series === 'cybr' ||
        p.series === 'custom-blend' ||
        (typeof p.name === 'string' && p.name.toLowerCase().includes('c.y.b.r'));

    let img = isCybr ? '/brand/cybr-custom-blend.jpg' : p.image;
    if (!img || img === '/images/products/packaging-standing-pouch.png') {
        img = '/brand/logo-circle.png';
    }

    let catName = null;
    if (typeof p.category_name === 'string') {
        catName = p.category_name;
    } else if (p.category_name && typeof p.category_name === 'object') {
        catName = p.category_name.id || p.category_name.en || Object.values(p.category_name)[0] || null;
    }

    let prodName = '';
    if (typeof p.name === 'string') {
        prodName = p.name;
    } else if (p.name && typeof p.name === 'object') {
        prodName = p.name.id || p.name.en || Object.values(p.name)[0] || '';
    } else {
        prodName = String(p.slug || '');
    }

    return {
        ...p,
        name: prodName,
        category_name: catName,
        min_price: minPrice,
        max_price: maxPrice,
        image: img,
        category_ids: Array.isArray(p.category_ids)
            ? p.category_ids
            : p.category_id
              ? [p.category_id]
              : [],
        variants,
    };
};

/**
 * Pre-cache product images into Service Worker / Browser Cache API
 * so that they load instantaneously without downloading again on app restart.
 */
export const precacheProductImages = async (productList: Product[]) => {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
        const cache = await caches.open('sanubari-pos-static-v6');
        for (const p of productList) {
            if (
                p.image &&
                !p.image.endsWith('/brand/logo-circle.png') &&
                (p.image.startsWith('/storage/') || p.image.startsWith('/'))
            ) {
                const match = await cache.match(p.image);
                if (!match) {
                    fetch(p.image)
                        .then((res) => {
                            if (res && res.status === 200) {
                                cache.put(p.image, res);
                            }
                        })
                        .catch(() => {});
                }
            }
        }
    } catch {
        // Silently continue if cache API is restricted
    }
};

export interface OfflineOrderItem {
    product_id: number;
    variant_id: number;
    product_name: string;
    variant_label: string;
    quantity: number;
    price: number;
    discount_type?: 'fixed' | 'percent';
    discount_value?: number;
    discount_amount?: number;
}

export interface OfflineOrder {
    offline_id: string;
    created_at: string;
    customer_name: string;
    customer_phone: string | null;
    customer_address?: string | null;
    shipping_cost?: number;
    shipping_courier?: string | null;
    items: OfflineOrderItem[];
    payment_method: 'cash' | 'qris' | 'debit' | 'bank_transfer';
    cash_tendered: number | null;
    cash_change?: number;
    discount_amount: number;
    cart_discount_type?: 'fixed' | 'percent';
    cart_discount_value?: number;
    subtotal: number;
    total_amount: number;
    notes?: string;
}

function PosContent({
    products: initialProducts = [],
    categories: initialCategories = [],
    recentOrders: initialRecentOrders = [],
    heldOrders: initialHeldOrders = [],
    queueOrders: initialQueueOrders = [],
    cashier = { id: 0, name: 'Kasir Sanubari', email: '', role: 'kasir' },
    staffList: initialStaffList = [],
    settings: initialSettings,
    todayCashDrawer,
    printerSettings: initialPrinterSettings,
    paymentSettings: initialPaymentSettings,
    layoutSettings: initialLayoutSettings,
    cashDrawerToday: initialCashDrawerToday,
    byobSettings: initialByobSettings,
}: PosProps) {
    const resolvedPrinter: PrinterSettings = {
        ...defaultPrinterSettings,
        ...(initialPrinterSettings || initialSettings?.printer),
    };
    const resolvedPayment =
        initialPaymentSettings ||
        initialSettings?.payments ||
        defaultPaymentSettings;
    const resolvedDrawer: CashDrawerState = (initialCashDrawerToday ||
        todayCashDrawer ||
        defaultCashDrawer) as CashDrawerState;

    // --- MODAL MENGATUR PRINTER & MARGIN STRUK ---
    const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);

    // --- OWNER & PERMISSION CHECKS (HANYA MUNCUL PADA AKUN OWNER / ADMIN) ---
    const isOwner = Boolean(cashier.is_owner || cashier.role === 'owner');
    const isAdmin = Boolean(
        cashier.is_admin || cashier.role === 'admin' || cashier.id === 1,
    );
    const isStaffRestricted = Boolean(
        cashier.is_staff_restricted ?? (!isOwner && !isAdmin && cashier.role === 'kasir'),
    );
    const canAccessProfitLoss = Boolean(
        cashier.can_view_profit_loss ?? (isOwner || isAdmin),
    );

    // --- STAFF MANAGEMENT STATE (OWNER & ADMIN ONLY) ---
    const [staff, setStaff] = useState<PosStaffMember[]>(
        initialStaffList || [],
    );
    const [staffName, setStaffName] = useState('');
    const [staffEmail, setStaffEmail] = useState('');
    const [staffPassword, setStaffPassword] = useState('');
    const [staffPasswordConfirm, setStaffPasswordConfirm] = useState('');
    const [staffRole, setStaffRole] = useState<'kasir' | 'admin' | 'owner'>(
        'kasir',
    );
    const [staffPhone, setStaffPhone] = useState('');
    const [isAddingStaff, setIsAddingStaff] = useState(false);
    const [staffFormError, setStaffFormError] = useState<string | null>(null);
    const [staffSearchQuery, setStaffSearchQuery] = useState('');
    const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null);

    // --- CATALOG (AUTO-CACHED FOR INSTANT OFFLINE & ONLINE LOAD) ---
    const [products, setProducts] = useState<Product[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                // Clear any legacy broken cache key
                localStorage.removeItem('sanubari_pos_cached_catalog_v1');
                localStorage.removeItem('sanubari_pos_cached_catalog_v2');
                localStorage.removeItem('sanubari_pos_cached_catalog_v3');
                localStorage.removeItem('sanubari_pos_cached_catalog_v4');
                localStorage.removeItem('sanubari_pos_cached_catalog_v5');

                // 1. FASTEST PATH: Read from persistent local cache for instant 0ms load
                const cached = localStorage.getItem(
                    POS_CACHED_CATALOG_STORAGE_KEY,
                );
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (
                        Array.isArray(parsed?.products) &&
                        parsed.products.length > 0
                    ) {
                        return parsed.products.map(normalizePosProduct);
                    }
                }

                // 2. Fallback: Server props on fresh installs
                if (Array.isArray(initialProducts) && initialProducts.length > 0) {
                    return initialProducts.map(normalizePosProduct);
                }
            } catch (e) {
                console.error('Failed reading cached catalog:', e);
            }
        }
        return Array.isArray(initialProducts) ? initialProducts.map(normalizePosProduct) : [];
    });

    const [categories, setCategories] = useState<Category[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(
                    POS_CACHED_CATALOG_STORAGE_KEY,
                );
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (
                        Array.isArray(parsed?.categories) &&
                        parsed.categories.length > 0
                    ) {
                        return parsed.categories.map(normalizePosCategory);
                    }
                }

                if (Array.isArray(initialCategories) && initialCategories.length > 0) {
                    return initialCategories.map(normalizePosCategory);
                }
            } catch (e) {
                console.error('Failed reading cached categories:', e);
            }
        }
        return Array.isArray(initialCategories) ? initialCategories.map(normalizePosCategory) : [];
    });

    // Background sync from server props: only update if data actually changed
    useEffect(() => {
        if (Array.isArray(initialProducts) && initialProducts.length > 0) {
            const normalized = initialProducts.map(normalizePosProduct);
            setProducts((prev) => {
                if (
                    prev.length === normalized.length &&
                    prev[0]?.id === normalized[0]?.id &&
                    prev[0]?.min_price === normalized[0]?.min_price &&
                    prev[prev.length - 1]?.id === normalized[normalized.length - 1]?.id
                ) {
                    return prev;
                }
                return normalized;
            });
            precacheProductImages(normalized);
        }
    }, [initialProducts]);

    useEffect(() => {
        if (Array.isArray(initialCategories) && initialCategories.length > 0) {
            setCategories((prev) => {
                if (
                    prev.length === initialCategories.length &&
                    prev[0]?.id === initialCategories[0]?.id
                ) {
                    return prev;
                }
                return initialCategories;
            });
        }
    }, [initialCategories]);

    // Pre-cache images on initial mount from cached products
    useEffect(() => {
        if (products.length > 0) {
            precacheProductImages(products);
        }
    }, []);

    // Auto-cache catalog when updated or loaded
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (products.length > 0 || categories.length > 0) {
            try {
                localStorage.setItem(
                    POS_CACHED_CATALOG_STORAGE_KEY,
                    JSON.stringify({
                        products,
                        categories,
                        updated_at: new Date().toISOString(),
                    }),
                );
            } catch (e) {
                console.error('Failed to cache catalog:', e);
            }
        }
    }, [products, categories]);

    // Silent background revalidation from /pos/catalog (Stale-While-Revalidate)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        let isMounted = true;
        const revalidateCatalog = async () => {
            try {
                const res = await fetch('/pos/catalog', {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (
                        isMounted &&
                        Array.isArray(data.products) &&
                        data.products.length > 0
                    ) {
                        const normalized = data.products.map(normalizePosProduct);
                        setProducts((prev) => {
                            if (
                                prev.length === normalized.length &&
                                prev[0]?.id === normalized[0]?.id &&
                                prev[0]?.min_price === normalized[0]?.min_price &&
                                prev[prev.length - 1]?.id ===
                                    normalized[normalized.length - 1]?.id
                            ) {
                                return prev;
                            }
                            return normalized;
                        });
                        if (
                            Array.isArray(data.categories) &&
                            data.categories.length > 0
                        ) {
                            setCategories(data.categories);
                        }
                        precacheProductImages(normalized);
                    }
                }
            } catch {
                // Offline or background network issue, keep cached data
            }
        };

        const timer = setTimeout(revalidateCatalog, 3000);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, []);

    // --- MODE OFFLINE & AUTO-SYNC STATE ---
    const [isOnline, setIsOnline] = useState<boolean>(() => {
        if (typeof navigator !== 'undefined') {
            return navigator.onLine;
        }
        return true;
    });
    const [manualOffline, setManualOffline] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        try {
            return (
                localStorage.getItem(POS_MANUAL_OFFLINE_STORAGE_KEY) === 'true'
            );
        } catch {
            return false;
        }
    });
    const [offlineOrders, setOfflineOrders] = useState<OfflineOrder[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(POS_OFFLINE_ORDERS_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Gagal membaca transaksi offline:', e);
        }
        return [];
    });
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatusMessage, setSyncStatusMessage] = useState<string>('');
    const [isDownloadingCatalog, setIsDownloadingCatalog] = useState(false);
    const [lastCatalogSync, setLastCatalogSync] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            const cached = localStorage.getItem(POS_CACHED_CATALOG_STORAGE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                return parsed.updated_at || '';
            }
        } catch {}
        return '';
    });

    const isEffectiveOffline = !isOnline || manualOffline;

    // Listen to network changes
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            showToast('Koneksi internet terhubung kembali (Online)');
        };
        const handleOffline = () => {
            setIsOnline(false);
            showToast('Koneksi terputus. Mode Offline aktif.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Save offline orders to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (offlineOrders.length > 0) {
                localStorage.setItem(
                    POS_OFFLINE_ORDERS_STORAGE_KEY,
                    JSON.stringify(offlineOrders),
                );
            } else {
                localStorage.removeItem(POS_OFFLINE_ORDERS_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan offlineOrders ke storage:', e);
        }
    }, [offlineOrders]);

    // Save manualOffline setting to localStorage
    const toggleManualOffline = (val: boolean) => {
        setManualOffline(val);
        try {
            localStorage.setItem(
                POS_MANUAL_OFFLINE_STORAGE_KEY,
                val ? 'true' : 'false',
            );
        } catch {}
        if (val) {
            showToast('Mode Offline diaktifkan secara manual.');
        } else {
            showToast('Kembali ke Mode Online.');
        }
    };

    // --- THEME & APPEARANCE (MODE GELAP / TERANG) ---
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();
    const isDark = resolvedAppearance === 'dark';

    // --- TOP TABS & NAVIGATION ---
    const [activeTab, setActiveTab] = useState<PosActiveTab>('cashier');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isReloadingApp, setIsReloadingApp] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    // Close 3-dots more menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (
                moreMenuRef.current &&
                !moreMenuRef.current.contains(event.target as Node)
            ) {
                setIsMoreMenuOpen(false);
            }
        };

        if (isMoreMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMoreMenuOpen]);

    // --- POS BILLING & CART STATE (PERSISTED IN LOCALSTORAGE) ---
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(POS_CART_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error(
                'Gagal membaca keranjang kasir dari localStorage:',
                e,
            );
        }
        return [];
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<
        number | 'all'
    >('all');
    const [variantPickerProduct, setVariantPickerProduct] =
        useState<Product | null>(null);

    // --- C.Y.B.R / STUDIO RACIK MODAL STATE (Custom Blend Kasir) ---
    const [isCybrModalOpen, setIsCybrModalOpen] = useState(false);
    const [cybrProduct, setCybrProduct] = useState<Product | null>(null);
    const [cybrBeanA, setCybrBeanA] = useState<ByobBean | null>(null);
    const [cybrBeanB, setCybrBeanB] = useState<ByobBean | null>(null);
    const [cybrRatioA, setCybrRatioA] = useState<number>(70);
    const [cybrSelectedVariant, setCybrSelectedVariant] = useState<ProductVariant | null>(null);
    const [cybrCustomName, setCybrCustomName] = useState<string>('');

    // Active beans available for C.Y.B.R blending in POS
    const availableCybrBeans: ByobBean[] = useMemo(() => {
        if (
            initialByobSettings?.byob_beans &&
            Array.isArray(initialByobSettings.byob_beans) &&
            initialByobSettings.byob_beans.length > 0
        ) {
            return initialByobSettings.byob_beans.filter((b) => b.is_active !== false);
        }

        // Fallback to active catalog coffee products if byobSettings is not yet loaded
        return (products || [])
            .filter((p) => p.slug !== 'byob')
            .map((p) => ({
                product_id: p.id,
                name: p.name,
                origin: p.origin || 'Kawi, Malang',
                process: p.process || 'Artisan Roast',
                price_per_10g: p.price_per_10g || 3500,
                cost_price_per_10g: p.cost_price_per_10g || null,
                is_active: true,
            }));
    }, [initialByobSettings, products]);

    // Available packaging variants for C.Y.B.R in POS
    const availableCybrVariants = useMemo(() => {
        if (cybrProduct?.variants && cybrProduct.variants.length > 0) {
            return cybrProduct.variants;
        }
        return [
            { id: 181, label: '200g', weight_grams: 200, price: 65000 },
            { id: 182, label: '500g', weight_grams: 500, price: 150000 },
            { id: 183, label: '1 kg', weight_grams: 1000, price: 275000 },
        ];
    }, [cybrProduct]);

    // Real-time calculation of dynamic price, HPP modal, and margin % for C.Y.B.R custom blend
    const { cybrCalculatedPrice, cybrCalculatedCostPrice, cybrMarginPct } = useMemo(() => {
        if (!cybrBeanA || !cybrBeanB || !cybrSelectedVariant) {
            return { cybrCalculatedPrice: 0, cybrCalculatedCostPrice: 0, cybrMarginPct: '0' };
        }

        const totalGrams = cybrSelectedVariant.weight_grams || 200;
        const gramA = (cybrRatioA / 100) * totalGrams;
        const gramB = ((100 - cybrRatioA) / 100) * totalGrams;

        const rateA = Number(cybrBeanA.price_per_10g || 3500) / 10;
        const rateB = Number(cybrBeanB.price_per_10g || 3500) / 10;
        const basePrice = (gramA * rateA) + (gramB * rateB);

        // Package discount from initialByobSettings if configured
        const variantSetting = initialByobSettings?.byob_variants?.find(
            (v) => Number(v.weight_grams) === Number(totalGrams)
        );
        let discount = 0;
        if (variantSetting?.discount_value && Number(variantSetting.discount_value) > 0) {
            if (variantSetting.discount_type === 'percentage') {
                discount = (basePrice * Number(variantSetting.discount_value)) / 100;
            } else {
                discount = Number(variantSetting.discount_value);
            }
        }
        const finalPrice = Math.max(0, Math.round(basePrice - discount));

        const costRateA = Number(cybrBeanA.cost_price_per_10g || 0) / 10;
        const costRateB = Number(cybrBeanB.cost_price_per_10g || 0) / 10;
        const finalCost = Math.round((gramA * costRateA) + (gramB * costRateB));

        const profit = finalPrice - finalCost;
        const margin = finalPrice > 0 ? ((profit / finalPrice) * 100).toFixed(1) : '0';

        return {
            cybrCalculatedPrice: finalPrice,
            cybrCalculatedCostPrice: finalCost,
            cybrMarginPct: margin,
        };
    }, [cybrBeanA, cybrBeanB, cybrRatioA, cybrSelectedVariant, initialByobSettings]);

    const isSameCybrBean = Boolean(
        cybrBeanA && cybrBeanB && cybrBeanA.name.toLowerCase() === cybrBeanB.name.toLowerCase()
    );

    const openCybrStudioModal = (product: Product) => {
        setCybrProduct(product);
        const vars = Array.isArray(product.variants) && product.variants.length > 0
            ? product.variants
            : [
                { id: 181, label: '200g', weight_grams: 200, price: 65000 },
                { id: 182, label: '500g', weight_grams: 500, price: 150000 },
                { id: 183, label: '1 kg', weight_grams: 1000, price: 275000 },
            ];
        setCybrSelectedVariant(vars[0]);
        setCybrCustomName('');
        setCybrRatioA(initialByobSettings?.default_ratio || 70);

        if (availableCybrBeans.length >= 2) {
            setCybrBeanA(availableCybrBeans[0]);
            setCybrBeanB(availableCybrBeans[1]);
        } else if (availableCybrBeans.length === 1) {
            setCybrBeanA(availableCybrBeans[0]);
            setCybrBeanB(availableCybrBeans[0]);
        }
        setIsCybrModalOpen(true);
    };

    const handleAddCybrToCart = () => {
        if (!cybrProduct || !cybrBeanA || !cybrBeanB || !cybrSelectedVariant) return;
        if (isSameCybrBean) {
            showToast('Komponen A dan B harus berbeda varietas biji kopi');
            return;
        }

        const ratioB = 100 - cybrRatioA;
        const recipeString = `${cybrRatioA}% ${cybrBeanA.name} + ${ratioB}% ${cybrBeanB.name}`;
        const itemLabel = `${cybrSelectedVariant.label} (${recipeString})`;
        const itemName = cybrCustomName.trim()
            ? `C.Y.B.R: "${cybrCustomName.trim()}"`
            : `C.Y.B.R Custom Blend`;
        const cartItemId = `cybr-${Date.now()}`;

        setCart((prev) => [
            ...prev,
            {
                id: cartItemId,
                product_id: cybrProduct.id,
                product_name: itemName,
                variant_id: cybrSelectedVariant.id,
                variant_label: itemLabel,
                price: cybrCalculatedPrice,
                cost_price: cybrCalculatedCostPrice > 0 ? cybrCalculatedCostPrice : undefined,
                quantity: 1,
                image: cybrProduct.image || '/brand/logo-circle.png',
                notes: `Rasio: ${recipeString}`,
            },
        ]);

        showToast(`${itemName} (${cybrSelectedVariant.label}) ditambahkan ke keranjang`);
        setIsCybrModalOpen(false);
    };

    // --- CHECKOUT & PAYMENT MODAL STATE ---
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<
        'cash' | 'qris' | 'debit' | 'bank_transfer'
    >(() => {
        if (resolvedPayment.enable_cash) return 'cash';
        if (resolvedPayment.enable_qris) return 'qris';
        if (resolvedPayment.enable_debit) return 'debit';
        return 'cash';
    });
    const [cashTendered, setCashTendered] = useState<number | ''>('');
    const [customerName, setCustomerName] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(POS_CUSTOMER_NAME_STORAGE_KEY) || '';
        } catch {
            return '';
        }
    });
    const [customerPhone, setCustomerPhone] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(POS_CUSTOMER_PHONE_STORAGE_KEY) || '';
        } catch {
            return '';
        }
    });
    const [isDeliveryOrder, setIsDeliveryOrder] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem(POS_IS_DELIVERY_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });
    const [shippingCost, setShippingCost] = useState<number | ''>(() => {
        if (typeof window === 'undefined') return '';
        try {
            const val = localStorage.getItem(POS_SHIPPING_COST_STORAGE_KEY);
            return val ? parseFloat(val) || '' : '';
        } catch {
            return '';
        }
    });
    const [shippingCourier, setShippingCourier] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(POS_SHIPPING_COURIER_STORAGE_KEY) || '';
        } catch {
            return '';
        }
    });
    const [customerAddress, setCustomerAddress] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        try {
            return localStorage.getItem(POS_CUSTOMER_ADDRESS_STORAGE_KEY) || '';
        } catch {
            return '';
        }
    });

    // --- DISCOUNT MANAGEMENT (NOMINAL / PERSENTASE & DISKON PER-ITEM) ---
    const [cartDiscountType, setCartDiscountType] = useState<
        'fixed' | 'percent'
    >(() => {
        if (typeof window === 'undefined') return 'fixed';
        try {
            const saved = localStorage.getItem(POS_DISCOUNT_TYPE_STORAGE_KEY);
            return saved === 'percent' || saved === 'fixed' ? saved : 'fixed';
        } catch {
            return 'fixed';
        }
    });
    const [cartDiscountValue, setCartDiscountValue] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        try {
            const saved = localStorage.getItem(POS_DISCOUNT_VALUE_STORAGE_KEY);
            return saved ? parseFloat(saved) || 0 : 0;
        } catch {
            return 0;
        }
    });
    const [isCartDiscountModalOpen, setIsCartDiscountModalOpen] =
        useState(false);
    const [tempDiscountType, setTempDiscountType] = useState<
        'fixed' | 'percent'
    >('fixed');
    const [tempDiscountValue, setTempDiscountValue] = useState<string>('');

    // Item-level Discount Modal State
    const [editingDiscountItem, setEditingDiscountItem] =
        useState<CartItem | null>(null);
    const [itemDiscountType, setItemDiscountType] = useState<
        'fixed' | 'percent'
    >('percent');
    const [itemDiscountValue, setItemDiscountValue] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- RECEIPT & PRINTING MODAL STATE ---
    const [completedReceipt, setCompletedReceipt] =
        useState<ReceiptData | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [recentOrders, setRecentOrders] = useState<PosRecentOrder[]>(
        initialRecentOrders || [],
    );

    // --- TRANSACTIONS HISTORY FILTER STATE ---
    const [historyFilter, setHistoryFilter] = useState<
        'today' | 'yesterday' | 'custom'
    >('today');
    const [historyStartDate, setHistoryStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return getLocalDateString(d);
    });
    const [historyEndDate, setHistoryEndDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [historySearch, setHistorySearch] = useState('');
    const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'paid' | 'refunded'>('all');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // --- REFUND MODAL STATE ---
    const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<PosRecentOrder | null>(null);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [refundAmount, setRefundAmount] = useState<number | ''>('');
    const [isProcessingRefund, setIsProcessingRefund] = useState(false);

    // --- SETTINGS STATE (Printer, Payments, Appearance, Staff, Categories & Menu Cafe) ---
    const [settingsSubTab, setSettingsSubTab] = useState<
        'printer' | 'payment' | 'appearance' | 'staff' | 'categories' | 'menu'
    >('printer');
    const [printerForm, setPrinterForm] =
        useState<PrinterSettings>(resolvedPrinter);
    const [paymentForm, setPaymentForm] =
        useState<PaymentSettings>(resolvedPayment);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    // --- GRID DENSITY & COLUMNS STATE ---
    const [gridDensity, setGridDensity] = useState<'compact' | 'normal' | 'comfortable'>(() => {
        try {
            const saved = localStorage.getItem('sanubari_pos_grid_density');
            if (saved === 'compact' || saved === 'normal' || saved === 'comfortable') return saved;
        } catch {}
        return (initialSettings?.layout?.grid_density) || (initialLayoutSettings?.grid_density) || 'normal';
    });

    const [gridColumns, setGridColumns] = useState<'auto' | 2 | 3 | 4 | 5 | 6>(() => {
        try {
            const saved = localStorage.getItem('sanubari_pos_grid_columns');
            if (saved && (saved === 'auto' || ['2', '3', '4', '5', '6'].includes(saved))) {
                return saved === 'auto' ? 'auto' : (Number(saved) as 2 | 3 | 4 | 5 | 6);
            }
        } catch {}
        return (initialSettings?.layout?.grid_columns) || (initialLayoutSettings?.grid_columns) || 'auto';
    });

    const [isLayoutPopoverOpen, setIsLayoutPopoverOpen] = useState(false);

    const updateGridDensity = (density: 'compact' | 'normal' | 'comfortable') => {
        setGridDensity(density);
        try {
            localStorage.setItem('sanubari_pos_grid_density', density);
        } catch {}
    };

    const updateGridColumns = (cols: 'auto' | 2 | 3 | 4 | 5 | 6) => {
        setGridColumns(cols);
        try {
            localStorage.setItem('sanubari_pos_grid_columns', String(cols));
        } catch {}
    };

    const handleSaveLayoutSettings = async () => {
        setIsSavingSettings(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    type: 'layout',
                    settings: {
                        grid_density: gridDensity,
                        grid_columns: gridColumns,
                    },
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data.message || 'Gagal menyimpan preferensi tampilan',
                );
            showToast('✓ Pengaturan kepadatan & kolom katalog berhasil disimpan!');
        } catch (err: any) {
            alert('Gagal: ' + (err.message || 'Terjadi kesalahan sistem'));
        } finally {
            setIsSavingSettings(false);
        }
    };

    const getCatalogGridClasses = (
        density: 'compact' | 'normal' | 'comfortable',
        columns: 'auto' | 2 | 3 | 4 | 5 | 6,
    ) => {
        const gap =
            density === 'compact'
                ? 'gap-1.5 sm:gap-2'
                : density === 'comfortable'
                ? 'gap-3 sm:gap-4'
                : 'gap-2 sm:gap-2.5';

        if (columns === 2) return `grid touch-pan-y grid-cols-2 ${gap}`;
        if (columns === 3) return `grid touch-pan-y grid-cols-2 sm:grid-cols-3 ${gap}`;
        if (columns === 4) return `grid touch-pan-y grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${gap}`;
        if (columns === 5) return `grid touch-pan-y grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${gap}`;
        if (columns === 6) return `grid touch-pan-y grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 ${gap}`;

        // Auto responsive mode:
        if (density === 'compact') {
            return `grid touch-pan-y grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 ${gap}`;
        }
        if (density === 'comfortable') {
            return `grid touch-pan-y grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ${gap}`;
        }
        return `grid touch-pan-y grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${gap}`;
    };

    // --- CASH FLOW STATE (Kas Masuk-Keluar) ---
    const [cashFlowPeriod, setCashFlowPeriod] = useState<
        'daily' | 'this_month' | 'custom_month'
    >('daily');
    const [cashFlowDate, setCashFlowDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [cashFlowMonth, setCashFlowMonth] = useState<string>(() =>
        getLocalMonthString(),
    );
    const [flowTransactionDate, setFlowTransactionDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [cashFlowsList, setCashFlowsList] = useState<PosCashFlowItem[]>([]);
    const [cashDrawer, setCashDrawer] = useState(resolvedDrawer);
    const [isLoadingCashFlow, setIsLoadingCashFlow] = useState(false);
    const [isSavingCashFlow, setIsSavingCashFlow] = useState(false);
    const [flowType, setFlowType] = useState<'in' | 'out'>('out');
    const [flowCategory, setFlowCategory] = useState<string>('operasional');
    const [flowAmount, setFlowAmount] = useState<number | ''>('');
    const [flowDescription, setFlowDescription] = useState<string>('');

    // --- REPORTS STATE ---
    const [reportStaffId, setReportStaffId] = useState<string>(
        isStaffRestricted ? String(cashier.id) : 'all',
    );
    const [reportPeriod, setReportPeriod] = useState<
        'daily' | 'monthly' | 'custom'
    >('daily');
    const [reportDate, setReportDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [reportMonth, setReportMonth] = useState<string>(() =>
        getLocalMonthString(),
    );
    const [reportStartDate, setReportStartDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [reportEndDate, setReportEndDate] = useState<string>(() =>
        getLocalDateString(),
    );
    const [reportData, setReportData] = useState<any>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    // --- PROFIT & LOSS REPORT STATE (LABA RUGI) ---
    const [plPeriod, setPlPeriod] = useState<
        'today' | 'yesterday' | 'this_month' | 'last_month' | 'custom_month'
    >('today');
    const [plDate, setPlDate] = useState<string>(() => getLocalDateString());
    const [plMonth, setPlMonth] = useState<string>(() => getLocalMonthString());
    const [profitLossData, setProfitLossData] = useState<any>(null);
    const [isLoadingProfitLoss, setIsLoadingProfitLoss] = useState(false);
    const [expandedPlOrderId, setExpandedPlOrderId] = useState<number | null>(
        null,
    );
    const [selectedPlExpenseCategory, setSelectedPlExpenseCategory] =
        useState<string>('all');
    const [isExportingPlExcel, setIsExportingPlExcel] = useState(false);

    // --- INVENTORY VIEW STATE ---
    const [inventorySearch, setInventorySearch] = useState('');
    const [inventoryFilter, setInventoryFilter] = useState<
        'all' | 'in_stock' | 'out_of_stock'
    >('all');

    // --- MOBILE DRAWER CART STATE ---
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    // --- QUEUE / HOLD ORDERS STATE ---
    const [heldOrdersList, setHeldOrdersList] = useState<PosHeldOrderItem[]>(
        initialHeldOrders || initialQueueOrders || [],
    );
    const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
    const [holdCustomerName, setHoldCustomerName] = useState('');
    const [holdCustomerPhone, setHoldCustomerPhone] = useState('');
    const [holdNotes, setHoldNotes] = useState('');
    const [isHoldingSubmit, setIsHoldingSubmit] = useState(false);

    // --- SHARE PRE-BILL RECEIPT (SEBELUM BAYAR) STATE ---
    const [isSharePreBillModalOpen, setIsSharePreBillModalOpen] =
        useState(false);
    const [sharePreBillCustomerName, setSharePreBillCustomerName] =
        useState('');
    const [sharePreBillCustomerPhone, setSharePreBillCustomerPhone] =
        useState('');
    const [sharePreBillIncludeBank, setSharePreBillIncludeBank] =
        useState(true);
    const [sharePreBillNotes, setSharePreBillNotes] = useState('');
    const [isPreBillCopied, setIsPreBillCopied] = useState(false);

    // --- MANUAL / CUSTOM ORDER STATE ---
    const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
    const [manualProductName, setManualProductName] = useState('');
    const [manualCostPrice, setManualCostPrice] = useState<string | number>('');
    const [manualPrice, setManualPrice] = useState<string | number>('');
    const [manualQuantity, setManualQuantity] = useState(1);
    const [manualVariantLabel, setManualVariantLabel] = useState('Manual');
    const [manualNotes, setManualNotes] = useState('');
    const [editingManualCartItemId, setEditingManualCartItemId] = useState<
        string | null
    >(null);

    // Search Input Auto-focus ref
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Categories allowed on POS (Semua Kopi, Filter Beans, Arabica Espresso, Houseblend, Fine Robusta)
    const posCategories = useMemo(() => {
        const allowedSlugs = [
            'filter-beans',
            'arabica',
            'houseblend',
            'robusta',
        ];
        const allowedNames = [
            'filter beans',
            'arabica espresso',
            'houseblend',
            'fine robusta',
        ];
        const filtered = categories.filter(
            (c) =>
                allowedSlugs.includes((c.slug || '').toLowerCase()) ||
                allowedNames.some((n) =>
                    (c.name || '').toLowerCase().includes(n),
                ),
        );
        return filtered.length > 0 ? filtered : categories;
    }, [categories]);

    // Filtered Products for Cashier View
    const filteredProducts = useMemo(() => {
        let list = Array.isArray(products) ? products : [];
        if (selectedCategoryId !== 'all') {
            list = list.filter((p) =>
                Array.isArray(p.category_ids)
                    ? p.category_ids.includes(selectedCategoryId)
                    : ((p as any)?.category_id === selectedCategoryId),
            );
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (p) =>
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (p.series && p.series.toLowerCase().includes(q)) ||
                    (Array.isArray(p.variants) &&
                        p.variants.some(
                            (v) =>
                                (v.label && v.label.toLowerCase().includes(q)) ||
                                (v.sku && v.sku.toLowerCase().includes(q)),
                        )),
            );
        }
        return list;
    }, [products, selectedCategoryId, searchQuery]);

    // Filtered Inventory
    const filteredInventory = useMemo(() => {
        let list = Array.isArray(products) ? products : [];
        if (inventoryFilter === 'in_stock') {
            list = list.filter((p) => !p.is_out_of_stock);
        } else if (inventoryFilter === 'out_of_stock') {
            list = list.filter((p) => p.is_out_of_stock);
        }
        if (inventorySearch.trim()) {
            const q = inventorySearch.toLowerCase();
            list = list.filter(
                (p) =>
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (Array.isArray(p.variants) &&
                        p.variants.some(
                            (v) =>
                                (v.label && v.label.toLowerCase().includes(q)) ||
                                (v.sku && v.sku.toLowerCase().includes(q)),
                        )),
            );
        }
        return list;
    }, [products, inventoryFilter, inventorySearch]);

    // Calculations (Diskon Per-Item & Diskon Transaksi)
    const grossSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const totalItemDiscounts = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
    }, [cart]);

    const netAfterItemDiscounts = useMemo(() => {
        return Math.max(0, grossSubtotal - totalItemDiscounts);
    }, [grossSubtotal, totalItemDiscounts]);

    const cartDiscountAmount = useMemo(() => {
        if (cartDiscountValue <= 0) return 0;
        if (cartDiscountType === 'percent') {
            const pct = Math.min(100, Math.max(0, cartDiscountValue));
            return Math.round((netAfterItemDiscounts * pct) / 100);
        }
        return Math.min(netAfterItemDiscounts, Math.max(0, cartDiscountValue));
    }, [netAfterItemDiscounts, cartDiscountType, cartDiscountValue]);

    const discountAmount = useMemo(() => {
        return totalItemDiscounts + cartDiscountAmount;
    }, [totalItemDiscounts, cartDiscountAmount]);

    const subtotal = grossSubtotal;

    const numericShippingCost = useMemo(() => {
        if (!isDeliveryOrder) return 0;
        const val =
            typeof shippingCost === 'number'
                ? shippingCost
                : parseFloat(String(shippingCost)) || 0;
        return Math.max(0, val);
    }, [isDeliveryOrder, shippingCost]);

    const totalAmount = useMemo(() => {
        return (
            Math.max(0, grossSubtotal - discountAmount) + numericShippingCost
        );
    }, [grossSubtotal, discountAmount, numericShippingCost]);

    const totalItemsCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const cashChange = useMemo(() => {
        if (paymentMethod !== 'cash') return 0;
        const tendered = typeof cashTendered === 'number' ? cashTendered : 0;
        return Math.max(0, tendered - totalAmount);
    }, [paymentMethod, cashTendered, totalAmount]);

    // Quick cash suggestion buttons
    const quickCashOptions = useMemo(() => {
        if (totalAmount <= 0) return [];
        const base = totalAmount;
        const opts = new Set<number>();
        opts.add(base); // Uang pas

        // Round up to nearest 10k, 20k, 50k, 100k
        const roundTo = (num: number, to: number) => Math.ceil(num / to) * to;
        if (base < 50000) opts.add(50000);
        if (base < 100000) opts.add(100000);
        if (base < 200000) opts.add(200000);
        opts.add(roundTo(base, 10000));
        opts.add(roundTo(base, 50000));

        return Array.from(opts)
            .filter((v) => v >= base)
            .sort((a, b) => a - b)
            .slice(0, 4);
    }, [totalAmount]);

    // --- PERSIST ACTIVE CART & TRANSACTION INFO TO LOCALSTORAGE (PREVENT RELOAD RESET) ---
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (cart.length > 0) {
                localStorage.setItem(
                    POS_CART_STORAGE_KEY,
                    JSON.stringify(cart),
                );
            } else {
                localStorage.removeItem(POS_CART_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan keranjang ke localStorage:', e);
        }
    }, [cart]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (cartDiscountValue > 0) {
                localStorage.setItem(
                    POS_DISCOUNT_TYPE_STORAGE_KEY,
                    cartDiscountType,
                );
                localStorage.setItem(
                    POS_DISCOUNT_VALUE_STORAGE_KEY,
                    String(cartDiscountValue),
                );
            } else {
                localStorage.removeItem(POS_DISCOUNT_TYPE_STORAGE_KEY);
                localStorage.removeItem(POS_DISCOUNT_VALUE_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan diskon ke localStorage:', e);
        }
    }, [cartDiscountType, cartDiscountValue]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (customerName) {
                localStorage.setItem(
                    POS_CUSTOMER_NAME_STORAGE_KEY,
                    customerName,
                );
            } else {
                localStorage.removeItem(POS_CUSTOMER_NAME_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan customerName ke localStorage:', e);
        }
    }, [customerName]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (customerPhone) {
                localStorage.setItem(
                    POS_CUSTOMER_PHONE_STORAGE_KEY,
                    customerPhone,
                );
            } else {
                localStorage.removeItem(POS_CUSTOMER_PHONE_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan customerPhone ke localStorage:', e);
        }
    }, [customerPhone]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (isDeliveryOrder) {
                localStorage.setItem(POS_IS_DELIVERY_STORAGE_KEY, 'true');
            } else {
                localStorage.removeItem(POS_IS_DELIVERY_STORAGE_KEY);
            }
            if (shippingCost !== '') {
                localStorage.setItem(
                    POS_SHIPPING_COST_STORAGE_KEY,
                    String(shippingCost),
                );
            } else {
                localStorage.removeItem(POS_SHIPPING_COST_STORAGE_KEY);
            }
            if (shippingCourier) {
                localStorage.setItem(
                    POS_SHIPPING_COURIER_STORAGE_KEY,
                    shippingCourier,
                );
            } else {
                localStorage.removeItem(POS_SHIPPING_COURIER_STORAGE_KEY);
            }
            if (customerAddress) {
                localStorage.setItem(
                    POS_CUSTOMER_ADDRESS_STORAGE_KEY,
                    customerAddress,
                );
            } else {
                localStorage.removeItem(POS_CUSTOMER_ADDRESS_STORAGE_KEY);
            }
        } catch (e) {
            console.error('Gagal menyimpan shipping ke localStorage:', e);
        }
    }, [isDeliveryOrder, shippingCost, shippingCourier, customerAddress]);

    const clearCartStorage = () => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(POS_CART_STORAGE_KEY);
            localStorage.removeItem(POS_DISCOUNT_TYPE_STORAGE_KEY);
            localStorage.removeItem(POS_DISCOUNT_VALUE_STORAGE_KEY);
            localStorage.removeItem(POS_CUSTOMER_NAME_STORAGE_KEY);
            localStorage.removeItem(POS_CUSTOMER_PHONE_STORAGE_KEY);
            localStorage.removeItem(POS_IS_DELIVERY_STORAGE_KEY);
            localStorage.removeItem(POS_SHIPPING_COST_STORAGE_KEY);
            localStorage.removeItem(POS_SHIPPING_COURIER_STORAGE_KEY);
            localStorage.removeItem(POS_CUSTOMER_ADDRESS_STORAGE_KEY);
        } catch (e) {
            console.error('Gagal membersihkan keranjang localStorage:', e);
        }
    };

    // Keyboard Shortcuts (F2: Search, F4: Bayar, ESC: Cancel/Close)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                setActiveTab('cashier');
                searchInputRef.current?.focus();
            } else if (e.key === 'F3') {
                e.preventDefault();
                setActiveTab('cashier');
                openManualOrderModal();
            } else if (e.key === 'F4') {
                if (cart.length > 0 && !isCheckoutModalOpen) {
                    e.preventDefault();
                    openCheckout();
                }
            } else if (e.key === 'F6') {
                if (
                    cart.length > 0 &&
                    !isSharePreBillModalOpen &&
                    !isCheckoutModalOpen
                ) {
                    e.preventDefault();
                    openSharePreBillModal();
                }
            } else if (e.key === 'F7') {
                if (
                    cart.length > 0 &&
                    !isHoldModalOpen &&
                    !isCheckoutModalOpen
                ) {
                    e.preventDefault();
                    openHoldModal();
                }
            } else if (e.key === 'Escape') {
                if (isSidebarOpen) {
                    setIsSidebarOpen(false);
                } else if (isSharePreBillModalOpen) {
                    setIsSharePreBillModalOpen(false);
                } else if (isHoldModalOpen) {
                    setIsHoldModalOpen(false);
                } else if (isCheckoutModalOpen) {
                    setIsCheckoutModalOpen(false);
                } else if (variantPickerProduct) {
                    setVariantPickerProduct(null);
                } else if (isRefundModalOpen) {
                    setIsRefundModalOpen(false);
                } else if (isReceiptModalOpen) {
                    setIsReceiptModalOpen(false);
                } else if (isOfflineModalOpen) {
                    setIsOfflineModalOpen(false);
                } else if (isManualOrderModalOpen) {
                    setIsManualOrderModalOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        cart,
        isCheckoutModalOpen,
        isSharePreBillModalOpen,
        isHoldModalOpen,
        isManualOrderModalOpen,
        variantPickerProduct,
        isReceiptModalOpen,
        isRefundModalOpen,
        isSidebarOpen,
        isOfflineModalOpen,
    ]);

    // Fetch Cash Flows when period, date, or month changes
    const fetchCashFlows = async (
        period = cashFlowPeriod,
        dateStr = cashFlowDate,
        monthStr = cashFlowMonth,
    ) => {
        setIsLoadingCashFlow(true);
        try {
            const params = new URLSearchParams();
            params.set('period', period);
            if (period === 'daily') {
                params.set('date', dateStr);
            } else if (period === 'custom_month') {
                params.set('month', monthStr);
            }
            const res = await fetch(`/pos/cash-flows?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const list = data.cash_flows || data.flows || [];
            setCashFlowsList(list);
            const drawer = data.cash_drawer || data.summary;
            if (drawer) {
                setCashDrawer(drawer);
            }
        } catch (err) {
            console.error('Failed to fetch cash flows:', err);
        } finally {
            setIsLoadingCashFlow(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'cash_flow') {
            fetchCashFlows(cashFlowPeriod, cashFlowDate, cashFlowMonth);
        }
    }, [activeTab, cashFlowPeriod, cashFlowDate, cashFlowMonth]);

    // Prevent Android APK SwipeRefreshLayout & browser pull-to-refresh from hijacking
    // vertical scroll gestures and accidentally reloading the POS app.
    // Keeping window.scrollY >= 2 ensures webView.canScrollVertically(-1) is always true.
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const prevHtmlOverscroll = html.style.overscrollBehaviorY;
        const prevBodyOverscroll = body.style.overscrollBehaviorY;
        const prevBodyMinHeight = body.style.minHeight;

        html.style.overscrollBehaviorY = 'none';
        body.style.overscrollBehaviorY = 'none';
        body.style.minHeight = 'calc(100dvh + 8px)';

        const ensureScrollOffset = () => {
            if (window.scrollY < 2) {
                window.scrollTo(0, 2);
            }
        };

        ensureScrollOffset();
        const rafId = requestAnimationFrame(ensureScrollOffset);
        const timerId = window.setTimeout(ensureScrollOffset, 120);

        window.addEventListener('scroll', ensureScrollOffset, { passive: true });
        window.addEventListener('touchstart', ensureScrollOffset, { passive: true });
        window.addEventListener('touchend', ensureScrollOffset, { passive: true });

        return () => {
            cancelAnimationFrame(rafId);
            window.clearTimeout(timerId);
            window.removeEventListener('scroll', ensureScrollOffset);
            window.removeEventListener('touchstart', ensureScrollOffset);
            window.removeEventListener('touchend', ensureScrollOffset);
            html.style.overscrollBehaviorY = prevHtmlOverscroll;
            body.style.overscrollBehaviorY = prevBodyOverscroll;
            body.style.minHeight = prevBodyMinHeight;
        };
    }, []);

    // Reset product catalog scroll to top (offset 2px) when switching category, search, or tab
    useEffect(() => {
        window.scrollTo(0, 2);
    }, [activeTab, selectedCategoryId, searchQuery]);

    // Fetch Sales Reports when period, date, or staff filter changes
    const fetchSalesReport = async (staffId = reportStaffId) => {
        setIsLoadingReport(true);
        try {
            const params = new URLSearchParams();
            params.set('period', reportPeriod);
            if (reportPeriod === 'daily') params.set('date', reportDate);
            if (reportPeriod === 'monthly') params.set('month', reportMonth);
            if (reportPeriod === 'custom') {
                params.set('start_date', reportStartDate);
                params.set('end_date', reportEndDate);
            }
            if (!isStaffRestricted && staffId && staffId !== 'all') {
                params.set('staff_id', staffId);
            }
            const res = await fetch(`/pos/reports?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const rep = data.report || data;
            setReportData(rep);
        } catch (err) {
            console.error('Failed to load reports:', err);
            showToast('Gagal memuat data laporan');
        } finally {
            setIsLoadingReport(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchSalesReport(reportStaffId);
        }
    }, [
        activeTab,
        reportPeriod,
        reportDate,
        reportMonth,
        reportStartDate,
        reportEndDate,
        reportStaffId,
    ]);

    // Fetch Profit & Loss Report
    const fetchProfitLossReport = async (
        period = plPeriod,
        date = plDate,
        month = plMonth,
    ) => {
        setIsLoadingProfitLoss(true);
        try {
            const params = new URLSearchParams();
            params.set('period', period);
            if (period === 'today') params.set('date', date);
            if (period === 'custom_month') params.set('month', month);

            const res = await fetch(`/pos/profit-loss?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const pl = data.profit_loss || data;
            setProfitLossData(pl);
        } catch (err) {
            console.error('Failed to load profit loss report:', err);
            showToast('Gagal memuat laporan laba rugi');
        } finally {
            setIsLoadingProfitLoss(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'profit_loss') {
            if (!canAccessProfitLoss) {
                setActiveTab('cashier');
                return;
            }
            fetchProfitLossReport(plPeriod, plDate, plMonth);
        }
    }, [activeTab, plPeriod, plDate, plMonth, canAccessProfitLoss]);

    const handleExportProfitLossExcel = () => {
        setIsExportingPlExcel(true);
        try {
            const params = new URLSearchParams();
            params.set('period', plPeriod);
            if (plPeriod === 'today') params.set('date', plDate);
            if (plPeriod === 'custom_month') params.set('month', plMonth);

            const exportUrl = `/pos/profit-loss/export-excel?${params.toString()}`;

            const link = document.createElement('a');
            link.href = exportUrl;
            link.setAttribute('download', '');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showToast('Laporan Laba Rugi Excel sedang diunduh...');
        } catch (err) {
            console.error('Failed to export profit loss excel:', err);
            showToast('Gagal mengekspor laporan Excel');
        } finally {
            setTimeout(() => setIsExportingPlExcel(false), 1200);
        }
    };

    const handlePrintProfitLossReport = () => {
        if (!profitLossData) {
            showToast('Data laba rugi belum siap dicetak.');
            return;
        }
        const reportData: ProfitLossReportData = {
            store_name: 'Kasir Sanubari',
            period_title: profitLossData.period_title,
            printed_at: new Date().toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }),
            cashier_name: cashier.name,
            gross_sales: profitLossData.summary.gross_sales,
            total_discounts: profitLossData.summary.total_discounts,
            net_sales: profitLossData.summary.net_sales,
            total_cogs: profitLossData.summary.total_cogs,
            gross_profit: profitLossData.summary.gross_profit,
            gross_margin_pct: profitLossData.summary.gross_margin_pct,
            total_expenses: profitLossData.summary.total_expenses,
            other_income: profitLossData.summary.other_income,
            net_profit: profitLossData.summary.net_profit,
            net_margin_pct: profitLossData.summary.net_margin_pct,
            total_transactions: profitLossData.summary.total_transactions,
            items_sold: profitLossData.summary.items_sold,
            expense_breakdown: profitLossData.expense_breakdown?.map(
                (e: any) => ({
                    category: e.category,
                    label: e.label,
                    count: e.count,
                    total: e.total,
                }),
            ),
            top_margin_products: profitLossData.top_margin_products
                ?.slice(0, 10)
                .map((p: any) => ({
                    product_name: p.product_name,
                    variant_label: p.variant_label,
                    quantity: p.quantity,
                    gross_profit: p.gross_profit,
                })),
        };
        printProfitLossThermalWeb(
            reportData,
            resolvedPrinter.paper_width,
            printerForm,
        );
    };

    // Fetch Transaction History with Filters (Hari Ini, Kemarin, Custom Tanggal)
    const fetchHistoryOrders = async (
        filterType = historyFilter,
        startDate = historyStartDate,
        endDate = historyEndDate,
        searchQuery = historySearch,
    ) => {
        setIsLoadingHistory(true);
        try {
            const params = new URLSearchParams();
            params.set('filter', filterType);
            if (filterType === 'custom') {
                if (startDate) params.set('start_date', startDate);
                if (endDate) params.set('end_date', endDate);
            }
            if (searchQuery.trim()) {
                params.set('search', searchQuery.trim());
            }
            const res = await fetch(`/pos/orders?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.orders) {
                setRecentOrders(data.orders);
            }
        } catch (err) {
            console.error('Failed to load transaction history:', err);
            showToast('Gagal memuat riwayat transaksi');
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchHistoryOrders(
                historyFilter,
                historyStartDate,
                historyEndDate,
                historySearch,
            );
        }
    }, [activeTab, historyFilter]);

    // Client-side search and summary calculation with Status Filter (All, Paid, Refunded)
    const filteredOrders = useMemo(() => {
        let list = Array.isArray(recentOrders) ? recentOrders : [];
        if (historyStatusFilter === 'paid') {
            list = list.filter((ord) => ord?.payment_status !== 'refunded');
        } else if (historyStatusFilter === 'refunded') {
            list = list.filter((ord) => ord?.payment_status === 'refunded');
        }

        if (!historySearch.trim()) return list;
        const q = historySearch.toLowerCase();
        return list.filter(
            (ord) =>
                (ord?.order_number && ord.order_number.toLowerCase().includes(q)) ||
                (ord?.customer_name && ord.customer_name.toLowerCase().includes(q)) ||
                (ord?.customer_phone && ord.customer_phone.includes(q)) ||
                (ord?.refund_reason && ord.refund_reason.toLowerCase().includes(q)),
        );
    }, [recentOrders, historyStatusFilter, historySearch]);

    const historyTotalAmount = useMemo(() => {
        return filteredOrders
            .filter((ord) => ord?.payment_status !== 'refunded')
            .reduce((sum, ord) => sum + (ord?.total_amount || 0), 0);
    }, [filteredOrders]);

    const historyTotalRefunds = useMemo(() => {
        const list = Array.isArray(recentOrders) ? recentOrders : [];
        return list
            .filter((ord) => ord?.payment_status === 'refunded')
            .reduce((sum, ord) => sum + (ord?.refund_amount || ord?.total_amount || 0), 0);
    }, [recentOrders]);

    // --- REFUND HANDLER FUNCTIONS ---
    const handleOpenRefundModal = (order: PosRecentOrder) => {
        if (order.payment_status === 'refunded') {
            showToast('Transaksi ini sudah di-refund sebelumnya.');
            return;
        }
        setSelectedOrderForRefund(order);
        setRefundAmount(order.total_amount);
        setRefundReason('');
        setIsRefundModalOpen(true);
    };

    const handleConfirmRefund = async () => {
        if (!selectedOrderForRefund) return;
        const reason = refundReason.trim();
        if (!reason) {
            alert('Mohon pilih atau masukkan alasan refund / retur transaksi.');
            return;
        }

        const amt = typeof refundAmount === 'number' && refundAmount > 0
            ? refundAmount
            : selectedOrderForRefund.total_amount;

        setIsProcessingRefund(true);
        try {
            // Check if online or offline
            if (!isOnline || manualOffline) {
                // Offline Refund handling
                const updatedOrders = recentOrders.map((ord) => {
                    if (ord.id === selectedOrderForRefund.id || ord.order_number === selectedOrderForRefund.order_number) {
                        return {
                            ...ord,
                            payment_status: 'refunded',
                            payment_status_label: 'Dana Dikembalikan (Refund)',
                            status: 'refunded',
                            status_label: 'Transaksi Di-refund',
                            refund_reason: reason,
                            refund_amount: amt,
                            refunded_at: new Date().toLocaleString('id-ID'),
                            refunded_by_name: cashier.name,
                            payment_details: {
                                ...(ord.payment_details || {}),
                                refunded_at: new Date().toLocaleString('id-ID'),
                                refunded_by_name: cashier.name,
                                refund_reason: reason,
                                refund_amount: amt,
                            },
                        };
                    }
                    return ord;
                });
                setRecentOrders(updatedOrders);
                showToast(`[MODE OFFLINE] Transaksi #${selectedOrderForRefund.order_number} berhasil di-refund.`);
                setIsRefundModalOpen(false);

                // Prepare Receipt for Printing
                const refundReceipt: ReceiptData = {
                    store_name: printerForm.store_name,
                    tagline: printerForm.tagline,
                    address: printerForm.address,
                    phone: printerForm.phone,
                    instagram: printerForm.instagram,
                    order_number: selectedOrderForRefund.order_number,
                    date: new Date().toLocaleString('id-ID'),
                    cashier_name: cashier.name,
                    customer_name: selectedOrderForRefund.customer_name,
                    customer_phone: selectedOrderForRefund.customer_phone,
                    customer_address: selectedOrderForRefund.customer_address,
                    shipping_cost: selectedOrderForRefund.shipping_cost,
                    shipping_courier: selectedOrderForRefund.shipping_courier,
                    items: selectedOrderForRefund.items,
                    subtotal: selectedOrderForRefund.subtotal,
                    discount_amount: selectedOrderForRefund.payment_details?.discount_amount || 0,
                    total_amount: selectedOrderForRefund.total_amount,
                    payment_method_label: selectedOrderForRefund.payment_method_label,
                    footer_note: printerForm.receipt_footer,
                    is_refund: true,
                    refund_reason: reason,
                    refund_amount: amt,
                    refunded_at: new Date().toLocaleString('id-ID'),
                    refunded_by_name: cashier.name,
                };
                setCompletedReceipt(refundReceipt);
                setIsReceiptModalOpen(true);
                return;
            }

            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(`/pos/orders/${selectedOrderForRefund.id}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    reason: reason,
                    refund_amount: amt,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal memproses refund transaksi.');
            }

            // Update recent orders state
            setRecentOrders((prev) =>
                prev.map((ord) =>
                    ord.id === selectedOrderForRefund.id
                        ? {
                              ...ord,
                              ...data.order,
                          }
                        : ord,
                ),
            );

            if (data.cash_drawer) {
                setCashDrawer((prev) => ({
                    ...prev,
                    ...data.cash_drawer,
                }));
            }

            showToast(data.message || 'Refund transaksi berhasil diproses.');
            setIsRefundModalOpen(false);

            // Automatically open Receipt Modal configured for Refund
            const refundReceipt: ReceiptData = {
                store_name: printerForm.store_name,
                tagline: printerForm.tagline,
                address: printerForm.address,
                phone: printerForm.phone,
                instagram: printerForm.instagram,
                order_number: data.order?.order_number || selectedOrderForRefund.order_number,
                date: data.order?.refunded_at || new Date().toLocaleString('id-ID'),
                cashier_name: cashier.name,
                customer_name: selectedOrderForRefund.customer_name,
                customer_phone: selectedOrderForRefund.customer_phone,
                customer_address: selectedOrderForRefund.customer_address,
                shipping_cost: selectedOrderForRefund.shipping_cost,
                shipping_courier: selectedOrderForRefund.shipping_courier,
                items: selectedOrderForRefund.items,
                subtotal: selectedOrderForRefund.subtotal,
                discount_amount: selectedOrderForRefund.payment_details?.discount_amount || 0,
                total_amount: selectedOrderForRefund.total_amount,
                payment_method_label: selectedOrderForRefund.payment_method_label,
                footer_note: printerForm.receipt_footer,
                is_refund: true,
                refund_reason: reason,
                refund_amount: amt,
                refunded_at: data.order?.refunded_at || new Date().toLocaleString('id-ID'),
                refunded_by_name: cashier.name,
            };
            setCompletedReceipt(refundReceipt);
            setIsReceiptModalOpen(true);
        } catch (err: any) {
            alert('Gagal memproses refund: ' + (err.message || 'Terjadi kesalahan sistem'));
        } finally {
            setIsProcessingRefund(false);
        }
    };

    // Add to Cart Logic
    const addToCart = (product: Product, variant: ProductVariant) => {
        if (
            product.is_out_of_stock ||
            variant.stock_status === 'out_of_stock'
        ) {
            showToast('Produk atau varian ini sedang habis');
            return;
        }

        const cartItemId = `${product.id}-${variant.id}`;
        setCart((prev) => {
            const existing = prev.find((item) => item.id === cartItemId);
            if (existing) {
                return prev.map((item) => {
                    if (item.id === cartItemId) {
                        const newQty = item.quantity + 1;
                        const newDisc = recalculateItemDiscount(item, newQty);
                        return {
                            ...item,
                            quantity: newQty,
                            discount_amount: newDisc > 0 ? newDisc : undefined,
                        };
                    }
                    return item;
                });
            }
            return [
                ...prev,
                {
                    id: cartItemId,
                    product_id: product.id,
                    product_name: product.name,
                    variant_id: variant.id,
                    variant_label: variant.label,
                    price: variant.price,
                    quantity: 1,
                    image: product.image,
                },
            ];
        });

        showToast(`${product.name} (${variant.label}) ditambahkan`);
    };

    // Recalculate discount amount when item quantity changes
    const recalculateItemDiscount = (
        item: CartItem,
        newQty: number,
    ): number => {
        if (!item.discount_type || !item.discount_value) return 0;
        const lineGross = item.price * newQty;
        if (item.discount_type === 'percent') {
            const pct = Math.min(100, Math.max(0, item.discount_value));
            return Math.round((lineGross * pct) / 100);
        }
        return Math.min(lineGross, item.discount_value);
    };

    // Click on Product card
    const handleProductClick = (product: Product) => {
        if (product.is_out_of_stock) return;

        // Check if C.Y.B.R / BYOB custom blend product
        if (
            product.slug === 'byob' ||
            product.series === 'cybr' ||
            product.series === 'custom-blend' ||
            product.name.toLowerCase().includes('c.y.b.r')
        ) {
            openCybrStudioModal(product);
            return;
        }

        const vars = Array.isArray(product.variants) ? product.variants : [];
        if (vars.length === 1) {
            addToCart(product, vars[0]);
        } else if (vars.length > 1) {
            // Open variant selection modal
            setVariantPickerProduct(product);
        }
    };

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart((prev) => {
            return prev
                .map((item) => {
                    if (item.id === cartItemId) {
                        const newQty = item.quantity + delta;
                        if (newQty <= 0) return null;
                        const newDisc = recalculateItemDiscount(item, newQty);
                        return {
                            ...item,
                            quantity: newQty,
                            discount_amount: newDisc > 0 ? newDisc : undefined,
                        };
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[];
        });
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        if (confirm('Yakin ingin mengosongkan keranjang kasir?')) {
            setCart([]);
            setCartDiscountValue(0);
            setCustomerName('');
            setCustomerPhone('');
            setIsDeliveryOrder(false);
            setShippingCost('');
            setShippingCourier('');
            setCustomerAddress('');
            clearCartStorage();
        }
    };

    // --- DISCOUNT MODAL HANDLERS ---
    const openCartDiscountModal = () => {
        setTempDiscountType(cartDiscountType);
        setTempDiscountValue(
            cartDiscountValue > 0 ? String(cartDiscountValue) : '',
        );
        setIsCartDiscountModalOpen(true);
    };

    const applyCartDiscount = () => {
        const val = parseFloat(tempDiscountValue) || 0;
        setCartDiscountType(tempDiscountType);
        setCartDiscountValue(Math.max(0, val));
        setIsCartDiscountModalOpen(false);
        showToast(
            val > 0
                ? 'Diskon transaksi berhasil diterapkan'
                : 'Diskon transaksi dihapus',
        );
    };

    const clearCartDiscount = () => {
        setCartDiscountValue(0);
        setTempDiscountValue('');
        setIsCartDiscountModalOpen(false);
        showToast('Diskon transaksi dihapus');
    };

    const openItemDiscountModal = (item: CartItem) => {
        setEditingDiscountItem(item);
        setItemDiscountType(item.discount_type || 'percent');
        setItemDiscountValue(
            item.discount_value ? String(item.discount_value) : '',
        );
    };

    const saveItemDiscount = () => {
        if (!editingDiscountItem) return;
        const val = parseFloat(itemDiscountValue) || 0;
        const lineGross =
            editingDiscountItem.price * editingDiscountItem.quantity;

        let calculatedAmount = 0;
        if (val > 0) {
            if (itemDiscountType === 'percent') {
                const pct = Math.min(100, Math.max(0, val));
                calculatedAmount = Math.round((lineGross * pct) / 100);
            } else {
                calculatedAmount = Math.min(lineGross, Math.max(0, val));
            }
        }

        setCart((prev) =>
            prev.map((it) => {
                if (it.id === editingDiscountItem.id) {
                    if (val <= 0 || calculatedAmount <= 0) {
                        const copy = { ...it };
                        delete copy.discount_type;
                        delete copy.discount_value;
                        delete copy.discount_amount;
                        return copy;
                    }
                    return {
                        ...it,
                        discount_type: itemDiscountType,
                        discount_value: val,
                        discount_amount: calculatedAmount,
                    };
                }
                return it;
            }),
        );

        setEditingDiscountItem(null);
        showToast(
            val > 0
                ? `Diskon produk "${editingDiscountItem.product_name}" disimpan (-Rp ${formatRp(calculatedAmount)})`
                : `Diskon produk "${editingDiscountItem.product_name}" dihapus`,
        );
    };

    const removeItemDiscount = (itemId: string) => {
        setCart((prev) =>
            prev.map((it) => {
                if (it.id === itemId) {
                    const copy = { ...it };
                    delete copy.discount_type;
                    delete copy.discount_value;
                    delete copy.discount_amount;
                    return copy;
                }
                return it;
            }),
        );
        showToast('Diskon produk dihapus');
    };

    const showToast = (msg: string) => {
        setFeedbackMessage(msg);
        setTimeout(() => setFeedbackMessage(null), 3000);
    };

    // Open Checkout Modal
    const openCheckout = () => {
        if (cart.length === 0) return;
        setCashTendered(totalAmount);
        if (paymentMethod === 'cash' && !paymentForm?.enable_cash) {
            if (paymentForm?.enable_qris) setPaymentMethod('qris');
            else if (paymentForm?.enable_debit) setPaymentMethod('debit');
            else if (paymentForm?.enable_bank_transfer)
                setPaymentMethod('bank_transfer');
        }
        setIsCheckoutModalOpen(true);
    };

    // Save transaction in local storage (Offline Mode)
    const saveOfflineTransaction = (payload: any) => {
        const offlineId = `POS-OFF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const nowIso = new Date().toISOString();
        const paymentLabel =
            paymentMethod === 'cash'
                ? 'Tunai (Offline)'
                : paymentMethod === 'qris'
                  ? 'QRIS (Offline)'
                  : paymentMethod === 'debit'
                    ? 'Debit EDC (Offline)'
                    : 'Transfer Bank (Offline)';

        const newOfflineOrder: OfflineOrder = {
            offline_id: offlineId,
            created_at: nowIso,
            customer_name: customerName.trim() || 'Pelanggan Kasir',
            customer_phone: customerPhone.trim() || null,
            customer_address: isDeliveryOrder ? customerAddress.trim() : null,
            shipping_cost: numericShippingCost,
            shipping_courier:
                isDeliveryOrder && shippingCourier.trim()
                    ? shippingCourier.trim()
                    : null,
            items: cart.map((i) => ({
                product_id: i.product_id,
                variant_id: i.variant_id,
                product_name: i.product_name,
                variant_label: i.variant_label,
                notes: i.notes || null,
                cost_price: i.cost_price ?? null,
                quantity: i.quantity,
                price: i.price,
                discount_type: i.discount_type,
                discount_value: i.discount_value,
                discount_amount: i.discount_amount || 0,
            })),
            payment_method: paymentMethod,
            cash_tendered:
                paymentMethod === 'cash' ? Number(cashTendered) : null,
            cash_change: paymentMethod === 'cash' ? cashChange : undefined,
            discount_amount: discountAmount,
            cart_discount_type: cartDiscountType,
            cart_discount_value: cartDiscountValue,
            subtotal: subtotal,
            total_amount: totalAmount,
            notes: 'Transaksi Offline POS',
        };

        const updated = [newOfflineOrder, ...offlineOrders];
        setOfflineOrders(updated);
        try {
            localStorage.setItem(
                POS_OFFLINE_ORDERS_STORAGE_KEY,
                JSON.stringify(updated),
            );
        } catch (e) {
            console.error('Gagal simpan offline order:', e);
        }

        const receipt: ReceiptData = {
            store_name: printerForm.store_name,
            tagline: printerForm.tagline,
            address: printerForm.address,
            phone: printerForm.phone,
            instagram: printerForm.instagram,
            order_number: offlineId,
            date: new Date().toLocaleString('id-ID'),
            cashier_name: cashier.name,
            customer_name: newOfflineOrder.customer_name,
            customer_phone: newOfflineOrder.customer_phone || '-',
            customer_address: newOfflineOrder.customer_address || undefined,
            shipping_cost: numericShippingCost,
            shipping_courier: newOfflineOrder.shipping_courier || undefined,
            items: cart.map((i) => ({
                product_name: i.product_name,
                variant_label: i.variant_label,
                price: i.price,
                quantity: i.quantity,
                subtotal: i.price * i.quantity - (i.discount_amount || 0),
                discount_amount: i.discount_amount,
            })),
            subtotal: subtotal,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            payment_method_label: paymentLabel,
            cash_tendered:
                paymentMethod === 'cash' ? Number(cashTendered) : undefined,
            cash_change: paymentMethod === 'cash' ? cashChange : undefined,
            footer_note:
                (printerForm.receipt_footer || '') +
                '\n* [MODE OFFLINE - TERSIMPAN DI KASIR] *',
        };

        setCompletedReceipt(receipt);
        setIsCheckoutModalOpen(false);
        setIsReceiptModalOpen(true);

        setRecentOrders((prev) => [
            {
                id: Date.now(),
                order_number: offlineId,
                customer_name: newOfflineOrder.customer_name,
                customer_phone: newOfflineOrder.customer_phone || undefined,
                customer_address: newOfflineOrder.customer_address || undefined,
                shipping_cost: numericShippingCost,
                shipping_courier: newOfflineOrder.shipping_courier || undefined,
                total_amount: totalAmount,
                subtotal: subtotal,
                payment_method: paymentMethod,
                payment_method_label: paymentLabel,
                created_at: 'Offline (Pending Sync)',
                items_count: totalItemsCount,
                items: receipt.items,
            },
            ...prev,
        ]);

        if (paymentMethod === 'cash') {
            setCashDrawer((prev) => ({
                ...prev,
                cash_sales: prev.cash_sales + totalAmount,
                net_cash: prev.net_cash + totalAmount,
            }));
        }

        setCart([]);
        setCartDiscountValue(0);
        setCustomerName('');
        setCustomerPhone('');
        setIsDeliveryOrder(false);
        setShippingCost('');
        setShippingCourier('');
        setCustomerAddress('');
        clearCartStorage();

        if (printerForm.auto_print) {
            if (connectedBtPrinter || getSavedBluetoothPrinter()) {
                handleBluetoothPrint(receipt);
            } else {
                printThermalWeb(receipt, printerForm);
            }
        }

        showToast('Transaksi disimpan di memori kasir (Mode Offline).');
    };

    // Process POS Checkout
    const handleProcessCheckout = async () => {
        if (cart.length === 0 || isSubmitting) return;

        if (paymentMethod === 'cash') {
            const tendered =
                typeof cashTendered === 'number' ? cashTendered : 0;
            if (tendered < totalAmount) {
                alert('Uang tunai yang diterima kurang dari total tagihan!');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload = {
                items: cart.map((i) => ({
                    product_id: i.product_id,
                    variant_id: i.variant_id,
                    product_name: i.product_name,
                    variant_label: i.variant_label,
                    cost_price: i.cost_price ?? null,
                    notes: i.notes || null,
                    is_manual: !!i.is_manual,
                    quantity: i.quantity,
                    price: i.price,
                    discount_type: i.discount_type,
                    discount_value: i.discount_value,
                    discount_amount: i.discount_amount || 0,
                })),
                payment_method: paymentMethod,
                cash_tendered: paymentMethod === 'cash' ? cashTendered : null,
                discount_amount: cartDiscountAmount,
                cart_discount_type: cartDiscountType,
                cart_discount_value: cartDiscountValue,
                customer_name: customerName.trim() || 'Pelanggan Kasir',
                customer_phone: customerPhone.trim() || null,
                customer_address: isDeliveryOrder
                    ? customerAddress.trim()
                    : null,
                shipping_cost: numericShippingCost,
                shipping_courier:
                    isDeliveryOrder && shippingCourier.trim()
                        ? shippingCourier.trim()
                        : null,
            };

            if (isEffectiveOffline) {
                saveOfflineTransaction(payload);
                return;
            }

            try {
                const csrfToken =
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '';
                const res = await fetch('/pos/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(
                        data.message || 'Gagal memproses transaksi kasir',
                    );
                }

                // Success! Build receipt
                const receipt: ReceiptData = {
                    store_name: printerForm.store_name,
                    tagline: printerForm.tagline,
                    address: printerForm.address,
                    phone: printerForm.phone,
                    instagram: printerForm.instagram,
                    order_number: data.order.order_number,
                    date: data.order.created_at,
                    cashier_name: cashier.name,
                    customer_name: data.order.customer_name,
                    customer_phone: data.order.customer_phone,
                    customer_address:
                        data.order.customer_address ||
                        (isDeliveryOrder ? customerAddress : undefined),
                    shipping_cost:
                        data.order.shipping_cost ?? numericShippingCost,
                    shipping_courier:
                        data.order.shipping_courier ||
                        (isDeliveryOrder ? shippingCourier : undefined),
                    items: cart.map((i) => ({
                        product_name: i.product_name,
                        variant_label: i.variant_label,
                        price: i.price,
                        quantity: i.quantity,
                        subtotal:
                            i.price * i.quantity - (i.discount_amount || 0),
                        discount_amount: i.discount_amount,
                    })),
                    subtotal: subtotal,
                    discount_amount: discountAmount,
                    total_amount: totalAmount,
                    payment_method_label: data.order.payment_method_label,
                    cash_tendered:
                        paymentMethod === 'cash'
                            ? Number(cashTendered)
                            : undefined,
                    cash_change:
                        paymentMethod === 'cash' ? cashChange : undefined,
                    footer_note: printerForm.receipt_footer,
                };

                setCompletedReceipt(receipt);
                setIsCheckoutModalOpen(false);
                setIsReceiptModalOpen(true);

                // Add to recent orders in UI
                setRecentOrders((prev) => [
                    {
                        id: data.order.id,
                        order_number: data.order.order_number,
                        customer_name: data.order.customer_name,
                        customer_phone: data.order.customer_phone,
                        customer_address: data.order.customer_address,
                        shipping_cost: data.order.shipping_cost,
                        shipping_courier: data.order.shipping_courier,
                        total_amount: totalAmount,
                        subtotal: subtotal,
                        payment_method: paymentMethod,
                        payment_method_label: data.order.payment_method_label,
                        created_at: 'Baru Saja',
                        items_count: totalItemsCount,
                        items: receipt.items,
                    },
                    ...prev,
                ]);

                // Update cash drawer state if cash
                if (paymentMethod === 'cash') {
                    setCashDrawer((prev) => ({
                        ...prev,
                        cash_sales: prev.cash_sales + totalAmount,
                        net_cash: prev.net_cash + totalAmount,
                    }));
                }

                // Clear Cart & Discounts
                setCart([]);
                setCartDiscountValue(0);
                setCustomerName('');
                setCustomerPhone('');
                setIsDeliveryOrder(false);
                setShippingCost('');
                setShippingCourier('');
                setCustomerAddress('');
                clearCartStorage();

                // Auto-print if enabled
                if (printerForm.auto_print) {
                    if (connectedBtPrinter || getSavedBluetoothPrinter()) {
                        handleBluetoothPrint(receipt);
                    } else {
                        printThermalWeb(receipt, printerForm);
                    }
                }
            } catch (netErr: any) {
                // If offline / network error, fallback automatically to offline mode
                if (
                    !navigator.onLine ||
                    !isOnline ||
                    netErr.message?.includes('fetch') ||
                    netErr.message?.includes('Failed to fetch') ||
                    netErr.message?.includes('NetworkError')
                ) {
                    console.warn(
                        'Network issue during checkout, falling back to offline storage:',
                        netErr,
                    );
                    saveOfflineTransaction(payload);
                    return;
                }
                throw netErr;
            }
        } catch (err: any) {
            alert('Terjadi kesalahan: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Synchronize offline orders batch to server (Auto-Sync & Manual Upload)
    const syncOfflineOrdersToServer = async (manualTrigger = false) => {
        if (offlineOrders.length === 0) {
            if (manualTrigger)
                showToast('Semua transaksi offline sudah tersinkronkan.');
            return;
        }
        if (!navigator.onLine && !manualTrigger) return;

        setIsSyncing(true);
        setSyncStatusMessage(
            `Mengunggah ${offlineOrders.length} transaksi offline ke server...`,
        );
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/sync-offline-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    orders: offlineOrders,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || 'Gagal menyinkronkan transaksi offline',
                );
            }

            const count = offlineOrders.length;
            setOfflineOrders([]);
            localStorage.removeItem(POS_OFFLINE_ORDERS_STORAGE_KEY);
            setSyncStatusMessage(
                `Berhasil menyinkronkan ${count} transaksi ke database server.`,
            );
            showToast(
                `Berhasil! ${count} transaksi offline telah disinkronkan ke database server.`,
            );
        } catch (err: any) {
            console.error('Sync offline orders error:', err);
            setSyncStatusMessage('Gagal sinkronisasi: ' + err.message);
            if (manualTrigger) {
                alert('Gagal menyinkronkan data ke server: ' + err.message);
            }
        } finally {
            setIsSyncing(false);
        }
    };

    // Auto-sync when online and there are offline orders
    useEffect(() => {
        if (
            isOnline &&
            !manualOffline &&
            offlineOrders.length > 0 &&
            !isSyncing
        ) {
            const timer = setTimeout(() => {
                syncOfflineOrdersToServer();
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [isOnline, manualOffline, offlineOrders.length, isSyncing]);

    // Periodic auto-sync check every 25 seconds when online
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const interval = setInterval(() => {
            if (
                navigator.onLine &&
                !manualOffline &&
                offlineOrders.length > 0 &&
                !isSyncing
            ) {
                syncOfflineOrdersToServer();
            }
        }, 25000);
        return () => clearInterval(interval);
    }, [manualOffline, offlineOrders.length, isSyncing]);

    // Pull catalog data from server (Tombol Download Data)
    const pullLatestCatalogData = async (downloadFile = false) => {
        setIsDownloadingCatalog(true);
        try {
            if (downloadFile) {
                window.location.href = '/pos/catalog?download=1';
                showToast('Mengunduh berkas backup katalog JSON...');
                return;
            }

            const res = await fetch('/pos/catalog');
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menarik katalog');
            }

            const normalizedProducts = Array.isArray(data.products)
                ? data.products.map(normalizePosProduct)
                : [];
            if (normalizedProducts.length > 0) {
                setProducts(normalizedProducts);
            }
            if (Array.isArray(data.categories) && data.categories.length > 0) {
                setCategories(data.categories);
            }

            const nowIso = new Date().toISOString();
            setLastCatalogSync(nowIso);
            localStorage.setItem(
                POS_CACHED_CATALOG_STORAGE_KEY,
                JSON.stringify({
                    products: normalizedProducts,
                    categories: data.categories,
                    updated_at: nowIso,
                }),
            );

            precacheProductImages(normalizedProducts);

            showToast(
                `Berhasil menarik ${data.products?.length || 0} produk dari database dan menyimpan gambar ke cache offline.`,
            );
        } catch (err: any) {
            console.error('Gagal menarik katalog:', err);
            alert('Gagal menarik data dari server: ' + err.message);
        } finally {
            setIsDownloadingCatalog(false);
        }
    };

    // Export offline orders to JSON file
    const exportOfflineOrdersToFile = () => {
        if (offlineOrders.length === 0) {
            alert('Belum ada transaksi offline yang tersimpan.');
            return;
        }
        const filename = `sanubari_pos_penjualan_offline_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const jsonStr = JSON.stringify(
            {
                exported_at: new Date().toISOString(),
                source: 'sanubari_pos_offline',
                cashier: cashier.name,
                orders_count: offlineOrders.length,
                orders: offlineOrders,
            },
            null,
            2,
        );
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(
            `File backup penjualan (${offlineOrders.length} transaksi) berhasil diunduh.`,
        );
    };

    // Upload & import JSON file to server (Tombol Import Penjualan)
    const handleImportOrdersFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsSyncing(true);
        setSyncStatusMessage(
            'Sedang mengimpor berkas penjualan ke database...',
        );
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/import-orders', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || 'Gagal mengimpor file penjualan.',
                );
            }

            showToast(
                data.message || 'Data penjualan berhasil diimpor ke database!',
            );
            setSyncStatusMessage(data.message);
        } catch (err: any) {
            console.error('Import error:', err);
            alert('Gagal mengimpor file penjualan: ' + err.message);
        } finally {
            setIsSyncing(false);
            e.target.value = '';
        }
    };

    // Sinkronisasi data & Reload aplikasi POS
    const handleSyncAndReload = async () => {
        setIsReloadingApp(true);
        showToast('Menyinkronkan data & memuat ulang aplikasi...');
        try {
            if (navigator.onLine && offlineOrders.length > 0) {
                await syncOfflineOrdersToServer(false);
            }
        } catch (err) {
            console.error('Sinkronisasi sebelum reload gagal:', err);
        }
        setTimeout(() => {
            window.location.reload();
        }, 350);
    };

    // =========================================================================
    // USB & WINDOWS POS PRINTER MANAGER (WINDOWS DESKTOP & WEBUSB)
    // =========================================================================
    const [connectedUsbPrinter, setConnectedUsbPrinter] = useState<UsbPrinterDevice | null>(() => getSavedUsbPrinter());
    const [availableWindowsPrinters, setAvailableWindowsPrinters] = useState<WindowsPrinterItem[]>([]);
    const [isLoadingWindowsPrinters, setIsLoadingWindowsPrinters] = useState(false);
    const [isUsbConnecting, setIsUsbConnecting] = useState(false);
    const [isUsbTesting, setIsUsbTesting] = useState(false);

    const refreshWindowsPrinters = async () => {
        setIsLoadingWindowsPrinters(true);
        try {
            const list = await getAvailableWindowsPrinters();
            setAvailableWindowsPrinters(list);
            if (list.length > 0) {
                setPrinterForm((prev) => {
                    if (prev.printer_name && list.some((p) => p.name.toLowerCase() === prev.printer_name?.toLowerCase())) {
                        return prev;
                    }
                    const def = list.find((p) => p.isDefault) || list[0];
                    return {
                        ...prev,
                        printer_name: def?.name || prev.printer_name,
                        usb_printer_name: def?.name || prev.usb_printer_name,
                    };
                });
            }
        } catch (err) {
            console.warn('Gagal memuat printer Windows:', err);
        } finally {
            setIsLoadingWindowsPrinters(false);
        }
    };

    useEffect(() => {
        if (isElectronDesktop()) {
            refreshWindowsPrinters();
        }
        reconnectSavedUsbPrinter().then((ok) => {
            if (ok) {
                setConnectedUsbPrinter(getSavedUsbPrinter());
            }
        });
    }, []);

    const handleConnectUsbPrinter = async () => {
        setIsUsbConnecting(true);
        try {
            const device = await scanAndConnectUsbPrinter();
            if (device) {
                setConnectedUsbPrinter(device);
                setPrinterForm((prev) => ({
                    ...prev,
                    connection_type: 'usb_direct',
                    usb_device_name: device.name,
                    usb_vendor_id: device.vendorId,
                    usb_product_id: device.productId,
                    usb_serial_number: device.serialNumber,
                    printer_name: device.name,
                }));
                showToast(`✓ Printer USB terhubung: ${device.name}`);
            }
        } catch (err: any) {
            showToast(`Gagal menyambungkan USB: ${err.message || 'Dibatalkan'}`);
        } finally {
            setIsUsbConnecting(false);
        }
    };

    const handleDisconnectUsbPrinter = () => {
        disconnectUsbPrinter();
        setConnectedUsbPrinter(null);
        setPrinterForm((prev) => ({
            ...prev,
            connection_type: 'system',
            usb_device_name: '',
        }));
        showToast('Koneksi printer USB diputuskan.');
    };

    // =========================================================================
    // BLUETOOTH PRINTER SCANNER & CONNECTION MANAGER (ANDROID APK & WEB BT)
    // =========================================================================
    const [isBtScannerModalOpen, setIsBtScannerModalOpen] = useState(false);
    const [btDevices, setBtDevices] = useState<BluetoothPrinterDevice[]>([]);
    const [connectedBtPrinter, setConnectedBtPrinter] =
        useState<BluetoothPrinterDevice | null>(() => getSavedBluetoothPrinter());
    const [isBtScanning, setIsBtScanning] = useState(false);
    const [connectingBtAddress, setConnectingBtAddress] = useState<string | null>(null);
    const [isBtPrinting, setIsBtPrinting] = useState(false);
    const [pendingBtReceipt, setPendingBtReceipt] = useState<ReceiptData | null>(null);
    const [btStatusMessage, setBtStatusMessage] = useState<string | null>(null);

    const refreshNativeBtDevices = () => {
        if (!isAndroidNativeBluetoothAvailable()) return;
        const list = getAndroidBluetoothDevices();
        setBtDevices(list);
        const saved = getSavedBluetoothPrinter();
        if (saved) {
            setConnectedBtPrinter(saved);
        }
    };

    useEffect(() => {
        const saved = getSavedBluetoothPrinter();
        if (saved) {
            setConnectedBtPrinter(saved);
        }

        const onDeviceFound = (e: Event) => {
            const detail = (e as CustomEvent).detail as BluetoothPrinterDevice;
            if (!detail || !detail.address) return;
            setBtDevices((prev) => {
                const existsIdx = prev.findIndex(
                    (d) => d.address.toLowerCase() === detail.address.toLowerCase(),
                );
                let next: BluetoothPrinterDevice[];
                if (existsIdx >= 0) {
                    next = [...prev];
                    next[existsIdx] = { ...next[existsIdx], ...detail };
                } else {
                    next = [...prev, detail];
                }
                return next.sort((a, b) => {
                    if (a.connected && !b.connected) return -1;
                    if (!a.connected && b.connected) return 1;
                    if (a.isPrinter && !b.isPrinter) return -1;
                    if (!a.isPrinter && b.isPrinter) return 1;
                    if (a.bonded && !b.bonded) return -1;
                    if (!a.bonded && b.bonded) return 1;
                    return (a.name || '').localeCompare(b.name || '');
                });
            });
        };

        const onDiscoveryState = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setIsBtScanning(Boolean(detail?.discovering));
        };

        const onBondChanged = () => {
            refreshNativeBtDevices();
        };

        const onPermissionChanged = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.granted) {
                refreshNativeBtDevices();
                startAndroidBluetoothScan();
            }
        };

        window.addEventListener('sanubari-bt-device-found', onDeviceFound);
        window.addEventListener('sanubari-bt-discovery-state', onDiscoveryState);
        window.addEventListener('sanubari-bt-bond-changed', onBondChanged);
        window.addEventListener('sanubari-bt-permission-changed', onPermissionChanged);

        return () => {
            window.removeEventListener('sanubari-bt-device-found', onDeviceFound);
            window.removeEventListener('sanubari-bt-discovery-state', onDiscoveryState);
            window.removeEventListener('sanubari-bt-bond-changed', onBondChanged);
            window.removeEventListener('sanubari-bt-permission-changed', onPermissionChanged);
        };
    }, []);

    const openBluetoothScannerModal = (receiptToPrint?: ReceiptData | null) => {
        setPendingBtReceipt(receiptToPrint || null);
        setBtStatusMessage(null);
        setIsBtScannerModalOpen(true);

        if (isAndroidNativeBluetoothAvailable()) {
            refreshNativeBtDevices();
            setIsBtScanning(true);
            startAndroidBluetoothScan();
        }
    };

    const closeBluetoothScannerModal = () => {
        if (isAndroidNativeBluetoothAvailable()) {
            stopAndroidBluetoothScan();
        }
        setIsBtScanning(false);
        setIsBtScannerModalOpen(false);
    };

    const handleStartBtScan = async () => {
        setBtStatusMessage(null);
        if (isAndroidNativeBluetoothAvailable()) {
            refreshNativeBtDevices();
            setIsBtScanning(true);
            startAndroidBluetoothScan();
            return;
        }

        if (isWebBluetoothAvailable()) {
            try {
                setIsBtScanning(true);
                setBtStatusMessage('Membuka pemindai Bluetooth browser...');
                const dev = await scanAndConnectWebBluetoothPrinter();
                setIsBtScanning(false);
                if (dev) {
                    setConnectedBtPrinter(dev);
                    setBtDevices((prev) => {
                        const filtered = prev.filter((d) => d.address !== dev.address);
                        return [dev, ...filtered];
                    });
                    setBtStatusMessage(`✓ Terhubung ke ${dev.name}`);
                    showToast(`✓ Printer Bluetooth terhubung: ${dev.name}`);
                    if (pendingBtReceipt) {
                        const receipt = pendingBtReceipt;
                        setPendingBtReceipt(null);
                        await executeDirectBtPrint(receipt, dev.address);
                        setIsBtScannerModalOpen(false);
                    }
                } else {
                    setBtStatusMessage('Pemindaian dibatalkan.');
                }
            } catch (err: any) {
                setIsBtScanning(false);
                setBtStatusMessage('Gagal menghubungkan Bluetooth: ' + (err?.message || 'Error'));
            }
        }
    };

    const executeDirectBtPrint = async (receipt: ReceiptData, targetAddr?: string) => {
        setIsBtPrinting(true);
        try {
            showToast('Mencetak struk ke printer Bluetooth...');
            const success = await printThermalBluetooth(receipt, printerForm, targetAddr);
            if (success) {
                showToast('✓ Struk berhasil dicetak ke printer Bluetooth!');
                return true;
            }
            return false;
        } finally {
            setIsBtPrinting(false);
        }
    };

    const handleConnectAndroidBtDevice = async (device: BluetoothPrinterDevice) => {
        setConnectingBtAddress(device.address);
        setBtStatusMessage(`Menghubungkan ke ${device.name}...`);
        try {
            const res = await connectAndroidBluetoothPrinter(device.address);
            setConnectingBtAddress(null);
            if (res.success) {
                const connectedDev: BluetoothPrinterDevice = {
                    ...device,
                    name: res.name || device.name,
                    address: res.address || device.address,
                    bonded: true,
                    connected: true,
                    source: 'android-native',
                };
                setConnectedBtPrinter(connectedDev);
                setBtDevices((prev) =>
                    prev.map((d) => ({
                        ...d,
                        connected: d.address.toLowerCase() === connectedDev.address.toLowerCase(),
                        bonded:
                            d.address.toLowerCase() === connectedDev.address.toLowerCase()
                                ? true
                                : d.bonded,
                    })),
                );
                setBtStatusMessage(`✓ Terhubung ke ${connectedDev.name}`);
                showToast(`✓ Terhubung ke printer ${connectedDev.name}`);

                if (pendingBtReceipt) {
                    const receipt = pendingBtReceipt;
                    setPendingBtReceipt(null);
                    try {
                        await executeDirectBtPrint(receipt, connectedDev.address);
                        closeBluetoothScannerModal();
                    } catch (printErr: any) {
                        setBtStatusMessage('Terhubung, namun gagal mencetak: ' + printErr.message);
                    }
                }
            } else {
                setBtStatusMessage(res.message);
            }
        } catch (err: any) {
            setConnectingBtAddress(null);
            setBtStatusMessage(err?.message || 'Gagal menghubungkan ke perangkat Bluetooth.');
        }
    };

    const handleDisconnectBtPrinter = () => {
        disconnectBluetoothPrinter();
        setConnectedBtPrinter(null);
        setBtDevices((prev) => prev.map((d) => ({ ...d, connected: false })));
        setBtStatusMessage('Koneksi printer Bluetooth telah diputuskan.');
        showToast('Koneksi printer Bluetooth diputuskan.');
    };

    // Bluetooth ESC/POS print handler
    const handleBluetoothPrint = async (receipt: ReceiptData) => {
        // 1. Native Android POS APK Mode
        if (isAndroidNativeBluetoothAvailable()) {
            const saved = connectedBtPrinter || getSavedBluetoothPrinter();
            if (!saved || !saved.address) {
                openBluetoothScannerModal(receipt);
                return;
            }

            try {
                await executeDirectBtPrint(receipt, saved.address);
            } catch (err: any) {
                setBtStatusMessage(err?.message || 'Koneksi printer terputus. Silakan pilih/hubungkan ulang printer.');
                openBluetoothScannerModal(receipt);
            }
            return;
        }

        // 2. Web Bluetooth Mode (Chrome Android / Desktop)
        if (isWebBluetoothAvailable()) {
            if (connectedBtPrinter && connectedBtPrinter.source === 'web-bluetooth') {
                try {
                    const ok = await executeDirectBtPrint(receipt);
                    if (ok) return;
                } catch {
                    // Fall back to opening modal
                }
            }
            openBluetoothScannerModal(receipt);
            return;
        }

        // 3. Fallback Mode (WebView without native bridge yet): open in-app Bluetooth manager modal
        openBluetoothScannerModal(receipt);
    };

    // Buat data sampel struk untuk pratinjau live di aplikasi POS
    const getSampleTestReceipt = (): ReceiptData => {
        return {
            store_name: printerForm.store_name || 'Kasir Sanubari',
            tagline: printerForm.tagline || 'Close to Your Every Brew',
            address:
                printerForm.address ||
                'Ruko Tlogomas Square Kav 34, Jl. Raya Tlogomas, Lowokwaru, Malang',
            phone: printerForm.phone || '+6285121930454',
            instagram: printerForm.instagram || '@kasir.sanubari',
            order_number:
                'TEST-' + (printerForm.paper_width === '80mm' ? '80' : '58'),
            date:
                new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                }) +
                ' ' +
                new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            cashier_name: cashier.name,
            customer_name: 'Pelanggan Kasir',
            items: [
                {
                    product_name: 'Flores Bajawa Washed Medium Dark',
                    variant_label: '200g - Biji Kopi',
                    price: 75000,
                    quantity: 1,
                    subtotal: 75000,
                },
                {
                    product_name: 'Drip Bag Coffee Blend Series',
                    variant_label: 'Box isi 5',
                    price: 45000,
                    quantity: 2,
                    subtotal: 90000,
                },
            ],
            subtotal: 165000,
            discount_amount: 15000,
            total_amount: 150000,
            payment_method_label: 'QRIS Kasir',
            cash_tendered: 0,
            cash_change: 0,
            footer_note:
                printerForm.receipt_footer ||
                'Terima kasih atas kunjungannya!\nFreshly Roasted with Heart.',
        };
    };

    // Buka Pratinjau Struk langsung di aplikasi POS (Bukan dari Chrome)
    const handlePreviewReceipt = (receiptToPreview?: ReceiptData) => {
        setCompletedReceipt(receiptToPreview || getSampleTestReceipt());
        setIsReceiptModalOpen(true);
    };

    // Jalankan Test Print thermal printer ke hardware fisik
    const handleRunTestPrint = async (method: 'web' | 'bluetooth' | 'usb_direct' = 'web') => {
        const testReceipt = getSampleTestReceipt();

        if (method === 'usb_direct') {
            setIsUsbTesting(true);
            try {
                const ok = await printThermalUsbDirect(testReceipt, printerForm);
                if (ok) {
                    showToast('✓ Tes cetak berhasil dikirim langsung ke printer USB!');
                }
            } catch (err: any) {
                showToast(`Gagal tes cetak USB: ${err.message || 'Error'}`);
            } finally {
                setIsUsbTesting(false);
            }
        } else if (method === 'web') {
            printThermalWeb(testReceipt, printerForm);
            showToast(`Mengirim tes cetak ke printer Windows: ${printerForm.printer_name || 'Default'}`);
        } else {
            handleBluetoothPrint(testReceipt);
        }
    };

    // Reset pengaturan printer ke default
    const handleResetPrinterDefaults = () => {
        if (
            confirm(
                'Kembalikan konfigurasi printer dan margin struk ke pengaturan standar (default)?',
            )
        ) {
            setPrinterForm(defaultPrinterSettings);
            showToast('Pengaturan printer dikembalikan ke default.');
        }
    };

    // Save Printer Settings
    const handleSavePrinterSettings = async () => {
        setIsSavingSettings(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    type: 'printer',
                    settings: printerForm,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data.message || 'Gagal menyimpan pengaturan printer',
                );
            showToast('Pengaturan printer berhasil disimpan');
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setIsSavingSettings(false);
        }
    };

    // Save Payment Settings
    const handleSavePaymentSettings = async () => {
        setIsSavingSettings(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    type: 'payment',
                    settings: paymentForm,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data.message || 'Gagal menyimpan pengaturan pembayaran',
                );
            showToast('Pengaturan pembayaran berhasil disimpan');
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setIsSavingSettings(false);
        }
    };

    // Add new staff member (Owner / Admin only)
    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setStaffFormError(null);

        if (!staffName.trim()) {
            setStaffFormError('Nama lengkap staf wajib diisi.');
            return;
        }
        if (!staffEmail.trim()) {
            setStaffFormError('Email login staf wajib diisi.');
            return;
        }
        if (!staffPassword || staffPassword.length < 6) {
            setStaffFormError('Password minimal 6 karakter.');
            return;
        }
        if (staffPassword !== staffPasswordConfirm) {
            setStaffFormError('Konfirmasi password tidak cocok.');
            return;
        }

        setIsAddingStaff(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    name: staffName.trim(),
                    email: staffEmail.trim(),
                    password: staffPassword,
                    role: staffRole,
                    phone: staffPhone.trim() || null,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menambahkan staf');
            }

            // Successfully added
            setStaff((prev) => [data.staff, ...prev]);
            setStaffName('');
            setStaffEmail('');
            setStaffPassword('');
            setStaffPasswordConfirm('');
            setStaffPhone('');
            setStaffRole('kasir');
            showToast(
                `Staf baru "${data.staff.name}" (${data.staff.role}) berhasil ditambahkan!`,
            );
        } catch (err: any) {
            setStaffFormError(
                err.message || 'Terjadi kesalahan saat menambahkan staf',
            );
        } finally {
            setIsAddingStaff(false);
        }
    };

    // Remove staff member (Owner / Admin only)
    const handleDeleteStaff = async (member: PosStaffMember) => {
        if (member.id === cashier.id) {
            alert('Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }
        if (member.id === 1) {
            alert('Akun Super Admin utama tidak dapat dihapus.');
            return;
        }
        if (
            !confirm(
                `Hapus akses staf "${member.name}" (${member.email})? Akun ini tidak akan dapat login ke POS lagi.`,
            )
        ) {
            return;
        }

        setDeletingStaffId(member.id);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch(`/pos/staff/${member.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal menghapus staf');
            }

            setStaff((prev) => prev.filter((s) => s.id !== member.id));
            showToast(`Akses staf "${member.name}" berhasil dihapus.`);
        } catch (err: any) {
            alert('Gagal menghapus staf: ' + err.message);
        } finally {
            setDeletingStaffId(null);
        }
    };

    // Submit Cash Flow Record
    const handleAddCashFlow = async (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(flowAmount) || 0;
        if (amt <= 0 || !flowDescription.trim()) {
            alert('Mohon isi nominal dan keterangan dengan benar');
            return;
        }

        setIsSavingCashFlow(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch('/pos/cash-flows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    type: flowType,
                    category: flowCategory,
                    amount: amt,
                    description: flowDescription.trim(),
                    date: flowTransactionDate,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success)
                throw new Error(data.message || 'Gagal mencatat arus kas');

            showToast('Catatan arus kas berhasil disimpan!');
            setFlowAmount('');
            setFlowDescription('');

            if (data.cash_drawer || data.summary) {
                setCashDrawer(data.cash_drawer || data.summary);
            }

            fetchCashFlows(cashFlowPeriod, cashFlowDate, cashFlowMonth);
        } catch (err: any) {
            alert('Gagal: ' + err.message);
        } finally {
            setIsSavingCashFlow(false);
        }
    };

    // Delete Cash Flow Record
    const handleDeleteCashFlow = async (id: number) => {
        if (!confirm('Hapus catatan arus kas ini?')) return;
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const res = await fetch(`/pos/cash-flows/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            const data = await res.json();
            if (!res.ok || !data.success)
                throw new Error(data.message || 'Gagal menghapus catatan');
            showToast('Catatan berhasil dihapus');
            if (data.cash_drawer || data.summary) {
                setCashDrawer(data.cash_drawer || data.summary);
            }
            fetchCashFlows(cashFlowPeriod, cashFlowDate);
        } catch (err: any) {
            alert('Gagal menghapus: ' + err.message);
        }
    };

    // Print Sales Report to Thermal Printer
    const handlePrintSalesReport = () => {
        if (!reportData) return;
        const rep: SalesReportData = {
            store_name: printerForm.store_name,
            period_title: reportData.period_title || 'Laporan Penjualan',
            printed_at: new Date().toLocaleString('id-ID'),
            cashier_name: reportData.active_staff_name || cashier.name,
            total_revenue: reportData.total_revenue || 0,
            total_transactions: reportData.total_transactions || 0,
            average_order_value: reportData.average_order_value || 0,
            payment_breakdown: reportData.payment_breakdown || [],
            cash_drawer: reportData.cash_drawer || {
                cash_sales: 0,
                cash_in: 0,
                cash_out: 0,
                net_cash: 0,
            },
            top_products: reportData.top_products || [],
        };
        printSalesReportThermalWeb(rep, printerForm.paper_width);
    };

    // --- MANUAL / CUSTOM ORDER HANDLERS ---
    const openManualOrderModal = (itemToEdit?: CartItem) => {
        if (itemToEdit) {
            setEditingManualCartItemId(itemToEdit.id);
            setManualProductName(itemToEdit.product_name);
            setManualCostPrice(itemToEdit.cost_price ?? '');
            setManualPrice(itemToEdit.price);
            setManualQuantity(itemToEdit.quantity);
            setManualVariantLabel(itemToEdit.variant_label || 'Manual');
            setManualNotes('');
        } else {
            setEditingManualCartItemId(null);
            setManualProductName('');
            setManualCostPrice('');
            setManualPrice('');
            setManualQuantity(1);
            setManualVariantLabel('Manual');
            setManualNotes('');
        }
        setIsManualOrderModalOpen(true);
    };

    const handleSaveManualItem = (e?: React.FormEvent, payDirectly = false) => {
        if (e) e.preventDefault();
        const trimmedName = manualProductName.trim();
        if (!trimmedName) {
            alert('Mohon masukkan nama produk');
            return;
        }

        const sellingPrice = Number(manualPrice) || 0;
        const hpp = Number(manualCostPrice) || 0;
        const qty = Math.max(1, Number(manualQuantity) || 1);

        if (sellingPrice < 0) {
            alert('Harga jual produk tidak boleh negatif');
            return;
        }

        if (editingManualCartItemId) {
            // Update existing cart item
            setCart((prev) =>
                prev.map((it) => {
                    if (it.id === editingManualCartItemId) {
                        return {
                            ...it,
                            product_name: trimmedName,
                            variant_label:
                                manualVariantLabel.trim() || 'Manual',
                            price: sellingPrice,
                            cost_price: hpp,
                            quantity: qty,
                        };
                    }
                    return it;
                }),
            );
            showToast(`Item manual "${trimmedName}" berhasil diperbarui!`);
        } else {
            // Add new cart item
            const newCartItem: CartItem = {
                id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                product_id: 0,
                variant_id: 0,
                product_name: trimmedName,
                variant_label: manualVariantLabel.trim() || 'Manual',
                price: sellingPrice,
                cost_price: hpp,
                quantity: qty,
                image: '/images/products/manual-order.svg',
                is_manual: true,
            };

            setCart((prev) => [...prev, newCartItem]);
            showToast(
                `Item manual "${trimmedName}" berhasil dimasukkan ke keranjang!`,
            );
        }

        setIsManualOrderModalOpen(false);

        if (payDirectly) {
            setTimeout(() => {
                openCheckout();
            }, 100);
        }
    };

    // --- HOLD / QUEUE ORDER HANDLERS ---
    const openHoldModal = () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong, pilih produk terlebih dahulu');
            return;
        }
        setHoldCustomerName(customerName.trim());
        setHoldCustomerPhone(customerPhone.trim());
        setHoldNotes('');
        setIsHoldModalOpen(true);
    };

    const handleConfirmHoldOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!holdCustomerName.trim()) {
            alert('Mohon isi nama pelanggan antrian');
            return;
        }
        setIsHoldingSubmit(true);
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            const payload = {
                customer_name: holdCustomerName.trim(),
                customer_phone: holdCustomerPhone.trim() || null,
                notes: holdNotes.trim() || null,
                items: cart.map((i) => ({
                    product_id: i.product_id,
                    product_name: i.product_name,
                    variant_id: i.variant_id,
                    variant_label: i.variant_label,
                    price: i.price,
                    quantity: i.quantity,
                    discount_type: i.discount_type,
                    discount_value: i.discount_value,
                    discount_amount: i.discount_amount || 0,
                    image: i.image,
                })),
                discount_amount: cartDiscountAmount,
                customer_address: isDeliveryOrder
                    ? customerAddress.trim()
                    : null,
                shipping_cost: numericShippingCost,
                shipping_courier:
                    isDeliveryOrder && shippingCourier.trim()
                        ? shippingCourier.trim()
                        : null,
            };
            const res = await fetch('/pos/queue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || 'Gagal menyimpan pesanan ke antrian',
                );
            }
            if (data.held_order) {
                setHeldOrdersList((prev) => [data.held_order, ...prev]);
            }
            // Clear active cart & customer info
            setCart([]);
            setCartDiscountValue(0);
            setCustomerName('');
            setCustomerPhone('');
            setIsDeliveryOrder(false);
            setShippingCost('');
            setShippingCourier('');
            setCustomerAddress('');
            clearCartStorage();
            setIsHoldModalOpen(false);
            showToast(
                `Pesanan antrian "${holdCustomerName.trim()}" berhasil disimpan!`,
            );
        } catch (err: any) {
            alert('Gagal: ' + err.message);
        } finally {
            setIsHoldingSubmit(false);
        }
    };

    const handleRestoreQueueOrder = (held: PosHeldOrderItem) => {
        if (cart.length > 0) {
            if (
                !confirm(
                    'Keranjang aktif saat ini ada isinya. Ganti isi keranjang kasir dengan pesanan antrian ini?',
                )
            ) {
                return;
            }
        }
        const restoredCart: CartItem[] = (held.items || []).map((it) => ({
            id: `${it.product_id}-${it.variant_id}`,
            product_id: it.product_id,
            product_name: it.product_name,
            variant_id: it.variant_id,
            variant_label: it.variant_label,
            price: it.price,
            quantity: it.quantity,
            discount_type: it.discount_type,
            discount_value: it.discount_value,
            discount_amount: it.discount_amount,
            image: it.image || '/brand/logo-circle.png',
        }));
        setCart(restoredCart);
        setCartDiscountValue(held.discount_amount || 0);
        setCustomerName(held.customer_name);
        setCustomerPhone(held.customer_phone || '');
        if (
            held.shipping_cost ||
            held.customer_address ||
            held.shipping_courier
        ) {
            setIsDeliveryOrder(true);
            setShippingCost(held.shipping_cost || '');
            setShippingCourier(held.shipping_courier || '');
            setCustomerAddress(held.customer_address || '');
        } else {
            setIsDeliveryOrder(false);
            setShippingCost('');
            setShippingCourier('');
            setCustomerAddress('');
        }

        handleDeleteQueueOrder(held.id, false);

        setActiveTab('cashier');
        showToast(
            `Pesanan antrian "${held.customer_name}" telah dimuat ke kasir!`,
        );
    };

    const handleDeleteQueueOrder = async (id: number, confirmPrompt = true) => {
        if (confirmPrompt && !confirm('Hapus pesanan dari antrian ini?'))
            return;
        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';
            await fetch(`/pos/queue/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            setHeldOrdersList((prev) => prev.filter((h) => h.id !== id));
            if (confirmPrompt) {
                showToast('Pesanan di antrian berhasil dihapus');
            }
        } catch (err) {
            console.error('Failed to delete queue order:', err);
        }
    };

    // --- SHARE PRE-BILL HANDLERS ---
    const openSharePreBillModal = () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong, pilih produk terlebih dahulu');
            return;
        }
        setSharePreBillCustomerName(customerName || '');
        setSharePreBillCustomerPhone(customerPhone || '');
        setSharePreBillNotes('');
        setIsPreBillCopied(false);
        setIsSharePreBillModalOpen(true);
    };

    const currentPreBillData: PreBillData = useMemo(() => {
        return {
            store_name: printerForm.store_name || 'Kasir Sanubari',
            tagline: printerForm.tagline,
            address: printerForm.address,
            phone: printerForm.phone,
            instagram: printerForm.instagram,
            cashier_name: cashier.name,
            customer_name:
                sharePreBillCustomerName.trim() ||
                customerName.trim() ||
                undefined,
            customer_phone:
                sharePreBillCustomerPhone.trim() ||
                customerPhone.trim() ||
                undefined,
            customer_address: isDeliveryOrder
                ? customerAddress.trim() || undefined
                : undefined,
            shipping_cost: numericShippingCost,
            shipping_courier:
                isDeliveryOrder && shippingCourier.trim()
                    ? shippingCourier.trim()
                    : undefined,
            date: new Date().toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            items: cart.map((item) => ({
                product_name: item.product_name,
                variant_label: item.variant_label,
                price: item.price,
                quantity: item.quantity,
                subtotal:
                    item.price * item.quantity - (item.discount_amount || 0),
                discount_amount: item.discount_amount,
            })),
            subtotal: subtotal,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            notes: sharePreBillNotes.trim() || undefined,
            bank_info: sharePreBillIncludeBank
                ? paymentForm.bank_info
                : undefined,
            qris_instructions: sharePreBillIncludeBank
                ? paymentForm.qris_instructions
                : undefined,
        };
    }, [
        cart,
        subtotal,
        discountAmount,
        totalAmount,
        printerForm,
        cashier,
        sharePreBillCustomerName,
        customerName,
        sharePreBillCustomerPhone,
        customerPhone,
        sharePreBillNotes,
        sharePreBillIncludeBank,
        paymentForm,
        isDeliveryOrder,
        customerAddress,
        numericShippingCost,
        shippingCourier,
    ]);

    const handleShareWhatsAppPreBill = () => {
        const waUrl = generatePreBillWhatsAppUrl(
            currentPreBillData,
            sharePreBillCustomerPhone,
        );
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        showToast('Membuka WhatsApp untuk mengirim struk...');
    };

    const handleDownloadA4InvoicePdf = () => {
        printA4InvoiceWeb(currentPreBillData);
        showToast('Mengunduh file PDF Invoice A4...');
    };

    const handleCopyPreBill = () => {
        const text = generatePreBillWhatsAppText(currentPreBillData);
        navigator.clipboard.writeText(text);
        setIsPreBillCopied(true);
        showToast('Teks pesan WhatsApp berhasil disalin ke clipboard!');
        setTimeout(() => setIsPreBillCopied(false), 2500);
    };

    const handlePrintPreBill = () => {
        if (
            isAndroidNativeBluetoothAvailable() &&
            !(connectedBtPrinter || getSavedBluetoothPrinter())
        ) {
            openBluetoothScannerModal();
            return;
        }
        printPreBillThermalWeb(currentPreBillData, printerForm.paper_width);
        if (isAndroidNativeBluetoothAvailable() && (connectedBtPrinter || getSavedBluetoothPrinter())) {
            showToast('✓ Mencetak struk estimasi ke printer Bluetooth...');
        }
    };

    // Helper to switch tab from sidebar
    const navigateToTab = (tab: PosActiveTab) => {
        if (tab === 'profit_loss' && !canAccessProfitLoss) {
            setActiveTab('cashier');
            setIsSidebarOpen(false);
            return;
        }
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

    return (
        <div
            className={`${isDark ? 'dark' : ''} flex w-full max-w-full flex-col overflow-x-clip bg-[#f4f6f6] font-sans text-stone-900 antialiased transition-colors select-none dark:bg-stone-950 dark:text-stone-100 ${
                activeTab === 'cashier'
                    ? 'min-h-[calc(100dvh+8px)] md:fixed md:inset-0 md:h-[100dvh] md:max-h-[100dvh] md:overflow-hidden'
                    : 'min-h-[calc(100dvh+8px)]'
            }`}
        >
            <Head title="Aplikasi POS Kasir — Sanubari Roastery" />

            {/* ========================================================================= */}
            {/* SLIDE-OUT SIDEBAR DRAWER (BERSIH HIJAU + PUTIH PERSIS REFERENSI USER)       */}
            {/* ========================================================================= */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex animate-in duration-200 fade-in">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 cursor-pointer bg-brand-950/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    {/* Left Slide Panel */}
                    <div className="relative z-10 flex h-full w-72 animate-in flex-col border-r border-stone-200 bg-white text-stone-800 shadow-2xl duration-200 slide-in-from-left sm:w-80 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
                        {/* Top Back Arrow Button */}
                        <div className="flex justify-end px-3 pt-3 pb-0">
                            <button
                                type="button"
                                onClick={() => setIsSidebarOpen(false)}
                                className="cursor-pointer rounded-xl p-1.5 text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                title="Tutup Menu"
                                aria-label="Tutup Menu"
                            >
                                <ArrowLeft className="h-6 w-6 stroke-[2.2]" />
                            </button>
                        </div>

                        {/* Centered Avatar & Cashier Name (Compact & Pulled Up) */}
                        <div className="-mt-2 flex flex-col items-center border-b border-stone-100 px-4 pb-3.5 dark:border-stone-800">
                            <div className="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 p-1.5 shadow-2xs dark:border-stone-700 dark:bg-stone-800">
                                <img
                                    src="/brand/logo-circle.png"
                                    alt="Kasir Sanubari"
                                    className="h-full w-full rounded-full object-contain"
                                />
                            </div>
                            <h2 className="text-center text-sm font-extrabold tracking-wide text-[#0284c7] uppercase dark:text-[#38bdf8]">
                                {cashier.name}
                            </h2>
                        </div>

                        {/* Vertical Menu Items List (Persis Urutan Screenshot Referensi) */}
                        <div className="flex-1 overflow-y-auto py-2">
                            {/* 1. Aplikasi Kasir */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('cashier')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'cashier'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Store className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Aplikasi Kasir</span>
                            </button>

                            {/* Order Manual (HPP + Harga Jual) */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSidebarOpen(false);
                                    setActiveTab('cashier');
                                    openManualOrderModal();
                                }}
                                className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60"
                            >
                                <PlusCircle className="h-5 w-5 shrink-0 stroke-[2.2] text-amber-600 dark:text-amber-400" />
                                <span>Order Manual</span>
                                <span className="ml-auto rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                    HPP + Jual
                                </span>
                            </button>

                            {/* Antrian Pesanan (Hold Orders) */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('queue')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'queue'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Clock className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Antrian Pesanan</span>
                                {heldOrdersList.length > 0 && (
                                    <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                                        {heldOrdersList.length}
                                    </span>
                                )}
                            </button>

                            {/* 2. Transaksi */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('transactions')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'transactions'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Calendar className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Transaksi</span>
                                {recentOrders.length > 0 && (
                                    <span className="ml-auto rounded-full bg-stone-200 px-2 py-0.5 text-xs font-bold text-stone-800 dark:bg-stone-700 dark:text-stone-200">
                                        {recentOrders.length}
                                    </span>
                                )}
                            </button>

                            {/* 3. Inventori */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('inventory')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'inventory'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Package className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Inventori</span>
                                <span className="ml-auto text-xs font-medium text-stone-400">
                                    {products.length} item
                                </span>
                            </button>

                            {/* Kategori Produk */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('settings');
                                    setSettingsSubTab('categories');
                                    setIsSidebarOpen(false);
                                }}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'settings' && settingsSubTab === 'categories'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Tag className="h-5 w-5 shrink-0 stroke-[2.2] text-brand-700 dark:text-brand-400" />
                                <span>Kategori Produk</span>
                                <span className="ml-auto text-xs font-medium text-stone-400">
                                    {categories.length} kategori
                                </span>
                            </button>

                            {/* Menu Cafe (Makanan & Minuman) */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('settings');
                                    setSettingsSubTab('menu');
                                    setIsSidebarOpen(false);
                                }}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'settings' && settingsSubTab === 'menu'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Coffee className="h-5 w-5 shrink-0 stroke-[2.2] text-amber-600 dark:text-amber-400" />
                                <span>Menu Cafe (Food & Drink)</span>
                                <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                    Baru
                                </span>
                            </button>

                            {/* 4. Kas Masuk-Keluar */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('cash_flow')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'cash_flow'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Banknote className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Kas Masuk-Keluar</span>
                            </button>

                            {/* 5. Laporan */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('reports')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'reports'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <TrendingUp className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Laporan Penjualan</span>
                            </button>

                            {/* Laporan Laba Rugi (Hanya Akun Owner & Admin) */}
                            {canAccessProfitLoss && (
                                <button
                                    type="button"
                                    onClick={() => navigateToTab('profit_loss')}
                                    className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                        activeTab === 'profit_loss'
                                            ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                            : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                    }`}
                                >
                                    <PieChart className="h-5 w-5 shrink-0 stroke-[2.2] text-emerald-600 dark:text-emerald-400" />
                                    <span>Laporan Laba Rugi</span>
                                </button>
                            )}

                            {/* 6. Pengaturan */}
                            <button
                                type="button"
                                onClick={() => navigateToTab('settings')}
                                className={`flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold transition ${
                                    activeTab === 'settings'
                                        ? 'bg-[#f0f2f5] font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                                        : 'text-stone-800 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60'
                                }`}
                            >
                                <Settings className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Pengaturan</span>
                            </button>

                            {/* 7. Mode Offline & Sinkronisasi Data */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSidebarOpen(false);
                                    setIsOfflineModalOpen(true);
                                }}
                                className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60"
                            >
                                <Cloud className="h-5 w-5 shrink-0 stroke-[2.2] text-stone-800 dark:text-stone-300" />
                                <span>Mode Offline & Sinkronisasi</span>
                                {offlineOrders.length > 0 ? (
                                    <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                                        {offlineOrders.length}
                                    </span>
                                ) : (
                                    <span
                                        className={`ml-auto text-[11px] font-bold ${
                                            isEffectiveOffline
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                        }`}
                                    >
                                        {isEffectiveOffline
                                            ? 'Offline'
                                            : 'Online'}
                                    </span>
                                )}
                            </button>

                            {/* 8. Khusus Owner: Kelola Staf POS */}
                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('settings');
                                        setSettingsSubTab('staff');
                                        setIsSidebarOpen(false);
                                    }}
                                    className="flex w-full cursor-pointer items-center gap-4 px-5 py-3.5 text-left text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/60"
                                >
                                    <Users className="h-5 w-5 shrink-0 stroke-[2.2] text-amber-600 dark:text-amber-400" />
                                    <span>Kelola Staf POS</span>
                                    <span className="ml-auto rounded border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-700 uppercase dark:text-amber-300">
                                        Owner
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Theme / Appearance Switcher: Terang / Gelap / Sistem */}
                        <div className="space-y-2 border-t border-stone-200 px-4 py-3 dark:border-stone-800">
                            <div className="flex items-center justify-between text-xs font-bold tracking-wider text-stone-500 uppercase dark:text-stone-400">
                                <span>Pilihan Mode</span>
                                <span className="text-[11px] font-bold text-brand-700 capitalize dark:text-emerald-400">
                                    {appearance === 'dark'
                                        ? 'Mode Gelap'
                                        : appearance === 'light'
                                          ? 'Mode Terang'
                                          : 'Sistem'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 text-xs font-semibold dark:bg-stone-800">
                                <button
                                    type="button"
                                    onClick={() => updateAppearance('light')}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                                        appearance === 'light'
                                            ? 'bg-white font-bold text-stone-900 shadow-xs dark:bg-stone-700 dark:text-stone-100'
                                            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                                    }`}
                                >
                                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Terang</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateAppearance('dark')}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                                        appearance === 'dark'
                                            ? 'bg-white font-bold text-stone-900 shadow-xs dark:bg-stone-700 dark:text-stone-100'
                                            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                                    }`}
                                >
                                    <Moon className="h-3.5 w-3.5 text-indigo-400" />
                                    <span>Gelap</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateAppearance('system')}
                                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                                        appearance === 'system'
                                            ? 'bg-white font-bold text-stone-900 shadow-xs dark:bg-stone-700 dark:text-stone-100'
                                            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                                    }`}
                                >
                                    <Monitor className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                                    <span>Sistem</span>
                                </button>
                            </div>
                        </div>

                        {/* Bottom Actions: Logout */}
                        <div className="space-y-1 border-t border-stone-200 px-2 py-1.5 dark:border-stone-800">
                            <Link
                                href="/pos/logout"
                                method="post"
                                as="button"
                                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            >
                                <LogOut className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                <span>Keluar / Ganti Akun</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOP APP HEADER WITH HAMBURGER MENU BUTTON (DEEP BRAND GREEN) --- */}
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-brand-900/60 bg-brand-950 px-3 text-white shadow-xs sm:px-4 md:static">
                <div className="flex items-center gap-3">
                    {/* Hamburger Button to Open Sidebar */}
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="-ml-1 flex cursor-pointer items-center justify-center rounded-xl border border-brand-800 bg-brand-900 p-2 text-white shadow-xs transition hover:bg-brand-800 active:scale-95"
                        title="Buka Menu Samping POS"
                        aria-label="Buka Menu Samping POS"
                    >
                        <Menu className="h-5 w-5 stroke-[2.3]" />
                    </button>

                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xs">
                            <img
                                src="/brand/logo-circle.png"
                                alt="Kasir Sanubari"
                                className="h-full w-full object-contain p-0.5"
                            />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold tracking-wide text-white">
                                KASIR SANUBARI
                            </h1>
                            <p className="flex max-w-[140px] items-center gap-1.5 truncate text-[11px] text-brand-300 sm:max-w-xs">
                                <span>
                                    Kasir:{' '}
                                    <span className="font-medium text-white">
                                        {cashier.name}
                                    </span>
                                </span>
                                {cashier.role && (
                                    <span className="rounded border border-brand-700/60 bg-brand-800 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-300 uppercase">
                                        {cashier.role}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Quick Controls */}
                <div className="flex items-center gap-2">
                    {/* Status Mode Offline / Online & Quick Sync */}
                    <button
                        type="button"
                        onClick={() => setIsOfflineModalOpen(true)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 sm:px-3 ${
                            manualOffline
                                ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                : !isOnline
                                  ? 'animate-pulse border border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                                  : offlineOrders.length > 0
                                    ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                    : 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                        title="Status Mode Offline / Online — Klik untuk Buka Sinkronisasi Data"
                    >
                        {isSyncing ? (
                            <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                                <span className="hidden md:inline">
                                    Sync...
                                </span>
                            </>
                        ) : manualOffline ? (
                            <>
                                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                                <span className="hidden md:inline">
                                    Mode Offline
                                </span>
                                {offlineOrders.length > 0 && (
                                    <span className="py-0.2 rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-stone-950">
                                        {offlineOrders.length}
                                    </span>
                                )}
                            </>
                        ) : !isOnline ? (
                            <>
                                <CloudOff className="h-3.5 w-3.5 text-rose-400" />
                                <span className="hidden md:inline">
                                    Offline
                                </span>
                                {offlineOrders.length > 0 && (
                                    <span className="py-0.2 rounded-full bg-rose-400 px-1.5 text-[10px] font-black text-white">
                                        {offlineOrders.length}
                                    </span>
                                )}
                            </>
                        ) : offlineOrders.length > 0 ? (
                            <>
                                <Cloud className="h-3.5 w-3.5 text-amber-400" />
                                <span className="hidden md:inline">
                                    Sync Pending
                                </span>
                                <span className="py-0.2 rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-stone-950">
                                    {offlineOrders.length}
                                </span>
                            </>
                        ) : (
                            <>
                                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="hidden md:inline">Online</span>
                            </>
                        )}
                    </button>

                    {/* Quick Queue Button (Hanya tampil saat berada di menu kasir / produk) */}
                    {activeTab === 'cashier' && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('queue')}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 ${
                                heldOrdersList.length > 0
                                    ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                    : 'border border-brand-800 bg-brand-900 text-brand-300 hover:bg-brand-800'
                            }`}
                            title="Daftar Antrian Pesanan Kasir"
                        >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Antrian</span>
                            {heldOrdersList.length > 0 && (
                                <span className="py-0.2 rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-stone-950">
                                    {heldOrdersList.length}
                                </span>
                            )}
                        </button>
                    )}

                    {activeTab !== 'cashier' && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('cashier')}
                            className="hidden cursor-pointer items-center gap-1.5 rounded-xl bg-brand-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-600 active:scale-95 sm:flex"
                        >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span>Ke Kasir</span>
                        </button>
                    )}

                    {/* Menu Lainnya (Titik Tiga) untuk Sinkronisasi / Reload Aplikasi */}
                    <div className="relative" ref={moreMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                            className="flex cursor-pointer items-center justify-center rounded-xl border border-brand-800 bg-brand-900 p-2 text-white shadow-xs transition hover:bg-brand-800 active:scale-95"
                            title="Menu Opsi POS / Sinkronisasi"
                            aria-label="Menu Opsi POS / Sinkronisasi"
                        >
                            <MoreVertical className="h-4 w-4 stroke-[2.2] sm:h-5 sm:w-5" />
                        </button>

                        {isMoreMenuOpen && (
                            <div className="absolute top-full right-0 z-50 mt-2 w-48 animate-in rounded-xl border border-stone-200 bg-white py-1.5 shadow-xl duration-100 zoom-in-95 fade-in sm:w-52 dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={handleSyncAndReload}
                                    disabled={isReloadingApp}
                                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50 sm:text-sm dark:text-stone-200 dark:hover:bg-stone-800"
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 text-stone-600 dark:text-stone-300 ${isReloadingApp ? 'animate-spin' : ''}`}
                                    />
                                    <span>
                                        {isReloadingApp
                                            ? 'Menyinkronkan...'
                                            : 'Sinkronisasi'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ========================================================================= */}
            {/* VIEW 1: APLIKASI KASIR (KATALOG & KERANJANG PENJUALAN RETAIL)               */}
            {/* ========================================================================= */}
            {activeTab === 'cashier' && (
                <div className="relative flex flex-1 md:min-h-0 md:overflow-hidden">
                    {/* === LEFT COLUMN: CATALOG & SEARCH === */}
                    <main className="flex min-w-0 flex-1 flex-col bg-[#f4f6f6] md:min-h-0 md:overflow-hidden dark:bg-stone-950">
                        {/* Search & Category Filter Header */}
                        <div className="sticky top-16 z-20 shrink-0 space-y-3 border-b border-stone-200/80 bg-white p-3 shadow-2xs sm:p-4 md:static dark:border-stone-800 dark:bg-stone-900">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Cari kopi, SKU, atau kategori... (Tekan F2)"
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pr-10 pl-10 text-sm text-stone-900 placeholder-stone-400 transition focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:bg-stone-800"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Category Selector Pills & Quick Layout Controls */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex min-w-0 flex-1 scrollbar-none touch-pan-x items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => openManualOrderModal()}
                                        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-bold whitespace-nowrap text-amber-800 shadow-2xs transition hover:bg-amber-100 active:scale-95 dark:border-amber-700/80 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900"
                                        title="Buat orderan / item manual dengan HPP dan harga jual custom (F3)"
                                    >
                                        <PlusCircle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                                        <span>+ Order Manual (F3)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategoryId('all')}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition ${
                                            selectedCategoryId === 'all'
                                                ? 'bg-brand-700 font-bold text-white shadow-xs'
                                                : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white'
                                        }`}
                                    >
                                        Semua Kopi ({products.length})
                                    </button>
                                    {posCategories.map((cat) => {
                                        const count = products.filter((p) =>
                                            Array.isArray(p.category_ids)
                                                ? p.category_ids.includes(cat.id)
                                                : ((p as any)?.category_id === cat.id),
                                        ).length;
                                        if (count === 0) return null;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedCategoryId(cat.id)
                                                }
                                                className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition ${
                                                    selectedCategoryId === cat.id
                                                        ? 'bg-brand-700 font-bold text-white shadow-xs'
                                                        : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white'
                                                }`}
                                            >
                                                {typeof cat.name === 'object' ? ((cat.name as any)?.id || (cat.name as any)?.en || '') : cat.name} ({count})
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Quick Layout Density & Column Toggle */}
                                <div className="relative shrink-0 pb-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsLayoutPopoverOpen(!isLayoutPopoverOpen)}
                                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-2xs transition ${
                                            isLayoutPopoverOpen
                                                ? 'border-brand-600 bg-brand-50 text-brand-900 dark:border-brand-500 dark:bg-stone-800 dark:text-brand-300'
                                                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                        }`}
                                        title="Atur Kepadatan Tampilan & Jumlah Kolom (Grid Density)"
                                    >
                                        <LayoutGrid className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                                        <span className="hidden sm:inline">
                                            {gridDensity === 'compact'
                                                ? 'Rapat'
                                                : gridDensity === 'comfortable'
                                                ? 'Lega'
                                                : 'Standar'}
                                            {gridColumns !== 'auto' ? ` (${gridColumns} Kolom)` : ''}
                                        </span>
                                        <ChevronDown className="h-3 w-3 opacity-60" />
                                    </button>

                                    {/* Quick Layout Dropdown Popover */}
                                    {isLayoutPopoverOpen && (
                                        <div className="absolute right-0 top-full z-40 mt-1.5 w-64 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs shadow-xl animate-in fade-in zoom-in-95 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
                                            <div className="flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
                                                <span className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-white">
                                                    <LayoutGrid className="h-3.5 w-3.5 text-brand-600 dark:text-amber-400" />
                                                    Tampilan & Kolom POS
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsLayoutPopoverOpen(false)}
                                                    className="cursor-pointer rounded p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>

                                            {/* Density Selection */}
                                            <div className="mt-2.5">
                                                <div className="mb-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                                                    Kepadatan Kartu (Density)
                                                </div>
                                                <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateGridDensity('compact')}
                                                        className={`cursor-pointer rounded-lg py-1.5 text-center text-[11px] font-bold transition ${
                                                            gridDensity === 'compact'
                                                                ? 'bg-brand-700 text-white shadow-2xs'
                                                                : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        Rapat
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateGridDensity('normal')}
                                                        className={`cursor-pointer rounded-lg py-1.5 text-center text-[11px] font-bold transition ${
                                                            gridDensity === 'normal'
                                                                ? 'bg-brand-700 text-white shadow-2xs'
                                                                : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        Standar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateGridDensity('comfortable')}
                                                        className={`cursor-pointer rounded-lg py-1.5 text-center text-[11px] font-bold transition ${
                                                            gridDensity === 'comfortable'
                                                                ? 'bg-brand-700 text-white shadow-2xs'
                                                                : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        Lega
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Columns Selection */}
                                            <div className="mt-3">
                                                <div className="mb-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                                                    Jumlah Kolom Produk
                                                </div>
                                                <div className="grid grid-cols-6 gap-1 rounded-xl bg-stone-100 p-1 text-center dark:bg-stone-800">
                                                    {(['auto', 2, 3, 4, 5, 6] as const).map((c) => (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => updateGridColumns(c as any)}
                                                            className={`cursor-pointer rounded-lg py-1.5 text-[11px] font-bold transition ${
                                                                gridColumns === c
                                                                    ? 'bg-brand-700 text-white shadow-2xs'
                                                                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                                                            }`}
                                                        >
                                                            {c === 'auto' ? 'Auto' : c}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Cards Grid */}
                        <div className="flex-1 touch-pan-y p-3 pb-28 sm:p-4 md:min-h-0 md:overflow-y-auto md:overscroll-y-contain md:pb-6">
                            {filteredProducts.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-stone-500 dark:text-stone-400">
                                    <Coffee className="mb-3 h-12 w-12 stroke-[1.2] text-stone-400 dark:text-stone-500" />
                                    <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                                        Tidak ada produk yang cocok
                                    </p>
                                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                        Coba kata kunci lain atau pilih kategori
                                        Semua
                                    </p>
                                </div>
                            ) : (
                                <div className={getCatalogGridClasses(gridDensity, gridColumns)}>
                                    {filteredProducts.map((product) => {
                                        const prodVariants = Array.isArray(product.variants) ? product.variants : [];
                                        const hasMultipleVariants =
                                            prodVariants.length > 1;
                                        const singleVariant =
                                            prodVariants.length === 1
                                                ? prodVariants[0]
                                                : null;

                                        return (
                                            <div
                                                key={product.id}
                                                onClick={() =>
                                                    handleProductClick(product)
                                                }
                                                className={`group relative flex touch-pan-y cursor-pointer flex-col rounded-xl border border-stone-200/90 bg-white text-left shadow-2xs transition-colors duration-150 hover:border-brand-600/70 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-brand-500 ${
                                                    gridDensity === 'compact'
                                                        ? 'p-1.5 sm:p-2'
                                                        : gridDensity === 'comfortable'
                                                        ? 'p-3 sm:p-3.5'
                                                        : 'p-2 sm:p-2.5'
                                                } ${
                                                    product.is_out_of_stock
                                                        ? 'cursor-not-allowed opacity-50 grayscale'
                                                        : 'active:scale-[0.98]'
                                                }`}
                                            >
                                                <div className={`relative aspect-square w-full overflow-hidden rounded-lg border border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800 ${
                                                    gridDensity === 'compact'
                                                        ? 'mb-1 sm:mb-1.5'
                                                        : gridDensity === 'comfortable'
                                                        ? 'mb-2 sm:mb-2.5 sm:rounded-xl'
                                                        : 'mb-1.5 sm:mb-2 sm:rounded-xl'
                                                }`}>
                                                    <img
                                                        src={
                                                            product.image ||
                                                            '/brand/logo-circle.png'
                                                        }
                                                        alt={product.name}
                                                        draggable={false}
                                                        decoding="async"
                                                        onError={(e) => {
                                                            const target =
                                                                e.currentTarget;
                                                            if (
                                                                !target.src.endsWith(
                                                                    '/brand/logo-circle.png',
                                                                )
                                                            ) {
                                                                target.src =
                                                                    '/brand/logo-circle.png';
                                                            }
                                                        }}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                    {product.slug === 'byob' || product.series === 'cybr' || product.series === 'custom-blend' ? (
                                                        <span className="py-0.2 absolute top-1 left-1 rounded-md border border-emerald-500 bg-emerald-950/95 px-1.5 text-[8px] font-black tracking-wider text-emerald-300 uppercase shadow-sm sm:top-1.5 sm:left-1.5 sm:px-2 sm:py-0.5 sm:text-[9px]">
                                                            🎨 Racik Blend
                                                        </span>
                                                    ) : (product.series_label || product.series) ? (
                                                        <span className="py-0.2 absolute top-1 left-1 rounded border border-brand-800 bg-brand-950/90 px-1.5 text-[8px] font-bold tracking-wider text-accent-copper-light uppercase sm:top-1.5 sm:left-1.5 sm:px-2 sm:py-0.5 sm:text-[9px]">
                                                            {product.series_label || product.series}
                                                        </span>
                                                    ) : null}
                                                    {product.is_out_of_stock ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-stone-900/80">
                                                            <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-rose-700 uppercase dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400">
                                                                Habis
                                                            </span>
                                                        </div>
                                                    ) : product.slug === 'byob' || product.series === 'cybr' || product.series === 'custom-blend' ? (
                                                        <div className="py-0.2 absolute right-1 bottom-1 rounded-md border border-emerald-300 bg-emerald-50/95 px-1.5 text-[9px] font-bold text-emerald-800 shadow-2xs sm:right-1.5 sm:bottom-1.5 dark:border-emerald-700 dark:bg-emerald-950/95 dark:text-emerald-300">
                                                            Custom Blend
                                                        </div>
                                                    ) : hasMultipleVariants ? (
                                                        <div className="py-0.2 absolute right-1 bottom-1 rounded-md border border-stone-200 bg-white/95 px-1.5 text-[9px] font-semibold text-stone-700 shadow-2xs sm:right-1.5 sm:bottom-1.5 dark:border-stone-700 dark:bg-stone-800/95 dark:text-stone-300">
                                                            {
                                                                product.variants
                                                                    .length
                                                            }{' '}
                                                            Varian
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div>
                                                        <h3 className={`line-clamp-2 font-bold text-stone-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-emerald-400 ${
                                                            gridDensity === 'compact'
                                                                ? 'min-h-[22px] text-[10px] leading-tight sm:min-h-[24px] sm:text-[11px]'
                                                                : gridDensity === 'comfortable'
                                                                ? 'min-h-[30px] text-xs leading-snug sm:min-h-[36px] sm:text-sm'
                                                                : 'min-h-[26px] text-[11px] leading-tight sm:min-h-[28px] sm:text-xs'
                                                        }`}>
                                                            {product.name}
                                                        </h3>
                                                    </div>

                                                    <div className="mt-1.5 flex items-center justify-between border-t border-stone-100 pt-1.5 dark:border-stone-800">
                                                        <div>
                                                            <div className={`leading-tight font-black text-brand-700 dark:text-emerald-400 ${
                                                                gridDensity === 'compact'
                                                                    ? 'text-[10px] sm:text-[11px]'
                                                                    : gridDensity === 'comfortable'
                                                                    ? 'text-xs sm:text-sm'
                                                                    : 'text-[11px] sm:text-xs'
                                                            }`}>
                                                                Rp{' '}
                                                                {hasMultipleVariants
                                                                    ? `${formatRp(
                                                                          product.min_price ||
                                                                              (product
                                                                                  .variants
                                                                                  ?.length
                                                                                  ? Math.min(
                                                                                        ...product.variants.map(
                                                                                            (
                                                                                                v: any,
                                                                                            ) =>
                                                                                                v.price,
                                                                                        ),
                                                                                    )
                                                                                  : 0),
                                                                      )}`
                                                                    : formatRp(
                                                                          singleVariant?.price ||
                                                                              product.min_price ||
                                                                              (product
                                                                                  .variants?.[0]
                                                                                  ?.price ??
                                                                                  0),
                                                                      )}
                                                            </div>
                                                            {hasMultipleVariants && (
                                                                <span className="block text-[9px] font-medium text-stone-500 dark:text-stone-400">
                                                                    s/d Rp{' '}
                                                                    {formatRp(
                                                                        product.max_price ||
                                                                            (product
                                                                                .variants
                                                                                ?.length
                                                                                ? Math.max(
                                                                                      ...product.variants.map(
                                                                                          (
                                                                                              v: any,
                                                                                          ) =>
                                                                                              v.price,
                                                                                      ),
                                                                                  )
                                                                                : product.min_price) ||
                                                                            0,
                                                                    )}
                                                                </span>
                                                            )}
                                                            {!hasMultipleVariants &&
                                                                singleVariant && (
                                                                    <span className="block text-[9px] font-medium text-stone-500 dark:text-stone-400">
                                                                        {
                                                                            singleVariant.label
                                                                        }
                                                                    </span>
                                                                )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                product.is_out_of_stock
                                                            }
                                                            className={`flex shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-700 shadow-2xs transition-colors group-hover:border-transparent group-hover:bg-brand-700 group-hover:text-white dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 ${
                                                                gridDensity === 'compact'
                                                                    ? 'h-5 w-5 sm:h-6 sm:w-6'
                                                                    : gridDensity === 'comfortable'
                                                                    ? 'h-7 w-7 sm:h-8 sm:w-8'
                                                                    : 'h-6 w-6 sm:h-7 sm:w-7'
                                                            }`}
                                                            aria-label="Tambah ke keranjang"
                                                        >
                                                            <Plus className={gridDensity === 'compact' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </main>

                    {/* === RIGHT COLUMN: CASHIER BILLING CART (Desktop & Tablet) === */}
                    <aside className="hidden w-96 shrink-0 flex-col border-l border-stone-200 bg-white shadow-xs md:flex lg:w-[420px] xl:w-[460px] dark:border-stone-800 dark:bg-stone-900">
                        {/* Cart Header */}
                        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/70 p-3.5 sm:p-4 dark:border-stone-800 dark:bg-stone-900/90">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 shrink-0 text-stone-800 dark:text-stone-200" />
                                <span className="text-sm font-bold text-stone-900 dark:text-white">
                                    ({totalItemsCount} item)
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {cart.length > 0 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={openSharePreBillModal}
                                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 active:scale-95 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900"
                                            title="Bagikan struk pesanan ini ke WhatsApp sebelum bayar (F6)"
                                        >
                                            <Share2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                            <span>Share WA</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={openHoldModal}
                                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 shadow-2xs transition hover:bg-amber-100 active:scale-95 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900"
                                            title="Simpan pesanan ini ke antrian (F7)"
                                        >
                                            <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                                            <span>Simpan Antrian</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Cart Items List */}
                        <div className="flex-1 touch-pan-y space-y-2.5 overflow-y-auto overscroll-y-contain bg-stone-50/30 p-3 sm:p-3.5 dark:bg-stone-950/40">
                            {cart.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-stone-500 dark:text-stone-400">
                                    <ShoppingCart className="mb-2.5 h-12 w-12 stroke-[1.2] text-stone-400 dark:text-stone-500" />
                                    <p className="text-sm font-bold text-stone-700 dark:text-stone-200">
                                        Keranjang Masih Kosong
                                    </p>
                                    <p className="mt-1 max-w-[220px] text-xs text-stone-500 dark:text-stone-400">
                                        Pilih produk di katalog atau klik tombol{' '}
                                        <strong>+ Manual</strong> untuk order
                                        custom
                                    </p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="dark:bg-stone-850 flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-white p-3 shadow-2xs transition hover:border-brand-300 sm:p-3.5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
                                    >
                                        {item.is_manual ? (
                                            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-300 bg-amber-500/10 text-amber-700 sm:h-16 sm:w-16 dark:border-amber-700/60 dark:bg-amber-400/10 dark:text-amber-400">
                                                <Calculator className="h-5 w-5 stroke-[2]" />
                                                <span className="mt-0.5 text-[9px] font-black tracking-wider uppercase">
                                                    Manual
                                                </span>
                                            </div>
                                        ) : (
                                            <img
                                                src={
                                                    item.image ||
                                                    '/brand/logo-circle.png'
                                                }
                                                alt={item.product_name}
                                                onError={(e) => {
                                                    const target =
                                                        e.currentTarget;
                                                    if (
                                                        !target.src.endsWith(
                                                            '/brand/logo-circle.png',
                                                        )
                                                    ) {
                                                        target.src =
                                                            '/brand/logo-circle.png';
                                                    }
                                                }}
                                                className="h-14 w-14 shrink-0 rounded-xl border border-stone-200 bg-stone-100 object-cover sm:h-16 sm:w-16 dark:border-stone-700 dark:bg-stone-800"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h4 className="truncate text-sm leading-snug font-bold text-stone-900 dark:text-white">
                                                    {item.product_name}
                                                </h4>
                                                {item.is_manual && (
                                                    <span className="py-0.2 rounded border border-amber-300 bg-amber-100 px-1.5 text-[10px] font-extrabold text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                                        Manual
                                                    </span>
                                                )}
                                                {item.id.startsWith('cybr-') && (
                                                    <span className="py-0.2 rounded border border-emerald-300 bg-emerald-100 px-1.5 text-[10px] font-extrabold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                        C.Y.B.R Blend
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                                                <span className="rounded-md border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand-800 dark:border-stone-700 dark:bg-stone-800 dark:text-amber-300">
                                                    {item.variant_label}
                                                </span>
                                                <span className="font-medium text-stone-500 dark:text-stone-400">
                                                    @ Rp {formatRp(item.price)}
                                                </span>
                                                {item.is_manual && (
                                                    <>
                                                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                                                            (HPP: Rp{' '}
                                                            {formatRp(
                                                                item.cost_price ||
                                                                    0,
                                                            )}
                                                            )
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openManualOrderModal(
                                                                    item,
                                                                )
                                                            }
                                                            className="ml-1 flex cursor-pointer items-center gap-0.5 text-[11px] font-bold text-brand-700 hover:underline dark:text-amber-400"
                                                        >
                                                            <Pencil className="h-2.5 w-2.5" />
                                                            <span>Edit</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {item.notes && (
                                                <div className="mt-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                                                    {item.notes}
                                                </div>
                                            )}

                                            {item.cost_price !== undefined && item.cost_price > 0 && !item.is_manual && (
                                                <div className="mt-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
                                                    HPP: Rp {formatRp(item.cost_price)} | Laba: +Rp {formatRp(item.price - item.cost_price)}
                                                </div>
                                            )}

                                            {item.is_manual && (
                                                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                    <span>
                                                        Laba Kotor: +Rp{' '}
                                                        {formatRp(
                                                            (item.price -
                                                                (item.cost_price ||
                                                                    0)) *
                                                                item.quantity,
                                                        )}
                                                    </span>
                                                    {item.price > 0 && (
                                                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                                                            (
                                                            {(
                                                                ((item.price -
                                                                    (item.cost_price ||
                                                                        0)) /
                                                                    item.price) *
                                                                100
                                                            ).toFixed(0)}
                                                            %)
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Item Pricing & Discount Badge */}
                                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                {item.discount_amount &&
                                                item.discount_amount > 0 ? (
                                                    <>
                                                        <span className="text-sm font-black text-brand-900 dark:text-emerald-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                item.price *
                                                                    item.quantity -
                                                                    item.discount_amount,
                                                            )}
                                                        </span>
                                                        <s className="text-xs font-normal text-stone-400 dark:text-stone-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                item.price *
                                                                    item.quantity,
                                                            )}
                                                        </s>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openItemDiscountModal(
                                                                    item,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-200 dark:hover:bg-emerald-900"
                                                            title="Ubah diskon item"
                                                        >
                                                            <span>
                                                                Diskon{' '}
                                                                {item.discount_type ===
                                                                'percent'
                                                                    ? `${item.discount_value}%`
                                                                    : ''}{' '}
                                                                (-Rp{' '}
                                                                {formatRp(
                                                                    item.discount_amount,
                                                                )}
                                                                )
                                                            </span>
                                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-300">
                                                                ✎
                                                            </span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-sm font-black text-brand-900 dark:text-emerald-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                item.price *
                                                                    item.quantity,
                                                            )}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openItemDiscountModal(
                                                                    item,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center gap-1 rounded border border-dashed border-stone-300 px-2 py-0.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-brand-800 dark:border-stone-600 dark:bg-stone-800/80 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                                                            title="Tambah diskon khusus untuk produk ini"
                                                        >
                                                            <Percent className="h-3 w-3 text-brand-600 dark:text-amber-400" />
                                                            <span>
                                                                + Diskon
                                                            </span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Qty Stepper */}
                                        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-900">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(item.id, -1)
                                                }
                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-200 hover:text-stone-950 active:scale-95 sm:h-8 sm:w-8 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                                                aria-label="Kurang satu"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-7 text-center text-sm font-black text-stone-900 dark:text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(item.id, 1)
                                                }
                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-200 hover:text-stone-950 active:scale-95 sm:h-8 sm:w-8 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                                                aria-label="Tambah satu"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Cart Footer Summary (Sticky Bottom on PC & Tablet - Persis Screenshot Referensi) */}
                        <div className="sticky bottom-0 z-10 shrink-0 space-y-3 border-t border-stone-200 bg-white p-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] dark:border-stone-800 dark:bg-stone-900">
                            {/* Pengiriman / Ongkos Kirim POS Section */}
                            <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-2.5 dark:border-stone-700/80 dark:bg-stone-800/60">
                                <div className="flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-stone-800 select-none dark:text-stone-200">
                                        <input
                                            type="checkbox"
                                            checked={isDeliveryOrder}
                                            onChange={(e) =>
                                                setIsDeliveryOrder(
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 cursor-pointer rounded text-brand-700 focus:ring-brand-500 dark:text-emerald-500"
                                        />
                                        <Truck className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                        <span>Kirim Pesanan (Ongkir)</span>
                                    </label>
                                    {isDeliveryOrder &&
                                        numericShippingCost > 0 && (
                                            <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                Rp{' '}
                                                {formatRp(numericShippingCost)}
                                            </span>
                                        )}
                                </div>

                                {isDeliveryOrder && (
                                    <div className="animate-in space-y-2 border-t border-stone-200 pt-1.5 fade-in dark:border-stone-700">
                                        <div>
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                                Nominal Ongkir (Rp):
                                            </label>
                                            <div className="relative mt-0.5">
                                                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-stone-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        shippingCost === ''
                                                            ? ''
                                                            : shippingCost
                                                    }
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value ===
                                                            ''
                                                                ? ''
                                                                : Math.max(
                                                                      0,
                                                                      parseFloat(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ) || 0,
                                                                  );
                                                        setShippingCost(val);
                                                    }}
                                                    placeholder="0"
                                                    className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pr-2.5 pl-8 text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                                Alamat Pengiriman:
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={customerAddress}
                                                onChange={(e) =>
                                                    setCustomerAddress(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Alamat lengkap tujuan kirim..."
                                                className="mt-0.5 w-full resize-none rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                                Kurir / Ekspedisi (Opsional):
                                            </label>
                                            <input
                                                type="text"
                                                value={shippingCourier}
                                                onChange={(e) =>
                                                    setShippingCourier(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="J&T / JNE / SiCepat / Lalamove / Grab..."
                                                className="mt-0.5 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5 text-xs sm:text-sm">
                                <div className="flex justify-between text-stone-600 dark:text-stone-300">
                                    <span className="font-medium text-stone-700 dark:text-stone-300">
                                        Subtotal
                                    </span>
                                    <span className="font-bold text-stone-900 dark:text-white">
                                        Rp {formatRp(grossSubtotal)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-stone-700 dark:text-stone-300">
                                            Diskon
                                        </span>
                                        {cartDiscountValue > 0 &&
                                            cartDiscountType === 'percent' && (
                                                <span className="py-0.2 rounded border border-emerald-200 bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                    {cartDiscountValue}%
                                                </span>
                                            )}
                                        <button
                                            type="button"
                                            onClick={openCartDiscountModal}
                                            className="cursor-pointer text-xs font-bold text-sky-600 hover:underline dark:text-sky-300"
                                            title="Atur Diskon Transaksi (Nominal / Persentase)"
                                        >
                                            [Ubah]
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-stone-900 dark:text-stone-200">
                                            -Rp {formatRp(discountAmount)}
                                        </span>
                                        {totalItemDiscounts > 0 &&
                                            cartDiscountAmount > 0 && (
                                                <div className="text-[10px] text-stone-400 dark:text-stone-400">
                                                    Item: -Rp{' '}
                                                    {formatRp(
                                                        totalItemDiscounts,
                                                    )}{' '}
                                                    | Trx: -Rp{' '}
                                                    {formatRp(
                                                        cartDiscountAmount,
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {isDeliveryOrder && numericShippingCost > 0 && (
                                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-stone-700 dark:text-stone-300">
                                                Ongkos Kirim
                                            </span>
                                            {shippingCourier && (
                                                <span className="py-0.2 rounded border border-blue-200 bg-blue-50 px-1.5 text-[10px] font-bold text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                    {shippingCourier}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-bold text-stone-900 dark:text-stone-200">
                                            Rp {formatRp(numericShippingCost)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-baseline justify-between border-t border-stone-200 pt-2 dark:border-stone-800">
                                    <span className="text-sm font-bold tracking-wide text-stone-900 uppercase dark:text-stone-200">
                                        TOTAL
                                    </span>
                                    <span className="text-2xl font-black text-stone-950 dark:text-emerald-400">
                                        Rp {formatRp(totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={cart.length === 0}
                                onClick={openCheckout}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#273a41] px-4 py-3.5 text-sm font-black tracking-wider text-white shadow-md transition-all hover:bg-[#1e2e34] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span>BAYAR (F4)</span>
                                <ChevronRight className="h-5 w-5 stroke-[2.8]" />
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW: ANTRIAN PESANAN (HOLD / QUEUE ORDERS)                               */}
            {/* ========================================================================= */}
            {activeTab === 'queue' && (
                <div className="mx-auto w-full max-w-5xl flex-1 space-y-5 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
                    <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-3 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <h2 className="text-lg font-bold text-brand-950 dark:text-white">
                                    Antrian Pesanan Kasir (Hold Orders)
                                </h2>
                                <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                    {heldOrdersList.length} Pesanan
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                                Daftar pesanan pelanggan yang ditahan/disimpan
                                sementara untuk dilanjutkan nanti
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActiveTab('cashier')}
                            className="flex cursor-pointer items-center gap-1.5 self-start rounded-xl bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 sm:self-auto"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Kembali ke Kasir</span>
                        </button>
                    </div>

                    {heldOrdersList.length === 0 ? (
                        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-xs dark:border-stone-800 dark:bg-stone-900">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                                <Clock className="h-8 w-8 stroke-[1.5]" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                                    Tidak Ada Pesanan di Antrian
                                </h3>
                                <p className="mx-auto mt-1 max-w-md text-xs text-stone-500 dark:text-stone-300">
                                    Saat kasir sedang melayani pelanggan yang
                                    ingin melihat-lihat produk lain atau
                                    mengambil barang tambahan, gunakan tombol{' '}
                                    <strong>"Simpan Antrian"</strong> di kasir
                                    agar pesanan tidak hilang.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveTab('cashier')}
                                className="mt-2 cursor-pointer rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-800"
                            >
                                Buka Aplikasi Kasir
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {heldOrdersList.map((held) => (
                                <div
                                    key={held.id}
                                    className="flex flex-col justify-between space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs transition hover:border-brand-300 sm:p-5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
                                >
                                    <div className="space-y-3">
                                        {/* Header Card */}
                                        <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5 dark:border-stone-800">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md bg-brand-900 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                                                        {held.queue_number ||
                                                            `Q-${held.id}`}
                                                    </span>
                                                    <span className="text-xs text-stone-400 dark:text-stone-300">
                                                        Disimpan jam{' '}
                                                        {held.held_at}
                                                    </span>
                                                </div>
                                                <h3 className="mt-1 flex items-center gap-1.5 text-base font-black text-brand-950 dark:text-white">
                                                    <User className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                                    <span>
                                                        {held.customer_name}
                                                    </span>
                                                </h3>
                                                {held.customer_phone && (
                                                    <p className="text-[11px] text-stone-500 dark:text-stone-300">
                                                        WA:{' '}
                                                        {held.customer_phone}
                                                    </p>
                                                )}
                                                {held.shipping_cost &&
                                                held.shipping_cost > 0 ? (
                                                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                                                        <Truck className="h-3.5 w-3.5" />
                                                        <span>
                                                            Ongkir: Rp{' '}
                                                            {formatRp(
                                                                held.shipping_cost,
                                                            )}
                                                        </span>
                                                        {held.shipping_courier && (
                                                            <span className="text-[10px] font-normal text-stone-500">
                                                                (
                                                                {
                                                                    held.shipping_courier
                                                                }
                                                                )
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : null}
                                                {held.customer_address && (
                                                    <p className="mt-0.5 flex items-start gap-1 text-[11px] text-stone-600 dark:text-stone-300">
                                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                                                        <span className="max-w-xs truncate">
                                                            {
                                                                held.customer_address
                                                            }
                                                        </span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <div className="text-base font-black text-brand-950 dark:text-emerald-400">
                                                    Rp{' '}
                                                    {formatRp(
                                                        held.total_amount,
                                                    )}
                                                </div>
                                                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                                    {held.items_count} item
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes if any */}
                                        {held.notes && (
                                            <div className="rounded-lg border border-amber-200/60 bg-amber-50/80 p-2 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-200">
                                                <span className="font-semibold">
                                                    Catatan:
                                                </span>{' '}
                                                {held.notes}
                                            </div>
                                        )}

                                        {/* Items preview */}
                                        <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                                            {(held.items || []).map(
                                                (it, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between rounded-lg bg-stone-50 px-2 py-1 text-xs dark:bg-stone-800"
                                                    >
                                                        <div className="truncate pr-2">
                                                            <span className="font-semibold text-stone-900 dark:text-white">
                                                                {it.quantity}x{' '}
                                                                {
                                                                    it.product_name
                                                                }
                                                            </span>
                                                            <span className="ml-1 text-[11px] text-stone-500 dark:text-stone-300">
                                                                (
                                                                {
                                                                    it.variant_label
                                                                }
                                                                )
                                                            </span>
                                                        </div>
                                                        <span className="shrink-0 font-bold text-stone-800 dark:text-stone-200">
                                                            Rp{' '}
                                                            {formatRp(
                                                                it.price *
                                                                    it.quantity,
                                                            )}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 border-t border-stone-100 pt-2 dark:border-stone-800">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteQueueOrder(held.id)
                                            }
                                            className="cursor-pointer rounded-xl border border-stone-200 p-2.5 text-stone-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                                            title="Batalkan dan hapus antrian ini"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRestoreQueueOrder(held)
                                            }
                                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            <span>Muat ke Kasir & Bayar</span>
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: TRANSAKSI (RIWAYAT TRANSAKSI POS DENGAN FILTER TANGGAL)            */}
            {/* ========================================================================= */}
            {activeTab === 'transactions' && (
                <div className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
                    {/* Header with Title and Filter Tabs */}
                    <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-3 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                                    <Calendar className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                                    <span>Riwayat Transaksi POS</span>
                                </h2>
                                {isStaffRestricted && (
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                                        Shift Anda: {cashier.name}
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                                {isStaffRestricted
                                    ? 'Daftar transaksi yang Anda proses pada sesi kasir ini'
                                    : 'Daftar transaksi dan cetak ulang struk kasir'}
                            </p>
                        </div>

                        {/* Filter Tabs: Hari Ini, Kemarin, Custom Tanggal & Status Filter */}
                        <div className="flex max-w-full flex-wrap items-center gap-2">
                            <div className="flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setHistoryFilter('today');
                                        fetchHistoryOrders(
                                            'today',
                                            historyStartDate,
                                            historyEndDate,
                                            historySearch,
                                        );
                                    }}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        historyFilter === 'today'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Hari Ini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setHistoryFilter('yesterday');
                                        fetchHistoryOrders(
                                            'yesterday',
                                            historyStartDate,
                                            historyEndDate,
                                            historySearch,
                                        );
                                    }}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        historyFilter === 'yesterday'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Kemarin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setHistoryFilter('custom');
                                        fetchHistoryOrders(
                                            'custom',
                                            historyStartDate,
                                            historyEndDate,
                                            historySearch,
                                        );
                                    }}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        historyFilter === 'custom'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Custom Tanggal
                                </button>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={() => setHistoryStatusFilter('all')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        historyStatusFilter === 'all'
                                            ? 'bg-stone-800 text-white shadow-xs dark:bg-stone-700'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Semua ({recentOrders.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHistoryStatusFilter('paid')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        historyStatusFilter === 'paid'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-emerald-600 dark:text-stone-300 dark:hover:text-emerald-400'
                                    }`}
                                >
                                    Lunas ({recentOrders.filter((o: PosRecentOrder) => o.payment_status !== 'refunded').length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHistoryStatusFilter('refunded')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        historyStatusFilter === 'refunded'
                                            ? 'bg-rose-600 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-rose-600 dark:text-stone-300 dark:hover:text-rose-400'
                                    }`}
                                >
                                    Di-refund ({recentOrders.filter((o: PosRecentOrder) => o.payment_status === 'refunded').length})
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    fetchHistoryOrders(
                                        historyFilter,
                                        historyStartDate,
                                        historyEndDate,
                                        historySearch,
                                    )
                                }
                                disabled={isLoadingHistory}
                                className="cursor-pointer rounded-xl border border-stone-200 bg-white p-2 text-stone-600 shadow-2xs transition hover:bg-stone-50 hover:text-brand-950 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                                title="Muat ulang riwayat transaksi"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isLoadingHistory ? 'animate-spin text-brand-700 dark:text-emerald-400' : ''}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Filter Detail, Search & Summary Row */}
                    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs shadow-xs sm:flex-row sm:items-center dark:border-stone-800 dark:bg-stone-900">
                        {historyFilter === 'custom' ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Dari:
                                </span>
                                <input
                                    type="date"
                                    value={historyStartDate}
                                    onChange={(e) =>
                                        setHistoryStartDate(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Sampai:
                                </span>
                                <input
                                    type="date"
                                    value={historyEndDate}
                                    onChange={(e) =>
                                        setHistoryEndDate(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        fetchHistoryOrders(
                                            'custom',
                                            historyStartDate,
                                            historyEndDate,
                                            historySearch,
                                        )
                                    }
                                    className="cursor-pointer rounded-xl bg-brand-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-800"
                                >
                                    Terapkan
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 font-medium text-stone-600 dark:text-stone-300">
                                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                                <span>
                                    Menampilkan transaksi:{' '}
                                    <strong className="text-stone-900 dark:text-white">
                                        {historyFilter === 'today'
                                            ? 'Hari Ini'
                                            : 'Kemarin'}
                                    </strong>
                                </span>
                            </div>
                        )}

                        {/* Search and Summary */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 sm:w-56">
                                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-stone-400" />
                                <input
                                    type="text"
                                    value={historySearch}
                                    onChange={(e) =>
                                        setHistorySearch(e.target.value)
                                    }
                                    placeholder="Cari nomor / pelanggan..."
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pr-3 pl-8 text-xs text-stone-900 placeholder-stone-400 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:placeholder-stone-400 dark:focus:bg-stone-700"
                                />
                            </div>
                            <div className="shrink-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-right font-bold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                                <span className="font-normal text-stone-500 dark:text-stone-400">
                                    {filteredOrders.length} Trx ·{' '}
                                </span>
                                <span className="font-black text-brand-900 dark:text-emerald-400">
                                    Rp {formatRp(historyTotalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="space-y-2">
                        {isLoadingHistory ? (
                            <div className="rounded-2xl border border-stone-200 bg-white p-8 py-12 text-center text-stone-500 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                                <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-brand-700 dark:text-emerald-400" />
                                <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                                    Memuat riwayat transaksi...
                                </p>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="rounded-2xl border border-stone-200 bg-white p-8 py-12 text-center text-stone-500 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                                <Clock className="mx-auto mb-2 h-10 w-10 text-stone-400 dark:text-stone-500" />
                                <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                                    {historyFilter === 'today'
                                        ? 'Belum ada transaksi hari ini'
                                        : historyFilter === 'yesterday'
                                          ? 'Tidak ada transaksi pada hari kemarin'
                                          : 'Tidak ada transaksi pada rentang tanggal yang dipilih'}
                                </p>
                                {historyFilter === 'today' && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHistoryFilter('yesterday');
                                            fetchHistoryOrders(
                                                'yesterday',
                                                historyStartDate,
                                                historyEndDate,
                                                historySearch,
                                            );
                                        }}
                                        className="mt-3 cursor-pointer rounded-xl bg-stone-100 px-3.5 py-1.5 text-xs font-bold text-stone-800 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                    >
                                        Lihat Transaksi Kemarin →
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredOrders.map((ord) => {
                            const isRefunded = ord.payment_status === 'refunded';
                            return (
                                <div
                                    key={ord.id}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 text-xs shadow-xs transition ${
                                        isRefunded
                                            ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20'
                                            : 'border-stone-200 bg-white hover:border-brand-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                    }`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-brand-950 dark:text-white">
                                                #{ord.order_number}
                                            </span>
                                            <span className="rounded-full border border-brand-100 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:border-stone-700 dark:bg-stone-800 dark:text-amber-300">
                                                {ord.payment_method_label}
                                            </span>
                                            {isRefunded ? (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-700 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                                                    <RotateCcw className="h-3 w-3" />
                                                    DI-REFUND
                                                </span>
                                            ) : (
                                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                    LUNAS
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-300">
                                            <span>
                                                {ord.created_at} ·{' '}
                                                {ord.items_count} item ·{' '}
                                                {ord.customer_name}
                                            </span>
                                            {ord.shipping_cost &&
                                            ord.shipping_cost > 0 ? (
                                                <span className="py-0.2 inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                    <Truck className="h-3 w-3" />
                                                    Ongkir: Rp{' '}
                                                    {formatRp(
                                                        ord.shipping_cost,
                                                    )}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`text-sm font-black ${
                                                    isRefunded
                                                        ? 'line-through text-stone-400 dark:text-stone-500'
                                                        : 'text-brand-700 dark:text-emerald-400'
                                                }`}
                                            >
                                                Rp {formatRp(ord.total_amount)}
                                            </div>
                                            {isRefunded && (
                                                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                                    (Refund: Rp {formatRp(ord.refund_amount || ord.total_amount)})
                                                </span>
                                            )}
                                        </div>
                                        {isRefunded && ord.refund_reason && (
                                            <div className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                                                Alasan: &ldquo;{ord.refund_reason}&rdquo;
                                                {ord.refunded_by_name ? ` · Oleh: ${ord.refunded_by_name}` : ''}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const rep: ReceiptData = {
                                                    store_name:
                                                        printerForm.store_name,
                                                    tagline: printerForm.tagline,
                                                    address: printerForm.address,
                                                    phone: printerForm.phone,
                                                    instagram:
                                                        printerForm.instagram,
                                                    order_number: ord.order_number,
                                                    date: ord.created_at,
                                                    cashier_name: cashier.name,
                                                    customer_name:
                                                        ord.customer_name,
                                                    customer_phone:
                                                        ord.customer_phone,
                                                    customer_address:
                                                        ord.customer_address,
                                                    shipping_cost:
                                                        ord.shipping_cost,
                                                    shipping_courier:
                                                        ord.shipping_courier,
                                                    items: ord.items,
                                                    subtotal: ord.subtotal,
                                                    discount_amount:
                                                        ord.payment_details
                                                            ?.discount_amount || 0,
                                                    total_amount: ord.total_amount,
                                                    payment_method_label:
                                                        ord.payment_method_label,
                                                    cash_tendered:
                                                        ord.payment_details
                                                            ?.cash_tendered,
                                                    cash_change:
                                                        ord.payment_details
                                                            ?.cash_change,
                                                    footer_note:
                                                        printerForm.receipt_footer,
                                                    is_refund: isRefunded,
                                                    refund_reason: ord.refund_reason,
                                                    refund_amount: ord.refund_amount || ord.total_amount,
                                                    refunded_at: ord.refunded_at,
                                                    refunded_by_name: ord.refunded_by_name,
                                                };
                                                setCompletedReceipt(rep);
                                                setIsReceiptModalOpen(true);
                                            }}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:border-brand-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                        >
                                            <Printer className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                            <span>{isRefunded ? 'Struk Refund' : 'Cetak Struk'}</span>
                                        </button>

                                        {!isRefunded && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenRefundModal(ord)}
                                                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100 hover:border-rose-300 transition dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
                                                title="Refund atau batalkan transaksi ini"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" />
                                                <span>Refund</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: INVENTORI (KATALOG & STOK PRODUK RETAIL)                           */}
            {/* ========================================================================= */}
            {activeTab === 'inventory' && (
                <div className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
                    <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-3 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                                <Package className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                                <span>Inventori & Stok Produk</span>
                            </h2>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                                Informasi stok real-time yang tersinkronisasi
                                dengan website
                            </p>
                        </div>

                        {/* Search & Stock Filter */}
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('settings');
                                    setSettingsSubTab('menu');
                                }}
                                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700"
                            >
                                <Coffee className="h-3.5 w-3.5" />
                                <span>+ Kelola Menu Cafe</span>
                            </button>
                            <input
                                type="text"
                                value={inventorySearch}
                                onChange={(e) =>
                                    setInventorySearch(e.target.value)
                                }
                                placeholder="Cari nama / SKU..."
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-900 outline-none focus:border-brand-600 sm:w-auto dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                            />
                            <select
                                value={inventoryFilter}
                                onChange={(e) =>
                                    setInventoryFilter(e.target.value as any)
                                }
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-900 outline-none focus:border-brand-600 sm:w-auto dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                            >
                                <option value="all">Semua Stok</option>
                                <option value="in_stock">Tersedia</option>
                                <option value="out_of_stock">Habis</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredInventory.map((p) => {
                            const variantRows =
                                Array.isArray(p.variants) &&
                                p.variants.length > 0
                                    ? p.variants
                                    : [
                                          {
                                              id: 0,
                                              label: 'Standar',
                                              price: Number(p.min_price) || 0,
                                              original_price: null,
                                              cost_price: 0,
                                              weight_grams: 0,
                                              sku: null,
                                              stock_status: p.stock_status,
                                          },
                                      ];

                            return (
                                <div
                                    key={p.id}
                                    className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-3.5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-900"
                                >
                                    {/* Product Header */}
                                    <div className="flex gap-3">
                                        <img
                                            src={
                                                p.image ||
                                                '/brand/logo-circle.png'
                                            }
                                            alt={p.name}
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                if (
                                                    !target.src.endsWith(
                                                        '/brand/logo-circle.png',
                                                    )
                                                ) {
                                                    target.src =
                                                        '/brand/logo-circle.png';
                                                }
                                            }}
                                            className="h-14 w-14 shrink-0 rounded-xl border border-stone-100 bg-stone-50 object-cover dark:border-stone-700 dark:bg-stone-800"
                                        />
                                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    {(p.series_label || p.series) && (
                                                        <span className="shrink-0 rounded border border-brand-800 bg-brand-950/90 px-1 py-0.2 text-[8px] font-bold tracking-wider text-accent-copper-light uppercase dark:border-stone-700 dark:bg-stone-800">
                                                            {p.series_label || p.series}
                                                        </span>
                                                    )}
                                                    <div
                                                        className="truncate font-bold text-stone-900 dark:text-white"
                                                        title={p.name}
                                                    >
                                                        {p.name}
                                                    </div>
                                                </div>
                                                <div className="mt-0.5 text-[11px] font-bold text-brand-700 dark:text-emerald-400">
                                                    Rp{' '}
                                                    {formatRp(
                                                        p.min_price ||
                                                            (p.variants?.length
                                                                ? Math.min(
                                                                      ...p.variants.map(
                                                                          (
                                                                              v: any,
                                                                          ) =>
                                                                              v.price,
                                                                      ),
                                                                  )
                                                                : 0),
                                                    )}{' '}
                                                    {(p.variants?.length || 0) >
                                                        1 &&
                                                        `s/d Rp ${formatRp(
                                                            p.max_price ||
                                                                (p.variants
                                                                    ?.length
                                                                    ? Math.max(
                                                                          ...p.variants.map(
                                                                              (
                                                                                  v: any,
                                                                              ) =>
                                                                                  v.price,
                                                                          ),
                                                                      )
                                                                    : p.min_price) ||
                                                                0,
                                                        )}`}
                                                </div>
                                            </div>
                                            <div className="mt-1.5 flex items-center justify-between">
                                                <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                                                    {p.variants?.length || 1}{' '}
                                                    Varian Kemasan
                                                </span>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                        p.is_out_of_stock
                                                            ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400'
                                                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    }`}
                                                >
                                                    {p.is_out_of_stock
                                                        ? 'Habis'
                                                        : 'Tersedia'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Per-Variant HPP & Harga Jual Breakdown Table */}
                                    <div className="mt-3 overflow-hidden rounded-xl border border-stone-100 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-950/60">
                                        <div className="grid grid-cols-12 border-b border-stone-200/70 bg-stone-100/80 px-2.5 py-1.5 text-[10px] font-bold tracking-wide text-stone-500 uppercase dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                                            <div className="col-span-4">
                                                Varian
                                            </div>
                                            <div className="col-span-4 text-right">
                                                HPP
                                            </div>
                                            <div className="col-span-4 text-right">
                                                Harga Jual
                                            </div>
                                        </div>
                                        <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
                                            {variantRows.map((v, vIdx) => {
                                                const hpp =
                                                    Number(v.cost_price) || 0;
                                                const sellPrice =
                                                    Number(v.price) || 0;
                                                const isVarOut =
                                                    v.stock_status ===
                                                        'out_of_stock' ||
                                                    p.is_out_of_stock;

                                                return (
                                                    <div
                                                        key={v.id || vIdx}
                                                        className="grid grid-cols-12 items-center px-2.5 py-1.5 text-[11px]"
                                                    >
                                                        <div className="col-span-4 flex items-center gap-1.5 pr-1 font-semibold text-stone-800 dark:text-stone-200">
                                                            <span
                                                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                                                    isVarOut
                                                                        ? 'bg-rose-500'
                                                                        : 'bg-emerald-500'
                                                                }`}
                                                                title={
                                                                    isVarOut
                                                                        ? 'Stok Habis'
                                                                        : 'Tersedia'
                                                                }
                                                            />
                                                            <span
                                                                className="truncate"
                                                                title={v.label}
                                                            >
                                                                {v.label}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-4 text-right font-medium text-amber-700 dark:text-amber-400">
                                                            Rp {formatRp(hpp)}
                                                        </div>
                                                        <div className="col-span-4 text-right font-bold text-brand-700 dark:text-emerald-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                sellPrice,
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 4: KAS MASUK-KELUAR (ARUS KAS LACI)                                  */}
            {/* ========================================================================= */}
            {activeTab === 'cash_flow' && (
                <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
                    {/* Header */}
                    <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-4 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                                <Wallet className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                                <span>
                                    Arus Kas Laci Kasir (Kas Masuk - Keluar)
                                </span>
                            </h2>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                                Pencatatan modal awal kasir, kas masuk, dan
                                pengeluaran operasional toko
                            </p>
                        </div>

                        {/* Filter Controls (Harian, Bulan Ini, Custom Bulan) */}
                        <div className="flex max-w-full flex-wrap items-center gap-2">
                            <div className="flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={() => setCashFlowPeriod('daily')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        cashFlowPeriod === 'daily'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Harian / Tanggal
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCashFlowPeriod('this_month')
                                    }
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        cashFlowPeriod === 'this_month'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Bulan Ini
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCashFlowPeriod('custom_month')
                                    }
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        cashFlowPeriod === 'custom_month'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Custom Bulan
                                </button>
                            </div>

                            {/* Date Picker if daily */}
                            {cashFlowPeriod === 'daily' && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <input
                                        type="date"
                                        value={cashFlowDate}
                                        onChange={(e) => {
                                            setCashFlowDate(e.target.value);
                                            setFlowTransactionDate(
                                                e.target.value,
                                            );
                                        }}
                                        className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 font-medium text-stone-900 shadow-2xs outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                    />
                                    {cashFlowDate !== getLocalDateString() && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today =
                                                    getLocalDateString();
                                                setCashFlowDate(today);
                                                setFlowTransactionDate(today);
                                            }}
                                            className="cursor-pointer rounded-xl border border-stone-200 bg-stone-100 px-2 py-1.5 text-[11px] font-bold text-stone-600 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                                            title="Tampilkan catatan kas hari ini"
                                        >
                                            Hari Ini
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Month Picker if custom_month */}
                            {cashFlowPeriod === 'custom_month' && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <input
                                        type="month"
                                        value={cashFlowMonth}
                                        onChange={(e) =>
                                            setCashFlowMonth(e.target.value)
                                        }
                                        className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 font-medium text-stone-900 shadow-2xs outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Period Banner Info */}
                    {cashDrawer.period_title && (
                        <div className="flex items-center justify-between px-1 text-xs text-stone-600 dark:text-stone-400">
                            <span className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                                <Calendar className="h-3.5 w-3.5 text-brand-700 dark:text-emerald-400" />
                                <span>
                                    Periode Arus Kas:{' '}
                                    <strong>{cashDrawer.period_title}</strong>
                                </span>
                            </span>
                            {isLoadingCashFlow && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-700 dark:text-emerald-400">
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    <span>Memperbarui...</span>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Cash Drawer Summary Cards */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                Penjualan Tunai
                            </span>
                            <div className="mt-1 text-lg font-bold text-stone-900 sm:text-xl dark:text-white">
                                Rp {formatRp(cashDrawer.cash_sales)}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-xs dark:border-emerald-900/60 dark:bg-stone-900">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                <ArrowDownLeft className="h-3.5 w-3.5" />
                                <span>Kas Masuk Lain (+)</span>
                            </span>
                            <div className="mt-1 text-lg font-bold text-emerald-600 sm:text-xl dark:text-emerald-400">
                                Rp {formatRp(cashDrawer.total_in)}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-rose-100 bg-white p-3.5 shadow-xs dark:border-rose-900/60 dark:bg-stone-900">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                <span>Kas Keluar Toko (-)</span>
                            </span>
                            <div className="mt-1 text-lg font-bold text-rose-600 sm:text-xl dark:text-rose-400">
                                Rp {formatRp(cashDrawer.total_out)}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-3.5 shadow-xs dark:border-stone-700 dark:bg-stone-900">
                            <span className="text-[11px] font-bold text-brand-800 dark:text-amber-300">
                                TOTAL SALDO LACI
                            </span>
                            <div className="mt-1 text-lg font-black text-brand-950 sm:text-xl dark:text-white">
                                Rp {formatRp(cashDrawer.net_cash)}
                            </div>
                        </div>
                    </div>

                    {/* Two Column: Form Input & List */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Form Input Kas Baru */}
                        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                            <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                Catat Arus Kas Baru
                            </h3>
                            <form
                                onSubmit={handleAddCashFlow}
                                className="space-y-3.5 text-xs"
                            >
                                <div>
                                    <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                        Jenis Arus Kas:
                                    </label>
                                    <div className="mt-1 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFlowType('in');
                                                if (
                                                    flowCategory !==
                                                        'modal_awal' &&
                                                    flowCategory !==
                                                        'pendapatan_lain'
                                                ) {
                                                    setFlowCategory(
                                                        'modal_awal',
                                                    );
                                                }
                                            }}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold transition ${
                                                flowType === 'in'
                                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            <ArrowDownLeft className="h-3.5 w-3.5" />
                                            <span>Kas Masuk</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFlowType('out');
                                                if (
                                                    flowCategory ===
                                                        'modal_awal' ||
                                                    flowCategory ===
                                                        'pendapatan_lain'
                                                ) {
                                                    setFlowCategory(
                                                        'operasional',
                                                    );
                                                }
                                            }}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold transition ${
                                                flowType === 'out'
                                                    ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                                                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                            <span>Kas Keluar</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                        Kategori:
                                    </label>
                                    <select
                                        value={flowCategory}
                                        onChange={(e) =>
                                            setFlowCategory(e.target.value)
                                        }
                                        className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                    >
                                        {flowType === 'in' ? (
                                            <>
                                                <option value="modal_awal">
                                                    Modal Awal Kasir
                                                </option>
                                                <option value="pendapatan_lain">
                                                    Pemasukan Lain-lain
                                                </option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="operasional">
                                                    Operasional Toko (Es Batu,
                                                    Gas, dll)
                                                </option>
                                                <option value="bahan_baku">
                                                    Bahan Baku & Kemasan
                                                </option>
                                                <option value="kebersihan">
                                                    Kebersihan & Perlengkapan
                                                </option>
                                                <option value="transport">
                                                    Transport / Kurir
                                                </option>
                                                <option value="gaji">
                                                    Upah & Gaji Kasir/Barista
                                                </option>
                                                <option value="lainnya">
                                                    Pengeluaran Lainnya
                                                </option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                            Nominal (Rp):
                                        </label>
                                        {flowAmount !== '' && (
                                            <span className="text-[11px] font-bold text-brand-700 dark:text-emerald-400">
                                                Rp{' '}
                                                {formatRp(
                                                    Number(flowAmount) || 0,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        value={
                                            flowAmount === '' ? '' : flowAmount
                                        }
                                        onChange={(e) =>
                                            setFlowAmount(
                                                e.target.value === ''
                                                    ? ''
                                                    : parseFloat(
                                                          e.target.value,
                                                      ),
                                            )
                                        }
                                        placeholder="Contoh: 50000"
                                        className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-sm font-bold text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        required
                                    />
                                    {/* Quick Preset Nominal Buttons */}
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {[
                                            10000, 20000, 50000, 100000, 125000,
                                            200000, 500000,
                                        ].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() =>
                                                    setFlowAmount(preset)
                                                }
                                                className={`cursor-pointer rounded-lg border px-2 py-1 text-[10px] font-semibold transition ${
                                                    flowAmount === preset
                                                        ? 'border-brand-700 bg-brand-700 text-white'
                                                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-brand-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                                }`}
                                            >
                                                {formatRp(preset)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                        Tanggal Transaksi:
                                    </label>
                                    <input
                                        type="date"
                                        value={flowTransactionDate}
                                        onChange={(e) =>
                                            setFlowTransactionDate(
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2 text-xs font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                        Keterangan / Keperluan:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={flowDescription}
                                        onChange={(e) =>
                                            setFlowDescription(e.target.value)
                                        }
                                        placeholder="Contoh: Beli es batu kristal 2 kantong"
                                        className="mt-1 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSavingCashFlow}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 py-2.5 font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 disabled:opacity-50"
                                >
                                    {isSavingCashFlow ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            <span>
                                                Menyimpan Catatan Kas...
                                            </span>
                                        </>
                                    ) : (
                                        <span>+ Simpan Catatan Kas</span>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* List Arus Kas */}
                        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs lg:col-span-2 dark:border-stone-800 dark:bg-stone-900">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                    Riwayat Arus Kas ({cashFlowsList.length}{' '}
                                    Catatan)
                                </h3>
                                {cashDrawer.period_title && (
                                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                        {cashDrawer.period_title}
                                    </span>
                                )}
                            </div>

                            {isLoadingCashFlow ? (
                                <p className="py-6 text-center text-xs text-stone-400">
                                    Memuat catatan...
                                </p>
                            ) : cashFlowsList.length === 0 ? (
                                <div className="py-8 text-center text-xs text-stone-500 dark:text-stone-400">
                                    <Wallet className="mx-auto mb-2 h-8 w-8 text-stone-400 dark:text-stone-500" />
                                    <span>
                                        Belum ada catatan kas masuk/keluar untuk
                                        periode ini
                                    </span>
                                </div>
                            ) : (
                                <div className="max-h-96 space-y-2 overflow-y-auto">
                                    {cashFlowsList.map((f) => (
                                        <div
                                            key={f.id}
                                            className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50 p-3 text-xs dark:border-stone-700 dark:bg-stone-800"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                                        f.type === 'in'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-rose-100 text-rose-700'
                                                    }`}
                                                >
                                                    {f.type === 'in' ? (
                                                        <ArrowDownLeft className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-stone-900 dark:text-white">
                                                        {f.description}
                                                    </div>
                                                    <div className="text-[10px] text-stone-500 dark:text-stone-300">
                                                        {f.category_label} · Jam{' '}
                                                        {f.recorded_at} · Oleh{' '}
                                                        {f.user_name}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`text-sm font-black ${
                                                        f.type === 'in'
                                                            ? 'text-emerald-700 dark:text-emerald-400'
                                                            : 'text-rose-700 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {f.type === 'in'
                                                        ? '+'
                                                        : '-'}
                                                    Rp {formatRp(f.amount)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteCashFlow(
                                                            f.id,
                                                        )
                                                    }
                                                    className="cursor-pointer rounded-lg p-1.5 text-stone-400 transition hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
                                                    title="Hapus catatan"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 5: LAPORAN PENJUALAN                                                 */}
            {/* ========================================================================= */}
            {activeTab === 'reports' && (
                <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
                    {/* Header & Filter Controls */}
                    <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-4 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                                    <BarChart3 className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                                    <span>Laporan Penjualan POS</span>
                                </h2>
                                {canAccessProfitLoss && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigateToTab('profit_loss')
                                        }
                                        className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                                    >
                                        <PieChart className="h-3.5 w-3.5" />
                                        <span>Laporan Laba Rugi</span>
                                    </button>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                                Rekap omset, jumlah transaksi, dan arus kas
                                kasir
                            </p>
                        </div>

                        {/* Filter Buttons & Thermal Print Report */}
                        <div className="flex max-w-full flex-wrap items-center gap-2">
                            <div className="flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={() => setReportPeriod('daily')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        reportPeriod === 'daily'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Harian
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReportPeriod('monthly')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        reportPeriod === 'monthly'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Bulanan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReportPeriod('custom')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        reportPeriod === 'custom'
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Kustom
                                </button>
                            </div>

                            {reportData && (
                                <button
                                    type="button"
                                    onClick={handlePrintSalesReport}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:border-brand-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                    title="Cetak struk ringkasan ke printer thermal (X-Report / Z-Report)"
                                >
                                    <Printer className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                    <span>Cetak Struk Laporan</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Date Pickers */}
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-900">
                        {reportPeriod === 'daily' && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Pilih Tanggal:
                                </span>
                                <input
                                    type="date"
                                    value={reportDate}
                                    onChange={(e) =>
                                        setReportDate(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                            </div>
                        )}

                        {reportPeriod === 'monthly' && (
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Pilih Bulan:
                                </span>
                                <input
                                    type="month"
                                    value={reportMonth}
                                    onChange={(e) =>
                                        setReportMonth(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                            </div>
                        )}

                        {reportPeriod === 'custom' && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Dari:
                                </span>
                                <input
                                    type="date"
                                    value={reportStartDate}
                                    onChange={(e) =>
                                        setReportStartDate(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Sampai:
                                </span>
                                <input
                                    type="date"
                                    value={reportEndDate}
                                    onChange={(e) =>
                                        setReportEndDate(e.target.value)
                                    }
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                />
                            </div>
                        )}

                        {/* Filter Staf Kasir (Hanya Owner/Admin yang bisa memilih, Staf Kasir terkunci ke dirinya sendiri) */}
                        {isStaffRestricted ? (
                            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>
                                    Laporan Kasir: <span className="underline">{cashier.name}</span>
                                </span>
                                <span className="text-[10px] font-normal text-emerald-700/80 dark:text-emerald-300/80">
                                    (Penjualan shift Anda sendiri)
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-stone-500 dark:text-stone-300">
                                    Staf Kasir:
                                </span>
                                <select
                                    value={reportStaffId}
                                    onChange={(e) => setReportStaffId(e.target.value)}
                                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-bold text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                >
                                    <option value="all">Semua Staf Kasir (Total Keseluruhan)</option>
                                    {(reportData?.staff_options || staff || []).map((s: any) => (
                                        <option key={s.id} value={String(s.id)}>
                                            {s.name} ({s.role || 'kasir'})
                                        </option>
                                    ))}
                                </select>
                                {reportStaffId !== 'all' && (
                                    <button
                                        type="button"
                                        onClick={() => setReportStaffId('all')}
                                        className="text-[11px] font-bold text-brand-700 hover:underline dark:text-emerald-400"
                                    >
                                        ✕ Reset ke Semua Staf
                                    </button>
                                )}
                            </div>
                        )}

                        <span className="ml-auto text-stone-500 dark:text-stone-300">
                            Periode:{' '}
                            <strong className="font-bold text-brand-950 dark:text-emerald-400">
                                {reportData?.period_title || '...'}
                            </strong>
                        </span>
                    </div>

                    {isLoadingReport ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
                            <span className="text-sm font-medium">
                                Memuat data laporan penjualan...
                            </span>
                        </div>
                    ) : reportData ? (
                        <div className="space-y-6">
                            {/* KPI Metrics Cards */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-300">
                                        <span>Total Omset Penjualan</span>
                                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-brand-950 dark:text-emerald-400">
                                        Rp{' '}
                                        {formatRp(
                                            reportData?.total_revenue ?? 0,
                                        )}
                                    </div>
                                    <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Dari{' '}
                                        {reportData?.total_transactions ?? 0}{' '}
                                        transaksi selesai
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-300">
                                        <span>Jumlah Transaksi</span>
                                        <Receipt className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-brand-950 dark:text-white">
                                        {reportData?.total_transactions ?? 0}{' '}
                                        Trx
                                    </div>
                                    <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Rata-rata: Rp{' '}
                                        {formatRp(
                                            reportData?.average_order_value ??
                                                0,
                                        )}{' '}
                                        / trx
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-300">
                                        <span>Total Penjualan Tunai</span>
                                        <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-brand-950 dark:text-emerald-400">
                                        Rp{' '}
                                        {formatRp(
                                            reportData?.cash_drawer
                                                ?.cash_sales ?? 0,
                                        )}
                                    </div>
                                    <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Uang fisik masuk kasir
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-300">
                                        <span>Estimasi Kas di Laci</span>
                                        <Wallet className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                    </div>
                                    <div className="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">
                                        Rp{' '}
                                        {formatRp(
                                            reportData?.cash_drawer?.net_cash ??
                                                0,
                                        )}
                                    </div>
                                    <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Penjualan tunai + Kas masuk - Kas keluar
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: REKAP PENJUALAN PER STAF / KASIR (HANYA MUNCUL JIKA OWNER/ADMIN & MEMILIH SEMUA STAF) */}
                            {!isStaffRestricted && (reportData?.staff_breakdown || []).length > 0 && reportStaffId === 'all' && (
                                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5 dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-800 dark:bg-stone-800 dark:text-amber-300">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                                    Rekap Penjualan per Staf Kasir
                                                </h3>
                                                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                    Rincian kontribusi omset, transaksi, dan arus kas per masing-masing staf kasir
                                                </p>
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                            {reportData.staff_breakdown.length} Staf Aktif Berjualan
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-stone-200 text-stone-500 dark:border-stone-800 dark:text-stone-400">
                                                    <th className="py-2.5 font-bold">Nama Staf</th>
                                                    <th className="py-2.5 font-bold">Role</th>
                                                    <th className="py-2.5 text-center font-bold">Total Trx</th>
                                                    <th className="py-2.5 text-right font-bold">Uang Tunai (Cash)</th>
                                                    <th className="py-2.5 text-right font-bold">Non-Tunai (QRIS/EDC)</th>
                                                    <th className="py-2.5 text-right font-bold">Total Omset</th>
                                                    <th className="py-2.5 text-center font-bold">Kontribusi</th>
                                                    <th className="py-2.5 text-right font-bold">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                                                {reportData.staff_breakdown.map((st: any) => (
                                                    <tr key={st.staff_id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40">
                                                        <td className="py-3 font-bold text-stone-900 dark:text-white">
                                                            {st.name}
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold capitalize ${
                                                                st.role === 'owner'
                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                                                    : st.role === 'admin'
                                                                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                                                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            }`}>
                                                                {st.role || 'kasir'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-center font-bold text-stone-700 dark:text-stone-300">
                                                            {st.total_transactions} Trx
                                                        </td>
                                                        <td className="py-3 text-right text-stone-700 dark:text-stone-300">
                                                            Rp {formatRp(st.cash_sales)}
                                                        </td>
                                                        <td className="py-3 text-right text-stone-700 dark:text-stone-300">
                                                            Rp {formatRp(st.non_cash_sales)}
                                                        </td>
                                                        <td className="py-3 text-right font-black text-brand-950 dark:text-emerald-400">
                                                            Rp {formatRp(st.total_revenue)}
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                                                                {st.percentage}%
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => setReportStaffId(st.staff_id)}
                                                                className="cursor-pointer rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-brand-700 transition hover:bg-brand-700 hover:text-white dark:bg-stone-800 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white"
                                                            >
                                                                Filter Staf Ini →
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Two Column Section */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5 dark:border-stone-800 dark:bg-stone-900">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-brand-950 dark:text-white">
                                        <CreditCard className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                        <span>
                                            Rincian per Metode Pembayaran
                                        </span>
                                    </h3>
                                    <div className="space-y-2 pt-1">
                                        {(
                                            reportData?.payment_breakdown || []
                                        ).map((pm: any) => (
                                            <div
                                                key={pm.method}
                                                className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50 p-3 text-xs dark:border-stone-700 dark:bg-stone-800"
                                            >
                                                <div>
                                                    <span className="font-bold text-stone-900 dark:text-white">
                                                        {pm.label}
                                                    </span>
                                                    <span className="ml-2 text-[11px] text-stone-500 dark:text-stone-300">
                                                        ({pm.count} transaksi)
                                                    </span>
                                                </div>
                                                <span className="font-black text-brand-900 dark:text-emerald-400">
                                                    Rp {formatRp(pm.total)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5 dark:border-stone-800 dark:bg-stone-900">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-brand-950 dark:text-white">
                                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <span>Produk & Varian Terlaris</span>
                                    </h3>
                                    <div className="max-h-72 touch-pan-y space-y-2 overflow-y-auto overscroll-y-contain pt-1">
                                        {(reportData?.top_products || [])
                                            .length === 0 ? (
                                            <p className="py-4 text-center text-xs text-stone-400 dark:text-stone-400">
                                                Belum ada data penjualan pada
                                                periode ini
                                            </p>
                                        ) : (
                                            (
                                                reportData?.top_products || []
                                            ).map((tp: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50 p-2.5 text-xs dark:border-stone-700 dark:bg-stone-800"
                                                >
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-800 dark:bg-stone-700 dark:text-amber-300">
                                                            {idx + 1}
                                                        </span>
                                                        <div className="truncate">
                                                            <div className="truncate font-bold text-stone-900 dark:text-white">
                                                                {tp.name}
                                                            </div>
                                                            <div className="text-[10px] text-stone-500 dark:text-stone-300">
                                                                {tp.variant}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <div className="font-bold text-brand-950 dark:text-white">
                                                            {tp.quantity} pcs
                                                        </div>
                                                        <div className="text-[10px] font-bold text-brand-700 dark:text-emerald-400">
                                                            Rp{' '}
                                                            {formatRp(tp.total)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500 shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-stone-400 dark:text-stone-400" />
                            <p className="font-bold text-stone-700 dark:text-stone-200">
                                Tidak ada data laporan yang dapat dimuat
                            </p>
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-300">
                                Silakan coba ganti filter tanggal atau muat
                                ulang.
                            </p>
                            <button
                                type="button"
                                onClick={() => fetchSalesReport()}
                                className="mt-4 cursor-pointer rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-800"
                            >
                                Muat Ulang Laporan
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 5B: LAPORAN LABA RUGI (HANYA OWNER & ADMIN)                         */}
            {/* ========================================================================= */}
            {activeTab === 'profit_loss' && canAccessProfitLoss && (
                <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 overflow-y-auto bg-[#f4f6f6] p-4 sm:p-6 dark:bg-stone-950">
                    {/* Header & Filter Controls */}
                    <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-4 sm:flex-row sm:items-center dark:border-stone-800">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="flex items-center gap-2 text-lg font-bold text-brand-950 dark:text-white">
                                    <PieChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Laporan Laba Rugi (P&L)</span>
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => navigateToTab('reports')}
                                    className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700 transition hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                                >
                                    <BarChart3 className="h-3.5 w-3.5" />
                                    <span>Laporan Penjualan</span>
                                </button>
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
                                Rekap Penjualan, HPP (Harga Pokok Penjualan),
                                Beban Operasional Kasir, dan Laba Bersih
                            </p>
                        </div>

                        {/* Filter Buttons & Actions */}
                        <div className="flex max-w-full flex-wrap items-center gap-2">
                            <div className="flex max-w-full scrollbar-none items-center overflow-x-auto rounded-xl border border-stone-200 bg-white p-1 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('today')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'today'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Hari Ini / Tanggal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('yesterday')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'yesterday'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Kemarin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('this_month')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'this_month'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Bulan Ini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('last_month')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'last_month'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Bulan Lalu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPlPeriod('custom_month')}
                                    className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 font-bold whitespace-nowrap transition ${
                                        plPeriod === 'custom_month'
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-brand-950 dark:text-stone-300 dark:hover:text-white'
                                    }`}
                                >
                                    Custom Bulan
                                </button>
                            </div>

                            {profitLossData && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleExportProfitLossExcel}
                                        disabled={isExportingPlExcel}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-50"
                                        title="Download Laporan Laba Rugi lengkap format Excel (.xlsx)"
                                    >
                                        <FileSpreadsheet className="h-4 w-4 text-emerald-100" />
                                        <span>
                                            {isExportingPlExcel
                                                ? 'Mengunduh...'
                                                : 'Export Excel'}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handlePrintProfitLossReport}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-2xs hover:border-emerald-500 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                        title="Cetak struk ringkasan Laba Rugi ke printer thermal"
                                    >
                                        <Printer className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                        <span>Cetak Struk P&L</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Date Pickers for Today / Custom Date and Custom Month */}
                    {(plPeriod === 'today' || plPeriod === 'custom_month') && (
                        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-900">
                            {plPeriod === 'today' && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-stone-500 dark:text-stone-300">
                                        Pilih Tanggal:
                                    </span>
                                    <input
                                        type="date"
                                        value={plDate}
                                        onChange={(e) =>
                                            setPlDate(e.target.value)
                                        }
                                        className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-emerald-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                    />
                                    {plDate !== getLocalDateString() && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPlDate(getLocalDateString())
                                            }
                                            className="cursor-pointer rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                                        >
                                            Reset Hari Ini
                                        </button>
                                    )}
                                </div>
                            )}

                            {plPeriod === 'custom_month' && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-stone-500 dark:text-stone-300">
                                        Pilih Bulan & Tahun:
                                    </span>
                                    <input
                                        type="month"
                                        value={plMonth}
                                        onChange={(e) =>
                                            setPlMonth(e.target.value)
                                        }
                                        className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-900 outline-none focus:border-emerald-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {isLoadingProfitLoss ? (
                        <div className="py-20 text-center">
                            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />
                            <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
                                Menghitung Laba Rugi & HPP...
                            </p>
                        </div>
                    ) : profitLossData ? (
                        <div className="space-y-6">
                            {/* Periode Banner */}
                            <div className="flex flex-col justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:flex-row sm:items-center dark:border-emerald-800/60 dark:bg-emerald-950/30">
                                <div>
                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                        Laporan Periode
                                    </p>
                                    <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                                        {profitLossData.period_title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                                    <span>
                                        Transaksi Selesai:{' '}
                                        <strong>
                                            {
                                                profitLossData.summary
                                                    .total_transactions
                                            }
                                        </strong>
                                    </span>
                                    <span>
                                        Total Item Terjual:{' '}
                                        <strong>
                                            {profitLossData.summary.items_sold}
                                        </strong>
                                    </span>
                                </div>
                            </div>

                            {/* Informative Warning if Items without HPP */}
                            {profitLossData.summary.items_without_hpp_count >
                                0 && (
                                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                    <div>
                                        <p className="font-bold">
                                            Perhatian: Ada{' '}
                                            {
                                                profitLossData.summary
                                                    .items_without_hpp_count
                                            }{' '}
                                            item terjual tanpa HPP terisi
                                        </p>
                                        <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                                            Varian produk tersebut belum
                                            memiliki Harga Dasar/HPP di
                                            Dashboard Admin sehingga dihitung
                                            dengan HPP Rp 0. Anda dapat mengisi
                                            HPP varian melalui dashboard
                                            Filament agar kalkulasi laba semakin
                                            presisi.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 4 KPI Cards */}
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {/* 1. Penjualan Bersih */}
                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="mb-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                                        <span>Penjualan Bersih</span>
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <p className="text-lg font-bold text-stone-900 sm:text-xl dark:text-white">
                                        {formatRp(
                                            profitLossData.summary.net_sales,
                                        )}
                                    </p>
                                    <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        Kotor{' '}
                                        {formatRp(
                                            profitLossData.summary.gross_sales,
                                        )}{' '}
                                        - Diskon{' '}
                                        {formatRp(
                                            profitLossData.summary
                                                .total_discounts,
                                        )}
                                    </p>
                                </div>

                                {/* 2. Total HPP (COGS) */}
                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="mb-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                                        <span>Total HPP (COGS)</span>
                                        <Package className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <p className="text-lg font-bold text-stone-900 sm:text-xl dark:text-white">
                                        {formatRp(
                                            profitLossData.summary.total_cogs,
                                        )}
                                    </p>
                                    <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                        {
                                            profitLossData.summary
                                                .items_with_hpp_count
                                        }{' '}
                                        item terdata HPP
                                    </p>
                                </div>

                                {/* 3. Laba Kotor */}
                                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                    <div className="mb-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                                        <span>Laba Kotor</span>
                                        <Calculator className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <p className="text-lg font-bold text-emerald-600 sm:text-xl dark:text-emerald-400">
                                        {formatRp(
                                            profitLossData.summary.gross_profit,
                                        )}
                                    </p>
                                    <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                        Margin:{' '}
                                        {
                                            profitLossData.summary
                                                .gross_margin_pct
                                        }
                                        %
                                    </p>
                                </div>

                                {/* 4. Laba Bersih */}
                                <div
                                    className={`rounded-2xl border p-4 shadow-2xs ${
                                        profitLossData.summary.net_profit >= 0
                                            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/70 dark:bg-emerald-950/20'
                                            : 'border-rose-200 bg-rose-50/50 dark:border-rose-800/70 dark:bg-rose-950/20'
                                    }`}
                                >
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="font-semibold text-stone-700 dark:text-stone-300">
                                            Laba Bersih (Net)
                                        </span>
                                        {profitLossData.summary.net_profit >=
                                        0 ? (
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-rose-600" />
                                        )}
                                    </div>
                                    <p
                                        className={`text-lg font-bold sm:text-xl ${
                                            profitLossData.summary.net_profit >=
                                            0
                                                ? 'text-emerald-700 dark:text-emerald-400'
                                                : 'text-rose-600 dark:text-rose-400'
                                        }`}
                                    >
                                        {formatRp(
                                            profitLossData.summary.net_profit,
                                        )}
                                    </p>
                                    <p className="mt-1 text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                                        Net Margin:{' '}
                                        {profitLossData.summary.net_margin_pct}%
                                    </p>
                                </div>
                            </div>

                            {/* Waterfall Income Statement */}
                            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                    <span>
                                        Laporan Laba Rugi Berjenjang (Income
                                        Statement)
                                    </span>
                                </h4>

                                <div className="divide-y divide-stone-100 text-xs sm:text-sm dark:divide-stone-800/80">
                                    {/* 1. Penjualan Kotor */}
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-stone-600 dark:text-stone-300">
                                            Total Penjualan Kotor (Gross Sales)
                                        </span>
                                        <span className="font-semibold text-stone-900 dark:text-white">
                                            {formatRp(
                                                profitLossData.summary
                                                    .gross_sales,
                                            )}
                                        </span>
                                    </div>

                                    {/* 2. Diskon */}
                                    <div className="flex items-center justify-between py-2.5 text-stone-500 dark:text-stone-400">
                                        <span className="pl-4">
                                            Dikurangi: Potongan & Diskon
                                            Penjualan
                                        </span>
                                        <span className="font-medium text-rose-600 dark:text-rose-400">
                                            -{' '}
                                            {formatRp(
                                                profitLossData.summary
                                                    .total_discounts,
                                            )}
                                        </span>
                                    </div>

                                    {/* 3. Penjualan Bersih */}
                                    <div className="my-1 flex items-center justify-between rounded-xl bg-stone-50 px-3 py-3 font-bold dark:bg-stone-800/40">
                                        <span className="text-stone-900 dark:text-white">
                                            Penjualan Bersih (Net Revenue)
                                        </span>
                                        <span className="text-stone-900 dark:text-white">
                                            {formatRp(
                                                profitLossData.summary
                                                    .net_sales,
                                            )}
                                        </span>
                                    </div>

                                    {/* 4. HPP */}
                                    <div className="flex items-center justify-between py-2.5 text-stone-600 dark:text-stone-300">
                                        <span className="pl-4">
                                            Dikurangi: Biaya Pokok Penjualan
                                            (HPP / COGS)
                                        </span>
                                        <span className="font-medium text-rose-600 dark:text-rose-400">
                                            -{' '}
                                            {formatRp(
                                                profitLossData.summary
                                                    .total_cogs,
                                            )}
                                        </span>
                                    </div>

                                    {/* 5. Laba Kotor */}
                                    <div className="my-1 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-3 font-bold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                                        <span>LABA KOTOR (GROSS PROFIT)</span>
                                        <div className="text-right">
                                            <div>
                                                {formatRp(
                                                    profitLossData.summary
                                                        .gross_profit,
                                                )}
                                            </div>
                                            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                                Margin{' '}
                                                {
                                                    profitLossData.summary
                                                        .gross_margin_pct
                                                }
                                                %
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6. Beban Operasional Kas Keluar */}
                                    <div className="flex items-center justify-between py-2.5 text-stone-600 dark:text-stone-300">
                                        <span className="pl-4">
                                            Dikurangi: Beban Kas Keluar Kasir
                                            (Operasional/Bahan/Gaji)
                                        </span>
                                        <span className="font-medium text-rose-600 dark:text-rose-400">
                                            -{' '}
                                            {formatRp(
                                                profitLossData.summary
                                                    .total_expenses,
                                            )}
                                        </span>
                                    </div>

                                    {/* 7. Pendapatan Kas Masuk Lain */}
                                    {profitLossData.summary.other_income >
                                        0 && (
                                        <div className="flex items-center justify-between py-2.5 text-stone-600 dark:text-stone-300">
                                            <span className="pl-4">
                                                Ditambah: Pendapatan Kas Masuk
                                                Lainnya
                                            </span>
                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                +{' '}
                                                {formatRp(
                                                    profitLossData.summary
                                                        .other_income,
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    {/* 8. Laba Bersih */}
                                    <div
                                        className={`my-1 flex items-center justify-between rounded-xl px-3 py-3.5 font-bold ${
                                            profitLossData.summary.net_profit >=
                                            0
                                                ? 'bg-emerald-100 text-sm text-emerald-950 sm:text-base dark:bg-emerald-900/40 dark:text-emerald-100'
                                                : 'bg-rose-100 text-sm text-rose-950 sm:text-base dark:bg-rose-900/40 dark:text-rose-100'
                                        }`}
                                    >
                                        <span>LABA BERSIH (NET PROFIT)</span>
                                        <div className="text-right">
                                            <div>
                                                {formatRp(
                                                    profitLossData.summary
                                                        .net_profit,
                                                )}
                                            </div>
                                            <div className="text-[11px] font-semibold opacity-85">
                                                Net Margin{' '}
                                                {
                                                    profitLossData.summary
                                                        .net_margin_pct
                                                }
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Top Margin Products & Operating Expenses Grid */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Left Column: Transaksi Per Pesanan (Harian) ATAU Rekap Harian (Bulanan) */}
                                <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    {profitLossData.is_monthly ? (
                                        /* Mode Bulanan: Rekap Transaksi Harian (HPP + Laba) */
                                        <>
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                                    <Calendar className="h-4 w-4 text-emerald-600" />
                                                    <span>
                                                        Rekap Transaksi Harian
                                                        (HPP & Laba)
                                                    </span>
                                                </h4>
                                                <span className="text-[11px] text-stone-400">
                                                    {profitLossData
                                                        .daily_summary
                                                        ?.length || 0}{' '}
                                                    Hari Transaksi
                                                </span>
                                            </div>

                                            {profitLossData.daily_summary &&
                                            profitLossData.daily_summary
                                                .length > 0 ? (
                                                <div className="-mx-5 max-h-96 overflow-x-auto overflow-y-auto px-5">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="sticky top-0 z-10 bg-white shadow-2xs dark:bg-stone-900">
                                                            <tr className="border-b border-stone-200 pb-2 text-stone-400 dark:border-stone-800">
                                                                <th className="pb-2 font-semibold">
                                                                    Tanggal
                                                                </th>
                                                                <th className="pb-2 text-center font-semibold">
                                                                    Trx
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    Penjualan
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    HPP
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    Laba Kotor
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    Beban Kas
                                                                </th>
                                                                <th className="pb-2 text-right font-semibold">
                                                                    Laba Bersih
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                                                            {profitLossData.daily_summary.map(
                                                                (day: any) => (
                                                                    <tr
                                                                        key={
                                                                            day.date
                                                                        }
                                                                        onClick={() => {
                                                                            setPlPeriod(
                                                                                'today',
                                                                            );
                                                                            setPlDate(
                                                                                day.date,
                                                                            );
                                                                        }}
                                                                        className="cursor-pointer transition hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                                                                        title="Klik untuk melihat transaksi satu per satu pada tanggal ini"
                                                                    >
                                                                        <td className="py-2.5 pr-2">
                                                                            <p className="flex items-center gap-1 font-bold text-stone-900 dark:text-stone-100">
                                                                                <span>
                                                                                    {
                                                                                        day.short_date
                                                                                    }
                                                                                </span>
                                                                                <span className="text-[10px] font-normal text-stone-500">
                                                                                    (
                                                                                    {
                                                                                        day.day_name
                                                                                    }
                                                                                    )
                                                                                </span>
                                                                            </p>
                                                                            <p className="text-[10px] font-semibold text-brand-700 dark:text-emerald-400">
                                                                                Lihat
                                                                                detail
                                                                                &rarr;
                                                                            </p>
                                                                        </td>
                                                                        <td className="py-2.5 text-center font-bold text-stone-700 dark:text-stone-300">
                                                                            <div>
                                                                                {
                                                                                    day.total_transactions
                                                                                }{' '}
                                                                                trx
                                                                            </div>
                                                                            <div className="text-[10px] font-normal text-stone-400">
                                                                                {
                                                                                    day.items_sold
                                                                                }{' '}
                                                                                item
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-2.5 text-right font-medium text-stone-800 dark:text-stone-200">
                                                                            {formatRp(
                                                                                day.net_sales,
                                                                            )}
                                                                        </td>
                                                                        <td className="py-2.5 text-right text-stone-500 dark:text-stone-400">
                                                                            {formatRp(
                                                                                day.total_cogs,
                                                                            )}
                                                                        </td>
                                                                        <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                                            <div>
                                                                                {formatRp(
                                                                                    day.gross_profit,
                                                                                )}
                                                                            </div>
                                                                            <div className="text-[10px] font-medium opacity-80">
                                                                                {
                                                                                    day.margin_pct
                                                                                }
                                                                                %
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-2.5 text-right font-medium text-rose-600 dark:text-rose-400">
                                                                            {day.total_expenses >
                                                                            0
                                                                                ? `- ${formatRp(day.total_expenses)}`
                                                                                : 'Rp 0'}
                                                                        </td>
                                                                        <td className="py-2.5 text-right font-bold">
                                                                            <div
                                                                                className={
                                                                                    day.net_profit >=
                                                                                    0
                                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                                        : 'text-rose-600 dark:text-rose-400'
                                                                                }
                                                                            >
                                                                                {formatRp(
                                                                                    day.net_profit,
                                                                                )}
                                                                            </div>
                                                                            <div className="text-[10px] font-medium text-stone-500 opacity-80">
                                                                                {day.net_margin_pct ??
                                                                                    0}
                                                                                %
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="my-auto py-8 text-center text-xs text-stone-400">
                                                    Belum ada transaksi pada
                                                    bulan ini.
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* Mode Harian: Data Transaksi Satu Persatu (HPP + Laba) */
                                        <>
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                                    <FileText className="h-4 w-4 text-emerald-600" />
                                                    <span>
                                                        Data Transaksi Pesanan
                                                        (HPP & Laba)
                                                    </span>
                                                </h4>
                                                <span className="text-[11px] text-stone-400">
                                                    {profitLossData.transactions
                                                        ?.length || 0}{' '}
                                                    Transaksi
                                                </span>
                                            </div>

                                            {profitLossData.transactions &&
                                            profitLossData.transactions.length >
                                                0 ? (
                                                <div className="-mx-5 max-h-96 space-y-2 overflow-x-auto overflow-y-auto px-5">
                                                    {profitLossData.transactions.map(
                                                        (trx: any) => {
                                                            const isExpanded =
                                                                expandedPlOrderId ===
                                                                trx.id;
                                                            return (
                                                                <div
                                                                    key={trx.id}
                                                                    className={`rounded-xl border transition ${
                                                                        isExpanded
                                                                            ? 'border-emerald-300 bg-stone-50 dark:border-emerald-700 dark:bg-stone-800/80'
                                                                            : 'border-stone-200/70 bg-stone-50/50 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-800/30 dark:hover:bg-stone-800/60'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        onClick={() =>
                                                                            setExpandedPlOrderId(
                                                                                isExpanded
                                                                                    ? null
                                                                                    : trx.id,
                                                                            )
                                                                        }
                                                                        className="flex cursor-pointer items-center justify-between p-3 text-xs select-none"
                                                                    >
                                                                        <div className="min-w-0 pr-2">
                                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                                <span className="font-bold text-stone-900 dark:text-stone-100">
                                                                                    {
                                                                                        trx.order_number
                                                                                    }
                                                                                </span>
                                                                                <span className="text-[11px] font-medium text-stone-500">
                                                                                    ·{' '}
                                                                                    {
                                                                                        trx.created_time
                                                                                    }
                                                                                </span>
                                                                                <span className="py-0.2 rounded bg-stone-200 px-1.5 text-[10px] font-bold text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                                                                                    {
                                                                                        trx.payment_method_label
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <p className="mt-0.5 truncate text-[11px] text-stone-500">
                                                                                {
                                                                                    trx.customer_name
                                                                                }{' '}
                                                                                ·{' '}
                                                                                {
                                                                                    trx.items_count
                                                                                }{' '}
                                                                                item
                                                                            </p>
                                                                        </div>

                                                                        <div className="flex shrink-0 items-center gap-3 text-right">
                                                                            <div>
                                                                                <p className="font-semibold text-stone-900 dark:text-stone-100">
                                                                                    {formatRp(
                                                                                        trx.net_sales,
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-[10px] text-stone-400">
                                                                                    HPP:{' '}
                                                                                    {formatRp(
                                                                                        trx.total_cogs,
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            <div className="min-w-[70px] text-right">
                                                                                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                                                                    +
                                                                                    {formatRp(
                                                                                        trx.gross_profit,
                                                                                    )}
                                                                                </p>
                                                                                <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                                                    {
                                                                                        trx.margin_pct
                                                                                    }
                                                                                    %
                                                                                </p>
                                                                            </div>
                                                                            <ChevronDown
                                                                                className={`h-3.5 w-3.5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Expanded Item Breakdown */}
                                                                    {isExpanded &&
                                                                        Array.isArray(trx.items) && (
                                                                            <div className="space-y-1.5 border-t border-stone-200 px-3 pt-1 pb-3 text-[11px] dark:border-stone-700/60">
                                                                                <p className="mb-1 text-[9px] font-bold tracking-wider text-stone-500 uppercase">
                                                                                    Rincian
                                                                                    Item
                                                                                    &
                                                                                    HPP:
                                                                                </p>
                                                                                {trx.items.map(
                                                                                    (
                                                                                        it: any,
                                                                                        iIdx: number,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                iIdx
                                                                                            }
                                                                                            className="flex items-center justify-between border-b border-stone-100 py-1 last:border-none dark:border-stone-800"
                                                                                        >
                                                                                            <div className="min-w-0 pr-2">
                                                                                                <span className="font-semibold text-stone-800 dark:text-stone-200">
                                                                                                    {
                                                                                                        it.product_name
                                                                                                    }
                                                                                                </span>
                                                                                                <span className="ml-1 text-stone-500">
                                                                                                    (
                                                                                                    {
                                                                                                        it.variant_label
                                                                                                    }
                                                                                                    )
                                                                                                    x
                                                                                                    {
                                                                                                        it.quantity
                                                                                                    }
                                                                                                </span>
                                                                                                {!it.has_hpp && (
                                                                                                    <span className="py-0.2 ml-1 rounded bg-amber-50 px-1 text-[9px] font-bold text-amber-600 dark:bg-amber-950">
                                                                                                        HPP
                                                                                                        0
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="shrink-0 text-right">
                                                                                                <span className="text-stone-600 dark:text-stone-400">
                                                                                                    {formatRp(
                                                                                                        it.subtotal,
                                                                                                    )}
                                                                                                </span>
                                                                                                <span className="ml-1.5 text-[10px] text-stone-400">
                                                                                                    (HPP:{' '}
                                                                                                    {formatRp(
                                                                                                        it.total_cost,
                                                                                                    )}
                                                                                                    )
                                                                                                </span>
                                                                                                <span className="ml-1.5 font-bold text-emerald-600">
                                                                                                    +
                                                                                                    {formatRp(
                                                                                                        it.gross_profit,
                                                                                                    )}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="my-auto py-8 text-center text-xs text-stone-400">
                                                    Belum ada transaksi pada
                                                    tanggal ini.
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Beban Operasional Kasir (Cash Flow Out) */}
                                <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                    {(() => {
                                        const rawExpenses =
                                            profitLossData.expenses ||
                                            (profitLossData.expense_breakdown
                                                ? profitLossData.expense_breakdown.flatMap(
                                                      (cat: any) =>
                                                          cat.records || [],
                                                  )
                                                : []);
                                        const filteredExpenses =
                                            selectedPlExpenseCategory === 'all'
                                                ? rawExpenses
                                                : rawExpenses.filter(
                                                      (e: any) =>
                                                          e.category ===
                                                          selectedPlExpenseCategory,
                                                  );
                                        const filteredTotal =
                                            filteredExpenses.reduce(
                                                (sum: number, e: any) =>
                                                    sum +
                                                    (Number(e.amount) || 0),
                                                0,
                                            );

                                        return (
                                            <>
                                                <div className="mb-4 flex items-center justify-between">
                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                                        <Wallet className="h-4 w-4 text-rose-600" />
                                                        <span>
                                                            Rincian Beban Kas
                                                            Keluar
                                                        </span>
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-stone-400">
                                                            {rawExpenses.length}{' '}
                                                            Pengeluaran
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigateToTab(
                                                                    'cash_flow',
                                                                )
                                                            }
                                                            className="ml-1 cursor-pointer text-[11px] font-bold text-brand-700 hover:underline dark:text-emerald-400"
                                                        >
                                                            Kelola Kasir &rarr;
                                                        </button>
                                                    </div>
                                                </div>

                                                {rawExpenses.length > 0 ? (
                                                    <div className="flex flex-1 flex-col">
                                                        {/* Category Filter Chips (if more than 1 category) */}
                                                        {profitLossData.expense_breakdown &&
                                                            profitLossData
                                                                .expense_breakdown
                                                                .length > 1 && (
                                                                <div className="mb-3 flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setSelectedPlExpenseCategory(
                                                                                'all',
                                                                            )
                                                                        }
                                                                        className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition ${
                                                                            selectedPlExpenseCategory ===
                                                                            'all'
                                                                                ? 'border border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                                                                : 'border border-transparent bg-stone-100 text-stone-600 hover:bg-stone-200/70 dark:bg-stone-800 dark:text-stone-400'
                                                                        }`}
                                                                    >
                                                                        Semua (
                                                                        {
                                                                            rawExpenses.length
                                                                        }
                                                                        )
                                                                    </button>
                                                                    {profitLossData.expense_breakdown.map(
                                                                        (
                                                                            cat: any,
                                                                        ) => (
                                                                            <button
                                                                                key={
                                                                                    cat.category
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setSelectedPlExpenseCategory(
                                                                                        cat.category ===
                                                                                            selectedPlExpenseCategory
                                                                                            ? 'all'
                                                                                            : cat.category,
                                                                                    )
                                                                                }
                                                                                className={`shrink-0 cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition ${
                                                                                    selectedPlExpenseCategory ===
                                                                                    cat.category
                                                                                        ? 'border border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                                                                        : 'border border-transparent bg-stone-100 text-stone-600 hover:bg-stone-200/70 dark:bg-stone-800 dark:text-stone-400'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    cat.label
                                                                                }{' '}
                                                                                (
                                                                                {
                                                                                    cat.count
                                                                                }
                                                                                )
                                                                                ·{' '}
                                                                                {formatRp(
                                                                                    cat.total,
                                                                                )}
                                                                            </button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}

                                                        {/* Itemized Expenses List */}
                                                        <div className="-mx-5 max-h-96 flex-1 space-y-2 overflow-x-auto overflow-y-auto px-5">
                                                            {filteredExpenses.map(
                                                                (exp: any) => (
                                                                    <div
                                                                        key={
                                                                            exp.id
                                                                        }
                                                                        className="flex items-start justify-between gap-3 rounded-xl border border-stone-200/70 bg-stone-50/70 p-3 text-xs transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-800/40 dark:hover:bg-stone-800/60"
                                                                    >
                                                                        <div className="flex min-w-0 items-start gap-2.5">
                                                                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                                                                                <ArrowUpRight className="h-4 w-4" />
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <p className="text-xs font-bold break-words text-stone-900 dark:text-stone-100">
                                                                                    {exp.description ||
                                                                                        'Pengeluaran Kas'}
                                                                                </p>
                                                                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                                                                                    <span className="py-0.2 rounded bg-stone-200 px-1.5 text-[10px] font-semibold text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                                                                                        {exp.category_label ||
                                                                                            (exp.category
                                                                                                ? exp.category.replace(
                                                                                                      '_',
                                                                                                      ' ',
                                                                                                  )
                                                                                                : 'Pengeluaran')}
                                                                                    </span>
                                                                                    <span>
                                                                                        ·
                                                                                    </span>
                                                                                    <span>
                                                                                        {profitLossData.is_monthly
                                                                                            ? exp.date_time ||
                                                                                              exp.date
                                                                                            : `${exp.time || ''} (${exp.date || ''})`}
                                                                                    </span>
                                                                                    {exp.user_name && (
                                                                                        <>
                                                                                            <span>
                                                                                                ·
                                                                                            </span>
                                                                                            <span>
                                                                                                {
                                                                                                    exp.user_name
                                                                                                }
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="shrink-0 text-right">
                                                                            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                                                                -{' '}
                                                                                {formatRp(
                                                                                    exp.amount,
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>

                                                        {/* Summary Total */}
                                                        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 text-xs font-bold dark:border-stone-800">
                                                            <span className="text-stone-600 dark:text-stone-300">
                                                                Total Beban
                                                                Kasir{' '}
                                                                {selectedPlExpenseCategory !==
                                                                'all'
                                                                    ? `(${filteredExpenses.length} item)`
                                                                    : ''}
                                                            </span>
                                                            <span className="text-sm text-rose-600 dark:text-rose-400">
                                                                -{' '}
                                                                {formatRp(
                                                                    selectedPlExpenseCategory ===
                                                                        'all'
                                                                        ? profitLossData
                                                                              .summary
                                                                              .total_expenses
                                                                        : filteredTotal,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="my-auto py-8 text-center text-xs text-stone-400">
                                                        Tidak ada catatan kas
                                                        keluar pada periode ini.
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900">
                            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-stone-400 dark:text-stone-400" />
                            <p className="font-bold text-stone-700 dark:text-stone-200">
                                Tidak ada data laba rugi yang dapat dimuat
                            </p>
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-300">
                                Silakan coba ganti filter tanggal atau muat
                                ulang.
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    fetchProfitLossReport(
                                        plPeriod,
                                        plDate,
                                        plMonth,
                                    )
                                }
                                className="mt-4 cursor-pointer rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                            >
                                Muat Ulang Laba Rugi
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 6: PENGATURAN (PRINTER & STRUK, PEMBAYARAN, TEMA, STAF)             */}
            {/* ========================================================================= */}
            {activeTab === 'settings' && (
                <div className="mx-auto w-full max-w-6xl min-w-0 flex-1 space-y-5 overflow-y-auto bg-[#f4f6f6] p-3.5 sm:space-y-6 sm:p-6 dark:bg-stone-950">
                    {/* Sub Tab Switcher Navigation Bar */}
                    <div className="border-b border-stone-200 pb-3 dark:border-stone-800">
                        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-stone-200 bg-white p-1.5 text-xs font-semibold shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                            <button
                                type="button"
                                onClick={() => setSettingsSubTab('printer')}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                    settingsSubTab === 'printer'
                                        ? 'bg-brand-700 font-bold text-white shadow-xs'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                }`}
                            >
                                <Printer className="h-4 w-4 shrink-0" />
                                <span>Printer & Struk</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSettingsSubTab('payment')}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                    settingsSubTab === 'payment'
                                        ? 'bg-brand-700 font-bold text-white shadow-xs'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                }`}
                            >
                                <CreditCard className="h-4 w-4 shrink-0" />
                                <span>Metode Pembayaran</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSettingsSubTab('appearance')}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                    settingsSubTab === 'appearance'
                                        ? 'bg-brand-700 font-bold text-white shadow-xs'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                }`}
                            >
                                <Sun className="h-4 w-4 shrink-0" />
                                <span>Tema & Tampilan</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSettingsSubTab('categories')}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                    settingsSubTab === 'categories'
                                        ? 'bg-brand-700 font-bold text-white shadow-xs'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                }`}
                            >
                                <Tag className="h-4 w-4 shrink-0" />
                                <span>Kategori Produk</span>
                                <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                                    {categories.length}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSettingsSubTab('menu')}
                                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                    settingsSubTab === 'menu'
                                        ? 'bg-amber-600 font-bold text-white shadow-xs'
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                }`}
                            >
                                <Coffee className="h-4 w-4 shrink-0" />
                                <span>Menu Cafe</span>
                                <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                                    {products.length}
                                </span>
                            </button>
                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => setSettingsSubTab('staff')}
                                    className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 whitespace-nowrap transition ${
                                        settingsSubTab === 'staff'
                                            ? 'bg-amber-600 font-bold text-white shadow-xs'
                                            : 'text-stone-600 hover:bg-stone-50 hover:text-brand-950 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
                                    }`}
                                >
                                    <Users className="h-4 w-4 shrink-0" />
                                    <span>Kelola Staf</span>
                                    <span className="py-0.2 rounded-full bg-amber-400 px-1.5 text-[9px] font-black text-stone-950 uppercase">
                                        Owner
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* SUBTAB A: PRINTER & STRUK (SEDERHANA & PREVIEW DI APLIKASI) */}
                    {settingsSubTab === 'printer' && (
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                                        Pengaturan Printer & Struk Kasir
                                    </h3>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                        Atur format kertas thermal, opsi cetak otomatis, dan informasi toko pada struk kasir.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handlePreviewReceipt()}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 active:scale-95 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                                        title="Lihat Pratinjau Struk langsung di aplikasi (Bukan Chrome)"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>Preview Struk di Aplikasi</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSavePrinterSettings}
                                        disabled={isSavingSettings}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>
                                            {isSavingSettings
                                                ? 'Menyimpan...'
                                                : 'Simpan'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                                {/* KOLOM KIRI: FORM PENGATURAN SEDERHANA (7 COLS) */}
                                <div className="space-y-4 lg:col-span-7">
                                    {/* CARD 0A: PENGATURAN KONEKSI & PEMILIHAN PRINTER USB / WINDOWS POS */}
                                    <div className="space-y-4 rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/70 via-white to-white p-5 shadow-xs dark:border-sky-900/60 dark:from-sky-950/30 dark:via-stone-900 dark:to-stone-900">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                                                    <Printer className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-100">
                                                            Printer USB & Windows POS
                                                        </h4>
                                                        {isElectronDesktop() && (
                                                            <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                                                                Desktop App
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Pilih printer thermal USB yang terhubung di PC/Laptop Windows untuk cetak struk kasir
                                                    </p>
                                                </div>
                                            </div>

                                            {connectedUsbPrinter ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-100 px-2.5 py-1 text-[10px] font-extrabold text-sky-800 dark:border-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
                                                    <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                                                    WebUSB: {connectedUsbPrinter.name}
                                                </span>
                                            ) : printerForm.printer_name ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
                                                    <Check className="h-3 w-3 text-sky-600" />
                                                    {printerForm.printer_name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                                                    Belum Dipilih
                                                </span>
                                            )}
                                        </div>

                                        {/* SELEKSI PRINTER WINDOWS (JIKA DI DETEKSI DESKTOP / ELECTRON) */}
                                        {availableWindowsPrinters.length > 0 && (
                                            <div className="rounded-xl border border-sky-200 bg-white p-3.5 space-y-2 dark:border-sky-800/60 dark:bg-stone-950/60">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                                        Daftar Printer Terdeteksi di Windows ({availableWindowsPrinters.length} Printer)
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={refreshWindowsPrinters}
                                                        disabled={isLoadingWindowsPrinters}
                                                        className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 disabled:opacity-50 dark:text-sky-400"
                                                        title="Segarkan daftar printer USB / Windows"
                                                    >
                                                        <RefreshCw className={`h-3 w-3 ${isLoadingWindowsPrinters ? 'animate-spin' : ''}`} />
                                                        <span>{isLoadingWindowsPrinters ? 'Memindai...' : 'Pindai Ulang'}</span>
                                                    </button>
                                                </div>

                                                <div className="relative">
                                                    <select
                                                        value={printerForm.printer_name || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const is80 = /80|tm-t|t82|t88|xp-n/i.test(val);
                                                            setPrinterForm((prev) => ({
                                                                ...prev,
                                                                printer_name: val,
                                                                usb_printer_name: val,
                                                                printer_driver: val,
                                                                paper_width: is80 ? '80mm' : prev.paper_width,
                                                                receipt_columns: is80 ? 44 : prev.receipt_columns,
                                                            }));
                                                            showToast(`✓ Printer kasir diset ke: ${val}`);
                                                        }}
                                                        className="w-full rounded-xl border border-sky-300 bg-sky-50/50 px-3.5 py-2.5 text-xs font-bold text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-sky-700 dark:bg-stone-900 dark:text-white"
                                                    >
                                                        <option value="">-- Pilih Printer yang Ingin Dipakai --</option>
                                                        {availableWindowsPrinters.map((p) => {
                                                            const isPos = /pos|thermal|receipt|58|80|xprinter|epson|panda|vsc|iware|bluetooth/i.test(p.name);
                                                            return (
                                                                <option key={p.name} value={p.name}>
                                                                    {p.name} {p.isDefault ? '★ (Default Windows)' : ''} {isPos ? '🖨️ [Thermal POS]' : ''}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                                                    Pilih printer kasir Anda dari daftar di atas. Printer yang dipilih akan langsung dipakai setiap kali kasir mencetak struk tanpa perlu memilih ulang.
                                                </p>
                                            </div>
                                        )}

                                        {/* KONEKSI LANGSUNG WEBUSB (CHROME / EDGE WINDOWS) */}
                                        <div className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-3 dark:border-stone-800 dark:bg-stone-950/40">
                                            <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
                                                <div>
                                                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                                        Koneksi Langsung WebUSB (ESC/POS Plug & Play)
                                                    </div>
                                                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Sambungkan printer USB langsung ke browser Chrome / Edge untuk cetak cepat tanpa dialog Windows
                                                    </div>
                                                </div>

                                                {connectedUsbPrinter ? (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRunTestPrint('usb_direct')}
                                                            disabled={isUsbTesting}
                                                            className="flex cursor-pointer items-center gap-1 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-sky-700 active:scale-95 disabled:opacity-50"
                                                        >
                                                            <Printer className="h-3.5 w-3.5" />
                                                            <span>{isUsbTesting ? 'Mengirim...' : 'Tes Cetak'}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleConnectUsbPrinter}
                                                            disabled={isUsbConnecting}
                                                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                                                        >
                                                            <span>Ganti</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleDisconnectUsbPrinter}
                                                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300"
                                                        >
                                                            <span>Putuskan</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={handleConnectUsbPrinter}
                                                        disabled={isUsbConnecting}
                                                        className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-sky-700 active:scale-95 disabled:opacity-50"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span>{isUsbConnecting ? 'Menghubungkan...' : 'Sambungkan Printer USB'}</span>
                                                    </button>
                                                )}
                                            </div>

                                            {connectedUsbPrinter && (
                                                <div className="rounded-lg bg-sky-50/70 p-2.5 text-[11px] font-mono text-sky-900 border border-sky-200/60 dark:bg-sky-950/30 dark:text-sky-200 dark:border-sky-800/40">
                                                    <div className="font-bold font-sans text-xs text-sky-950 dark:text-sky-100">
                                                        Perangkat USB: {connectedUsbPrinter.name}
                                                    </div>
                                                    <div className="mt-0.5 text-[10px] text-sky-700 dark:text-sky-300">
                                                        VID: 0x{connectedUsbPrinter.vendorId.toString(16).padStart(4, '0').toUpperCase()} · PID: 0x{connectedUsbPrinter.productId.toString(16).padStart(4, '0').toUpperCase()}
                                                        {connectedUsbPrinter.serialNumber ? ` · Serial: ${connectedUsbPrinter.serialNumber}` : ''}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* PRESET CEPAT & NAMA PRINTER DRIVER WINDOWS */}
                                        <div className="space-y-2.5">
                                            <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                Nama Driver / Identitas Printer Windows yang Dipakai:
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={printerForm.printer_name || ''}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            printer_name: e.target.value,
                                                            usb_printer_name: e.target.value,
                                                            printer_driver: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Contoh: POS80 Printer, POS58 Printer, EPSON TM-T82"
                                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-900 outline-none focus:border-sky-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRunTestPrint('web')}
                                                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800 shadow-2xs transition hover:bg-sky-100 active:scale-95 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                                                    title="Kirim tes cetak ke printer Windows"
                                                >
                                                    <Printer className="h-3.5 w-3.5" />
                                                    <span>Tes Cetak USB</span>
                                                </button>
                                            </div>

                                            {/* Banner Rekomendasi Resmi Kassen BTP-3100 */}
                                            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-sky-300 bg-sky-50/80 p-3 dark:border-sky-800 dark:bg-sky-950/40">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-base text-white shadow-2xs font-bold">
                                                        🖨️
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-black text-sky-950 dark:text-sky-200">
                                                                Layout Resmi: Kassen BTP-3100
                                                            </span>
                                                            <span className="rounded-full bg-sky-200/90 px-2 py-0.5 text-[9px] font-black text-sky-900 dark:bg-sky-900/80 dark:text-sky-200">
                                                                USB Kasir Windows
                                                            </span>
                                                        </div>
                                                        <p className="text-[10.5px] text-sky-800/90 dark:text-sky-300/80">
                                                            80 mm • 72 mm Area Cetak • 44 Karakter • Auto-Cutter ON • Laci Kasir RJ11
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            printer_name: 'Kassen BTP-3100',
                                                            usb_printer_name: 'Kassen BTP-3100',
                                                            printer_driver: 'Kassen BTP-3100',
                                                            paper_width: '80mm',
                                                            receipt_columns: 44,
                                                            receipt_columns_80mm: 44,
                                                            custom_paper_width_mm: 80,
                                                            custom_printable_width_mm: 72,
                                                            custom_receipt_columns: 44,
                                                            max_item_name_length: 30,
                                                            margin_horizontal: '1mm',
                                                            margin_feed_lines: 2,
                                                            copies: 1,
                                                            show_logo: true,
                                                            formatting: 'formatted',
                                                            open_cash_drawer: true,
                                                            font_family: 'monospace',
                                                            font_size: 'normal',
                                                            font_weight: 'bold',
                                                            connection_type: 'usb',
                                                        }));
                                                        showToast('✓ Layout optimal Kassen BTP-3100 berhasil diterapkan!');
                                                    }}
                                                    className="flex cursor-pointer items-center gap-1 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-black text-white shadow-xs transition hover:bg-sky-700 active:scale-95"
                                                >
                                                    <span>Terapkan Layout Kassen BTP-3100</span>
                                                </button>
                                            </div>

                                            {/* Tombol Preset Cepat */}
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                                                    Pilih Cepat Nama Printer Populer:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {[
                                                        { name: 'Kassen BTP-3100', label: '⭐ Kassen BTP-3100 (80mm)', width: '80mm' as PaperWidth, cols: 44 },
                                                        { name: 'POS80 Printer | WINDOWS', label: 'POS-80 (80mm)', width: '80mm' as PaperWidth, cols: 44 },
                                                        { name: 'POS58 Printer | WINDOWS', label: 'POS-58 (58mm)', width: '58mm' as PaperWidth, cols: 32 },
                                                        { name: 'EPSON TM-T82 Receipt', label: 'EPSON TM-T82', width: '80mm' as PaperWidth, cols: 44 },
                                                        { name: 'Xprinter XP-58', label: 'Xprinter 58mm', width: '58mm' as PaperWidth, cols: 32 },
                                                        { name: 'Xprinter XP-N160II', label: 'Xprinter 80mm', width: '80mm' as PaperWidth, cols: 44 },
                                                        { name: 'Panda PRJ-80', label: 'Panda 80mm', width: '80mm' as PaperWidth, cols: 44 },
                                                        { name: 'VSC TM-58', label: 'VSC 58mm', width: '58mm' as PaperWidth, cols: 32 },
                                                    ].map((preset) => {
                                                        const isSelected = printerForm.printer_name === preset.name;
                                                        return (
                                                            <button
                                                                key={preset.name}
                                                                type="button"
                                                                onClick={() => {
                                                                    setPrinterForm((prev) => ({
                                                                        ...prev,
                                                                        printer_name: preset.name,
                                                                        usb_printer_name: preset.name,
                                                                        printer_driver: preset.name,
                                                                        paper_width: preset.width,
                                                                        receipt_columns: preset.cols,
                                                                        max_item_name_length: preset.width === '80mm' ? 32 : 24,
                                                                    }));
                                                                    showToast(`✓ Memilih profil: ${preset.label}`);
                                                                }}
                                                                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-bold transition active:scale-95 ${
                                                                    isSelected
                                                                        ? 'border-sky-600 bg-sky-600 text-white shadow-2xs'
                                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                                }`}
                                                            >
                                                                {preset.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CARD 0: PENCARIAN & KONEKSI PRINTER BLUETOOTH */}
                                    <div className="space-y-3.5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-white p-5 shadow-xs dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-stone-900 dark:to-stone-900">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                                                    <Smartphone className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-100">
                                                        Printer Bluetooth POS
                                                    </h4>
                                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Pindai & hubungkan printer thermal Bluetooth langsung dari aplikasi
                                                    </p>
                                                </div>
                                            </div>
                                            {connectedBtPrinter ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    Terhubung
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                                                    Belum Terhubung
                                                </span>
                                            )}
                                        </div>

                                        {connectedBtPrinter ? (
                                            <div className="flex flex-col justify-between gap-3 rounded-xl border border-emerald-200 bg-white p-3.5 sm:flex-row sm:items-center dark:border-emerald-800/60 dark:bg-stone-950/60">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <Printer className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                        <span className="truncate text-sm font-black text-stone-900 dark:text-white">
                                                            {connectedBtPrinter.name}
                                                        </span>
                                                    </div>
                                                    <div className="mt-0.5 font-mono text-[11px] text-stone-500 dark:text-stone-400">
                                                        ID / MAC: {connectedBtPrinter.address}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRunTestPrint('bluetooth')}
                                                        disabled={isBtPrinting}
                                                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span>{isBtPrinting ? 'Mencetak...' : 'Tes Cetak'}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openBluetoothScannerModal(getSampleTestReceipt())}
                                                        className="flex cursor-pointer items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                                                    >
                                                        <span>Ganti</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleDisconnectBtPrinter}
                                                        className="flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300"
                                                    >
                                                        <span>Putuskan</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col justify-between gap-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-3.5 sm:flex-row sm:items-center dark:border-stone-700 dark:bg-stone-950/40">
                                                <div className="text-xs text-stone-600 dark:text-stone-400">
                                                    Belum ada printer Bluetooth yang dipilih. Klik tombol di samping untuk memindai printer di sekitar.
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => openBluetoothScannerModal(getSampleTestReceipt())}
                                                    className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                                                >
                                                    <Search className="h-3.5 w-3.5" />
                                                    <span>Cari Printer Bluetooth</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* CARD 1: FORMAT UKURAN KERTAS */}
                                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                Ukuran Kertas Thermal
                                            </h4>
                                            <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                                                Pilih sesuai jenis roll printer Anda
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPrinterForm((prev) => {
                                                        const targetCols = prev.receipt_columns_58mm || 32;
                                                        return {
                                                            ...prev,
                                                            paper_width: '58mm',
                                                            receipt_columns: targetCols,
                                                            max_item_name_length: targetCols >= 38 ? 26 : Math.min(targetCols - 10, 22),
                                                            margin_horizontal: '2mm',
                                                        };
                                                    })
                                                }
                                                className={`flex cursor-pointer flex-col rounded-xl border p-3.5 text-left transition ${
                                                    printerForm.paper_width === '58mm'
                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-xs'
                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-black">58 mm</span>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                            printerForm.paper_width === '58mm'
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                                                        }`}
                                                    >
                                                        Mini / Portabel
                                                    </span>
                                                </div>
                                                <p
                                                    className={`mt-1.5 text-[11px] ${
                                                        printerForm.paper_width === '58mm'
                                                            ? 'text-white/80'
                                                            : 'text-stone-500 dark:text-stone-400'
                                                    }`}
                                                >
                                                    Printer Bluetooth & Saku ({printerForm.receipt_columns_58mm || 32} Kolom)
                                                </p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPrinterForm((prev) => {
                                                        const targetCols = prev.receipt_columns_80mm || 44;
                                                        return {
                                                            ...prev,
                                                            paper_width: '80mm',
                                                            receipt_columns: targetCols,
                                                            max_item_name_length: targetCols >= 44 ? 32 : 26,
                                                            margin_horizontal: '2mm',
                                                        };
                                                    })
                                                }
                                                className={`flex cursor-pointer flex-col rounded-xl border p-3.5 text-left transition ${
                                                    printerForm.paper_width === '80mm'
                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-xs'
                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-black">80 mm</span>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                            printerForm.paper_width === '80mm'
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                                                        }`}
                                                    >
                                                        Standar Kasir
                                                    </span>
                                                </div>
                                                <p
                                                    className={`mt-1.5 text-[11px] ${
                                                        printerForm.paper_width === '80mm'
                                                            ? 'text-white/80'
                                                            : 'text-stone-500 dark:text-stone-400'
                                                    }`}
                                                >
                                                    Printer Kasir Desktop & USB ({printerForm.receipt_columns_80mm || 44} Kolom)
                                                </p>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPrinterForm((prev) => {
                                                        const customWidth = prev.custom_paper_width_mm || 76;
                                                        const customCols = prev.custom_receipt_columns || 40;
                                                        return {
                                                            ...prev,
                                                            paper_width: 'custom',
                                                            custom_paper_width_mm: customWidth,
                                                            custom_printable_width_mm: prev.custom_printable_width_mm || Math.max(24, customWidth - 6),
                                                            custom_receipt_columns: customCols,
                                                            receipt_columns: customCols,
                                                            max_item_name_length: Math.max(16, customCols - 14),
                                                            margin_horizontal: '2mm',
                                                        };
                                                    })
                                                }
                                                className={`flex cursor-pointer flex-col rounded-xl border p-3.5 text-left transition ${
                                                    printerForm.paper_width === 'custom'
                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-xs'
                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-black">
                                                        {printerForm.custom_paper_width_mm || 76} mm
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                            printerForm.paper_width === 'custom'
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                                                        }`}
                                                    >
                                                        Kustom Bebas
                                                    </span>
                                                </div>
                                                <p
                                                    className={`mt-1.5 text-[11px] ${
                                                        printerForm.paper_width === 'custom'
                                                            ? 'text-white/80'
                                                            : 'text-stone-500 dark:text-stone-400'
                                                    }`}
                                                >
                                                    USB / Dot Matrix / Kertas Lain ({printerForm.custom_receipt_columns || 40} Kolom)
                                                </p>
                                            </button>
                                        </div>

                                        {/* PANEL KUSTOM UKURAN KERTAS (TAMPIL JIKA CUSTOM DIPILIH) */}
                                        {printerForm.paper_width === 'custom' && (
                                            <div className="mt-4 space-y-4 rounded-xl border border-brand-300 bg-brand-50/50 p-4 dark:border-brand-800/80 dark:bg-brand-950/20">
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-200/60 pb-3 dark:border-brand-800/60">
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white shadow-2xs">
                                                            ⚙️
                                                        </span>
                                                        <h5 className="text-xs font-bold text-brand-950 dark:text-brand-200">
                                                            Konfigurasi Dimensi Kertas Kustom untuk Printer USB
                                                        </h5>
                                                    </div>
                                                    <span className="rounded-full bg-brand-200/70 px-2.5 py-0.5 text-[10px] font-bold text-brand-900 dark:bg-brand-900/60 dark:text-brand-300">
                                                        Ukuran Aktif: {printerForm.custom_paper_width_mm || 76} mm ({printerForm.custom_receipt_columns || 40} Kolom)
                                                    </span>
                                                </div>

                                                {/* Pilihan Cepat / Preset Ukuran Populer */}
                                                <div>
                                                    <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                        Pilihan Cepat Ukuran Thermal (Presets):
                                                    </label>
                                                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                        {[
                                                            { width: 50, printable: 44, cols: 28, label: '50 mm', desc: 'EDC / SPBU Mini' },
                                                            { width: 57, printable: 48, cols: 30, label: '57 mm', desc: 'Mini POS USB' },
                                                            { width: 70, printable: 64, cols: 36, label: '70 mm', desc: 'Thermal Medium' },
                                                            { width: 76, printable: 70, cols: 40, label: '76 mm (3")', desc: 'Epson TM-U220 / Kasir' },
                                                            { width: 82, printable: 76, cols: 44, label: '82 mm', desc: 'Thermal Lebar' },
                                                            { width: 85, printable: 80, cols: 46, label: '85 mm', desc: 'POS Roll Lebar' },
                                                            { width: 100, printable: 92, cols: 52, label: '100 mm', desc: 'Resi / Barcode' },
                                                            { width: 112, printable: 104, cols: 58, label: '112 mm', desc: 'Thermal A6 / Resi' },
                                                        ].map((preset) => {
                                                            const isSelected = (printerForm.custom_paper_width_mm || 76) === preset.width;
                                                            return (
                                                                <button
                                                                    key={preset.width}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setPrinterForm((prev) => ({
                                                                            ...prev,
                                                                            custom_paper_width_mm: preset.width,
                                                                            custom_printable_width_mm: preset.printable,
                                                                            custom_receipt_columns: preset.cols,
                                                                            receipt_columns: preset.cols,
                                                                            max_item_name_length: Math.max(16, preset.cols - 14),
                                                                        }));
                                                                    }}
                                                                    className={`cursor-pointer rounded-lg border p-2 text-left transition ${
                                                                        isSelected
                                                                            ? 'border-brand-700 bg-brand-700 text-white shadow-2xs font-bold'
                                                                            : 'border-stone-200 bg-white text-stone-700 hover:border-brand-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-xs font-bold">{preset.label}</span>
                                                                        <span className={`text-[9.5px] ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                                                                            {preset.cols} col
                                                                        </span>
                                                                    </div>
                                                                    <div className={`mt-0.5 text-[9.5px] ${isSelected ? 'text-white/85' : 'text-stone-500 dark:text-stone-400'}`}>
                                                                        {preset.desc}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Form Input Manual Dimensi Kustom */}
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                            Lebar Roll Kertas Fisik (mm):
                                                        </label>
                                                        <div className="mt-1 flex items-center rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus-within:border-brand-600 dark:border-stone-700 dark:bg-stone-800">
                                                            <input
                                                                type="number"
                                                                min="30"
                                                                max="120"
                                                                value={printerForm.custom_paper_width_mm || 76}
                                                                onChange={(e) => {
                                                                    const val = Math.max(30, Math.min(120, Number(e.target.value) || 76));
                                                                    setPrinterForm((prev) => ({
                                                                        ...prev,
                                                                        custom_paper_width_mm: val,
                                                                        custom_printable_width_mm: Math.min(prev.custom_printable_width_mm || (val - 6), val),
                                                                    }));
                                                                }}
                                                                className="w-full bg-transparent text-xs font-bold text-stone-900 focus:outline-none dark:text-white"
                                                            />
                                                            <span className="text-[10px] font-bold text-stone-400">mm</span>
                                                        </div>
                                                        <p className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                                                            Rentang: 30 mm – 120 mm
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                            Lebar Area Cetak Efektif (mm):
                                                        </label>
                                                        <div className="mt-1 flex items-center rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus-within:border-brand-600 dark:border-stone-700 dark:bg-stone-800">
                                                            <input
                                                                type="number"
                                                                min="24"
                                                                max={printerForm.custom_paper_width_mm || 116}
                                                                value={printerForm.custom_printable_width_mm || Math.max(24, (printerForm.custom_paper_width_mm || 76) - 6)}
                                                                onChange={(e) => {
                                                                    const maxAllowed = printerForm.custom_paper_width_mm || 116;
                                                                    const val = Math.max(24, Math.min(maxAllowed, Number(e.target.value) || (maxAllowed - 6)));
                                                                    setPrinterForm((prev) => ({
                                                                        ...prev,
                                                                        custom_printable_width_mm: val,
                                                                    }));
                                                                }}
                                                                className="w-full bg-transparent text-xs font-bold text-stone-900 focus:outline-none dark:text-white"
                                                            />
                                                            <span className="text-[10px] font-bold text-stone-400">mm</span>
                                                        </div>
                                                        <p className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                                                            Area cetak tanpa margin samping
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                                                            Jumlah Kolom per Baris (Chars):
                                                        </label>
                                                        <div className="mt-1 flex items-center rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 focus-within:border-brand-600 dark:border-stone-700 dark:bg-stone-800">
                                                            <input
                                                                type="number"
                                                                min="20"
                                                                max="64"
                                                                value={printerForm.custom_receipt_columns || 40}
                                                                onChange={(e) => {
                                                                    const val = Math.max(20, Math.min(64, Number(e.target.value) || 40));
                                                                    setPrinterForm((prev) => ({
                                                                        ...prev,
                                                                        custom_receipt_columns: val,
                                                                        receipt_columns: val,
                                                                        max_item_name_length: Math.max(16, val - 14),
                                                                    }));
                                                                }}
                                                                className="w-full bg-transparent text-xs font-bold text-stone-900 focus:outline-none dark:text-white"
                                                            />
                                                            <span className="text-[10px] font-bold text-stone-400">kolom</span>
                                                        </div>
                                                        <p className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                                                            Karakter per baris font standar
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg bg-amber-500/10 p-2.5 text-[11px] text-amber-900 dark:text-amber-300 border border-amber-300/40 dark:border-amber-800/40">
                                                    💡 <strong>Tips Printer USB Windows:</strong> Ukuran kertas kustom ini secara otomatis disinkronkan ke driver cetak Windows / WebPrint / Electron (`@page size: {printerForm.custom_paper_width_mm || 76}mm auto`). Fitur pemotong kertas otomatis (auto-cutter) otomatis aktif jika lebar kertas ≥ 75mm.
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* CARD 1.5: PENGATURAN JUMLAH KOLOM STRUK (58mm & 80mm) */}
                                    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                    <Columns className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                        Pengaturan Kolom Struk (Receipt Columns)
                                                    </h4>
                                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Atur jumlah karakter per baris untuk kertas 58 mm dan 80 mm agar hasil cetak pas dan rapi
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                                                <span>Aktif Saat Ini:</span>
                                                <span className="font-black underline">{printerForm.receipt_columns || (printerForm.paper_width === '80mm' ? printerForm.receipt_columns_80mm || 44 : printerForm.receipt_columns_58mm || 32)} Kolom</span>
                                                <span>({printerForm.paper_width})</span>
                                            </div>
                                        </div>

                                        {/* Section 1: Kolom untuk Kertas 58 mm */}
                                        <div className={`rounded-xl border p-3.5 transition ${
                                            printerForm.paper_width === '58mm'
                                                ? 'border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-950/20'
                                                : 'border-stone-200 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-800/40'
                                        }`}>
                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-black text-stone-800 dark:bg-stone-700 dark:text-stone-200">
                                                        58 MM
                                                    </span>
                                                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                                        Kertas 58 mm (Printer Mini & Bluetooth Portable)
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-bold text-brand-700 dark:text-brand-400">
                                                    Tersimpan: {printerForm.receipt_columns_58mm || 32} Karakter
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                                Standar printer 58mm adalah 32 karakter (Font A). Jika teks terpotong di tepi kanan kertas fisik, pilih 30 atau 28 kolom.
                                            </p>

                                            {/* Preset Buttons for 58mm */}
                                            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                                                {[
                                                    { cols: 28, label: '28 Kolom', sub: 'Margin Lebar' },
                                                    { cols: 30, label: '30 Kolom', sub: 'Rapat Rapi' },
                                                    { cols: 32, label: '32 Kolom', sub: 'Standar Font A' },
                                                    { cols: 36, label: '36 Kolom', sub: 'Padat' },
                                                    { cols: 40, label: '40 Kolom', sub: 'Font B Mini' },
                                                ].map((p) => {
                                                    const isSelected = (printerForm.receipt_columns_58mm || 32) === p.cols;
                                                    return (
                                                        <button
                                                            key={p.cols}
                                                            type="button"
                                                            onClick={() =>
                                                                setPrinterForm((prev) => ({
                                                                    ...prev,
                                                                    receipt_columns_58mm: p.cols,
                                                                    receipt_columns: prev.paper_width === '58mm' ? p.cols : prev.receipt_columns,
                                                                    max_item_name_length: p.cols >= 38 ? 26 : Math.min(p.cols - 10, 22),
                                                                }))
                                                            }
                                                            className={`cursor-pointer rounded-lg border p-2 text-center transition ${
                                                                isSelected
                                                                    ? 'border-brand-700 bg-brand-700 text-white shadow-2xs font-bold'
                                                                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                            }`}
                                                        >
                                                            <div className="text-xs font-bold">{p.label}</div>
                                                            <div className={`text-[9.5px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                                                                {p.sub}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom Input for 58mm */}
                                            <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 whitespace-nowrap">
                                                    Kustom Kolom 58mm:
                                                </label>
                                                <input
                                                    type="number"
                                                    min="24"
                                                    max="44"
                                                    value={printerForm.receipt_columns_58mm || 32}
                                                    onChange={(e) => {
                                                        const val = Math.max(20, Math.min(48, Number(e.target.value) || 32));
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            receipt_columns_58mm: val,
                                                            receipt_columns: prev.paper_width === '58mm' ? val : prev.receipt_columns,
                                                            max_item_name_length: val >= 38 ? 26 : Math.min(val - 10, 22),
                                                        }));
                                                    }}
                                                    className="w-20 rounded-lg border border-stone-200 bg-white px-2 py-1 text-center text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                                />
                                                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                                                    karakter per baris (rentang 24 - 44)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Section 2: Kolom untuk Kertas 80 mm */}
                                        <div className={`rounded-xl border p-3.5 transition ${
                                            printerForm.paper_width === '80mm'
                                                ? 'border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-950/20'
                                                : 'border-stone-200 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-800/40'
                                        }`}>
                                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-black text-stone-800 dark:bg-stone-700 dark:text-stone-200">
                                                        80 MM
                                                    </span>
                                                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                                        Kertas 80 mm (Printer Desktop & Kasir POS80)
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-bold text-brand-700 dark:text-brand-400">
                                                    Tersimpan: {printerForm.receipt_columns_80mm || 44} Karakter
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                                                Standar printer desktop 80mm adalah 42-44 kolom (Font A) atau 48-56 kolom untuk format padat.
                                            </p>

                                            {/* Preset Buttons for 80mm */}
                                            <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                                                {[
                                                    { cols: 40, label: '40 Kolom', sub: 'Renggang / Besar' },
                                                    { cols: 42, label: '42 Kolom', sub: 'Epson / Star TM' },
                                                    { cols: 44, label: '44 Kolom', sub: 'Standar POS80' },
                                                    { cols: 48, label: '48 Kolom', sub: 'Maksimal Rapi' },
                                                    { cols: 56, label: '56 Kolom', sub: 'Font B Padat' },
                                                ].map((p) => {
                                                    const isSelected = (printerForm.receipt_columns_80mm || 44) === p.cols;
                                                    return (
                                                        <button
                                                            key={p.cols}
                                                            type="button"
                                                            onClick={() =>
                                                                setPrinterForm((prev) => ({
                                                                    ...prev,
                                                                    receipt_columns_80mm: p.cols,
                                                                    receipt_columns: prev.paper_width === '80mm' ? p.cols : prev.receipt_columns,
                                                                    max_item_name_length: p.cols >= 44 ? 32 : 26,
                                                                }))
                                                            }
                                                            className={`cursor-pointer rounded-lg border p-2 text-center transition ${
                                                                isSelected
                                                                    ? 'border-brand-700 bg-brand-700 text-white shadow-2xs font-bold'
                                                                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                                            }`}
                                                        >
                                                            <div className="text-xs font-bold">{p.label}</div>
                                                            <div className={`text-[9.5px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                                                                {p.sub}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Custom Input for 80mm */}
                                            <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                                                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 whitespace-nowrap">
                                                    Kustom Kolom 80mm:
                                                </label>
                                                <input
                                                    type="number"
                                                    min="36"
                                                    max="64"
                                                    value={printerForm.receipt_columns_80mm || 44}
                                                    onChange={(e) => {
                                                        const val = Math.max(30, Math.min(72, Number(e.target.value) || 44));
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            receipt_columns_80mm: val,
                                                            receipt_columns: prev.paper_width === '80mm' ? val : prev.receipt_columns,
                                                            max_item_name_length: val >= 44 ? 32 : 26,
                                                        }));
                                                    }}
                                                    className="w-20 rounded-lg border border-stone-200 bg-white px-2 py-1 text-center text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                                />
                                                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                                                    karakter per baris (rentang 36 - 64)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CARD 2: OPSI CETAK STRUK */}
                                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                            Opsi Cetak & Hardware Kasir
                                        </h4>

                                        <div className="space-y-3 text-xs divide-y divide-stone-100 dark:divide-stone-800">
                                            <div className="flex items-center justify-between pt-1">
                                                <div>
                                                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                                                        Cetak Otomatis Struk
                                                    </div>
                                                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Buka cetak otomatis langsung setiap selesai pembayaran
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={printerForm.auto_print}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            auto_print: e.target.checked,
                                                        }))
                                                    }
                                                    className="h-4 w-4 cursor-pointer rounded text-brand-700 accent-brand-700"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between pt-3">
                                                <div>
                                                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                                                        Buka Laci Uang (Cash Drawer)
                                                    </div>
                                                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Kirim sinyal pulse pembuka laci otomatis saat pembayaran tunai
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(printerForm.open_cash_drawer)}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            open_cash_drawer: e.target.checked,
                                                        }))
                                                    }
                                                    className="h-4 w-4 cursor-pointer rounded text-brand-700 accent-brand-700"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between pt-3">
                                                <div>
                                                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                                                        Tampilkan Logo Brand Toko
                                                    </div>
                                                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                                        Cetak logo Toko di bagian paling atas struk
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={printerForm.show_logo !== false}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            show_logo: e.target.checked,
                                                        }))
                                                    }
                                                    className="h-4 w-4 cursor-pointer rounded text-brand-700 accent-brand-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* CARD 3: IDENTITAS & TEKS STRUK */}
                                    <div className="space-y-3.5 rounded-2xl border border-stone-200 bg-white p-5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                            Informasi Toko pada Struk
                                        </h4>

                                        <div>
                                            <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                Nama Toko:
                                            </label>
                                            <input
                                                type="text"
                                                value={printerForm.store_name}
                                                onChange={(e) =>
                                                    setPrinterForm((prev) => ({
                                                        ...prev,
                                                        store_name: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-bold text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                Tagline / Slogan:
                                            </label>
                                            <input
                                                type="text"
                                                value={printerForm.tagline || ''}
                                                onChange={(e) =>
                                                    setPrinterForm((prev) => ({
                                                        ...prev,
                                                        tagline: e.target.value,
                                                    }))
                                                }
                                                placeholder="Contoh: Close to Your Every Brew"
                                                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                Alamat Toko:
                                            </label>
                                            <input
                                                type="text"
                                                value={printerForm.address || ''}
                                                onChange={(e) =>
                                                    setPrinterForm((prev) => ({
                                                        ...prev,
                                                        address: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                    No. Telp / WhatsApp:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={printerForm.phone || ''}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            phone: e.target.value,
                                                        }))
                                                    }
                                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                    Instagram:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={printerForm.instagram || ''}
                                                    onChange={(e) =>
                                                        setPrinterForm((prev) => ({
                                                            ...prev,
                                                            instagram: e.target.value,
                                                        }))
                                                    }
                                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                                                Pesan Footer Struk:
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={printerForm.receipt_footer || ''}
                                                onChange={(e) =>
                                                    setPrinterForm((prev) => ({
                                                        ...prev,
                                                        receipt_footer: e.target.value,
                                                    }))
                                                }
                                                placeholder="Contoh: Terima kasih atas pesanannya!"
                                                className="mt-1 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                            />
                                        </div>
                                    </div>

                                    {/* CARD 4: UJI COBA & RESET */}
                                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                Uji Coba & Bantuan
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={handleResetPrinterDefaults}
                                                className="cursor-pointer text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                                            >
                                                Reset ke Standar
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            <button
                                                type="button"
                                                onClick={() => handlePreviewReceipt()}
                                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>Preview di POS</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleRunTestPrint('web')}
                                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                            >
                                                <Printer className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                                <span>Tes Fisik USB</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleRunTestPrint('bluetooth')}
                                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                            >
                                                <Smartphone className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                                <span>Tes Bluetooth</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* KOLOM KANAN: LIVE PREVIEW STRUK DI APLIKASI (5 COLS) */}
                                <div className="space-y-3 lg:col-span-5 lg:sticky lg:top-24">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                                                Pratinjau Struk
                                            </h4>
                                            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:bg-brand-950/60 dark:text-amber-300">
                                                Live {printerForm.paper_width}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handlePreviewReceipt()}
                                            className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline dark:text-amber-400"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>Layar Penuh</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-center rounded-2xl border border-stone-200 bg-stone-100/80 p-4 shadow-inner dark:border-stone-800 dark:bg-stone-950/60">
                                        <ThermalReceiptPreview
                                            receipt={getSampleTestReceipt()}
                                            paperWidth={printerForm.paper_width}
                                            customPaperWidthMm={printerForm.custom_paper_width_mm}
                                            receiptColumns={printerForm.receipt_columns || (printerForm.paper_width === '80mm' ? printerForm.receipt_columns_80mm || 44 : printerForm.paper_width === 'custom' ? printerForm.custom_receipt_columns || 40 : printerForm.receipt_columns_58mm || 32)}
                                            showLogo={printerForm.show_logo !== false}
                                            fontFamily={printerForm.font_family}
                                            fontSize={printerForm.font_size}
                                            fontWeight={printerForm.font_weight}
                                        />

                                        <div className="mt-4 flex w-full max-w-[280px] gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePreviewReceipt()}
                                                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>Buka Preview</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRunTestPrint('web')}
                                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 shadow-2xs transition hover:bg-stone-50 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
                                                title="Cetak langsung ke printer fisik"
                                            >
                                                <Printer className="h-3.5 w-3.5" />
                                                <span>Cetak</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUBTAB B: METODE PEMBAYARAN */}
                    {settingsSubTab === 'payment' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSavePaymentSettings}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>Simpan Pengaturan Pembayaran</span>
                                </button>
                            </div>

                            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
                                <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                    Metode Pembayaran yang Aktif di Kasir
                                </h3>

                                <div className="space-y-3">
                                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                                        <div className="flex items-center gap-3">
                                            <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            <div>
                                                <div className="text-xs font-bold text-stone-900 dark:text-white">
                                                    Uang Tunai (Cash)
                                                </div>
                                                <div className="text-[11px] text-stone-500 dark:text-stone-300">
                                                    Pembayaran tunai dengan
                                                    kalkulator uang kembalian
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={paymentForm.enable_cash}
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    enable_cash:
                                                        e.target.checked,
                                                }))
                                            }
                                            className="h-5 w-5 cursor-pointer rounded text-brand-700 accent-brand-700"
                                        />
                                    </label>

                                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                                        <div className="flex items-center gap-3">
                                            <QrCode className="h-5 w-5 text-brand-700 dark:text-amber-400" />
                                            <div>
                                                <div className="text-xs font-bold text-stone-900 dark:text-white">
                                                    QRIS (GoPay, OVO, Dana, BCA,
                                                    dll)
                                                </div>
                                                <div className="text-[11px] text-stone-500 dark:text-stone-300">
                                                    Scan QRIS kasir resmi toko
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={paymentForm.enable_qris}
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    enable_qris:
                                                        e.target.checked,
                                                }))
                                            }
                                            className="h-5 w-5 cursor-pointer rounded text-brand-700 accent-brand-700"
                                        />
                                    </label>

                                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
                                            <div>
                                                <div className="text-xs font-bold text-stone-900 dark:text-white">
                                                    Kartu Debit / EDC
                                                </div>
                                                <div className="text-[11px] text-stone-500 dark:text-stone-300">
                                                    Pembayaran via mesin gesek
                                                    EDC fisik di toko
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={paymentForm.enable_debit}
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    enable_debit:
                                                        e.target.checked,
                                                }))
                                            }
                                            className="h-5 w-5 cursor-pointer rounded text-brand-700 accent-brand-700"
                                        />
                                    </label>

                                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-brand-700 dark:text-sky-400" />
                                            <div>
                                                <div className="text-xs font-bold text-stone-900 dark:text-white">
                                                    Transfer Bank Langsung
                                                </div>
                                                <div className="text-[11px] text-stone-500 dark:text-stone-300">
                                                    Transfer manual ke rekening
                                                    bank roastery
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={
                                                paymentForm.enable_bank_transfer
                                            }
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    enable_bank_transfer:
                                                        e.target.checked,
                                                }))
                                            }
                                            className="h-5 w-5 cursor-pointer rounded text-brand-700 accent-brand-700"
                                        />
                                    </label>
                                </div>

                                <div className="space-y-3 border-t border-stone-100 pt-3 text-xs dark:border-stone-800">
                                    <div>
                                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                            Petunjuk QRIS di Kasir:
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                paymentForm.qris_instructions ||
                                                ''
                                            }
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    qris_instructions:
                                                        e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-medium text-stone-500 dark:text-stone-300">
                                            Informasi Rekening Bank:
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentForm.bank_info || ''}
                                            onChange={(e) =>
                                                setPaymentForm((prev) => ({
                                                    ...prev,
                                                    bank_info: e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-stone-900 outline-none focus:border-brand-600 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUBTAB C: TEMA & MODE GELAP */}
                    {settingsSubTab === 'appearance' && (
                        <div className="space-y-6">
                            <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6 dark:border-stone-800 dark:bg-stone-900">
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-bold text-brand-950 dark:text-stone-100">
                                        <Sun className="h-5 w-5 text-amber-500" />
                                        <span>
                                            Preferensi Mode & Tampilan POS
                                        </span>
                                    </h3>
                                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                        Pilih tampilan antarmuka kasir yang
                                        paling nyaman untuk mata Anda saat
                                        operasional toko siang maupun malam
                                        hari.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-3">
                                    {/* Mode Terang */}
                                    <div
                                        onClick={() =>
                                            updateAppearance('light')
                                        }
                                        className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                                            appearance === 'light'
                                                ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                                                    <Sun className="h-5 w-5" />
                                                </div>
                                                {appearance === 'light' && (
                                                    <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                    Mode Terang (Light)
                                                </h4>
                                                <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                    Warna latar putih dan
                                                    bersih. Sangat optimal untuk
                                                    kasir pada siang hari atau
                                                    ruangan toko yang terang.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`mt-5 w-full cursor-pointer rounded-xl py-2.5 text-xs font-bold transition ${
                                                appearance === 'light'
                                                    ? 'bg-brand-700 text-white shadow-xs'
                                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            {appearance === 'light'
                                                ? '✓ Mode Terang Aktif'
                                                : 'Pilih Mode Terang'}
                                        </button>
                                    </div>

                                    {/* Mode Gelap */}
                                    <div
                                        onClick={() => updateAppearance('dark')}
                                        className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                                            appearance === 'dark'
                                                ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                                                    <Moon className="h-5 w-5" />
                                                </div>
                                                {appearance === 'dark' && (
                                                    <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                    Mode Gelap (Dark)
                                                </h4>
                                                <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                    Warna latar gelap dan
                                                    kontras teratur. Meredakan
                                                    ketegangan mata saat
                                                    operasional malam hari atau
                                                    pencahayaan temaram.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`mt-5 w-full cursor-pointer rounded-xl py-2.5 text-xs font-bold transition ${
                                                appearance === 'dark'
                                                    ? 'bg-brand-700 text-white shadow-xs'
                                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            {appearance === 'dark'
                                                ? '✓ Mode Gelap Aktif'
                                                : 'Pilih Mode Gelap'}
                                        </button>
                                    </div>

                                    {/* Ikuti Sistem */}
                                    <div
                                        onClick={() =>
                                            updateAppearance('system')
                                        }
                                        className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all ${
                                            appearance === 'system'
                                                ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                                    <Monitor className="h-5 w-5" />
                                                </div>
                                                {appearance === 'system' && (
                                                    <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[11px] font-bold text-white">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                    Ikuti Sistem
                                                </h4>
                                                <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                    Secara otomatis menyesuaikan
                                                    preferensi tema terang atau
                                                    gelap sesuai pengaturan
                                                    bawaan sistem operasi
                                                    komputer / tablet Anda.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`mt-5 w-full cursor-pointer rounded-xl py-2.5 text-xs font-bold transition ${
                                                appearance === 'system'
                                                    ? 'bg-brand-700 text-white shadow-xs'
                                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                                            }`}
                                        >
                                            {appearance === 'system'
                                                ? '✓ Ikuti Sistem Aktif'
                                                : 'Pilih Ikuti Sistem'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* CARD 2: KEPADATAN KATALOG & JUMLAH KOLOM (GRID DENSITY) */}
                            <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6 dark:border-stone-800 dark:bg-stone-900">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="flex items-center gap-2 text-base font-bold text-brand-950 dark:text-stone-100">
                                            <LayoutGrid className="h-5 w-5 text-brand-700 dark:text-amber-400" />
                                            <span>Kepadatan Katalog & Jumlah Kolom (Grid Density)</span>
                                        </h3>
                                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                            Sesuaikan ukuran kartu produk, jarak antar item, dan jumlah kolom di layar kasir untuk kenyamanan dan efisiensi kerja.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSaveLayoutSettings}
                                        disabled={isSavingSettings}
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>
                                            {isSavingSettings ? 'Menyimpan...' : 'Simpan Tampilan'}
                                        </span>
                                    </button>
                                </div>

                                {/* Pilihan Kepadatan (Density) */}
                                <div>
                                    <div className="mb-2 text-xs font-bold text-stone-700 dark:text-stone-300">
                                        Pilih Kepadatan Tampilan:
                                    </div>
                                    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
                                        {/* Density 1: Compact / Rapat */}
                                        <div
                                            onClick={() => updateGridDensity('compact')}
                                            className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all ${
                                                gridDensity === 'compact'
                                                    ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                    : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                            }`}
                                        >
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                                                        Efisien & Padat
                                                    </span>
                                                    {gridDensity === 'compact' && (
                                                        <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                        Rapat / Ringkas (Compact)
                                                    </h4>
                                                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                        Ukuran kartu lebih ramping, padding rapat, muat lebih banyak produk dalam satu layar kasir tanpa banyak scroll.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-brand-700 dark:text-amber-400">
                                                {gridDensity === 'compact' ? '✓ Sedang Digunakan' : 'Klik untuk Pilih'}
                                            </div>
                                        </div>

                                        {/* Density 2: Normal / Standar */}
                                        <div
                                            onClick={() => updateGridDensity('normal')}
                                            className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all ${
                                                gridDensity === 'normal'
                                                    ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                    : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                            }`}
                                        >
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        Standar Default
                                                    </span>
                                                    {gridDensity === 'normal' && (
                                                        <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                        Standar (Normal)
                                                    </h4>
                                                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                        Tampilan seimbang dengan proporsi gambar, teks nama kopi, dan tombol tambah yang nyaman untuk semua perangkat.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-brand-700 dark:text-amber-400">
                                                {gridDensity === 'normal' ? '✓ Sedang Digunakan' : 'Klik untuk Pilih'}
                                            </div>
                                        </div>

                                        {/* Density 3: Comfortable / Lega */}
                                        <div
                                            onClick={() => updateGridDensity('comfortable')}
                                            className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all ${
                                                gridDensity === 'comfortable'
                                                    ? 'border-brand-600 bg-brand-50/40 shadow-sm dark:bg-stone-800'
                                                    : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
                                            }`}
                                        >
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                        Layar Sentuh / Tablet
                                                    </span>
                                                    {gridDensity === 'comfortable' && (
                                                        <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                                        Lega / Nyaman (Comfortable)
                                                    </h4>
                                                    <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                                        Kartu produk lebih besar, tulisan lebih besar, dan tombol lebih lapang. Sangat cocok untuk jari di tablet POS.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-brand-700 dark:text-amber-400">
                                                {gridDensity === 'comfortable' ? '✓ Sedang Digunakan' : 'Klik untuk Pilih'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pilihan Jumlah Kolom */}
                                <div className="space-y-2 border-t border-stone-100 pt-4 dark:border-stone-800">
                                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                        <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                            Jumlah Kolom Katalog Produk:
                                        </div>
                                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                            {gridColumns === 'auto'
                                                ? 'Menyesuaikan lebar layar kasir secara otomatis'
                                                : `Terkunci pada ${gridColumns} kolom`}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                        {(['auto', 2, 3, 4, 5, 6] as const).map((col) => (
                                            <button
                                                key={col}
                                                type="button"
                                                onClick={() => updateGridColumns(col as any)}
                                                className={`cursor-pointer rounded-xl border p-2.5 text-center transition ${
                                                    gridColumns === col
                                                        ? 'border-brand-700 bg-brand-700 font-bold text-white shadow-2xs'
                                                        : 'border-stone-200 bg-stone-50 font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                }`}
                                            >
                                                <div className="text-xs">
                                                    {col === 'auto' ? 'Otomatis' : `${col} Kolom`}
                                                </div>
                                                <div className={`mt-0.5 text-[10px] ${gridColumns === col ? 'text-white/80' : 'text-stone-400'}`}>
                                                    {col === 'auto' ? 'Auto Grid' : `${col} Grid`}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mini Live Sample Preview */}
                                <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-800 dark:bg-stone-950/40">
                                    <div className="mb-3 flex items-center justify-between text-xs">
                                        <span className="font-bold text-stone-700 dark:text-stone-300">
                                            Simulasi Kartu Produk ({gridDensity.toUpperCase()} • {gridColumns === 'auto' ? 'AUTO' : `${gridColumns} KOLOM`}):
                                        </span>
                                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                            Contoh tampilan langsung di katalog
                                        </span>
                                    </div>

                                    <div className="max-w-md">
                                        <div className={`relative flex rounded-xl border border-stone-200 bg-white text-left shadow-2xs dark:border-stone-800 dark:bg-stone-900 ${
                                            gridDensity === 'compact'
                                                ? 'p-2'
                                                : gridDensity === 'comfortable'
                                                ? 'p-3.5'
                                                : 'p-2.5'
                                        }`}>
                                            <div className={`aspect-square shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-stone-100 dark:border-stone-800 dark:bg-stone-800 ${
                                                gridDensity === 'compact'
                                                    ? 'h-12 w-12'
                                                    : gridDensity === 'comfortable'
                                                    ? 'h-16 w-16'
                                                    : 'h-14 w-14'
                                            }`}>
                                                <img
                                                    src="/brand/logo-circle.png"
                                                    alt="Sample"
                                                    className="h-full w-full object-contain p-1"
                                                />
                                            </div>
                                            <div className="ml-3 flex flex-1 flex-col justify-between">
                                                <div>
                                                    <span className="rounded border border-brand-800 bg-brand-950 px-1.5 py-0.5 text-[8px] font-bold text-amber-300 uppercase">
                                                        HOUSEBLEND
                                                    </span>
                                                    <h5 className={`font-bold text-stone-900 dark:text-white ${
                                                        gridDensity === 'compact'
                                                            ? 'text-[11px]'
                                                            : gridDensity === 'comfortable'
                                                            ? 'text-sm'
                                                            : 'text-xs'
                                                    }`}>
                                                        Funky Berry Natural Anaerobic
                                                    </h5>
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <span className={`font-black text-brand-700 dark:text-emerald-400 ${
                                                        gridDensity === 'compact'
                                                            ? 'text-xs'
                                                            : gridDensity === 'comfortable'
                                                            ? 'text-sm'
                                                            : 'text-xs'
                                                    }`}>
                                                        Rp 75.000
                                                    </span>
                                                    <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-stone-800 dark:text-emerald-400">
                                                        + Tambah
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUBTAB D: MANAJEMEN STAF (KHUSUS OWNER & ADMIN) */}
                    {settingsSubTab === 'staff' && isOwner && (
                        <div className="space-y-5 sm:space-y-6">
                            {/* Banner Penjelasan Role Owner */}
                            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 dark:bg-amber-500/15">
                                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                                            Akses Khusus Akun Owner: Manajemen
                                            Tim & Kasir
                                        </h3>
                                        <span className="shrink-0 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-stone-950 uppercase">
                                            Owner Only
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-amber-900/80 dark:text-amber-300/80">
                                        Tambahkan akun baru untuk staf kasir
                                        atau admin outlet langsung dari aplikasi
                                        POS. Staf yang didaftarkan dapat
                                        langsung masuk melalui portal login POS
                                        kasir (
                                        <code className="font-mono font-semibold">
                                            /pos/login
                                        </code>
                                        ).
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
                                {/* KOLOM KIRI: FORM TAMBAH STAF BARU */}
                                <div className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:space-y-5 sm:p-6 lg:col-span-5 dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex items-center gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
                                        <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                                            <UserPlus className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                                Tambah Staf Baru
                                            </h4>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                Buat akun untuk kasir atau admin
                                                outlet
                                            </p>
                                        </div>
                                    </div>

                                    {staffFormError && (
                                        <div className="flex animate-in items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 fade-in dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300">
                                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                                            <span>{staffFormError}</span>
                                        </div>
                                    )}

                                    <form
                                        onSubmit={handleCreateStaff}
                                        className="space-y-4 text-xs"
                                    >
                                        {/* Nama Lengkap */}
                                        <div className="space-y-1">
                                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                Nama Lengkap Staf{' '}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={staffName}
                                                onChange={(e) =>
                                                    setStaffName(e.target.value)
                                                }
                                                placeholder="Contoh: Barista Kasir 1"
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                            />
                                        </div>

                                        {/* Email Login */}
                                        <div className="space-y-1">
                                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                Email Login POS{' '}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={staffEmail}
                                                onChange={(e) =>
                                                    setStaffEmail(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: kasir1@pos.test"
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                            />
                                            <span className="block text-[10px] text-stone-400">
                                                Digunakan staf untuk login ke
                                                aplikasi POS
                                            </span>
                                        </div>

                                        {/* Peran / Role */}
                                        <div className="space-y-1">
                                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                Peran / Hak Akses POS{' '}
                                                <span className="text-rose-500">
                                                    *
                                                </span>
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setStaffRole('kasir')
                                                    }
                                                    className={`cursor-pointer rounded-xl border px-2.5 py-2 text-center font-bold transition ${
                                                        staffRole === 'kasir'
                                                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                                    }`}
                                                >
                                                    Kasir
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setStaffRole('admin')
                                                    }
                                                    className={`cursor-pointer rounded-xl border px-2.5 py-2 text-center font-bold transition ${
                                                        staffRole === 'admin'
                                                            ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                                    }`}
                                                >
                                                    Admin
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setStaffRole('owner')
                                                    }
                                                    className={`cursor-pointer rounded-xl border px-2.5 py-2 text-center font-bold transition ${
                                                        staffRole === 'owner'
                                                            ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                                                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                                                    }`}
                                                >
                                                    Owner
                                                </button>
                                            </div>
                                            <span className="block text-[10px] text-stone-400">
                                                {staffRole === 'kasir' &&
                                                    'Kasir: Transaksi penjualan, cetak struk, antrian pesanan & kas harian.'}
                                                {staffRole === 'admin' &&
                                                    'Admin: Akses operasional kasir, inventori & pengaturan POS.'}
                                                {staffRole === 'owner' &&
                                                    'Owner: Hak akses pemilik penuh termasuk menambah staf & finansial.'}
                                            </span>
                                        </div>

                                        {/* Password & Konfirmasi Password */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                    Password{' '}
                                                    <span className="text-rose-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    value={staffPassword}
                                                    onChange={(e) =>
                                                        setStaffPassword(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Min. 6 karakter"
                                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                    Konfirmasi Password{' '}
                                                    <span className="text-rose-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="password"
                                                    required
                                                    minLength={6}
                                                    value={staffPasswordConfirm}
                                                    onChange={(e) =>
                                                        setStaffPasswordConfirm(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ulangi password"
                                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                                />
                                            </div>
                                        </div>

                                        {/* No Telp (Opsional) */}
                                        <div className="space-y-1">
                                            <label className="font-semibold text-stone-700 dark:text-stone-300">
                                                Nomor WhatsApp / HP (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={staffPhone}
                                                onChange={(e) =>
                                                    setStaffPhone(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 081234567890"
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isAddingStaff}
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95 disabled:opacity-50"
                                        >
                                            <UserPlus
                                                className={`h-4 w-4 ${isAddingStaff ? 'animate-bounce' : ''}`}
                                            />
                                            <span>
                                                {isAddingStaff
                                                    ? 'Menyimpan Staf...'
                                                    : 'Tambahkan Staf ke POS'}
                                            </span>
                                        </button>
                                    </form>
                                </div>

                                {/* KOLOM KANAN: DAFTAR STAF TERDAFTAR */}
                                <div className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6 lg:col-span-7 dark:border-stone-800 dark:bg-stone-900">
                                    <div className="flex flex-col justify-between gap-2 border-b border-stone-100 pb-3 sm:flex-row sm:items-center dark:border-stone-800">
                                        <div>
                                            <h4 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                                <span>
                                                    Daftar Tim & Staf POS
                                                </span>
                                                <span className="py-0.2 rounded-full bg-stone-100 px-2 text-[10px] font-black text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                                    {staff.length} Staf
                                                </span>
                                            </h4>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                                Seluruh akun internal yang
                                                memiliki hak akses login ke POS
                                            </p>
                                        </div>

                                        {/* Search Filter */}
                                        <div className="relative w-full sm:w-48">
                                            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                                            <input
                                                type="text"
                                                value={staffSearchQuery}
                                                onChange={(e) =>
                                                    setStaffSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Cari staf..."
                                                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pr-3 pl-8 text-xs text-stone-900 placeholder-stone-400 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* List Staf */}
                                    <div className="max-h-[460px] space-y-1 divide-y divide-stone-100 overflow-y-auto pr-1 dark:divide-stone-800">
                                        {staff
                                            .filter((s) => {
                                                if (!staffSearchQuery.trim())
                                                    return true;
                                                const q =
                                                    staffSearchQuery.toLowerCase();
                                                return (
                                                    (s.name ? s.name.toLowerCase().includes(q) : false) ||
                                                    (s.email ? s.email.toLowerCase().includes(q) : false) ||
                                                    (s.role ? s.role.toLowerCase().includes(q) : false)
                                                );
                                            })
                                            .map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-stone-50 dark:hover:bg-stone-800/40"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold uppercase ${
                                                                member.role ===
                                                                'owner'
                                                                    ? 'border border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                                    : member.role ===
                                                                        'admin'
                                                                      ? 'border border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                                      : 'border border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                            }`}
                                                        >
                                                            {member.name.slice(
                                                                0,
                                                                2,
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="truncate text-xs font-bold text-stone-900 dark:text-white">
                                                                    {
                                                                        member.name
                                                                    }
                                                                </span>
                                                                {member.id ===
                                                                    cashier.id && (
                                                                    <span className="py-0.2 rounded bg-stone-200 px-1.5 text-[9px] font-bold text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
                                                                {member.email}
                                                            </p>
                                                            {member.phone && (
                                                                <p className="text-[10px] text-stone-400">
                                                                    WA:{' '}
                                                                    {
                                                                        member.phone
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <span
                                                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                                                                member.role ===
                                                                'owner'
                                                                    ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                                                                    : member.role ===
                                                                        'admin'
                                                                      ? 'border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                                                                      : 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                                                            }`}
                                                        >
                                                            {member.role}
                                                        </span>

                                                        {member.id !==
                                                            cashier.id &&
                                                            member.id !== 1 && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        deletingStaffId ===
                                                                        member.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleDeleteStaff(
                                                                            member,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                                                                    title={`Hapus akses staf ${member.name}`}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUBTAB E: PENGATURAN KATEGORI PRODUK POS */}
                    {settingsSubTab === 'categories' && (
                        <CategorySettings
                            categories={categories}
                            onCategoriesChange={(newCats) => setCategories(newCats)}
                            showToast={showToast}
                        />
                    )}

                    {/* SUBTAB F: PENGATURAN MENU CAFE (FOOD & DRINK) */}
                    {settingsSubTab === 'menu' && (
                        <MenuSettings
                            products={products}
                            categories={categories}
                            onProductsChange={(newProds) => setProducts(newProds as any)}
                            showToast={showToast}
                        />
                    )}
                </div>
            )}

            {/* === MOBILE STICKY BOTTOM CHECKOUT BUTTON (Halaman Produk: Hanya Tampil Tombol Lihat Keranjang Ringkas) === */}
            {activeTab === 'cashier' && cart.length > 0 && (
                <div className="fixed right-0 bottom-0 left-0 z-30 animate-in border-t border-stone-200 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md duration-200 slide-in-from-bottom md:hidden dark:border-stone-800 dark:bg-stone-900/95">
                    <button
                        type="button"
                        onClick={() => setIsMobileCartOpen(true)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-[#273a41] px-4 py-3 text-sm font-black tracking-wider text-white shadow-md transition-all hover:bg-[#1e2e34] active:scale-[0.99] dark:bg-brand-700 dark:hover:bg-brand-600"
                    >
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-bold text-white">
                                {totalItemsCount} item
                            </span>
                            <span className="text-xs font-extrabold sm:text-sm">
                                LIHAT KERANJANG
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-black sm:text-base">
                            <span>Rp {formatRp(totalAmount)}</span>
                            <ChevronRight className="h-4 w-4 stroke-[2.8]" />
                        </div>
                    </button>
                </div>
            )}

            {/* === MOBILE CART SLIDE-UP DRAWER === */}
            {isMobileCartOpen && (
                <div className="fixed inset-0 z-50 flex animate-in flex-col justify-end duration-200 fade-in md:hidden">
                    <div
                        className="fixed inset-0 cursor-pointer bg-brand-950/70 backdrop-blur-xs dark:bg-black/80"
                        onClick={() => setIsMobileCartOpen(false)}
                    />
                    <div className="relative z-10 flex max-h-[85vh] animate-in flex-col rounded-t-3xl border-t border-stone-200 bg-white text-stone-900 shadow-2xl duration-200 slide-in-from-bottom dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                        <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-800">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 shrink-0 text-stone-800 dark:text-stone-200" />
                                <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                                    ({totalItemsCount} item)
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {cart.length > 0 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMobileCartOpen(false);
                                                openSharePreBillModal();
                                            }}
                                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900"
                                            title="Share Struk ke WA"
                                        >
                                            <Share2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                                            <span>Share WA</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMobileCartOpen(false);
                                                openHoldModal();
                                            }}
                                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900"
                                            title="Simpan ke antrian"
                                        >
                                            <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                                            <span>Antrian</span>
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsMobileCartOpen(false)}
                                    className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[45vh] flex-1 touch-pan-y space-y-2.5 overflow-y-auto overscroll-y-contain bg-stone-50/40 p-4 dark:bg-stone-950/40">
                            {cart.length === 0 ? (
                                <div className="py-12 text-center text-stone-500 dark:text-stone-400">
                                    <ShoppingCart className="mx-auto mb-2 h-10 w-10 text-stone-400 dark:text-stone-500" />
                                    <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                                        Keranjang Masih Kosong
                                    </p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="dark:bg-stone-850 flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-white p-3 shadow-2xs sm:p-3.5 dark:border-stone-800 dark:bg-stone-900"
                                    >
                                        {item.is_manual ? (
                                            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-300 bg-amber-500/10 text-amber-700 sm:h-16 sm:w-16 dark:border-amber-700/60 dark:bg-amber-400/10 dark:text-amber-400">
                                                <Calculator className="h-5 w-5 stroke-[2]" />
                                                <span className="mt-0.5 text-[9px] font-black tracking-wider uppercase">
                                                    Manual
                                                </span>
                                            </div>
                                        ) : (
                                            <img
                                                src={
                                                    item.image ||
                                                    '/brand/logo-circle.png'
                                                }
                                                alt={item.product_name}
                                                onError={(e) => {
                                                    const target =
                                                        e.currentTarget;
                                                    if (
                                                        !target.src.endsWith(
                                                            '/brand/logo-circle.png',
                                                        )
                                                    ) {
                                                        target.src =
                                                            '/brand/logo-circle.png';
                                                    }
                                                }}
                                                className="h-14 w-14 shrink-0 rounded-xl border border-stone-200 bg-stone-100 object-cover sm:h-16 sm:w-16 dark:border-stone-700 dark:bg-stone-800"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <h4 className="truncate text-sm leading-snug font-bold text-stone-900 dark:text-white">
                                                    {item.product_name}
                                                </h4>
                                                {item.is_manual && (
                                                    <span className="py-0.2 rounded border border-amber-300 bg-amber-100 px-1.5 text-[10px] font-extrabold text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                                        Manual
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                                                <span className="rounded-md border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand-800 dark:border-stone-700 dark:bg-stone-800 dark:text-amber-300">
                                                    {item.variant_label}
                                                </span>
                                                <span className="font-medium text-stone-500 dark:text-stone-400">
                                                    @ Rp {formatRp(item.price)}
                                                </span>
                                                {item.is_manual && (
                                                    <>
                                                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                                                            (HPP: Rp{' '}
                                                            {formatRp(
                                                                item.cost_price ||
                                                                    0,
                                                            )}
                                                            )
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsMobileCartOpen(
                                                                    false,
                                                                );
                                                                openManualOrderModal(
                                                                    item,
                                                                );
                                                            }}
                                                            className="ml-1 flex cursor-pointer items-center gap-0.5 text-[11px] font-bold text-brand-700 hover:underline dark:text-amber-400"
                                                        >
                                                            <Pencil className="h-2.5 w-2.5" />
                                                            <span>Edit</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {item.is_manual && (
                                                <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                    <span>
                                                        Laba Kotor: +Rp{' '}
                                                        {formatRp(
                                                            (item.price -
                                                                (item.cost_price ||
                                                                    0)) *
                                                                item.quantity,
                                                        )}
                                                    </span>
                                                    {item.price > 0 && (
                                                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                                                            (
                                                            {(
                                                                ((item.price -
                                                                    (item.cost_price ||
                                                                        0)) /
                                                                    item.price) *
                                                                100
                                                            ).toFixed(0)}
                                                            %)
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Item Pricing & Discount Badge */}
                                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                {item.discount_amount &&
                                                item.discount_amount > 0 ? (
                                                    <>
                                                        <span className="text-sm font-black text-brand-900 dark:text-emerald-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                item.price *
                                                                    item.quantity -
                                                                    item.discount_amount,
                                                            )}
                                                        </span>
                                                        <s className="text-xs font-normal text-stone-400 dark:text-stone-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                item.price *
                                                                    item.quantity,
                                                            )}
                                                        </s>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openItemDiscountModal(
                                                                    item,
                                                                )
                                                            }
                                                            className="cursor-pointer rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-200 dark:hover:bg-emerald-900"
                                                        >
                                                            {item.discount_type ===
                                                            'percent'
                                                                ? `-${item.discount_value}%`
                                                                : `-Rp ${formatRp(item.discount_amount)}`}{' '}
                                                            ✎
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-sm font-black text-brand-900 dark:text-emerald-400">
                                                            Rp{' '}
                                                            {formatRp(
                                                                item.price *
                                                                    item.quantity,
                                                            )}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openItemDiscountModal(
                                                                    item,
                                                                )
                                                            }
                                                            className="rounded border border-dashed border-stone-300 px-2 py-0.5 text-xs font-semibold text-stone-600 hover:text-brand-800 dark:border-stone-600 dark:bg-stone-800/80 dark:text-stone-300 dark:hover:text-white"
                                                        >
                                                            + Diskon
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-900">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(item.id, -1)
                                                }
                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-200 hover:text-stone-950 active:scale-95 sm:h-8 sm:w-8 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-7 text-center text-sm font-black text-stone-900 dark:text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(item.id, 1)
                                                }
                                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-stone-700 transition hover:bg-stone-200 hover:text-stone-950 active:scale-95 sm:h-8 sm:w-8 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Sticky Drawer Footer Summary */}
                        <div className="max-h-[75vh] shrink-0 touch-pan-y space-y-3 overflow-y-auto overscroll-y-contain border-t border-stone-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.12)] dark:border-stone-800 dark:bg-stone-900">
                            {/* Item count indicator & Hemat (Muncul di Halaman Lihat Keranjang) */}
                            <div className="flex items-center justify-between border-b border-stone-100 pb-2 text-xs text-stone-600 dark:border-stone-800 dark:text-stone-300">
                                <div className="flex items-center gap-1.5 font-bold text-brand-800 dark:text-stone-200">
                                    <ShoppingCart className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                                    <span>{totalItemsCount} item di struk</span>
                                </div>
                                {discountAmount > 0 && (
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        Hemat Rp {formatRp(discountAmount)}
                                    </span>
                                )}
                            </div>

                            {/* Pengiriman / Ongkos Kirim POS Section (Mobile) */}
                            <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-2.5 dark:border-stone-700/80 dark:bg-stone-800/60">
                                <div className="flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-stone-800 select-none dark:text-stone-200">
                                        <input
                                            type="checkbox"
                                            checked={isDeliveryOrder}
                                            onChange={(e) =>
                                                setIsDeliveryOrder(
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 cursor-pointer rounded text-brand-700 focus:ring-brand-500 dark:text-emerald-500"
                                        />
                                        <Truck className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                        <span>Kirim Pesanan (Ongkir)</span>
                                    </label>
                                    {isDeliveryOrder &&
                                        numericShippingCost > 0 && (
                                            <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                Rp{' '}
                                                {formatRp(numericShippingCost)}
                                            </span>
                                        )}
                                </div>

                                {isDeliveryOrder && (
                                    <div className="animate-in space-y-2 border-t border-stone-200 pt-1.5 fade-in dark:border-stone-700">
                                        <div>
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                                Nominal Ongkir (Rp):
                                            </label>
                                            <div className="relative mt-0.5">
                                                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-stone-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        shippingCost === ''
                                                            ? ''
                                                            : shippingCost
                                                    }
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value ===
                                                            ''
                                                                ? ''
                                                                : Math.max(
                                                                      0,
                                                                      parseFloat(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ) || 0,
                                                                  );
                                                        setShippingCost(val);
                                                    }}
                                                    placeholder="0"
                                                    className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pr-2.5 pl-8 text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                                Alamat Pengiriman:
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={customerAddress}
                                                onChange={(e) =>
                                                    setCustomerAddress(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Alamat lengkap tujuan kirim..."
                                                className="mt-0.5 w-full resize-none rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                                Kurir / Ekspedisi (Opsional):
                                            </label>
                                            <input
                                                type="text"
                                                value={shippingCourier}
                                                onChange={(e) =>
                                                    setShippingCourier(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="J&T / JNE / SiCepat / Lalamove / Grab..."
                                                className="mt-0.5 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between text-stone-600 dark:text-stone-300">
                                    <span className="font-medium text-stone-700 dark:text-stone-300">
                                        Subtotal
                                    </span>
                                    <span className="font-bold text-stone-800 dark:text-white">
                                        Rp {formatRp(grossSubtotal)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-medium text-stone-700 dark:text-stone-300">
                                            Diskon
                                        </span>
                                        {cartDiscountValue > 0 &&
                                            cartDiscountType === 'percent' && (
                                                <span className="py-0.2 rounded border border-emerald-200 bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                                                    {cartDiscountValue}%
                                                </span>
                                            )}
                                        <button
                                            type="button"
                                            onClick={openCartDiscountModal}
                                            className="cursor-pointer text-xs font-bold text-sky-600 hover:underline dark:text-sky-300"
                                        >
                                            [Ubah]
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-stone-900 dark:text-stone-200">
                                            -Rp {formatRp(discountAmount)}
                                        </span>
                                        {totalItemDiscounts > 0 &&
                                            cartDiscountAmount > 0 && (
                                                <div className="text-[10px] text-stone-400 dark:text-stone-400">
                                                    Item: -Rp{' '}
                                                    {formatRp(
                                                        totalItemDiscounts,
                                                    )}{' '}
                                                    | Trx: -Rp{' '}
                                                    {formatRp(
                                                        cartDiscountAmount,
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {isDeliveryOrder && numericShippingCost > 0 && (
                                    <div className="flex items-center justify-between text-stone-600 dark:text-stone-300">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-stone-700 dark:text-stone-300">
                                                Ongkos Kirim
                                            </span>
                                            {shippingCourier && (
                                                <span className="py-0.2 rounded border border-blue-200 bg-blue-50 px-1.5 text-[10px] font-bold text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                    {shippingCourier}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-bold text-stone-900 dark:text-stone-200">
                                            Rp {formatRp(numericShippingCost)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-baseline justify-between border-t border-stone-200 pt-2 dark:border-stone-800">
                                    <span className="text-sm font-bold tracking-wide text-stone-900 uppercase dark:text-stone-200">
                                        TOTAL
                                    </span>
                                    <span className="text-2xl font-black text-stone-950 dark:text-emerald-400">
                                        Rp {formatRp(totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={cart.length === 0}
                                onClick={() => {
                                    setIsMobileCartOpen(false);
                                    openCheckout();
                                }}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#273a41] px-4 py-3.5 text-sm font-black tracking-wider text-white shadow-md transition-all hover:bg-[#1e2e34] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-700 dark:hover:bg-brand-600"
                            >
                                <span>BAYAR</span>
                                <ChevronRight className="h-5 w-5 stroke-[2.8]" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === MODAL 1: VARIANT PICKER MODAL (Coffee Beans & Retail) === */}
            {variantPickerProduct && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-brand-950/60 p-4 backdrop-blur-xs fade-in dark:bg-black/80">
                    <div className="w-full max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        variantPickerProduct.image ||
                                        '/brand/logo-circle.png'
                                    }
                                    alt={variantPickerProduct.name}
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        if (
                                            !target.src.endsWith(
                                                '/brand/logo-circle.png',
                                            )
                                        ) {
                                            target.src =
                                                '/brand/logo-circle.png';
                                        }
                                    }}
                                    className="h-12 w-12 rounded-xl border border-stone-100 bg-stone-50 object-cover dark:border-stone-700 dark:bg-stone-800"
                                />
                                <div>
                                    <h3 className="text-sm font-bold text-brand-950 dark:text-white">
                                        {variantPickerProduct.name}
                                    </h3>
                                    <p className="text-xs text-stone-500 dark:text-stone-300">
                                        Pilih Gramatur / Ukuran Kemasan:
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setVariantPickerProduct(null)}
                                className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-72 touch-pan-y space-y-2 overflow-y-auto overscroll-y-contain pt-1">
                            {(variantPickerProduct.variants || []).map((v) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => {
                                        addToCart(variantPickerProduct, v);
                                        setVariantPickerProduct(null);
                                    }}
                                    className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 text-left transition hover:border-brand-600 hover:bg-brand-50/70 dark:border-stone-700 dark:bg-stone-800/80 dark:hover:border-stone-600 dark:hover:bg-stone-800"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-brand-700 dark:bg-amber-400" />
                                        <span className="text-sm font-semibold text-stone-800 group-hover:text-brand-950 dark:text-stone-100 dark:group-hover:text-white">
                                            {v.label}
                                        </span>
                                        {v.sku && (
                                            <span className="font-mono text-[10px] text-stone-400 dark:text-stone-400">
                                                ({v.sku})
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm font-bold text-brand-700 group-hover:text-brand-800 dark:text-emerald-400 dark:group-hover:text-emerald-300">
                                        Rp {formatRp(v.price)}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="pt-2 text-center text-xs text-stone-400 dark:text-stone-400">
                            Pilihan ukuran akan langsung masuk ke keranjang
                            kasir
                        </div>
                    </div>
                </div>
            )}

            {/* === MODAL 1B: C.Y.B.R STUDIO RACIK MODAL (KASIR POS) === */}
            {isCybrModalOpen && cybrProduct && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-brand-950/70 p-3 sm:p-4 backdrop-blur-xs fade-in dark:bg-black/80">
                    <div className="w-full max-w-lg touch-pan-y space-y-4 rounded-3xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 max-h-[92vh] overflow-y-auto overscroll-y-contain">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl shadow-md">
                                    🎨
                                </div>
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                                        C.Y.B.R Studio Racik
                                    </div>
                                    <h3 className="text-base font-black text-brand-950 dark:text-white">
                                        Custom Your Blend Ratio
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCybrModalOpen(false)}
                                className="cursor-pointer rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Komponen Biji Kopi A & B */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Biji A */}
                                <div className="rounded-2xl border border-stone-200 p-3 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-800/50 space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                                        <span>Komponen A ({cybrRatioA}%)</span>
                                        <span className="font-mono text-stone-500 font-semibold">
                                            {Math.round((cybrRatioA / 100) * (cybrSelectedVariant?.weight_grams || 200))}g
                                        </span>
                                    </label>
                                    <select
                                        value={cybrBeanA?.name || ''}
                                        onChange={(e) => {
                                            const found = availableCybrBeans.find(b => b.name === e.target.value);
                                            if (found) setCybrBeanA(found);
                                        }}
                                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-900 dark:text-white"
                                    >
                                        {availableCybrBeans.map((b) => (
                                            <option key={b.name} value={b.name}>
                                                {b.name} (Rp {formatRp(b.price_per_10g)}/10g)
                                            </option>
                                        ))}
                                    </select>
                                    {cybrBeanA && (
                                        <div className="text-[10px] text-stone-500 flex items-center justify-between">
                                            <span>{cybrBeanA.origin || 'Kawi'} • {cybrBeanA.process || 'Natural'}</span>
                                            {cybrBeanA.cost_price_per_10g ? (
                                                <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">HPP: Rp {formatRp(cybrBeanA.cost_price_per_10g)}/10g</span>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                {/* Biji B */}
                                <div className="rounded-2xl border border-stone-200 p-3 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-800/50 space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center justify-between">
                                        <span>Komponen B ({100 - cybrRatioA}%)</span>
                                        <span className="font-mono text-stone-500 font-semibold">
                                            {Math.round(((100 - cybrRatioA) / 100) * (cybrSelectedVariant?.weight_grams || 200))}g
                                        </span>
                                    </label>
                                    <select
                                        value={cybrBeanB?.name || ''}
                                        onChange={(e) => {
                                            const found = availableCybrBeans.find(b => b.name === e.target.value);
                                            if (found) setCybrBeanB(found);
                                        }}
                                        className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-900 dark:text-white"
                                    >
                                        {availableCybrBeans.map((b) => (
                                            <option key={b.name} value={b.name}>
                                                {b.name} (Rp {formatRp(b.price_per_10g)}/10g)
                                            </option>
                                        ))}
                                    </select>
                                    {cybrBeanB && (
                                        <div className="text-[10px] text-stone-500 flex items-center justify-between">
                                            <span>{cybrBeanB.origin || 'Malang'} • {cybrBeanB.process || 'Washed'}</span>
                                            {cybrBeanB.cost_price_per_10g ? (
                                                <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">HPP: Rp {formatRp(cybrBeanB.cost_price_per_10g)}/10g</span>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isSameCybrBean && (
                                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                                    <span>⚠️ Komponen A dan B harus berbeda varietas biji kopi.</span>
                                </div>
                            )}

                            {/* Slider Rasio */}
                            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                        Proporsi Rasio Racikan
                                    </span>
                                    <div className="flex items-center gap-2 text-xs font-black font-mono">
                                        <span className="text-emerald-700 dark:text-emerald-400">{cybrRatioA}%</span>
                                        <span className="text-stone-400">:</span>
                                        <span className="text-teal-700 dark:text-teal-400">{100 - cybrRatioA}%</span>
                                    </div>
                                </div>

                                <input
                                    type="range"
                                    min="10"
                                    max="90"
                                    step="10"
                                    value={cybrRatioA}
                                    onChange={(e) => setCybrRatioA(Number(e.target.value))}
                                    className="w-full accent-emerald-700 cursor-pointer"
                                />

                                {/* Quick Preset Buttons */}
                                <div className="flex items-center justify-center gap-1.5 pt-1">
                                    {[
                                        { label: '80 : 20', val: 80 },
                                        { label: '70 : 30', val: 70 },
                                        { label: '60 : 40', val: 60 },
                                        { label: '50 : 50', val: 50 },
                                        { label: '30 : 70', val: 30 },
                                    ].map((p) => (
                                        <button
                                            key={p.val}
                                            type="button"
                                            onClick={() => setCybrRatioA(p.val)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition cursor-pointer ${
                                                cybrRatioA === p.val
                                                    ? 'bg-emerald-700 text-white shadow-xs'
                                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pilihan Ukuran Kemasan Saja (Tanpa Opsi Gilingan) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                    Pilih Ukuran Kemasan:
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {availableCybrVariants.map((v) => {
                                        const isSelected = cybrSelectedVariant?.id === v.id;
                                        return (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => setCybrSelectedVariant(v)}
                                                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                                                    isSelected
                                                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200 shadow-xs'
                                                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300'
                                                }`}
                                            >
                                                <div className="text-sm font-black">{v.label}</div>
                                                <div className="text-[10px] text-stone-500 mt-0.5 font-medium">
                                                    {v.weight_grams} gram
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Nama Racikan (Opsional) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                                    Nama Kustom Blend (Opsional):
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Morning Sanubari / Blend Mas Budi"
                                    value={cybrCustomName}
                                    onChange={(e) => setCybrCustomName(e.target.value)}
                                    className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2 text-xs font-semibold text-stone-900 dark:text-white placeholder:text-stone-400"
                                />
                            </div>

                            {/* Ringkasan & Kalkulasi Real-time */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-brand-950 text-white space-y-2 border border-stone-800 shadow-md">
                                <div className="flex items-center justify-between text-xs text-stone-300 border-b border-stone-800 pb-2">
                                    <span>Resep Blend:</span>
                                    <span className="font-mono font-bold text-emerald-400">
                                        {cybrRatioA}% {cybrBeanA?.name || 'A'} + {100 - cybrRatioA}% {cybrBeanB?.name || 'B'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-stone-300">
                                    <span>Total Gramatur:</span>
                                    <span className="font-mono font-semibold">{cybrSelectedVariant?.weight_grams || 200}g</span>
                                </div>
                                {cybrCalculatedCostPrice > 0 && (
                                    <div className="flex items-center justify-between text-xs text-amber-300">
                                        <span>Estimasi HPP Modal:</span>
                                        <span className="font-mono font-semibold">Rp {formatRp(cybrCalculatedCostPrice)}</span>
                                    </div>
                                )}
                                <div className="flex items-baseline justify-between pt-1 border-t border-stone-800">
                                    <span className="text-xs font-bold text-stone-200">Total Harga Jual:</span>
                                    <div className="text-right">
                                        <span className="text-xl font-black text-emerald-400">
                                            Rp {formatRp(cybrCalculatedPrice)}
                                        </span>
                                        {cybrCalculatedCostPrice > 0 && (
                                            <div className="text-[10px] text-emerald-300 font-mono">
                                                Laba: Rp {formatRp(cybrCalculatedPrice - cybrCalculatedCostPrice)} ({cybrMarginPct}%)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                            <button
                                type="button"
                                onClick={() => setIsCybrModalOpen(false)}
                                className="flex-1 rounded-xl border border-stone-300 dark:border-stone-700 px-4 py-2.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isSameCybrBean || !cybrBeanA || !cybrBeanB || !cybrSelectedVariant}
                                onClick={handleAddCybrToCart}
                                className={`flex-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
                                    isSameCybrBean || !cybrBeanA || !cybrBeanB || !cybrSelectedVariant
                                        ? 'bg-stone-400 cursor-not-allowed opacity-60'
                                        : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98]'
                                }`}
                            >
                                <span>☕ Tambah Racikan ke Keranjang</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === MODAL 2: CHECKOUT & PAYMENT MODAL === */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/60 p-3 backdrop-blur-xs sm:p-4 dark:bg-black/80">
                    <div className="my-auto w-full max-w-lg space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-brand-700 dark:text-amber-400" />
                                <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                    Pembayaran Kasir
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsCheckoutModalOpen(false)}
                                className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center dark:border-stone-700 dark:bg-stone-800/90">
                            <span className="text-xs font-semibold text-brand-800 dark:text-amber-300">
                                Total Tagihan
                            </span>
                            <div className="mt-0.5 text-3xl font-black text-brand-950 dark:text-emerald-400">
                                Rp {formatRp(totalAmount)}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs">
                                {discountAmount > 0 && (
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                        Diskon: -Rp {formatRp(discountAmount)}
                                    </span>
                                )}
                                {numericShippingCost > 0 && (
                                    <span className="font-semibold text-blue-700 dark:text-blue-400">
                                        Ongkir: +Rp{' '}
                                        {formatRp(numericShippingCost)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                                Metode Pembayaran:
                            </label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {(() => {
                                    const allMethods = [
                                        {
                                            id: 'cash',
                                            label: 'Tunai (Cash)',
                                            icon: Banknote,
                                            enabled:
                                                paymentForm?.enable_cash ??
                                                true,
                                        },
                                        {
                                            id: 'qris',
                                            label: 'QRIS',
                                            icon: QrCode,
                                            enabled:
                                                paymentForm?.enable_qris ??
                                                true,
                                        },
                                        {
                                            id: 'debit',
                                            label: 'Debit / EDC',
                                            icon: CreditCard,
                                            enabled:
                                                paymentForm?.enable_debit ??
                                                true,
                                        },
                                        {
                                            id: 'bank_transfer',
                                            label: 'Transfer',
                                            icon: Building2,
                                            enabled:
                                                paymentForm?.enable_bank_transfer ??
                                                true,
                                        },
                                    ];
                                    const available = allMethods.filter(
                                        (m) => m.enabled,
                                    );
                                    const toDisplay =
                                        available.length > 0
                                            ? available
                                            : allMethods;

                                    return toDisplay.map((m) => {
                                        const Icon = m.icon;
                                        const isSelected =
                                            paymentMethod === m.id;
                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() =>
                                                    setPaymentMethod(
                                                        m.id as any,
                                                    )
                                                }
                                                className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${
                                                    isSelected
                                                        ? 'border-brand-700 bg-brand-700 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600'
                                                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-brand-950 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 dark:hover:text-white'
                                                }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{m.label}</span>
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {paymentMethod === 'cash' && (
                            <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-700 dark:bg-stone-800/70">
                                <div>
                                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                                        Uang Tunai Diterima:
                                    </label>
                                    <div className="relative mt-1">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-stone-400 dark:text-stone-400">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            value={
                                                cashTendered === ''
                                                    ? ''
                                                    : cashTendered
                                            }
                                            onChange={(e) => {
                                                const val =
                                                    e.target.value === ''
                                                        ? ''
                                                        : parseFloat(
                                                              e.target.value,
                                                          );
                                                setCashTendered(val);
                                            }}
                                            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-4 pl-10 text-lg font-bold text-stone-900 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                            placeholder="0"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {(quickCashOptions || []).map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setCashTendered(opt)}
                                            className="cursor-pointer rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-2xs transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-950 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 dark:hover:text-white"
                                        >
                                            {opt === totalAmount
                                                ? 'Uang Pas'
                                                : `Rp ${formatRp(opt)}`}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-sm dark:border-stone-700">
                                    <span className="font-semibold text-stone-600 dark:text-stone-300">
                                        Kembalian:
                                    </span>
                                    <span
                                        className={`text-base font-black ${
                                            (cashChange || 0) > 0
                                                ? 'text-emerald-700 dark:text-emerald-400'
                                                : 'text-stone-800 dark:text-stone-300'
                                        }`}
                                    >
                                        Rp {formatRp(cashChange || 0)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'qris' && (
                            <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-center dark:border-stone-700 dark:bg-stone-800/70">
                                <QrCode className="mx-auto h-12 w-12 text-brand-700 dark:text-emerald-400" />
                                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                                    {paymentForm?.qris_instructions ||
                                        'Tampilkan QRIS Kasir Sanubari kepada Pelanggan'}
                                </p>
                                <p className="text-[11px] text-stone-500 dark:text-stone-300">
                                    Total bayar:{' '}
                                    <b className="text-brand-950 dark:text-emerald-400">
                                        Rp {formatRp(totalAmount)}
                                    </b>
                                    .
                                </p>
                            </div>
                        )}

                        {paymentMethod === 'debit' && (
                            <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-center dark:border-stone-700 dark:bg-stone-800/70">
                                <CreditCard className="mx-auto h-10 w-10 text-brand-700 dark:text-emerald-400" />
                                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                                    Gesek / Tap Kartu pada Mesin EDC Kasir
                                </p>
                                <p className="text-[11px] text-stone-500 dark:text-stone-300">
                                    Total bayar:{' '}
                                    <b className="text-brand-950 dark:text-emerald-400">
                                        Rp {formatRp(totalAmount)}
                                    </b>
                                    . Pastikan transaksi mesin EDC berhasil.
                                </p>
                            </div>
                        )}

                        {paymentMethod === 'bank_transfer' && (
                            <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-center dark:border-stone-700 dark:bg-stone-800/70">
                                <Building2 className="mx-auto h-10 w-10 text-brand-700 dark:text-emerald-400" />
                                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                                    Rekening Transfer:{' '}
                                    {paymentForm?.bank_info ||
                                        'BCA 123-456-7890 a/n Sanubari Roastery'}
                                </p>
                                <p className="text-[11px] text-stone-500 dark:text-stone-300">
                                    Nominal pas:{' '}
                                    <b className="text-brand-950 dark:text-emerald-400">
                                        Rp {formatRp(totalAmount)}
                                    </b>
                                    .
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            <div>
                                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                    Nama Pelanggan (Opsional):
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(e.target.value)
                                    }
                                    placeholder="Contoh: Kak Dika"
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                    No. WhatsApp (Struk e-Receipt):
                                </label>
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) =>
                                        setCustomerPhone(e.target.value)
                                    }
                                    placeholder="0812xxxx"
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                                />
                            </div>
                        </div>

                        {/* Pengiriman / Ongkir Option in Checkout Modal */}
                        <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800/60">
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-stone-800 select-none dark:text-stone-200">
                                    <input
                                        type="checkbox"
                                        checked={isDeliveryOrder}
                                        onChange={(e) =>
                                            setIsDeliveryOrder(e.target.checked)
                                        }
                                        className="h-4 w-4 cursor-pointer rounded text-brand-700 focus:ring-brand-500 dark:text-emerald-500"
                                    />
                                    <Truck className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                    <span>
                                        Pesanan Butuh Pengiriman (Ongkir)
                                    </span>
                                </label>
                                {isDeliveryOrder && (
                                    <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                        Rp {formatRp(numericShippingCost)}
                                    </span>
                                )}
                            </div>

                            {isDeliveryOrder && (
                                <div className="animate-in space-y-2 border-t border-stone-200 pt-2 fade-in dark:border-stone-700">
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <div>
                                            <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                                Nominal Ongkir (Rp):
                                            </label>
                                            <div className="relative mt-1">
                                                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-bold text-stone-400">
                                                    Rp
                                                </span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        shippingCost === ''
                                                            ? ''
                                                            : shippingCost
                                                    }
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value ===
                                                            ''
                                                                ? ''
                                                                : Math.max(
                                                                      0,
                                                                      parseFloat(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ) || 0,
                                                                  );
                                                        setShippingCost(val);
                                                    }}
                                                    placeholder="0"
                                                    className="w-full rounded-xl border border-stone-200 bg-white py-2 pr-3 pl-8 text-xs font-bold text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                                Kurir / Ekspedisi (Opsional):
                                            </label>
                                            <input
                                                type="text"
                                                value={shippingCourier}
                                                onChange={(e) =>
                                                    setShippingCourier(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="J&T / JNE / SiCepat / Lalamove / Grab..."
                                                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                            Alamat Pengiriman Lengkap:
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={customerAddress}
                                            onChange={(e) =>
                                                setCustomerAddress(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: Jl. Sukarno Hatta No. 45, Lowokwaru, Kota Malang..."
                                            className="mt-1 w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 focus:border-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-white dark:focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCheckoutModalOpen(false)}
                                className="flex-1 cursor-pointer rounded-xl bg-stone-100 px-4 py-3 text-xs font-bold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleProcessCheckout}
                                className="flex flex-2 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-brand-800 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                            >
                                {isSubmitting ? (
                                    <span>Memproses...</span>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>SELESAIKAN TRANSAKSI</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === MODAL: REFUND TRANSAKSI === */}
            {isRefundModalOpen && selectedOrderForRefund && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/60 p-3 backdrop-blur-xs sm:p-4 dark:bg-black/80">
                    <div className="my-auto w-full max-w-md animate-in space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 sm:p-6 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3.5 dark:border-stone-800">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                                    <RotateCcw className="h-5 w-5 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                        Refund Transaksi #{selectedOrderForRefund.order_number}
                                    </h3>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                        Pengembalian dana dan pembatalan pesanan kasir
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRefundModalOpen(false);
                                    setSelectedOrderForRefund(null);
                                }}
                                disabled={isProcessingRefund}
                                className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Order Summary Box */}
                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs space-y-1.5 dark:border-stone-800 dark:bg-stone-800/60">
                            <div className="flex justify-between py-1 border-b border-stone-200/80 dark:border-stone-700">
                                <span className="text-stone-500 dark:text-stone-400">Pelanggan:</span>
                                <span className="font-semibold text-stone-900 dark:text-white">
                                    {selectedOrderForRefund.customer_name}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-stone-200/80 dark:border-stone-700">
                                <span className="text-stone-500 dark:text-stone-400">Waktu Transaksi:</span>
                                <span className="text-stone-700 dark:text-stone-300">
                                    {selectedOrderForRefund.created_at}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-stone-200/80 dark:border-stone-700">
                                <span className="text-stone-500 dark:text-stone-400">Metode Pembayaran:</span>
                                <span className="font-semibold text-stone-900 dark:text-white">
                                    {selectedOrderForRefund.payment_method_label}
                                </span>
                            </div>
                            <div className="flex justify-between pt-1 font-bold text-sm">
                                <span className="text-stone-700 dark:text-stone-300">Total Transaksi:</span>
                                <span className="text-brand-900 dark:text-emerald-400">
                                    Rp {formatRp(selectedOrderForRefund.total_amount)}
                                </span>
                            </div>
                        </div>

                        {/* Notice */}
                        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <span>
                                Saldo penjualan dan kas harian akan disesuaikan. Struk bukti refund akan otomatis disiapkan untuk dicetak.
                            </span>
                        </div>

                        {/* Form Inputs */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                    Nominal Pengembalian Dana (Rp)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={selectedOrderForRefund.total_amount}
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-900 outline-none focus:border-rose-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                />
                                <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">
                                    <span>Maksimal: Rp {formatRp(selectedOrderForRefund.total_amount)}</span>
                                    <button
                                        type="button"
                                        onClick={() => setRefundAmount(selectedOrderForRefund.total_amount)}
                                        className="cursor-pointer font-bold text-rose-600 hover:underline dark:text-rose-400"
                                    >
                                        Set Penuh (100%)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                    Alasan Refund / Retur
                                </label>
                                <div className="mb-2 flex flex-wrap gap-1.5">
                                    {[
                                        'Salah Masuk Pesanan / Kasir',
                                        'Pesanan Dibatalkan Pelanggan',
                                        'Produk Habis / Rusak',
                                        'Salah Metode Pembayaran',
                                    ].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setRefundReason(preset)}
                                            className={`cursor-pointer rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                                                refundReason === preset
                                                    ? 'bg-rose-600 text-white shadow-2xs'
                                                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                                            }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Tulis alasan refund..."
                                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-rose-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRefundModalOpen(false);
                                    setSelectedOrderForRefund(null);
                                }}
                                disabled={isProcessingRefund}
                                className="flex-1 cursor-pointer rounded-xl border border-stone-200 bg-stone-100 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmRefund}
                                disabled={isProcessingRefund || Number(refundAmount) <= 0}
                                className="flex-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-60"
                            >
                                {isProcessingRefund ? (
                                    <>
                                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        <span>Konfirmasi Refund</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === MODAL 3: RECEIPT & SUCCESS / PREVIEW MODAL === */}
            {isReceiptModalOpen && completedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/60 p-3 backdrop-blur-xs sm:p-4 dark:bg-black/80">
                    <div className="my-auto w-full max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                        <div className="space-y-1 text-center">
                            {completedReceipt.is_refund ? (
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
                                    <RotateCcw className="h-6 w-6 stroke-[3]" />
                                </div>
                            ) : completedReceipt.order_number.startsWith('TEST-') ? (
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400">
                                    <Eye className="h-6 w-6 stroke-[2.5]" />
                                </div>
                            ) : (
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                    <Check className="h-6 w-6 stroke-[3]" />
                                </div>
                            )}
                            <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                {completedReceipt.is_refund
                                    ? 'Struk Bukti Refund'
                                    : completedReceipt.order_number.startsWith('TEST-')
                                    ? 'Pratinjau Struk Kasir'
                                    : 'Transaksi Berhasil!'}
                            </h3>
                            <p className="text-xs text-stone-500 dark:text-stone-300">
                                {completedReceipt.order_number.startsWith('TEST-') ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                        Preview di Aplikasi POS (Bukan Chrome)
                                    </span>
                                ) : (
                                    <>
                                        No. Struk:{' '}
                                        <span className="font-mono font-bold text-brand-800 dark:text-amber-300">
                                            #{completedReceipt.order_number}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* In-App Realistic Thermal Receipt Preview */}
                        <div className="max-h-[50vh] overflow-y-auto rounded-xl bg-stone-100/90 p-3 flex justify-center shadow-inner dark:bg-stone-950/60">
                            <ThermalReceiptPreview
                                receipt={completedReceipt}
                                paperWidth={printerForm.paper_width}
                                customPaperWidthMm={printerForm.custom_paper_width_mm}
                                receiptColumns={printerForm.receipt_columns || (printerForm.paper_width === '80mm' ? printerForm.receipt_columns_80mm || 44 : printerForm.paper_width === 'custom' ? printerForm.custom_receipt_columns || 40 : printerForm.receipt_columns_58mm || 32)}
                                showLogo={printerForm.show_logo !== false}
                                fontFamily={printerForm.font_family}
                                fontSize={printerForm.font_size}
                                fontWeight={printerForm.font_weight}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        printThermalWeb(
                                            completedReceipt,
                                            printerForm,
                                        )
                                    }
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-stone-800 shadow-2xs transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
                                >
                                    <Printer className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                    <span>
                                        Cetak USB ({printerForm.paper_width})
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleBluetoothPrint(completedReceipt)
                                    }
                                    disabled={isBtPrinting}
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-900 shadow-2xs transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                                >
                                    <Smartphone className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                    <span className="truncate">
                                        {isBtPrinting
                                            ? 'Mencetak...'
                                            : connectedBtPrinter
                                              ? `Cetak BT (${connectedBtPrinter.name})`
                                              : 'Bluetooth Print'}
                                    </span>
                                </button>
                            </div>

                            {connectedBtPrinter && (
                                <div className="flex items-center justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-1.5 text-[11px] dark:border-emerald-800/50 dark:bg-emerald-950/30">
                                    <span className="truncate font-semibold text-emerald-800 dark:text-emerald-300">
                                        ✓ Printer: {connectedBtPrinter.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openBluetoothScannerModal(completedReceipt)
                                        }
                                        className="ml-2 shrink-0 cursor-pointer font-bold text-emerald-700 underline hover:text-emerald-900 dark:text-emerald-400"
                                    >
                                        Ganti Printer
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <a
                                    href={generateWhatsAppReceiptUrl(
                                        completedReceipt,
                                        completedReceipt.customer_phone,
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span>Kirim Struk via WA</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => {
                                        printA4InvoiceWeb({
                                            store_name:
                                                completedReceipt.store_name,
                                            tagline: completedReceipt.tagline,
                                            address: completedReceipt.address,
                                            phone: completedReceipt.phone,
                                            instagram:
                                                completedReceipt.instagram,
                                            cashier_name:
                                                completedReceipt.cashier_name,
                                            customer_name:
                                                completedReceipt.customer_name,
                                            customer_phone:
                                                completedReceipt.customer_phone,
                                            customer_address:
                                                completedReceipt.customer_address,
                                            shipping_cost:
                                                completedReceipt.shipping_cost,
                                            shipping_courier:
                                                completedReceipt.shipping_courier,
                                            notes: `No. Struk: #${completedReceipt.order_number} | Metode: ${completedReceipt.payment_method_label}`,
                                            items: completedReceipt.items.map(
                                                (i) => ({
                                                    product_name:
                                                        i.product_name,
                                                    variant_label:
                                                        i.variant_label,
                                                    quantity: i.quantity,
                                                    price: i.price,
                                                    subtotal: i.subtotal,
                                                }),
                                            ),
                                            subtotal: completedReceipt.subtotal,
                                            discount_amount:
                                                completedReceipt.discount_amount,
                                            total_amount:
                                                completedReceipt.total_amount,
                                            date: completedReceipt.date,
                                        });
                                        showToast(
                                            'Mengunduh file PDF Invoice A4...',
                                        );
                                    }}
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#273a41] px-3 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#1e2e34] dark:bg-stone-800 dark:hover:bg-stone-700"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Download PDF Invoice</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsReceiptModalOpen(false);
                                setCompletedReceipt(null);
                            }}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-brand-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                            {completedReceipt.order_number.startsWith('TEST-') ? (
                                <>
                                    <X className="h-4 w-4" />
                                    <span>TUTUP PRATINJAU</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    <span>TRANSAKSI BARU</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* === MODAL: PENCARIAN & KONEKSI PRINTER BLUETOOTH (ANDROID APK & WEB BT) === */}
            {isBtScannerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/70 p-3 backdrop-blur-xs sm:p-4 dark:bg-black/80">
                    <div className="my-auto w-full max-w-lg touch-pan-y animate-in space-y-4 overflow-y-auto overscroll-y-contain rounded-3xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 max-h-[92vh] sm:p-6 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3.5 dark:border-stone-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
                                    <Smartphone className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-800 uppercase dark:bg-emerald-950/60 dark:text-emerald-300">
                                        {isAndroidNativeBluetoothAvailable()
                                            ? 'Native Bluetooth POS Android'
                                            : isWebBluetoothAvailable()
                                              ? 'Web Bluetooth POS'
                                              : 'Manajer Printer Bluetooth'}
                                    </div>
                                    <h3 className="mt-0.5 text-base font-black text-brand-950 dark:text-white">
                                        Pencarian Printer Bluetooth
                                    </h3>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeBluetoothScannerModal}
                                className="cursor-pointer rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Status / Feedback Banner */}
                        {btStatusMessage && (
                            <div
                                className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                                    btStatusMessage.startsWith('✓')
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                        : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300'
                                }`}
                            >
                                <span>{btStatusMessage}</span>
                            </div>
                        )}

                        {/* Pending Print Job Notice */}
                        {pendingBtReceipt && (
                            <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50/80 px-3.5 py-2.5 text-xs dark:border-sky-800/60 dark:bg-sky-950/40">
                                <div className="flex items-center gap-2 font-semibold text-sky-900 dark:text-sky-200">
                                    <Printer className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
                                    <span>
                                        Siap mencetak Struk{' '}
                                        <strong>#{pendingBtReceipt.order_number}</strong>{' '}
                                        setelah printer terhubung
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Connected Printer Active Box */}
                        {connectedBtPrinter && (
                            <div className="space-y-2.5 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-3.5 dark:border-emerald-800/70 dark:bg-emerald-950/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase dark:text-emerald-300">
                                        Printer Aktif Terhubung
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                        ✓ Siap Cetak
                                    </span>
                                </div>
                                <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-black text-stone-900 dark:text-white">
                                            {connectedBtPrinter.name}
                                        </div>
                                        <div className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                                            MAC / ID: {connectedBtPrinter.address}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            disabled={isBtPrinting}
                                            onClick={async () => {
                                                const receiptToUse =
                                                    pendingBtReceipt ||
                                                    completedReceipt ||
                                                    getSampleTestReceipt();
                                                try {
                                                    const ok = await executeDirectBtPrint(
                                                        receiptToUse,
                                                        connectedBtPrinter.address,
                                                    );
                                                    if (ok && pendingBtReceipt) {
                                                        setPendingBtReceipt(null);
                                                        closeBluetoothScannerModal();
                                                    }
                                                } catch (e: any) {
                                                    setBtStatusMessage(
                                                        e?.message || 'Gagal mencetak struk.',
                                                    );
                                                }
                                            }}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                        >
                                            <Printer className="h-3.5 w-3.5" />
                                            <span>
                                                {isBtPrinting
                                                    ? 'Mencetak...'
                                                    : pendingBtReceipt
                                                      ? 'Cetak Sekarang'
                                                      : 'Tes Cetak'}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDisconnectBtPrinter}
                                            className="cursor-pointer rounded-xl border border-rose-200 bg-white px-2.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-800 dark:bg-stone-900 dark:text-rose-400"
                                        >
                                            Putuskan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CASE 1: NATIVE ANDROID POS APK SCANNER */}
                        {isAndroidNativeBluetoothAvailable() ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
                                            Daftar Perangkat Bluetooth ({btDevices.length})
                                        </span>
                                        {isBtScanning && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                                Memindai...
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={handleStartBtScan}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-brand-800 active:scale-95"
                                        >
                                            <RefreshCw
                                                className={`h-3.5 w-3.5 ${isBtScanning ? 'animate-spin' : ''}`}
                                            />
                                            <span>
                                                {isBtScanning ? 'Memindai...' : 'Pindai Ulang'}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={openAndroidBluetoothSettings}
                                            className="flex cursor-pointer items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                                            title="Buka Pengaturan Bluetooth Sistem Android"
                                        >
                                            <Settings className="h-3.5 w-3.5" />
                                            <span>Setelan BT HP</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-72 touch-pan-y space-y-2 overflow-y-auto overscroll-y-contain rounded-2xl border border-stone-200 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-950/50">
                                    {btDevices.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-stone-500 dark:text-stone-400">
                                            <Smartphone className="mx-auto mb-2 h-8 w-8 text-stone-400" />
                                            <p className="font-bold text-stone-700 dark:text-stone-300">
                                                {isBtScanning
                                                    ? 'Sedang mencari printer Bluetooth di sekitar...'
                                                    : 'Belum ada perangkat Bluetooth yang terdeteksi'}
                                            </p>
                                            <p className="mt-1 text-[11px]">
                                                Pastikan printer thermal Bluetooth menyala, lampu indikator berkedip, dan Bluetooth HP aktif.
                                            </p>
                                        </div>
                                    ) : (
                                        btDevices.map((dev) => {
                                            const isCurrentConnected =
                                                connectedBtPrinter?.address?.toLowerCase() ===
                                                dev.address.toLowerCase();
                                            const isConnectingThis =
                                                connectingBtAddress?.toLowerCase() ===
                                                dev.address.toLowerCase();

                                            return (
                                                <div
                                                    key={dev.address}
                                                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                                                        isCurrentConnected
                                                            ? 'border-emerald-400 bg-emerald-50/90 dark:border-emerald-700 dark:bg-emerald-950/40'
                                                            : dev.isPrinter
                                                              ? 'border-stone-200 bg-white hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-900'
                                                              : 'border-stone-200/70 bg-white/80 dark:border-stone-800/70 dark:bg-stone-900/70'
                                                    }`}
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                                isCurrentConnected || dev.isPrinter
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                                                            }`}
                                                        >
                                                            <Printer className="h-5 w-5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span className="truncate text-sm font-bold text-stone-900 dark:text-white">
                                                                    {dev.name}
                                                                </span>
                                                                {dev.isPrinter && (
                                                                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800 uppercase dark:bg-emerald-950 dark:text-emerald-300">
                                                                        Printer
                                                                    </span>
                                                                )}
                                                                {dev.bonded && (
                                                                    <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[9px] font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                                                        Paired
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                                                                {dev.address}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={isConnectingThis}
                                                        onClick={() =>
                                                            handleConnectAndroidBtDevice(dev)
                                                        }
                                                        className={`shrink-0 cursor-pointer rounded-xl px-3.5 py-2 text-xs font-extrabold transition active:scale-95 disabled:opacity-50 ${
                                                            isCurrentConnected
                                                                ? 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                                                                : 'bg-brand-700 text-white hover:bg-brand-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                                                        }`}
                                                    >
                                                        {isConnectingThis
                                                            ? 'Menghubungkan...'
                                                            : isCurrentConnected
                                                              ? pendingBtReceipt
                                                                  ? 'Cetak'
                                                                  : '✓ Terhubung'
                                                              : 'Hubungkan'}
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ) : isWebBluetoothAvailable() ? (
                            /* CASE 2: CHROME WEB BLUETOOTH SCANNER */
                            <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center dark:border-stone-800 dark:bg-stone-950/60">
                                <Smartphone className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                                        Pindai Printer Bluetooth di Sekitar
                                    </h4>
                                    <p className="text-xs text-stone-600 dark:text-stone-400">
                                        Klik tombol di bawah untuk membuka daftar perangkat printer thermal Bluetooth yang aktif di dekat Anda.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleStartBtScan}
                                    disabled={isBtScanning}
                                    className="mx-auto flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                                >
                                    <Search className="h-4 w-4" />
                                    <span>
                                        {isBtScanning
                                            ? 'Memindai Perangkat...'
                                            : 'Mulai Cari Printer Bluetooth'}
                                    </span>
                                </button>
                            </div>
                        ) : (
                            /* CASE 3: OLDER WEBVIEW / FALLBACK WITH 1-TAP APK v2.0 UPDATE + RAWBT BRIDGE */
                            <div className="space-y-3">
                                <div className="space-y-2.5 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
                                    <div className="flex items-start gap-3">
                                        <Download className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-200">
                                                Pembaruan APK POS Android v2.0 (Native Bluetooth)
                                            </h4>
                                            <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                                                Aplikasi APK yang sedang terpasang di HP Anda masih versi lama (v1.0). Unduh & pasang pembaruan <strong>Sanubari POS APK v2.0</strong> di bawah ini untuk mengaktifkan <strong>Pemindai Printer Bluetooth Langsung di Aplikasi</strong>.
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href="/pos/download-apk"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Unduh & Perbarui APK POS v2.0 (Bluetooth Native)</span>
                                    </a>
                                </div>

                                <div className="space-y-2.5 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50">
                                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                        Cetak Instan Tanpa Update (Alternatif):
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <a
                                            href={generateRawBtPrintUrl(
                                                pendingBtReceipt ||
                                                    completedReceipt ||
                                                    getSampleTestReceipt(),
                                                printerForm,
                                            )}
                                            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-brand-300 bg-white px-3 py-2.5 text-xs font-bold text-brand-800 shadow-2xs transition hover:bg-brand-50 dark:border-stone-700 dark:bg-stone-800 dark:text-emerald-300"
                                        >
                                            <Smartphone className="h-4 w-4" />
                                            <span>Kirim ke Bridge Bluetooth (RawBT)</span>
                                        </a>
                                        <button
                                            type="button"
                                            onClick={openAndroidBluetoothSettings}
                                            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-bold text-stone-700 shadow-2xs transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                                        >
                                            <Settings className="h-4 w-4" />
                                            <span>Buka Setelan Bluetooth HP</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-[11px] text-stone-500 dark:border-stone-800 dark:text-stone-400">
                            <span>Mendukung semua printer thermal 58mm & 80mm (ESC/POS)</span>
                            <button
                                type="button"
                                onClick={closeBluetoothScannerModal}
                                className="cursor-pointer rounded-xl bg-stone-100 px-3.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* === MODAL: ORDERAN MANUAL (NAMA, HPP, HARGA JUAL) === */}
            {isManualOrderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/60 p-3 backdrop-blur-xs sm:p-4 dark:bg-black/80">
                    <div className="my-auto w-full max-w-lg animate-in space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 sm:p-6 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3.5 dark:border-stone-800">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300 bg-amber-500/10 text-amber-600 dark:border-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
                                    <PlusCircle className="h-5 w-5 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                        {editingManualCartItemId
                                            ? 'Edit Orderan Manual'
                                            : 'Buat Orderan Manual'}
                                    </h3>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                        Masukkan HPP & Harga Jual untuk
                                        perhitungan laba rugi real di kasir
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsManualOrderModalOpen(false)}
                                className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => handleSaveManualItem(e, false)}
                            className="space-y-4 text-xs"
                        >
                            {/* 1. Nama Produk */}
                            <div>
                                <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                                    <span>Nama Produk / Jasa / Item</span>
                                    <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={manualProductName}
                                    onChange={(e) =>
                                        setManualProductName(e.target.value)
                                    }
                                    placeholder="Contoh: Paket Katering Kopi 50 Cup / Snack Vendor / Custom Beans"
                                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                    autoFocus
                                />
                            </div>

                            {/* 2. Variant / Label opsional */}
                            <div>
                                <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                                    <span>
                                        Varian / Keterangan Ukuran (Opsional)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={manualVariantLabel}
                                    onChange={(e) =>
                                        setManualVariantLabel(e.target.value)
                                    }
                                    placeholder="Contoh: Cup 12oz, Botol 1L, Box, Porsi, dll."
                                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-900 focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                                />
                            </div>

                            {/* 3. Grid: HPP Modal & Harga Jual */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {/* HPP Produk */}
                                <div className="space-y-1.5 rounded-xl border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900/60 dark:bg-rose-950/20">
                                    <label className="flex items-center justify-between text-[11px] font-bold text-rose-900 dark:text-rose-300">
                                        <span>HPP Produk (Modal Satuan)</span>
                                        <span className="text-[10px] font-normal text-rose-600 dark:text-rose-400">
                                            Biaya Modal
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-rose-600 dark:text-rose-400">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="100"
                                            value={manualCostPrice}
                                            onChange={(e) =>
                                                setManualCostPrice(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0"
                                            className="w-full rounded-lg border border-rose-300 bg-white py-2 pr-3 pl-9 text-sm font-bold text-rose-950 focus:ring-1 focus:ring-rose-500 focus:outline-none dark:border-rose-800 dark:bg-stone-900 dark:text-rose-100"
                                        />
                                    </div>
                                    <p className="text-[10px] text-rose-700 dark:text-rose-300/80">
                                        Digunakan untuk menghitung HPP & Laba
                                        Rugi real pada laporan kasir.
                                    </p>
                                </div>

                                {/* Harga Jual Produk */}
                                <div className="space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                                    <label className="flex items-center justify-between text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                                        <span>Harga Jual Produk (Satuan)</span>
                                        <span className="text-rose-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="500"
                                            required
                                            value={manualPrice}
                                            onChange={(e) =>
                                                setManualPrice(e.target.value)
                                            }
                                            placeholder="0"
                                            className="w-full rounded-lg border border-emerald-300 bg-white py-2 pr-3 pl-9 text-sm font-bold text-emerald-950 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-100"
                                        />
                                    </div>
                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300/80">
                                        Harga yang ditagihkan ke pelanggan saat
                                        checkout.
                                    </p>
                                </div>
                            </div>

                            {/* 4. Jumlah (Qty) & Real-time Profit Preview */}
                            <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-100 p-3.5 dark:border-stone-700 dark:bg-stone-800/80">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                                        Jumlah Pembelian (Qty)
                                    </span>
                                    <div className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-2 py-1 dark:border-stone-700 dark:bg-stone-900">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setManualQuantity((q) =>
                                                    Math.max(1, q - 1),
                                                )
                                            }
                                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg font-bold text-stone-700 hover:bg-stone-100 active:scale-95 dark:text-stone-200 dark:hover:bg-stone-800"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            max="999"
                                            value={manualQuantity}
                                            onChange={(e) =>
                                                setManualQuantity(
                                                    Math.max(
                                                        1,
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 1,
                                                    ),
                                                )
                                            }
                                            className="w-12 border-0 bg-transparent text-center text-xs font-bold text-stone-900 focus:outline-none dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setManualQuantity((q) => q + 1)
                                            }
                                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg font-bold text-stone-700 hover:bg-stone-100 active:scale-95 dark:text-stone-200 dark:hover:bg-stone-800"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Real-time Calculation Summary */}
                                {(() => {
                                    const selling = Number(manualPrice) || 0;
                                    const cost = Number(manualCostPrice) || 0;
                                    const qty = Math.max(
                                        1,
                                        Number(manualQuantity) || 1,
                                    );
                                    const subtotalCalc = selling * qty;
                                    const totalCostCalc = cost * qty;
                                    const grossProfitCalc =
                                        subtotalCalc - totalCostCalc;
                                    const marginPercent =
                                        subtotalCalc > 0
                                            ? (grossProfitCalc / subtotalCalc) *
                                              100
                                            : 0;

                                    return (
                                        <div className="space-y-1.5 border-t border-stone-200 pt-2 text-[11px] dark:border-stone-700/80">
                                            <div className="flex justify-between text-stone-600 dark:text-stone-300">
                                                <span>
                                                    Subtotal Penjualan ({qty}{' '}
                                                    item):
                                                </span>
                                                <span className="font-bold text-stone-900 dark:text-white">
                                                    Rp {formatRp(subtotalCalc)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-rose-600 dark:text-rose-400">
                                                <span>
                                                    Total Modal HPP ({qty}{' '}
                                                    item):
                                                </span>
                                                <span className="font-semibold">
                                                    - Rp{' '}
                                                    {formatRp(totalCostCalc)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-dashed border-stone-200 pt-1.5 font-bold dark:border-stone-700">
                                                <span className="text-stone-800 dark:text-stone-200">
                                                    Estimasi Laba Kotor Real:
                                                </span>
                                                <span
                                                    className={`text-xs ${grossProfitCalc >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                                                >
                                                    {grossProfitCalc >= 0
                                                        ? '+ '
                                                        : ''}
                                                    Rp{' '}
                                                    {formatRp(grossProfitCalc)}
                                                    {subtotalCalc > 0 &&
                                                        ` (${marginPercent.toFixed(1)}%)`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsManualOrderModalOpen(false)
                                    }
                                    className="flex-1 cursor-pointer rounded-xl border border-stone-300 px-3 py-2.5 text-center font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex flex-2 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-brand-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>
                                        {editingManualCartItemId
                                            ? 'Simpan Perubahan'
                                            : 'Tambah ke Keranjang'}
                                    </span>
                                </button>
                                {!editingManualCartItemId && (
                                    <button
                                        type="button"
                                        onClick={(e) =>
                                            handleSaveManualItem(e, true)
                                        }
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 font-black text-stone-950 shadow-sm transition hover:bg-amber-600 active:scale-95"
                                        title="Masukkan ke keranjang dan langsung buka pembayaran"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        <span>Bayar Langsung</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === MODAL: SIMPAN PESANAN KE ANTRIAN (HOLD ORDER) === */}
            {isHoldModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/60 p-3 backdrop-blur-xs sm:p-4 dark:bg-black/80">
                    <div className="my-auto w-full max-w-md animate-in space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                    Simpan Pesanan ke Antrian
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsHoldModalOpen(false)}
                                className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                            <div className="flex justify-between font-bold">
                                <span>Total Tagihan Pesanan:</span>
                                <span className="text-amber-950 dark:text-amber-300">
                                    Rp {formatRp(totalAmount)}
                                </span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300/80">
                                {totalItemsCount} item akan disimpan sementara
                                dan kasir siap melayani pesanan berikutnya.
                            </div>
                        </div>

                        <form
                            onSubmit={handleConfirmHoldOrder}
                            className="space-y-3 text-xs"
                        >
                            <div>
                                <label className="flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                                    <span>Nama Pelanggan / Nomor Antrian</span>
                                    <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={holdCustomerName}
                                    onChange={(e) =>
                                        setHoldCustomerName(e.target.value)
                                    }
                                    placeholder="Contoh: Kak Rendy / Meja 3 / Baju Biru"
                                    className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 font-semibold text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                    No. WhatsApp (Opsional):
                                </label>
                                <input
                                    type="tel"
                                    value={holdCustomerPhone}
                                    onChange={(e) =>
                                        setHoldCustomerPhone(e.target.value)
                                    }
                                    placeholder="0812xxxx"
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                    Catatan / Keterangan (Opsional):
                                </label>
                                <input
                                    type="text"
                                    value={holdNotes}
                                    onChange={(e) =>
                                        setHoldNotes(e.target.value)
                                    }
                                    placeholder="Contoh: Mengambil dompet di mobil / menunggu teman"
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsHoldModalOpen(false)}
                                    className="flex-1 cursor-pointer rounded-xl bg-stone-100 px-3 py-2.5 font-bold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        isHoldingSubmit ||
                                        !holdCustomerName.trim()
                                    }
                                    className="flex flex-2 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2.5 font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95 disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
                                >
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {isHoldingSubmit
                                            ? 'Menyimpan...'
                                            : 'Simpan ke Antrian'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* === MODAL: BAGIKAN STRUK PESANAN KE WHATSAPP (INVOICE DIGITAL A4 PDF) === */}
            {isSharePreBillModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/60 p-3 backdrop-blur-xs sm:p-4 dark:bg-black/80">
                    <div className="my-auto w-full max-w-lg animate-in space-y-4 rounded-2xl border border-stone-200 bg-white p-5 text-stone-900 shadow-2xl duration-150 zoom-in-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    <Share2 className="h-5 w-5 stroke-[2.3]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-brand-950 dark:text-white">
                                        Bagikan Struk Pesanan ke WhatsApp
                                    </h3>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-300">
                                        Kirim rincian struk estimasi pesanan
                                        langsung ke WhatsApp pelanggan
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    setIsSharePreBillModalOpen(false)
                                }
                                className="cursor-pointer rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Feature Highlights Banner */}
                        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                            <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                            <div className="text-[11px] leading-relaxed">
                                Struk belanja akan dikirim dalam format teks
                                rapi ke WhatsApp pelanggan, lengkap dengan
                                rincian pesanan dan total tagihan.
                            </div>
                        </div>

                        {/* Customer Info Form */}
                        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                            <div>
                                <label className="flex items-center gap-1 text-[11px] font-bold text-stone-700 dark:text-stone-200">
                                    <span>Nomor WhatsApp Pelanggan</span>
                                </label>
                                <input
                                    type="tel"
                                    autoFocus
                                    value={sharePreBillCustomerPhone}
                                    onChange={(e) =>
                                        setSharePreBillCustomerPhone(
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: 08123456789"
                                    className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                                />
                                <span className="mt-0.5 block text-[10px] text-stone-500 dark:text-stone-400">
                                    Format: 08xxx atau 628xxx
                                </span>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-200">
                                    Nama Pelanggan (Opsional):
                                </label>
                                <input
                                    type="text"
                                    value={sharePreBillCustomerName}
                                    onChange={(e) =>
                                        setSharePreBillCustomerName(
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Kak Dinda / Meja 4"
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                                />
                            </div>
                        </div>

                        {/* Checkbox for Bank / QRIS Payment Details */}
                        <div className="space-y-2 text-xs">
                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2.5 transition hover:bg-stone-100/70 dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700">
                                <input
                                    type="checkbox"
                                    checked={sharePreBillIncludeBank}
                                    onChange={(e) =>
                                        setSharePreBillIncludeBank(
                                            e.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 cursor-pointer rounded text-brand-700 accent-brand-700 dark:text-emerald-500 dark:accent-emerald-500"
                                />
                                <span className="text-[11px] font-medium text-stone-700 dark:text-stone-200">
                                    Sertakan info rekening bank & QRIS (untuk
                                    pembayaran non-tunai)
                                </span>
                            </label>

                            <div>
                                <label className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                    Catatan Khusus (Opsional):
                                </label>
                                <input
                                    type="text"
                                    value={sharePreBillNotes}
                                    onChange={(e) =>
                                        setSharePreBillNotes(e.target.value)
                                    }
                                    placeholder="Contoh: Pesanan Takeaway / Meja Outdoor"
                                    className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:border-brand-600 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-900"
                                />
                            </div>
                        </div>

                        {/* Message Preview Box */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-200">
                                    <Smartphone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Pratinjau Struk Teks WhatsApp:</span>
                                </span>
                                <span className="text-stone-600 dark:text-stone-300">
                                    Total:{' '}
                                    <b className="text-stone-900 dark:text-white">
                                        Rp {formatRp(totalAmount)}
                                    </b>
                                </span>
                            </div>

                            <div className="rounded-xl border border-stone-200 bg-[#efeae2] p-3 shadow-inner dark:border-stone-700 dark:bg-stone-800">
                                <div className="max-h-48 overflow-y-auto rounded-lg rounded-tr-none border border-emerald-100/50 bg-white p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-stone-800 shadow-xs dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
                                    {generatePreBillWhatsAppText(
                                        currentPreBillData,
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleShareWhatsAppPreBill}
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span>Kirim Struk ke WA</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCopyPreBill}
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-800 transition hover:bg-stone-200 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                    title="Salin teks struk ke clipboard"
                                >
                                    <Copy className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                                    <span>
                                        {isPreBillCopied
                                            ? 'Tersalin!'
                                            : 'Salin Struk'}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadA4InvoicePdf}
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#273a41] px-3.5 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#1e2e34] active:scale-95 dark:bg-stone-800 dark:hover:bg-stone-700"
                                    title="Download atau Cetak Invoice A4 format PDF"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Download PDF Invoice</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePrintPreBill}
                                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-800 transition hover:bg-stone-200 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                    title="Cetak Bill Kasir Thermal (58mm/80mm)"
                                >
                                    <Printer className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                                    <span>Cetak Kasir</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsSharePreBillModalOpen(false)
                                }
                                className="w-full cursor-pointer rounded-xl py-2 text-xs font-semibold text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL PENGATURAN DISKON TRANSAKSI (NOMINAL / PERSENTASE) --- */}
            {isCartDiscountModalOpen && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs fade-in">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900 p-4 text-white dark:bg-stone-950">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-white/10 p-1.5 text-brand-300 dark:text-emerald-400">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm leading-tight font-bold text-white">
                                        Pengaturan Diskon Transaksi
                                    </h3>
                                    <p className="text-[11px] text-stone-300">
                                        Potongan harga untuk seluruh keranjang
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setIsCartDiscountModalOpen(false)
                                }
                                className="cursor-pointer rounded-lg p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-4 p-5">
                            {/* Type Switcher */}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-200">
                                    Tipe Diskon:
                                </label>
                                <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-800">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTempDiscountType('fixed')
                                        }
                                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                            tempDiscountType === 'fixed'
                                                ? 'border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-stone-600 dark:bg-stone-700 dark:text-white'
                                                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                                        }`}
                                    >
                                        <span>Nominal (Rp)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTempDiscountType('percent')
                                        }
                                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                            tempDiscountType === 'percent'
                                                ? 'border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-stone-600 dark:bg-stone-700 dark:text-white'
                                                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                                        }`}
                                    >
                                        <Percent className="h-3.5 w-3.5" />
                                        <span>Persentase (%)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Value Input */}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-200">
                                    {tempDiscountType === 'percent'
                                        ? 'Persentase Diskon (%):'
                                        : 'Nominal Diskon (Rp):'}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-bold text-stone-400 dark:text-stone-400">
                                        {tempDiscountType === 'percent'
                                            ? '%'
                                            : 'Rp'}
                                    </div>
                                    <input
                                        type="number"
                                        autoFocus
                                        min="0"
                                        max={
                                            tempDiscountType === 'percent'
                                                ? '100'
                                                : String(netAfterItemDiscounts)
                                        }
                                        value={tempDiscountValue}
                                        onChange={(e) =>
                                            setTempDiscountValue(e.target.value)
                                        }
                                        placeholder={
                                            tempDiscountType === 'percent'
                                                ? 'Contoh: 10'
                                                : 'Contoh: 15000'
                                        }
                                        className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-4 pl-10 text-base font-bold text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-800"
                                    />
                                </div>
                            </div>

                            {/* Quick Preset Chips */}
                            <div>
                                <span className="mb-1.5 block text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                    Pilihan Cepat:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {tempDiscountType === 'percent'
                                        ? [5, 10, 15, 20, 25, 50].map((pct) => (
                                              <button
                                                  key={pct}
                                                  type="button"
                                                  onClick={() =>
                                                      setTempDiscountValue(
                                                          String(pct),
                                                      )
                                                  }
                                                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                                                      tempDiscountValue ===
                                                      String(pct)
                                                          ? 'border-brand-900 bg-brand-900 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600'
                                                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                  }`}
                                              >
                                                  {pct}%
                                              </button>
                                          ))
                                        : [2000, 5000, 10000, 20000, 50000].map(
                                              (nom) => (
                                                  <button
                                                      key={nom}
                                                      type="button"
                                                      onClick={() =>
                                                          setTempDiscountValue(
                                                              String(nom),
                                                          )
                                                      }
                                                      className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                                                          tempDiscountValue ===
                                                          String(nom)
                                                              ? 'border-brand-900 bg-brand-900 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600'
                                                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                      }`}
                                                  >
                                                      Rp {formatRp(nom)}
                                                  </button>
                                              ),
                                          )}
                                </div>
                            </div>

                            {/* Live Calculation Preview Card */}
                            {(() => {
                                const parsedVal =
                                    parseFloat(tempDiscountValue) || 0;
                                let previewAmount = 0;
                                if (parsedVal > 0) {
                                    if (tempDiscountType === 'percent') {
                                        const pct = Math.min(
                                            100,
                                            Math.max(0, parsedVal),
                                        );
                                        previewAmount = Math.round(
                                            (netAfterItemDiscounts * pct) / 100,
                                        );
                                    } else {
                                        previewAmount = Math.min(
                                            netAfterItemDiscounts,
                                            Math.max(0, parsedVal),
                                        );
                                    }
                                }
                                const finalEst = Math.max(
                                    0,
                                    netAfterItemDiscounts - previewAmount,
                                );

                                return (
                                    <div className="space-y-1.5 rounded-xl border border-stone-200/80 bg-stone-50 p-3 text-xs dark:border-stone-700 dark:bg-stone-800/80">
                                        <div className="flex justify-between text-stone-600 dark:text-stone-300">
                                            <span>
                                                Subtotal setelah diskon item:
                                            </span>
                                            <span className="font-semibold text-stone-800 dark:text-stone-100">
                                                Rp{' '}
                                                {formatRp(
                                                    netAfterItemDiscounts,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-emerald-700 dark:text-emerald-400">
                                            <span>
                                                Potongan diskon transaksi:
                                            </span>
                                            <span>
                                                -Rp {formatRp(previewAmount)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-stone-200 pt-1.5 font-bold text-stone-900 dark:border-stone-700 dark:text-white">
                                            <span>Total akhir:</span>
                                            <span className="text-sm font-bold text-brand-900 dark:text-emerald-400">
                                                Rp {formatRp(finalEst)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-2 border-t border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
                            {cartDiscountValue > 0 ? (
                                <button
                                    type="button"
                                    onClick={clearCartDiscount}
                                    className="cursor-pointer rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                >
                                    Hapus Diskon
                                </button>
                            ) : (
                                <div />
                            )}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsCartDiscountModalOpen(false)
                                    }
                                    className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={applyCartDiscount}
                                    className="cursor-pointer rounded-xl bg-brand-900 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-950 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                >
                                    Terapkan Diskon
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL PENGATURAN DISKON PER-ITEM (NOMINAL / PERSENTASE) --- */}
            {editingDiscountItem && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs fade-in">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-stone-800 bg-[#273a41] p-4 text-white dark:bg-stone-950">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-white/10 p-1.5 text-emerald-300 dark:text-emerald-400">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="truncate text-sm leading-tight font-bold text-white">
                                        Diskon Produk:{' '}
                                        {editingDiscountItem.product_name}
                                    </h3>
                                    <p className="text-[11px] text-stone-300">
                                        {editingDiscountItem.variant_label} •{' '}
                                        {editingDiscountItem.quantity} x Rp{' '}
                                        {formatRp(editingDiscountItem.price)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingDiscountItem(null)}
                                className="shrink-0 cursor-pointer rounded-lg p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-4 p-5">
                            {/* Type Switcher */}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-200">
                                    Tipe Diskon Produk:
                                </label>
                                <div className="grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-800">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setItemDiscountType('percent')
                                        }
                                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                            itemDiscountType === 'percent'
                                                ? 'border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-stone-600 dark:bg-stone-700 dark:text-white'
                                                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                                        }`}
                                    >
                                        <Percent className="h-3.5 w-3.5" />
                                        <span>Persentase (%)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setItemDiscountType('fixed')
                                        }
                                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                            itemDiscountType === 'fixed'
                                                ? 'border border-stone-200/80 bg-white text-stone-900 shadow-xs dark:border-stone-600 dark:bg-stone-700 dark:text-white'
                                                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                                        }`}
                                    >
                                        <span>Nominal (Rp)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Value Input */}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-stone-700 dark:text-stone-200">
                                    {itemDiscountType === 'percent'
                                        ? 'Persentase Diskon (%):'
                                        : 'Nominal Potongan Total Produk (Rp):'}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-bold text-stone-400 dark:text-stone-400">
                                        {itemDiscountType === 'percent'
                                            ? '%'
                                            : 'Rp'}
                                    </div>
                                    <input
                                        type="number"
                                        autoFocus
                                        min="0"
                                        max={
                                            itemDiscountType === 'percent'
                                                ? '100'
                                                : String(
                                                      editingDiscountItem.price *
                                                          editingDiscountItem.quantity,
                                                  )
                                        }
                                        value={itemDiscountValue}
                                        onChange={(e) =>
                                            setItemDiscountValue(e.target.value)
                                        }
                                        placeholder={
                                            itemDiscountType === 'percent'
                                                ? 'Contoh: 10'
                                                : 'Contoh: 5000'
                                        }
                                        className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-4 pl-10 text-base font-bold text-stone-900 focus:border-brand-600 focus:bg-white focus:ring-1 focus:ring-brand-600 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-stone-800"
                                    />
                                </div>
                            </div>

                            {/* Quick Preset Chips */}
                            <div>
                                <span className="mb-1.5 block text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                                    Pilihan Cepat:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {itemDiscountType === 'percent'
                                        ? [5, 10, 15, 20, 25, 50].map((pct) => (
                                              <button
                                                  key={pct}
                                                  type="button"
                                                  onClick={() =>
                                                      setItemDiscountValue(
                                                          String(pct),
                                                      )
                                                  }
                                                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                                                      itemDiscountValue ===
                                                      String(pct)
                                                          ? 'border-[#273a41] bg-[#273a41] text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600'
                                                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                  }`}
                                              >
                                                  {pct}%
                                              </button>
                                          ))
                                        : [1000, 2000, 5000, 10000, 20000].map(
                                              (nom) => (
                                                  <button
                                                      key={nom}
                                                      type="button"
                                                      onClick={() =>
                                                          setItemDiscountValue(
                                                              String(nom),
                                                          )
                                                      }
                                                      className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                                                          itemDiscountValue ===
                                                          String(nom)
                                                              ? 'border-[#273a41] bg-[#273a41] text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600'
                                                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                                                      }`}
                                                  >
                                                      Rp {formatRp(nom)}
                                                  </button>
                                              ),
                                          )}
                                </div>
                            </div>

                            {/* Live Calculation Preview Card */}
                            {(() => {
                                const parsedVal =
                                    parseFloat(itemDiscountValue) || 0;
                                const lineGross =
                                    editingDiscountItem.price *
                                    editingDiscountItem.quantity;
                                let previewAmount = 0;
                                if (parsedVal > 0) {
                                    if (itemDiscountType === 'percent') {
                                        const pct = Math.min(
                                            100,
                                            Math.max(0, parsedVal),
                                        );
                                        previewAmount = Math.round(
                                            (lineGross * pct) / 100,
                                        );
                                    } else {
                                        previewAmount = Math.min(
                                            lineGross,
                                            Math.max(0, parsedVal),
                                        );
                                    }
                                }
                                const finalLine = Math.max(
                                    0,
                                    lineGross - previewAmount,
                                );

                                return (
                                    <div className="space-y-1.5 rounded-xl border border-stone-200/80 bg-stone-50 p-3 text-xs dark:border-stone-700 dark:bg-stone-800/80">
                                        <div className="flex justify-between text-stone-600 dark:text-stone-300">
                                            <span>
                                                Harga Normal (
                                                {editingDiscountItem.quantity}
                                                x):
                                            </span>
                                            <span className="font-semibold text-stone-800 dark:text-stone-100">
                                                Rp {formatRp(lineGross)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-emerald-700 dark:text-emerald-400">
                                            <span>Diskon produk:</span>
                                            <span>
                                                -Rp {formatRp(previewAmount)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t border-stone-200 pt-1.5 font-bold text-stone-900 dark:border-stone-700 dark:text-white">
                                            <span>Subtotal produk:</span>
                                            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                                                Rp {formatRp(finalLine)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-2 border-t border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
                            {editingDiscountItem.discount_amount &&
                            editingDiscountItem.discount_amount > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        removeItemDiscount(
                                            editingDiscountItem.id,
                                        );
                                        setEditingDiscountItem(null);
                                    }}
                                    className="cursor-pointer rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                >
                                    Hapus Diskon
                                </button>
                            ) : (
                                <div />
                            )}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingDiscountItem(null)}
                                    className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={saveItemDiscount}
                                    className="cursor-pointer rounded-xl bg-brand-900 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-950 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                >
                                    Simpan Diskon
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL: MODE OFFLINE & SINKRONISASI DATA                                     */}
            {/* ========================================================================= */}
            {isOfflineModalOpen && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-3 backdrop-blur-xs duration-150 fade-in sm:p-4">
                    <div className="flex max-h-[90vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl duration-150 zoom-in-95 dark:border-stone-800 dark:bg-stone-900">
                        {/* Modal Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-stone-200 bg-stone-50/60 p-4 sm:p-5 dark:border-stone-800 dark:bg-stone-900/60">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-brand-900/10 p-2.5 text-brand-900 dark:bg-emerald-500/10 dark:text-emerald-400">
                                    <Cloud className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-2 text-base font-bold text-stone-900 dark:text-white">
                                        <span>
                                            Mode Offline & Sinkronisasi Data
                                        </span>
                                    </h3>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">
                                        Operasional kasir tanpa internet, tarik
                                        data database & unggah transaksi
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOfflineModalOpen(false)}
                                className="cursor-pointer rounded-xl p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
                            {/* Status Koneksi & Saklar Manual Offline */}
                            <div className="flex flex-col justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4 sm:flex-row sm:items-center dark:border-stone-800 dark:bg-stone-800/40">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-3 w-3 rounded-full ${
                                                !isOnline
                                                    ? 'animate-ping bg-rose-500'
                                                    : manualOffline
                                                      ? 'bg-amber-500'
                                                      : 'bg-emerald-500'
                                            }`}
                                        />
                                        <span className="text-sm font-bold text-stone-900 dark:text-white">
                                            {!isOnline
                                                ? 'Internet Terputus (Offline)'
                                                : manualOffline
                                                  ? 'Mode Offline Manual Aktif'
                                                  : 'Terhubung ke Database (Online)'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                        {isEffectiveOffline
                                            ? 'Transaksi akan disimpan di memori kasir lokal dan otomatis disinkronkan saat online.'
                                            : 'Semua transaksi dan data otomatis terupdate langsung ke database server.'}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-2xs dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                        <input
                                            type="checkbox"
                                            checked={manualOffline}
                                            onChange={(e) =>
                                                toggleManualOffline(
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-4 w-4 cursor-pointer rounded text-brand-900 focus:ring-brand-800"
                                        />
                                        <span>Paksa Mode Offline</span>
                                    </label>
                                </div>
                            </div>

                            {/* Status Message / Notification */}
                            {syncStatusMessage && (
                                <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
                                    <RefreshCw
                                        className={`h-4 w-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`}
                                    />
                                    <span>{syncStatusMessage}</span>
                                </div>
                            )}

                            {/* 2 Main Action Cards: Download (Tarik Data) & Upload (Import Penjualan) */}
                            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                                {/* CARD 1: TARIK DATA (DOWNLOAD DATABASE) */}
                                <div className="flex flex-col justify-between space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                            <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            <span>
                                                Tarik Data Katalog (Download)
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                            Unduh katalog produk, harga varian,
                                            dan kategori terbaru dari database
                                            pusat ke memori kasir agar dapat
                                            dipakai jualan saat offline.
                                        </p>
                                        <div className="mt-2 text-[11px] text-stone-400 dark:text-stone-500">
                                            Tersimpan:{' '}
                                            <strong className="text-stone-700 dark:text-stone-300">
                                                {products.length} produk
                                            </strong>{' '}
                                            ({categories.length} kategori)
                                            {lastCatalogSync && (
                                                <span className="mt-0.5 block truncate">
                                                    Terakhir:{' '}
                                                    {new Date(
                                                        lastCatalogSync,
                                                    ).toLocaleString('id-ID')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 border-t border-stone-100 pt-2 dark:border-stone-800">
                                        <button
                                            type="button"
                                            disabled={
                                                isDownloadingCatalog ||
                                                isSyncing
                                            }
                                            onClick={() =>
                                                pullLatestCatalogData(false)
                                            }
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-900 px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-950 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                        >
                                            <RefreshCw
                                                className={`h-3.5 w-3.5 ${isDownloadingCatalog ? 'animate-spin' : ''}`}
                                            />
                                            <span>
                                                {isDownloadingCatalog
                                                    ? 'Menarik Data...'
                                                    : 'Tarik Data dari Database'}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                pullLatestCatalogData(true)
                                            }
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            <span>
                                                Unduh File Backup Katalog (JSON)
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* CARD 2: UPLOAD DATA PENJUALAN (IMPORT KE DATABASE) */}
                                <div className="flex flex-col justify-between space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                                            <Upload className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            <span>
                                                Upload Data Penjualan (Import)
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                                            Kirim transaksi kasir offline ke
                                            database pusat agar laporan
                                            penjualan dan keuangan sinkron, atau
                                            impor file data penjualan offline.
                                        </p>
                                        <div className="mt-2 text-[11px] text-stone-400 dark:text-stone-500">
                                            Transaksi offline tersimpan:{' '}
                                            <strong className="font-bold text-amber-600 dark:text-amber-400">
                                                {offlineOrders.length} transaksi
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 border-t border-stone-100 pt-2 dark:border-stone-800">
                                        <button
                                            type="button"
                                            disabled={
                                                offlineOrders.length === 0 ||
                                                isSyncing ||
                                                !isOnline
                                            }
                                            onClick={() =>
                                                syncOfflineOrdersToServer(true)
                                            }
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Upload
                                                className={`h-3.5 w-3.5 ${isSyncing ? 'animate-bounce' : ''}`}
                                            />
                                            <span>
                                                {isSyncing
                                                    ? 'Mengunggah Transaksi...'
                                                    : `Upload & Sinkronkan (${offlineOrders.length})`}
                                            </span>
                                        </button>

                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                                type="button"
                                                disabled={
                                                    offlineOrders.length === 0
                                                }
                                                onClick={
                                                    exportOfflineOrdersToFile
                                                }
                                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-stone-100 px-2.5 py-2 text-[11px] font-semibold text-stone-700 transition hover:bg-stone-200 disabled:opacity-40 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                                title="Ekspor transaksi offline kasir ke berkas JSON"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                <span>Export JSON</span>
                                            </button>

                                            <label
                                                htmlFor="pos-import-file-input"
                                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-stone-100 px-2.5 py-2 text-center text-[11px] font-semibold text-stone-700 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                                                title="Pilih file JSON transaksi kasir untuk diimpor ke database"
                                            >
                                                <Upload className="h-3.5 w-3.5" />
                                                <span>Import JSON</span>
                                                <input
                                                    id="pos-import-file-input"
                                                    type="file"
                                                    accept=".json,application/json,text/plain"
                                                    onChange={
                                                        handleImportOrdersFile
                                                    }
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Daftar Transaksi Offline Yang Menunggu Sinkronisasi */}
                            <div className="pt-2">
                                <div className="mb-2 flex items-center justify-between">
                                    <h4 className="text-xs font-bold tracking-wider text-stone-600 uppercase dark:text-stone-400">
                                        Daftar Transaksi Offline Tersimpan (
                                        {offlineOrders.length})
                                    </h4>
                                    {offlineOrders.length > 0 && isOnline && (
                                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            <Wifi className="h-3 w-3" />
                                            <span>
                                                Otomatis terupdate saat online
                                            </span>
                                        </span>
                                    )}
                                </div>

                                {offlineOrders.length === 0 ? (
                                    <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 py-6 text-center text-xs text-stone-400 dark:border-stone-800 dark:bg-stone-800/20 dark:text-stone-500">
                                        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500 opacity-80" />
                                        <p className="font-semibold text-stone-700 dark:text-stone-300">
                                            Tidak ada transaksi offline yang
                                            tertunda
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                                            Semua penjualan telah tersinkronkan
                                            ke database server pusat.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-h-52 overflow-hidden overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-800">
                                        <table className="w-full text-left text-xs">
                                            <thead className="border-b border-stone-200 bg-stone-100 font-bold text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                                                <tr>
                                                    <th className="p-2.5">
                                                        No. Struk
                                                    </th>
                                                    <th className="p-2.5">
                                                        Pelanggan
                                                    </th>
                                                    <th className="p-2.5">
                                                        Metode
                                                    </th>
                                                    <th className="p-2.5">
                                                        Waktu
                                                    </th>
                                                    <th className="p-2.5 text-right">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-200 text-stone-800 dark:divide-stone-800 dark:text-stone-200">
                                                {offlineOrders.map((ord) => (
                                                    <tr
                                                        key={ord.offline_id}
                                                        className="hover:bg-stone-50 dark:hover:bg-stone-800/50"
                                                    >
                                                        <td className="p-2.5 font-mono font-semibold text-brand-900 dark:text-emerald-400">
                                                            {ord.offline_id}
                                                        </td>
                                                        <td className="p-2.5">
                                                            {ord.customer_name ||
                                                                'Pelanggan Kasir'}
                                                        </td>
                                                        <td className="p-2.5 capitalize">
                                                            {ord.payment_method}
                                                        </td>
                                                        <td className="p-2.5 text-[11px] text-stone-400 dark:text-stone-500">
                                                            {new Date(
                                                                ord.created_at,
                                                            ).toLocaleTimeString(
                                                                'id-ID',
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </td>
                                                        <td className="p-2.5 text-right font-bold">
                                                            Rp{' '}
                                                            {formatRp(
                                                                ord.total_amount,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">
                                Sanubari POS Offline Engine • LocalStorage &
                                Auto-Sync
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsOfflineModalOpen(false)}
                                className="cursor-pointer rounded-xl bg-stone-200 px-4 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL DIALOG MENGATUR PRINTER & MARGIN STRUK (DEPRECATED: NOW INLINE) */}
            {/* ========================================================================= */}
            {false && isPrinterModalOpen && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-brand-950/60 p-3 backdrop-blur-xs duration-150 fade-in sm:p-4">
                    <div className="relative flex w-full max-w-2xl animate-in flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl duration-150 zoom-in-95 dark:border-stone-800 dark:bg-stone-900">
                        {/* Blue Modal Header */}
                        <div className="flex shrink-0 items-center justify-between bg-[#0284c7] px-5 py-3.5 text-white shadow-sm">
                            <div className="flex items-center gap-2.5">
                                <Printer className="h-5 w-5 text-white" />
                                <h3 className="text-sm font-bold tracking-wide text-white">
                                    Mengatur Printer
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPrinterModalOpen(false)}
                                className="cursor-pointer rounded-lg p-1 text-white transition hover:bg-white/20"
                                title="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body: 2 Columns */}
                        <div className="max-h-[calc(85vh-120px)] space-y-4 overflow-y-auto p-5 text-xs sm:p-6">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                                {/* KOLOM KIRI */}
                                <div className="space-y-3.5">
                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Nama
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                printerForm.printer_name || ''
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    printer_name:
                                                        e.target.value,
                                                }))
                                            }
                                            placeholder="Contoh: Printer #639304662601302044"
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Printer
                                        </label>
                                        <select
                                            value={
                                                printerForm.printer_driver ||
                                                'POS80 Printer | WINDOWS'
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    printer_driver:
                                                        e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="POS80 Printer | WINDOWS">
                                                POS80 Printer | WINDOWS
                                            </option>
                                            <option value="POS58 Printer | WINDOWS">
                                                POS58 Printer | WINDOWS
                                            </option>
                                            <option value="Bluetooth Thermal ESC/POS">
                                                Bluetooth Thermal ESC/POS
                                            </option>
                                            <option value="Default System / USB Printer">
                                                Default System / USB Printer
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Ukuran Kertas Thermal
                                        </label>
                                        <select
                                            value={printerForm.paper_width}
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    paper_width: e.target
                                                        .value as PaperWidth,
                                                    receipt_columns:
                                                        e.target.value ===
                                                        '80mm'
                                                            ? 44
                                                            : 32,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="58mm">
                                                58 mm (Printer Portabel / Kasir
                                                Kecil)
                                            </option>
                                            <option value="80mm">
                                                80 mm (Printer Desktop / Kasir
                                                Standar)
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Cash Drawer
                                        </label>
                                        <select
                                            value={
                                                printerForm.open_cash_drawer
                                                    ? '1'
                                                    : '0'
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    open_cash_drawer:
                                                        e.target.value === '1',
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="0">Tidak</option>
                                            <option value="1">
                                                Buka Laci Kasir Saat Cetak
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Line Display
                                        </label>
                                        <select
                                            value={
                                                printerForm.line_display ||
                                                'none'
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    line_display:
                                                        e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="none">Tidak</option>
                                            <option value="vfd_2x20">
                                                ESC/POS Customer Display (2x20)
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Formatting
                                        </label>
                                        <select
                                            value={
                                                printerForm.formatting ||
                                                'formatted'
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    formatting: e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="formatted">
                                                Dengan Formatting
                                            </option>
                                            <option value="plain">
                                                Teks Polos
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {/* KOLOM KANAN */}
                                <div className="space-y-3.5">
                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Receipt - Jumlah Kolom
                                        </label>
                                        <select
                                            value={
                                                printerForm.receipt_columns ||
                                                (printerForm.paper_width ===
                                                '80mm'
                                                    ? 44
                                                    : 32)
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    receipt_columns: Number(
                                                        e.target.value,
                                                    ),
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="32">32</option>
                                            <option value="40">40</option>
                                            <option value="42">42</option>
                                            <option value="44">44</option>
                                            <option value="48">48</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Panjang Maksimal Nama Item
                                        </label>
                                        <select
                                            value={
                                                printerForm.max_item_name_length ||
                                                24
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    max_item_name_length:
                                                        Number(e.target.value),
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="18">18</option>
                                            <option value="24">24</option>
                                            <option value="28">28</option>
                                            <option value="32">32</option>
                                            <option value="44">44</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Receipt - Cetak Salinan
                                        </label>
                                        <select
                                            value={printerForm.copies || 1}
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    copies: Number(
                                                        e.target.value,
                                                    ),
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Cetak Logo
                                        </label>
                                        <select
                                            value={
                                                printerForm.show_logo !== false
                                                    ? '1'
                                                    : '0'
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    show_logo:
                                                        e.target.value === '1',
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="1">Ya</option>
                                            <option value="0">Tidak</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Auto Print
                                        </label>
                                        <select
                                            value={
                                                printerForm.auto_print
                                                    ? '1'
                                                    : '0'
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    auto_print:
                                                        e.target.value === '1',
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="0">Manual</option>
                                            <option value="1">Otomatis</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Printer Kasir
                                        </label>
                                        <select
                                            value={
                                                printerForm.is_cashier_printer !==
                                                false
                                                    ? '1'
                                                    : '0'
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    is_cashier_printer:
                                                        e.target.value === '1',
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="1">Ya</option>
                                            <option value="0">Bukan</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* PENGATURAN MARGIN STRUK */}
                            <div className="border-t border-stone-200 pt-3 dark:border-stone-800">
                                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-white">
                                    <SlidersHorizontal className="h-3.5 w-3.5 text-sky-600" />
                                    <span>
                                        Margin Kertas & Jarak Potong Struk
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Margin Kiri & Kanan (Padding Kertas)
                                        </label>
                                        <select
                                            value={
                                                printerForm.margin_horizontal ||
                                                '2mm'
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    margin_horizontal:
                                                        e.target.value,
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="0mm">
                                                0 mm (Rapat Tepi Kertas)
                                            </option>
                                            <option value="1mm">1 mm</option>
                                            <option value="2mm">
                                                2 mm (Standar Thermal)
                                            </option>
                                            <option value="3mm">3 mm</option>
                                            <option value="4mm">4 mm</option>
                                            <option value="5mm">
                                                5 mm (Margin Longgar)
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                                            Margin Bawah / Jarak Potong (Feed
                                            Lines)
                                        </label>
                                        <select
                                            value={
                                                printerForm.margin_feed_lines ||
                                                2
                                            }
                                            onChange={(e) =>
                                                setPrinterForm((prev) => ({
                                                    ...prev,
                                                    margin_feed_lines: Number(
                                                        e.target.value,
                                                    ),
                                                }))
                                            }
                                            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-900 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-800"
                                        >
                                            <option value="1">1 Baris</option>
                                            <option value="2">
                                                2 Baris (Standar)
                                            </option>
                                            <option value="3">3 Baris</option>
                                            <option value="4">
                                                4 Baris (Aman Pisau Potong
                                                Otomatis)
                                            </option>
                                            <option value="5">5 Baris</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer (Persis Screenshot Referensi) */}
                        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/80">
                            <button
                                type="button"
                                onClick={handleResetPrinterDefaults}
                                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-95"
                            >
                                <X className="h-4 w-4" />
                                <span>Hapus</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleRunTestPrint('web')}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#22c55e] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-600 active:scale-95"
                                >
                                    <Printer className="h-4 w-4" />
                                    <span>Test Cetak</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        await handleSavePrinterSettings();
                                        setIsPrinterModalOpen(false);
                                    }}
                                    disabled={isSavingSettings}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0284c7] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-sky-700 active:scale-95 disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                                        {isSavingSettings
                                            ? 'Menyimpan...'
                                            : 'Simpan'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FLOATING TOAST NOTIFICATION --- */}
            {feedbackMessage && (
                <div className="fixed bottom-16 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-2 rounded-full border border-brand-800 bg-brand-950 px-4 py-2 text-xs font-semibold text-white shadow-xl fade-in slide-in-from-bottom-2 md:bottom-6">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{feedbackMessage}</span>
                </div>
            )}
        </div>
    );
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class PosErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('POS Crash Intercepted by ErrorBoundary:', error, errorInfo);
    }

    handleReset = () => {
        try {
            // Clear all POS cache keys
            Object.keys(localStorage).forEach((k) => {
                if (k.includes('pos') || k.includes('sanubari')) {
                    localStorage.removeItem(k);
                }
            });
            sessionStorage.clear();
            if ('caches' in window) {
                caches.keys().then((names) => {
                    names.forEach((name) => caches.delete(name));
                });
            }
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                        registration.unregister();
                    }
                });
            }
        } catch {}
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 p-6 text-center text-white">
                    <div className="w-full max-w-md space-y-4 rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                            <RotateCcw className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-bold text-stone-100">
                            Terjadi Kesalahan Tampilan POS
                        </h2>
                        <p className="text-xs text-stone-400">
                            Sistem mendeteksi kendala pada data cache terminal kasir. Silakan klik tombol di bawah untuk membersihkan cache dan memuat ulang.
                        </p>
                        {this.state.error && (
                            <pre className="overflow-x-auto rounded-lg bg-stone-950 p-2.5 text-left font-mono text-[10px] text-rose-400/80">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="flex-1 cursor-pointer rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-600"
                            >
                                Muat Ulang
                            </button>
                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="flex-1 cursor-pointer rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-bold text-stone-200 transition hover:bg-stone-700"
                            >
                                Bersihkan Cache POS
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function PosPage(props: PosProps) {
    return (
        <PosErrorBoundary>
            <PosContent {...props} />
        </PosErrorBoundary>
    );
}
