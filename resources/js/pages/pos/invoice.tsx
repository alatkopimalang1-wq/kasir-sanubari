import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Download,
    Printer,
    Coffee,
    Building2,
    QrCode,
    Share2,
} from 'lucide-react';
import { formatRp } from '@/lib/thermal-printer';

interface PosInvoiceItem {
    id: number;
    product_name: string;
    variant_label: string;
    price: number;
    quantity: number;
    discount_amount?: number;
    subtotal: number;
}

interface PosInvoiceOrder {
    id: number;
    order_number: string;
    queue_number?: string;
    customer_name: string;
    customer_phone?: string;
    customer_notes?: string;
    cashier_name: string;
    payment_method_label: string;
    payment_status: 'pending' | 'paid';
    payment_status_label: string;
    status: string;
    status_label: string;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    created_at: string;
    bank_info?: string | null;
    qris_instructions?: string | null;
    items: PosInvoiceItem[];
}

interface PosInvoiceProps {
    order: PosInvoiceOrder;
    settings: {
        site_name?: string;
        tagline?: string;
        address?: string;
        phone?: string;
        email?: string;
    };
    autoDownload?: boolean;
}

export default function PosDigitalInvoicePage({
    order,
    settings,
    autoDownload,
}: PosInvoiceProps) {
    const isPaid = order.payment_status === 'paid';

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    // Auto trigger print/save-as-pdf if requested
    useEffect(() => {
        if (autoDownload && typeof window !== 'undefined') {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoDownload]);

    const pageTitle = `Invoice-${order.order_number}-Kasir-Sanubari`;

    return (
        <div className="min-h-screen bg-stone-100 px-4 py-6 font-sans text-stone-900 selection:bg-brand-700 selection:text-white sm:px-6 sm:py-10 print:m-0 print:bg-white print:p-0">
            <Head title={pageTitle}>
                <style>{`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 10mm;
                        }
                        body {
                            background-color: #ffffff !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print-hidden {
                            display: none !important;
                        }
                    }
                `}</style>
            </Head>

            {/* Action Bar (Screen Only, Hidden in Print) */}
            <div className="print-hidden mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3">
                <Link
                    href="/pos"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 shadow-2xs transition-colors hover:text-brand-950"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke POS Kasir</span>
                </Link>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-95"
                    >
                        <Download className="h-4 w-4" />
                        <span>Download Invoice PDF (A4)</span>
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#273a41] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1e2e34] active:scale-95"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Faktur A4</span>
                    </button>
                </div>
            </div>

            {/* A4 Sheet Container */}
            <div className="mx-auto max-w-4xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-10 print:max-w-none print:border-none print:p-0 print:shadow-none">
                {/* Header: Brand & Invoice Meta */}
                <div className="flex flex-col justify-between gap-6 border-b-2 border-stone-800 pb-6 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-4">
                        <img
                            src="/brand/logo-circle.png"
                            alt="Kasir Sanubari Logo"
                            className="h-16 w-16 shrink-0 rounded-full border border-stone-200 bg-stone-50 object-contain p-1"
                        />
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-black tracking-tight text-stone-900 uppercase sm:text-2xl">
                                {settings.site_name || 'Kasir Sanubari'}
                            </h1>
                            <p className="text-xs font-semibold text-stone-600 italic">
                                {settings.tagline ||
                                    'Menyentuh Hati, Merangkai Cerita'}
                            </p>
                            <p className="max-w-sm pt-1 text-[11px] leading-relaxed text-stone-500">
                                {settings.address ||
                                    'Jl. Candi Mendut No. 3, Lowokwaru, Kota Malang, Jawa Timur 65141'}
                                <br />
                                WhatsApp: {settings.phone || '0851-2193-0454'} ·
                                Email:{' '}
                                {settings.email || 'halo@kasir-sanubari.test'}
                            </p>
                        </div>
                    </div>

                    <div className="shrink-0 space-y-1 sm:text-right">
                        <span className="inline-block rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black tracking-widest text-emerald-800 uppercase">
                            FAKTUR PENJUALAN DIGITAL (A4)
                        </span>
                        <div className="pt-1 font-mono text-base font-black text-stone-900 sm:text-lg">
                            #{order.order_number}
                        </div>
                        <div className="text-xs font-medium text-stone-600">
                            Tanggal: {order.created_at} WIB
                        </div>
                        <div className="text-xs text-stone-600">
                            Kasir:{' '}
                            <b className="text-stone-900">
                                {order.cashier_name}
                            </b>
                        </div>
                        <div className="flex items-center gap-2 pt-1 sm:justify-end">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black tracking-wider uppercase ${
                                    isPaid
                                        ? 'border-2 border-emerald-400 bg-emerald-100 text-emerald-800'
                                        : 'border-2 border-amber-300 bg-amber-100 text-amber-900'
                                }`}
                            >
                                {isPaid ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                                )}
                                <span>
                                    {isPaid
                                        ? 'LUNAS / PAID'
                                        : 'ESTIMASI (PRE-BILL)'}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Customer & Transaction Meta */}
                <div className="grid grid-cols-1 gap-6 border-b border-stone-200 py-6 text-xs sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <span className="block text-[10px] font-black tracking-wider text-stone-500 uppercase">
                            DITUJUKAN KEPADA PELANGGAN
                        </span>
                        <h4 className="text-base font-black text-stone-900">
                            {order.customer_name}
                        </h4>
                        {order.customer_phone &&
                            order.customer_phone !== '-' && (
                                <p className="text-stone-700">
                                    No. WhatsApp:{' '}
                                    <b className="text-stone-900">
                                        {order.customer_phone}
                                    </b>
                                </p>
                            )}
                        {order.customer_notes && (
                            <p className="mt-1 rounded-lg border border-stone-200 bg-stone-50 p-2 text-stone-600">
                                Catatan: <i>{order.customer_notes}</i>
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5 sm:text-right">
                        <span className="block text-[10px] font-black tracking-wider text-stone-500 uppercase">
                            INFORMASI TRANSAKSI
                        </span>
                        <p className="text-stone-700">
                            Metode:{' '}
                            <b className="text-stone-900">
                                {order.payment_method_label}
                            </b>
                        </p>
                        <p className="text-stone-700">
                            Status Pembayaran:{' '}
                            <b
                                className={
                                    isPaid
                                        ? 'font-bold text-emerald-700'
                                        : 'font-bold text-amber-800'
                                }
                            >
                                {order.payment_status_label}
                            </b>
                        </p>
                        <p className="text-[11px] text-stone-500">
                            Kategori: Transaksi Langsung di Kasir (POS)
                        </p>
                    </div>
                </div>

                {/* Itemized Table */}
                <div className="py-6">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b-2 border-stone-300 text-[10px] font-black tracking-wider text-stone-500 uppercase">
                                <th className="w-10 pb-3 text-center">NO</th>
                                <th className="pb-3">
                                    DESKRIPSI PRODUK & VARIAN
                                </th>
                                <th className="pb-3 text-right">
                                    HARGA SATUAN
                                </th>
                                <th className="w-16 pb-3 text-center">QTY</th>
                                <th className="pb-3 text-right">
                                    JUMLAH (IDR)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {order.items.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-stone-50/50"
                                >
                                    <td className="py-3 text-center font-mono text-stone-500">
                                        {index + 1}
                                    </td>
                                    <td className="py-3">
                                        <div className="text-sm font-bold text-stone-900">
                                            {item.product_name}
                                        </div>
                                        <div className="text-[11px] font-medium text-stone-500">
                                            Varian: {item.variant_label}
                                        </div>
                                    </td>
                                    <td className="py-3 text-right font-medium text-stone-700">
                                        Rp {formatRp(item.price)}
                                    </td>
                                    <td className="py-3 text-center font-bold text-stone-900">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 text-right font-bold text-stone-950">
                                        <div>Rp {formatRp(item.subtotal)}</div>
                                        {item.discount_amount &&
                                        item.discount_amount > 0 ? (
                                            <div className="text-[10px] font-semibold text-emerald-700">
                                                Diskon: -Rp{' '}
                                                {formatRp(item.discount_amount)}
                                            </div>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Calculation Summary & Payment Info */}
                <div className="grid grid-cols-1 items-start gap-6 border-t-2 border-stone-200 pt-4 sm:grid-cols-2">
                    {/* Left: Payment details instructions & Official Stamp */}
                    <div className="space-y-4">
                        {(order.bank_info || order.qris_instructions) && (
                            <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs">
                                <span className="block flex items-center gap-1.5 text-[11px] font-black tracking-wide text-stone-900 uppercase">
                                    <Building2 className="h-4 w-4 text-emerald-700" />
                                    <span>
                                        Petunjuk Pembayaran Transfer / QRIS:
                                    </span>
                                </span>
                                {order.bank_info && (
                                    <div className="text-stone-800">
                                        <span className="block text-[10px] text-stone-500">
                                            Rekening Bank:
                                        </span>
                                        <b className="font-mono text-xs text-stone-900">
                                            {order.bank_info}
                                        </b>
                                    </div>
                                )}
                                {order.qris_instructions && (
                                    <div className="text-stone-800">
                                        <span className="block text-[10px] text-stone-500">
                                            Petunjuk QRIS:
                                        </span>
                                        <span className="text-[11px] text-stone-700">
                                            {order.qris_instructions}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Stempel Fisik Sanubari */}
                        <div className="inline-block rotate-[-2deg] rounded-xl border-2 border-stone-700 bg-white px-4 py-2 text-xs font-black tracking-widest text-stone-800 uppercase shadow-2xs select-none">
                            <div className="text-[9px] font-bold tracking-normal">
                                KASIR SANUBARI
                            </div>
                            <div className="my-0.5 text-sm leading-none font-black text-emerald-800">
                                {isPaid ? '★ LUNAS ★' : '★ RESMI (PRE-BILL) ★'}
                            </div>
                            <div className="font-mono text-[8px] tracking-tighter text-stone-500">
                                MALANG · {order.created_at}
                            </div>
                        </div>
                    </div>

                    {/* Right: Totals Box */}
                    <div className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs">
                        <div className="flex justify-between text-stone-600">
                            <span>Subtotal Pesanan:</span>
                            <span className="font-semibold text-stone-800">
                                Rp {formatRp(order.subtotal)}
                            </span>
                        </div>

                        {order.discount_amount > 0 && (
                            <div className="flex justify-between font-semibold text-emerald-700">
                                <span>Potongan Diskon:</span>
                                <span>
                                    -Rp {formatRp(order.discount_amount)}
                                </span>
                            </div>
                        )}

                        <div className="flex items-baseline justify-between border-t-2 border-stone-300 pt-2">
                            <span className="text-sm font-black tracking-wide text-stone-900 uppercase">
                                TOTAL TAGIHAN:
                            </span>
                            <span className="text-2xl font-black text-stone-950">
                                Rp {formatRp(order.total_amount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-8 space-y-1.5 border-t border-stone-200 pt-6 text-center text-[11px] text-stone-500">
                    <p className="font-semibold text-stone-700">
                        Terima kasih telah memesan kopi di Kasir Sanubari!
                        Freshly Roasted with Heart.
                    </p>
                    <p>
                        Dokumen ini adalah bukti faktur digital resmi yang sah
                        yang dicetak secara elektronik oleh sistem Kasir Sanubari.
                    </p>
                </div>
            </div>
        </div>
    );
}
