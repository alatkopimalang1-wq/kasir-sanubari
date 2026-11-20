import React from 'react';
import {
    ReceiptData,
    PaperWidth,
    formatRp,
    generateWhatsAppReceiptUrl,
    generatePlainTextReceipt,
} from '@/lib/thermal-printer';
import {
    Printer,
    Smartphone,
    Share2,
    X,
    RotateCcw,
    Sparkles,
    FileText,
    Eye,
} from 'lucide-react';

interface ThermalReceiptPreviewProps {
    receipt: ReceiptData;
    paperWidth?: PaperWidth;
    customPaperWidthMm?: number;
    receiptColumns?: number;
    showLogo?: boolean;
    showActions?: boolean;
    onPrintWeb?: () => void;
    onPrintBluetooth?: () => void;
    onClose?: () => void;
    className?: string;
    showCloseButton?: boolean;
    fontFamily?: 'monospace' | 'courier' | 'sans-serif' | 'consolas' | 'roboto-mono' | string;
    fontSize?: 'compact' | 'normal' | 'large' | string;
    fontWeight?: 'normal' | 'bold' | string;
}

export const ThermalReceiptPreview: React.FC<ThermalReceiptPreviewProps> = ({
    receipt,
    paperWidth = '58mm',
    customPaperWidthMm,
    receiptColumns,
    showLogo = true,
    showActions = false,
    onPrintWeb,
    onPrintBluetooth,
    onClose,
    className = '',
    showCloseButton = false,
    fontFamily = 'monospace',
    fontSize = 'normal',
    fontWeight = 'normal',
}) => {
    const is80mm = paperWidth === '80mm';
    const isCustom = paperWidth === 'custom';
    const customWidth = Number(customPaperWidthMm) || 58;
    const isWide = is80mm || (isCustom && customWidth >= 75);
    const resolvedColumns = Number(receiptColumns) || (isWide ? 44 : 32);
    const [previewMode, setPreviewMode] = React.useState<'visual' | 'escpos'>('visual');

    const resolvedFontFamily =
        fontFamily === 'courier'
            ? "'Courier New', Courier, monospace"
            : fontFamily === 'sans-serif'
            ? "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            : fontFamily === 'consolas'
            ? "'Consolas', 'Lucida Console', monospace"
            : fontFamily === 'roboto-mono'
            ? "'Roboto Mono', monospace"
            : "'Courier New', Courier, monospace, -apple-system";

    const resolvedFontSizeClass =
        fontSize === 'compact'
            ? isWide
                ? 'text-[11px] leading-tight'
                : 'text-[9.5px] leading-tight'
            : fontSize === 'large'
            ? isWide
                ? 'text-sm leading-normal'
                : 'text-xs leading-normal'
            : isWide
            ? 'text-xs leading-normal'
            : 'text-[11px] leading-tight';

    const resolvedFontWeightClass = fontWeight === 'bold' ? 'font-bold' : 'font-normal';

    const rawReceiptText = React.useMemo(() => {
        return generatePlainTextReceipt(receipt, {
            paper_width: paperWidth,
            custom_paper_width_mm: customWidth,
            receipt_columns: resolvedColumns,
            font_family: fontFamily,
            font_size: fontSize,
            font_weight: fontWeight,
            show_logo: showLogo,
        });
    }, [receipt, paperWidth, customWidth, resolvedColumns, fontFamily, fontSize, fontWeight, showLogo]);

    const columnRuler = React.useMemo(() => {
        let ruler = '';
        for (let i = 1; i <= resolvedColumns; i++) {
            if (i % 10 === 0) {
                ruler += Math.floor(i / 10).toString();
            } else if (i % 5 === 0) {
                ruler += '+';
            } else {
                ruler += '·';
            }
        }
        return ruler;
    }, [resolvedColumns]);

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* Action Bar (if enabled) */}
            {showActions && (
                <div className="mb-3 flex w-full max-w-sm flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 dark:border-stone-700">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Pratinjau Struk ({paperWidth} • {resolvedColumns} Kolom)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {onPrintWeb && (
                            <button
                                type="button"
                                onClick={onPrintWeb}
                                className="flex cursor-pointer items-center gap-1 rounded-lg bg-brand-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition hover:bg-brand-800 active:scale-95"
                                title="Kirim ke printer thermal fisik"
                            >
                                <Printer className="h-3.5 w-3.5" />
                                <span>Cetak Fisik</span>
                            </button>
                        )}
                        {showCloseButton && onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
                                title="Tutup preview"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Mode Switcher: Desain Grafis vs Teks Cetak Asli ESC/POS */}
            <div className="mb-2.5 flex items-center justify-center rounded-lg bg-stone-100 p-1 text-[11px] font-semibold dark:bg-stone-800">
                <button
                    type="button"
                    onClick={() => setPreviewMode('visual')}
                    className={`flex items-center gap-1 cursor-pointer rounded-md px-2.5 py-1 transition ${
                        previewMode === 'visual'
                            ? 'bg-white text-stone-900 shadow-2xs font-bold dark:bg-stone-700 dark:text-white'
                            : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                >
                    <Eye className="h-3 w-3" />
                    <span>Desain Grafis</span>
                </button>
                <button
                    type="button"
                    onClick={() => setPreviewMode('escpos')}
                    className={`flex items-center gap-1 cursor-pointer rounded-md px-2.5 py-1 transition ${
                        previewMode === 'escpos'
                            ? 'bg-white text-stone-900 shadow-2xs font-bold dark:bg-stone-700 dark:text-white'
                            : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                    title="Simulasi output teks fisik ESC/POS"
                >
                    <FileText className="h-3 w-3" />
                    <span>Teks Cetak Asli ({resolvedColumns} Kolom)</span>
                </button>
            </div>

            {/* Thermal Paper Container */}
            <div
                className={`relative mx-auto rounded-xs bg-[#fffdfa] text-stone-900 shadow-lg ring-1 ring-stone-900/10 transition-all duration-150 ${resolvedFontWeightClass} ${resolvedFontSizeClass} ${
                    is80mm
                        ? 'w-full max-w-[340px] px-4 py-5'
                        : isCustom
                          ? customWidth >= 80
                            ? 'w-full max-w-[340px] px-4 py-5'
                            : customWidth >= 70
                              ? 'w-full max-w-[310px] px-3.5 py-4.5'
                              : 'w-full max-w-[275px] px-3 py-4'
                          : 'w-full max-w-[275px] px-3 py-4'
                }`}
                style={{
                    fontFamily: resolvedFontFamily,
                    filter: 'drop-shadow(0 4px 6px -1px rgba(0, 0, 0, 0.1)) drop-shadow(0 2px 4px -2px rgba(0, 0, 0, 0.06))',
                }}
            >
                {previewMode === 'escpos' ? (
                    <div>
                        {/* Paper Roll Top Perforation Indicator */}
                        <div className="mb-2 flex items-center justify-center gap-1 border-b border-dashed border-stone-300 pb-1.5 text-[9px] uppercase tracking-wider text-stone-400 select-none">
                            <span>- - CETAK ASLI THERMAL ({paperWidth} • {resolvedColumns} KOLOM) - -</span>
                        </div>

                        {/* Column Ruler */}
                        <div className="mb-2.5 rounded bg-stone-100/90 px-1.5 py-1 text-[8.5px] font-mono text-stone-600 select-none border border-stone-200 dark:bg-stone-800/80 dark:border-stone-700 dark:text-stone-300">
                            <div className="flex justify-between text-[8px] text-stone-400 pb-0.5">
                                <span>KOLOM 1</span>
                                <span>LEBAR: {resolvedColumns} KARAKTER</span>
                            </div>
                            <div className="overflow-x-auto whitespace-pre tracking-tighter text-stone-500 font-mono select-none">
                                {columnRuler}
                            </div>
                        </div>

                        {/* Raw Monospace Text as printed by ESC/POS / printer head */}
                        <pre className="whitespace-pre overflow-x-auto font-mono text-[10px] leading-[1.28] text-stone-900 selection:bg-brand-100 dark:text-stone-900">
                            {rawReceiptText}
                        </pre>

                        {/* Bottom Cut Line */}
                        <div className="mt-4 border-t border-dashed border-stone-300 pt-1 text-center text-[8px] uppercase tracking-wider text-stone-400 select-none">
                            - - - - - POTONG DI SINI - - - - -
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Paper Roll Top Perforation Indicator */}
                        <div className="mb-3 flex items-center justify-center gap-1 border-b border-dashed border-stone-300 pb-2 text-[9px] uppercase tracking-wider text-stone-400 select-none">
                            <span>- - - - - KERTAS THERMAL ({paperWidth} • {resolvedColumns} KOLOM) - - - - -</span>
                        </div>

                {/* Header Section */}
                <div className="space-y-1 text-center">
                    {showLogo && (
                        <div className="flex justify-center pb-1">
                            <img
                                src="/brand/logo-circle.png"
                                alt="Logo"
                                className="h-9 w-9 object-contain"
                                onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                    <h2 className="text-xs font-black tracking-wider text-stone-900 uppercase">
                        {receipt.store_name || 'SANUBARI ROASTERY'}
                    </h2>
                    {receipt.tagline && (
                        <p className="text-[10px] text-stone-600 italic">
                            {receipt.tagline}
                        </p>
                    )}
                    {receipt.address && (
                        <p className="text-[9px] text-stone-600">
                            {receipt.address}
                        </p>
                    )}
                    {receipt.phone && (
                        <p className="text-[9px] text-stone-600">
                            WA: {receipt.phone}
                        </p>
                    )}
                </div>

                {/* Double dashed separator */}
                <div className="my-2 border-b-2 border-dashed border-stone-400" />

                {/* Refund Notice (if refund receipt) */}
                {receipt.is_refund && (
                    <div className="mb-2 rounded border border-dashed border-rose-400 bg-rose-50/60 p-2 text-center text-rose-900">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase">
                            <RotateCcw className="h-3 w-3 stroke-[2.5]" />
                            <span>BUKTI REFUND / RETUR</span>
                        </div>
                        <div className="mt-0.5 text-[9px] text-rose-800">
                            Alasan: {receipt.refund_reason || 'Pengembalian Dana Kasir'}
                        </div>
                        <div className="mt-0.5 text-[10px] font-bold text-rose-900">
                            Dana Kembali: Rp {formatRp(receipt.refund_amount || receipt.total_amount)}
                        </div>
                        {receipt.refunded_by_name && (
                            <div className="mt-0.5 text-[8px] text-stone-500">
                                Kasir Refund: {receipt.refunded_by_name}
                            </div>
                        )}
                        <div className="mt-1 border-b border-dashed border-rose-300" />
                    </div>
                )}

                {/* Order Meta Info */}
                <div className="space-y-0.5 text-[10px] text-stone-800">
                    <div className="flex justify-between">
                        <span>No: #{receipt.order_number}</span>
                        <span>{receipt.date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kasir: {receipt.cashier_name}</span>
                        {receipt.customer_name &&
                            receipt.customer_name !== 'Pelanggan Kasir' && (
                                <span className="max-w-[130px] truncate text-right">
                                    Plg: {receipt.customer_name}
                                </span>
                            )}
                    </div>
                    {receipt.customer_address &&
                        receipt.customer_address !== 'Toko Fisik / POS Kasir' && (
                            <div className="text-[9px] text-stone-600">
                                Alamat: {receipt.customer_address}
                            </div>
                        )}
                </div>

                {/* Dashed separator */}
                <div className="my-2 border-b border-dashed border-stone-300" />

                {/* Items List */}
                <div className="space-y-2">
                    {receipt.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                            <div className="font-semibold text-stone-900">
                                {item.product_name}
                                {item.variant_label
                                    ? ` (${item.variant_label})`
                                    : ''}
                            </div>
                            <div className="flex justify-between pl-2 text-stone-700">
                                <span>
                                    {item.quantity} x Rp {formatRp(item.price)}
                                </span>
                                <span className="font-bold text-stone-900">
                                    Rp {formatRp(item.subtotal)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dashed separator */}
                <div className="my-2 border-b border-dashed border-stone-300" />

                {/* Totals Section */}
                <div className="space-y-1">
                    <div className="flex justify-between text-stone-800">
                        <span>Subtotal</span>
                        <span>Rp {formatRp(receipt.subtotal)}</span>
                    </div>

                    {receipt.discount_amount > 0 && (
                        <div className="flex justify-between font-bold text-emerald-800">
                            <span>Diskon</span>
                            <span>-Rp {formatRp(receipt.discount_amount)}</span>
                        </div>
                    )}

                    {receipt.shipping_cost && receipt.shipping_cost > 0 && (
                        <div className="flex justify-between text-blue-800">
                            <span>
                                Ongkir
                                {receipt.shipping_courier
                                    ? ` (${receipt.shipping_courier})`
                                    : ''}
                            </span>
                            <span>Rp {formatRp(receipt.shipping_cost)}</span>
                        </div>
                    )}

                    <div className="flex justify-between border-t border-dashed border-stone-300 pt-1 text-xs font-black text-stone-950">
                        <span>TOTAL</span>
                        <span className="text-sm font-black">
                            Rp {formatRp(receipt.total_amount)}
                        </span>
                    </div>

                    <div className="flex justify-between pt-0.5 text-[10px] text-stone-700">
                        <span>Metode Bayar</span>
                        <span className="font-semibold uppercase">
                            {receipt.payment_method_label}
                        </span>
                    </div>

                    {receipt.cash_tendered && receipt.cash_tendered > 0 && (
                        <>
                            <div className="flex justify-between text-[10px] text-stone-700">
                                <span>Bayar Tunai</span>
                                <span>
                                    Rp {formatRp(receipt.cash_tendered)}
                                </span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-stone-900">
                                <span>Kembalian</span>
                                <span>
                                    Rp {formatRp(receipt.cash_change || 0)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Double dashed separator */}
                <div className="my-2.5 border-b-2 border-dashed border-stone-400" />

                {/* Footer Section */}
                <div className="space-y-1 text-center text-[9px] text-stone-600">
                    <div className="whitespace-pre-line">
                        {receipt.footer_note ||
                            'Terima kasih atas kunjungannya!\nFreshly Roasted with Heart.'}
                    </div>
                    {receipt.instagram && (
                        <div className="font-semibold text-stone-700">
                            IG: {receipt.instagram}
                        </div>
                    )}
                </div>

                {/* Bottom Paper Perforation / Cut line */}
                <div className="mt-4 border-t border-dashed border-stone-300 pt-1 text-center text-[8px] uppercase tracking-wider text-stone-400 select-none">
                    - - - - - POTONG DI SINI - - - - -
                </div>
            </>
        )}
    </div>

            {/* Bottom Actions if in Modal */}
            {showActions && (
                <div className="mt-4 flex w-full max-w-sm flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                        {onPrintWeb && (
                            <button
                                type="button"
                                onClick={onPrintWeb}
                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-3 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-800 active:scale-95"
                            >
                                <Printer className="h-4 w-4" />
                                <span>Cetak USB</span>
                            </button>
                        )}
                        {onPrintBluetooth && (
                            <button
                                type="button"
                                onClick={onPrintBluetooth}
                                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-xs font-bold text-stone-800 shadow-2xs transition hover:bg-stone-50 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                            >
                                <Smartphone className="h-4 w-4 text-brand-700 dark:text-amber-400" />
                                <span>Bluetooth</span>
                            </button>
                        )}
                    </div>

                    <a
                        href={generateWhatsAppReceiptUrl(
                            receipt,
                            receipt.customer_phone,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Kirim Struk via WhatsApp</span>
                    </a>
                </div>
            )}
        </div>
    );
};
