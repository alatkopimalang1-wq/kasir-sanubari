import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import {
    ArrowRight,
    Bell,
    Check,
    CheckCheck,
    Clock,
    Coffee,
    ExternalLink,
    Flame,
    Package,
    Search,
    ShieldCheck,
    Sparkles,
    Tag,
    Truck,
    X,
    Zap,
} from 'lucide-react';
import { formatRupiah } from '@/lib/trans';

export interface NotificationItem {
    id: string;
    type: 'order' | 'promo' | 'broadcast' | 'event';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    href?: string;
    badge?: string;
    badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'red';
    metadata?: {
        orderNumber?: string;
        orderStatus?: string;
        courier?: string;
        trackingNumber?: string;
        discount?: string;
    };
}

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    announcementText?: string;
    announcementLink?: string;
}

const STORAGE_READ_KEY = 'sanubari_read_notifications_v1';
const STORAGE_ORDERS_KEY = 'sanubari_recent_orders';

export const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,
    announcementText,
    announcementLink,
}) => {
    const [activeTab, setActiveTab] = useState<
        'all' | 'order' | 'promo' | 'news'
    >('all');
    const [readIds, setReadIds] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem(STORAGE_READ_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const [recentOrders, setRecentOrders] = useState<any[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    // Save read states
    const markAsRead = (id: string) => {
        setReadIds((prev) => {
            if (prev.includes(id)) return prev;
            const updated = [...prev, id];
            try {
                localStorage.setItem(STORAGE_READ_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error(e);
            }
            return updated;
        });
    };

    const markAllAsRead = () => {
        const allIds = notificationsList.map((n) => n.id);
        setReadIds(allIds);
        try {
            localStorage.setItem(STORAGE_READ_KEY, JSON.stringify(allIds));
        } catch (e) {
            console.error(e);
        }
    };

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Build notification list
    const notificationsList: NotificationItem[] = [
        // 1. Broadcast Promos
        {
            id: 'promo-flash-sale-2026',
            type: 'promo',
            title: '🔥 Flash Sale Kopi Pilihan Sedang Berlangsung!',
            message:
                'Dapatkan potongan harga spesial hingga 35% untuk varian single origin lereng Kawi dan blend espresso favorit. Stok terbatas hari ini!',
            timestamp: 'Baru Saja',
            isRead: readIds.includes('promo-flash-sale-2026'),
            href: '/flash-sale',
            badge: 'Diskon s/d 35%',
            badgeColor: 'red',
        },
        {
            id: 'promo-free-shipping-java',
            type: 'promo',
            title: '🚚 Promo Bebas Ongkos Kirim Se-Jawa',
            message:
                'Nikmati Gratis Ongkir ke seluruh Pulau Jawa untuk setiap pembelian biji kopi minimal Rp 250.000 dengan kurir terhubung (J&T, JNE, SiCepat).',
            timestamp: 'Aktif Setiap Hari',
            isRead: readIds.includes('promo-free-shipping-java'),
            href: '/shop',
            badge: 'Gratis Ongkir',
            badgeColor: 'emerald',
        },
        {
            id: 'promo-byob-blend',
            type: 'promo',
            title: '✨ C.Y.B.R Custom Blend',
            message:
                'Buat formula kopi houseblend kedai atau seduhan personal Anda sendiri dengan racikan persentase origin dan roast level sesuai selera.',
            timestamp: 'Layanan Eksklusif',
            isRead: readIds.includes('promo-byob-blend'),
            href: '/cybr',
            badge: 'Signature Blend',
            badgeColor: 'purple',
        },

        // 2. Announcements from Admin if available
        ...(announcementText
            ? [
                  {
                      id: 'admin-broadcast-banner',
                      type: 'broadcast' as const,
                      title: '📢 Pengumuman Resmi Sanubari Roastery',
                      message: announcementText,
                      timestamp: 'Informasi Terkini',
                      isRead: readIds.includes('admin-broadcast-banner'),
                      href: announcementLink || '/shop',
                      badge: 'Info Toko',
                      badgeColor: 'amber' as const,
                  },
              ]
            : []),

        // 3. Order Status Notifications (Real from localStorage or Demo guides)
        ...(recentOrders.length > 0
            ? recentOrders.map((ord: any) => ({
                  id: `order-status-${ord.order_number}`,
                  type: 'order' as const,
                  title: `Pesanan #${ord.order_number}`,
                  message: `Status: ${ord.status_label || 'Sedang Diproses'}. Metode bayar: ${ord.payment_method_label || 'QRIS Toko'}. Klik untuk memantau resi atau bayar.`,
                  timestamp: ord.created_at || 'Hari ini',
                  isRead: readIds.includes(`order-status-${ord.order_number}`),
                  href: `/pesanan/${ord.order_number}`,
                  badge:
                      ord.payment_status === 'paid'
                          ? 'Lunas'
                          : 'Menunggu Bayar',
                  badgeColor:
                      ord.payment_status === 'paid'
                          ? ('emerald' as const)
                          : ('amber' as const),
                  metadata: {
                      orderNumber: ord.order_number,
                      orderStatus: ord.status,
                      courier: ord.shipping_courier,
                  },
              }))
            : [
                  {
                      id: 'order-sample-notice',
                      type: 'order' as const,
                      title: '📦 Lacak Status & Resi Pesanan Anda',
                      message:
                          'Sudah melakukan pemesanan? Anda dapat melacak nomor pesanan, mengecek status pembayaran QRIS/Transfer Bank, dan melihat resi kurir kapan saja.',
                      timestamp: 'Bantuan Pesanan',
                      isRead: readIds.includes('order-sample-notice'),
                      href: '/lacak-pesanan',
                      badge: 'Lacak Pesanan',
                      badgeColor: 'blue' as const,
                  },
              ]),

        // 4. Roastery News & Events
        {
            id: 'event-cupping-session',
            type: 'event',
            title: '☕ Public Cupping Session di Roastery Malang',
            message:
                'Eksplorasi sensorik profil rasa panen lereng Gunung Kawi bersama head roaster Sanubari. Terbuka untuk umum & home brewer.',
            timestamp: 'Sabtu Ini',
            isRead: readIds.includes('event-cupping-session'),
            href: '/acara',
            badge: 'Workshop Kopi',
            badgeColor: 'blue',
        },
        {
            id: 'guide-brew-v60',
            type: 'event',
            title: '📖 Panduan Seduh: Ekstraksi Manis Madu Kawi',
            message:
                'Simak resep pour-over V60 dengan rasio 1:15 dan suhu 92°C untuk menonjolkan aroma floral dan aftertaste manis madu alami.',
            timestamp: 'Jurnal Edukasi',
            isRead: readIds.includes('guide-brew-v60'),
            href: '/panduan-seduh',
            badge: 'Panduan Seduh',
            badgeColor: 'amber',
        },
    ];

    // Filter by Tab
    const filteredList = notificationsList.filter((item) => {
        if (activeTab === 'order') return item.type === 'order';
        if (activeTab === 'promo')
            return item.type === 'promo' || item.type === 'broadcast';
        if (activeTab === 'news') return item.type === 'event';
        return true;
    });

    const unreadCount = notificationsList.filter((n) => !n.isRead).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[80] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-brand-950/60 backdrop-blur-xs"
                        onClick={onClose}
                    />

                    {/* Slide-over panel */}
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
                        <div className="flex items-center justify-between border-b border-sand-200 bg-cream-50 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-700 text-white">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="flex items-center gap-1.5 text-base font-bold text-brand-950">
                                        <span>Pusat Notifikasi</span>
                                        {unreadCount > 0 && (
                                            <span className="py-0.2 rounded-full bg-red-500 px-1.5 text-[10px] font-extrabold text-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-[11px] text-brand-600">
                                        Status pesanan, broadcast promo &amp;
                                        info roastery
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllAsRead}
                                        className="flex cursor-pointer items-center gap-1 rounded-lg p-1 text-[11px] font-semibold text-brand-700 transition-colors hover:bg-sand-200/60 hover:text-brand-950"
                                        title="Tandai semua sudah dibaca"
                                    >
                                        <CheckCheck className="h-3.5 w-3.5 text-brand-600" />
                                        <span className="hidden sm:inline">
                                            Tandai Dibaca
                                        </span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="cursor-pointer rounded-full p-1.5 text-brand-600 transition-colors hover:bg-sand-200 hover:text-brand-950"
                                    aria-label="Tutup notifikasi"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="bg-sand-100/60 no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-sand-200 px-4 py-2.5">
                            {[
                                { id: 'all', label: 'Semua' },
                                { id: 'order', label: 'Pesanan' },
                                { id: 'promo', label: 'Promo & Diskon' },
                                { id: 'news', label: 'Kabar Roastery' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-brand-700 text-white shadow-xs'
                                            : 'border border-sand-200/80 bg-white text-brand-700 hover:bg-sand-200/80'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 space-y-3 overflow-y-auto p-4">
                            {filteredList.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center py-12 text-center text-brand-500">
                                    <Bell className="mb-2 h-10 w-10 stroke-1 text-brand-300" />
                                    <p className="text-xs font-semibold">
                                        Tidak ada notifikasi dalam kategori ini
                                    </p>
                                </div>
                            ) : (
                                filteredList.map((item) => {
                                    const badgeClasses =
                                        item.badgeColor === 'red'
                                            ? 'bg-red-100 text-red-800'
                                            : item.badgeColor === 'emerald'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : item.badgeColor === 'purple'
                                                ? 'bg-purple-100 text-purple-800'
                                                : item.badgeColor === 'blue'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-amber-100 text-amber-800';

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => markAsRead(item.id)}
                                            className={`relative rounded-2xl border p-3.5 transition-all ${
                                                item.isRead
                                                    ? 'border-sand-200 bg-white hover:border-sand-300'
                                                    : 'border-brand-200/80 bg-cream-50/80 shadow-xs'
                                            }`}
                                        >
                                            {/* Unread indicator dot */}
                                            {!item.isRead && (
                                                <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-brand-700 ring-2 ring-brand-100" />
                                            )}

                                            <div className="space-y-1.5 pr-4">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {item.badge && (
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${badgeClasses}`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-medium text-brand-400">
                                                        {item.timestamp}
                                                    </span>
                                                </div>

                                                <h3 className="text-xs leading-snug font-bold text-brand-950 sm:text-sm">
                                                    {item.title}
                                                </h3>

                                                <p className="text-[11px] leading-relaxed text-brand-600">
                                                    {item.message}
                                                </p>

                                                {/* Action Link Button */}
                                                {item.href && (
                                                    <div className="pt-1.5">
                                                        <Link
                                                            href={item.href}
                                                            onClick={() => {
                                                                markAsRead(
                                                                    item.id,
                                                                );
                                                                onClose();
                                                            }}
                                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-950 hover:underline"
                                                        >
                                                            <span>
                                                                {item.type ===
                                                                'order'
                                                                    ? 'Buka Rincian Pesanan'
                                                                    : item.type ===
                                                                        'promo'
                                                                      ? 'Lihat Penawaran'
                                                                      : 'Pelajari Selengkapnya'}
                                                            </span>
                                                            <ArrowRight className="h-3 w-3" />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Quick Action: Lacak Pesanan Langsung */}
                        <div className="space-y-2 border-t border-sand-200 bg-cream-50 p-4">
                            <div className="flex items-center justify-between text-xs text-brand-600">
                                <span className="font-medium">
                                    Punya nomor invoice pesanan?
                                </span>
                                <Link
                                    href="/lacak-pesanan"
                                    onClick={onClose}
                                    className="flex items-center gap-1 font-bold text-brand-700 hover:text-brand-950 hover:underline"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    <span>Lacak Pesanan</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
