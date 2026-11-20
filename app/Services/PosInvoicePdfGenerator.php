<?php

namespace App\Services;

class PosInvoicePdfGenerator
{
    private const PAGE_WIDTH = 595.28;
    private const PAGE_HEIGHT = 841.89;

    /**
     * Generate a complete A4 PDF-1.4 binary string for a POS Invoice / Pre-Bill.
     *
     * @param  array<string, mixed>  $data
     */
    public static function generate(array $data): string
    {
        $storeName = strtoupper(trim((string) ($data['store_name'] ?? 'SANUBARI ROASTERY')));
        $tagline = trim((string) ($data['tagline'] ?? 'Close to Your Every Brew'));
        $address = trim((string) ($data['address'] ?? 'Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang'));
        $phone = trim((string) ($data['phone'] ?? '+6285121930454'));
        $date = trim((string) ($data['date'] ?? now()->format('d M Y, H.i')));
        $cashierName = trim((string) ($data['cashier_name'] ?? 'Kasir Sanubari'));
        $customerName = trim((string) ($data['customer_name'] ?? 'Pelanggan Sanubari')) ?: 'Pelanggan Sanubari';
        $customerPhone = trim((string) ($data['customer_phone'] ?? ''));
        $customerAddress = trim((string) ($data['customer_address'] ?? ''));
        $shippingCourier = trim((string) ($data['shipping_courier'] ?? ''));
        $shippingCost = (float) ($data['shipping_cost'] ?? 0);
        $notes = trim((string) ($data['notes'] ?? ''));
        $subtotal = (float) ($data['subtotal'] ?? 0);
        $discountAmount = (float) ($data['discount_amount'] ?? 0);
        $totalAmount = (float) ($data['total_amount'] ?? 0);
        $bankInfo = trim((string) ($data['bank_info'] ?? ''));
        $qrisInstructions = trim((string) ($data['qris_instructions'] ?? ''));
        $items = is_array($data['items'] ?? null) ? $data['items'] : [];

        $isPaid = str_contains(strtolower($notes), 'no. struk:') || ! empty($data['is_paid']);

        $ops = [];
        $marginX = 42.0;
        $contentWidth = self::PAGE_WIDTH - ($marginX * 2); // 511.28
        $rightX = self::PAGE_WIDTH - $marginX; // 553.28

        // White page background
        $ops[] = self::rect(0, 0, self::PAGE_WIDTH, self::PAGE_HEIGHT, [1, 1, 1], null);

        // --- 1. HEADER SECTION ---
        $topY = 42.0;

        // Left: Brand Name, Tagline, Address, Phone
        $ops[] = self::text($marginX, $topY + 16, $storeName, 'F2', 17, [0.067, 0.094, 0.153]);
        $ops[] = self::text($marginX, $topY + 31, $tagline, 'F3', 9.5, [0.294, 0.333, 0.388]);

        $addrLines = self::wrapText($address, 58);
        $addrY = $topY + 46;
        foreach ($addrLines as $aLine) {
            $ops[] = self::text($marginX, $addrY, $aLine, 'F1', 8.5, [0.420, 0.447, 0.502]);
            $addrY += 12;
        }
        $ops[] = self::text($marginX, $addrY, 'Telp/WA: '.$phone, 'F1', 8.5, [0.420, 0.447, 0.502]);

        // Right: Badge "FAKTUR PENJUALAN DIGITAL (A4)"
        $badgeText = 'FAKTUR PENJUALAN DIGITAL (A4)';
        $badgeW = 166.0;
        $badgeH = 18.0;
        $badgeX = $rightX - $badgeW;
        $ops[] = self::rect($badgeX, $topY + 2, $badgeW, $badgeH, [0.925, 0.992, 0.961], [0.655, 0.953, 0.816], 0.8);
        $ops[] = self::textCentered($badgeX, $badgeW, $topY + 14, $badgeText, 'F2', 8.0, [0.024, 0.373, 0.275]);

        // Right: Waktu & Kasir
        $ops[] = self::textRight($rightX, $topY + 34, 'Waktu: '.$date.' WIB', 'F2', 9.5, [0.067, 0.094, 0.153]);
        $ops[] = self::textRight($rightX, $topY + 48, 'Kasir: '.$cashierName, 'F1', 9.0, [0.294, 0.333, 0.388]);

        // Right: Status Pill Badge
        $pillText = $isPaid ? 'LUNAS (PAID)' : 'ESTIMASI (PRE-BILL)';
        $pillW = $isPaid ? 86.0 : 112.0;
        $pillH = 16.0;
        $pillX = $rightX - $pillW;
        if ($isPaid) {
            $ops[] = self::rect($pillX, $topY + 55, $pillW, $pillH, [0.820, 0.980, 0.898], [0.431, 0.906, 0.718], 0.8);
            $ops[] = self::textCentered($pillX, $pillW, $topY + 66, $pillText, 'F2', 8.0, [0.024, 0.373, 0.275]);
        } else {
            $ops[] = self::rect($pillX, $topY + 55, $pillW, $pillH, [0.996, 0.953, 0.780], [0.992, 0.902, 0.541], 0.8);
            $ops[] = self::textCentered($pillX, $pillW, $topY + 66, $pillText, 'F2', 8.0, [0.471, 0.208, 0.059]);
        }

        $headerBottomY = max($addrY + 14, $topY + 82);
        $ops[] = self::line($marginX, $headerBottomY, $rightX, $headerBottomY, [0.067, 0.094, 0.153], 1.8);

        // --- 2. CUSTOMER & DOCUMENT STATUS ---
        $custTopY = $headerBottomY + 18;
        $ops[] = self::text($marginX, $custTopY, 'DITUJUKAN KEPADA:', 'F2', 8.0, [0.612, 0.639, 0.686]);
        $ops[] = self::text($marginX, $custTopY + 15, $customerName, 'F2', 12.5, [0.067, 0.094, 0.153]);

        $custExtraY = $custTopY + 29;
        if ($customerPhone !== '' && $customerPhone !== '-') {
            $ops[] = self::text($marginX, $custExtraY, 'No. WhatsApp: '.$customerPhone, 'F1', 9.0, [0.294, 0.333, 0.388]);
            $custExtraY += 13;
        }
        if ($customerAddress !== '' && $customerAddress !== 'Toko Fisik / POS Kasir') {
            foreach (self::wrapText('Alamat Kirim: '.$customerAddress, 56) as $cl) {
                $ops[] = self::text($marginX, $custExtraY, $cl, 'F1', 8.5, [0.216, 0.255, 0.318]);
                $custExtraY += 12;
            }
        }
        if ($shippingCourier !== '' && $shippingCost > 0) {
            $ops[] = self::text($marginX, $custExtraY, 'Ekspedisi: '.$shippingCourier, 'F1', 8.5, [0.294, 0.333, 0.388]);
            $custExtraY += 12;
        }
        if ($notes !== '') {
            foreach (self::wrapText('Catatan: '.$notes, 60) as $nl) {
                $ops[] = self::text($marginX, $custExtraY, $nl, 'F3', 8.5, [0.420, 0.447, 0.502]);
                $custExtraY += 12;
            }
        }

        // Right Status
        $ops[] = self::textRight($rightX, $custTopY, 'STATUS DOKUMEN:', 'F2', 8.0, [0.612, 0.639, 0.686]);
        $ops[] = self::textRight(
            $rightX,
            $custTopY + 14,
            $isPaid ? 'PEMBAYARAN LUNAS' : 'MENUNGGU PEMBAYARAN',
            'F2',
            9.5,
            $isPaid ? [0.024, 0.373, 0.275] : [0.573, 0.251, 0.055]
        );
        $ops[] = self::textRight($rightX, $custTopY + 27, 'POS Cashier Digital Invoice', 'F1', 8.5, [0.420, 0.447, 0.502]);

        // --- 3. ITEMS TABLE ---
        $tableTopY = max($custExtraY + 12, $custTopY + 46);

        // Columns X coordinates
        $colNoCenter = $marginX + 14;
        $colDescX = $marginX + 34;
        $colPriceRight = $rightX - 155;
        $colQtyCenter = $rightX - 110;
        $colSubRight = $rightX - 4;

        // Table Header Text
        $ops[] = self::textCentered($marginX, 28, $tableTopY, 'NO', 'F2', 8.0, [0.294, 0.333, 0.388]);
        $ops[] = self::text($colDescX, $tableTopY, 'DESKRIPSI PRODUK & VARIAN', 'F2', 8.0, [0.294, 0.333, 0.388]);
        $ops[] = self::textRight($colPriceRight, $tableTopY, 'HARGA', 'F2', 8.0, [0.294, 0.333, 0.388]);
        $ops[] = self::textCentered($colQtyCenter - 20, 40, $tableTopY, 'QTY', 'F2', 8.0, [0.294, 0.333, 0.388]);
        $ops[] = self::textRight($colSubRight, $tableTopY, 'JUMLAH (IDR)', 'F2', 8.0, [0.294, 0.333, 0.388]);

        $rowY = $tableTopY + 8;
        $ops[] = self::line($marginX, $rowY, $rightX, $rowY, [0.820, 0.835, 0.859], 1.3);

        foreach ($items as $idx => $item) {
            if ($rowY > self::PAGE_HEIGHT - 190) {
                break; // Keep single page A4 clean
            }
            $num = (string) ($idx + 1);
            $prodName = trim((string) ($item['product_name'] ?? 'Produk Kopi'));
            $varLabel = trim((string) ($item['variant_label'] ?? 'Standar'));
            $price = (float) ($item['price'] ?? 0);
            $qty = (int) ($item['quantity'] ?? 1);
            $itemSub = (float) ($item['subtotal'] ?? ($price * $qty));

            $ops[] = self::textCentered($marginX, 28, $rowY + 16, $num, 'F4', 9.0, [0.420, 0.447, 0.502]);
            $ops[] = self::text($colDescX, $rowY + 14, self::truncate($prodName, 44), 'F2', 10.0, [0.067, 0.094, 0.153]);
            $ops[] = self::text($colDescX, $rowY + 26, 'Varian: '.self::truncate($varLabel, 48), 'F1', 8.5, [0.420, 0.447, 0.502]);

            $ops[] = self::textRight($colPriceRight, $rowY + 19, 'Rp '.self::formatRp($price), 'F1', 9.5, [0.216, 0.255, 0.318]);
            $ops[] = self::textCentered($colQtyCenter - 20, 40, $rowY + 19, (string) $qty, 'F2', 9.5, [0.067, 0.094, 0.153]);
            $ops[] = self::textRight($colSubRight, $rowY + 19, 'Rp '.self::formatRp($itemSub), 'F2', 9.5, [0.067, 0.094, 0.153]);

            $rowY += 34;
            $ops[] = self::line($marginX, $rowY, $rightX, $rowY, [0.898, 0.906, 0.922], 0.7);
        }

        // --- 4. BOTTOM TWO-COLUMN SECTION (PAYMENT / STAMP & TOTALS) ---
        $bottomTopY = $rowY + 18;
        $leftColW = $contentWidth * 0.55; // ~281pt
        $rightColW = $contentWidth * 0.40; // ~204pt
        $rightColX = $rightX - $rightColW;

        $leftCursorY = $bottomTopY;

        if ($bankInfo !== '' || $qrisInstructions !== '') {
            $bankLines = [];
            if ($bankInfo !== '') {
                foreach (self::wrapText('Rekening Bank: '.$bankInfo, 44) as $bl) {
                    $bankLines[] = $bl;
                }
            }
            if ($qrisInstructions !== '') {
                foreach (self::wrapText('QRIS: '.$qrisInstructions, 44) as $ql) {
                    $bankLines[] = $ql;
                }
            }
            $boxH = 26 + (count($bankLines) * 13);
            $ops[] = self::rect($marginX, $leftCursorY, $leftColW, $boxH, [0.976, 0.980, 0.984], [0.898, 0.906, 0.922], 0.8);
            $ops[] = self::text($marginX + 10, $leftCursorY + 15, 'PETUNJUK PEMBAYARAN TRANSFER / QRIS:', 'F2', 8.5, [0.024, 0.373, 0.275]);
            $bY = $leftCursorY + 29;
            foreach ($bankLines as $bLine) {
                $ops[] = self::text($marginX + 10, $bY, $bLine, 'F1', 8.5, [0.067, 0.094, 0.153]);
                $bY += 13;
            }
            $leftCursorY += $boxH + 14;
        }

        // Official Stamp Box
        $stampW = 148.0;
        $stampH = 44.0;
        $ops[] = self::rect($marginX, $leftCursorY, $stampW, $stampH, [1, 1, 1], [0.122, 0.161, 0.216], 1.4);
        $ops[] = self::textCentered($marginX, $stampW, $leftCursorY + 12, 'SANUBARI ROASTERY', 'F2', 7.0, [0.420, 0.447, 0.502]);
        $ops[] = self::textCentered(
            $marginX,
            $stampW,
            $leftCursorY + 26,
            $isPaid ? '* RESMI (LUNAS) *' : '* RESMI (PRE-BILL) *',
            'F2',
            9.5,
            [0.024, 0.373, 0.275]
        );
        $ops[] = self::textCentered($marginX, $stampW, $leftCursorY + 38, 'MALANG - '.$date, 'F4', 6.8, [0.612, 0.639, 0.686]);

        // Right Totals Box
        $totalsRows = 1; // Subtotal
        if ($discountAmount > 0) {
            $totalsRows++;
        }
        if ($shippingCost > 0) {
            $totalsRows++;
        }
        $totalsBoxH = 46 + ($totalsRows * 16);
        $ops[] = self::rect($rightColX, $bottomTopY, $rightColW, $totalsBoxH, [0.976, 0.980, 0.984], [0.898, 0.906, 0.922], 0.8);

        $tY = $bottomTopY + 18;
        $ops[] = self::text($rightColX + 12, $tY, 'Subtotal:', 'F1', 9.5, [0.294, 0.333, 0.388]);
        $ops[] = self::textRight($rightX - 12, $tY, 'Rp '.self::formatRp($subtotal), 'F2', 9.5, [0.067, 0.094, 0.153]);
        $tY += 16;

        if ($discountAmount > 0) {
            $ops[] = self::text($rightColX + 12, $tY, 'Potongan Diskon:', 'F1', 9.5, [0.016, 0.471, 0.341]);
            $ops[] = self::textRight($rightX - 12, $tY, '-Rp '.self::formatRp($discountAmount), 'F2', 9.5, [0.016, 0.471, 0.341]);
            $tY += 16;
        }

        if ($shippingCost > 0) {
            $shipLabel = 'Ongkos Kirim'.($shippingCourier !== '' ? " ({$shippingCourier})" : '').':';
            $ops[] = self::text($rightColX + 12, $tY, self::truncate($shipLabel, 24), 'F1', 9.5, [0.118, 0.251, 0.686]);
            $ops[] = self::textRight($rightX - 12, $tY, 'Rp '.self::formatRp($shippingCost), 'F2', 9.5, [0.118, 0.251, 0.686]);
            $tY += 16;
        }

        $ops[] = self::line($rightColX + 12, $tY - 4, $rightX - 12, $tY - 4, [0.820, 0.835, 0.859], 1.2);
        $ops[] = self::text($rightColX + 12, $tY + 14, 'TOTAL:', 'F2', 10.5, [0.067, 0.094, 0.153]);
        $ops[] = self::textRight($rightX - 12, $tY + 15, 'Rp '.self::formatRp($totalAmount), 'F2', 14.5, [0.067, 0.094, 0.153]);

        // --- 5. FOOTER ---
        $footerY = max($leftCursorY + $stampH + 34, $bottomTopY + $totalsBoxH + 34);
        $ops[] = self::line($marginX, $footerY, $rightX, $footerY, [0.898, 0.906, 0.922], 0.8);
        $footerMsg = 'Terima kasih telah memesan di Sanubari Roastery! Dokumen ini adalah faktur digital resmi format A4 yang diterbitkan oleh sistem POS Sanubari.';
        $ops[] = self::textCentered($marginX, $contentWidth, $footerY + 16, $footerMsg, 'F1', 8.0, [0.612, 0.639, 0.686]);

        $stream = implode("\n", $ops);

        return self::compilePdfDocument($stream);
    }

    private static function formatRp(float $amount): string
    {
        return number_format(round($amount), 0, ',', '.');
    }

    private static function truncate(string $text, int $max): string
    {
        if (mb_strlen($text) <= $max) {
            return $text;
        }

        return mb_substr($text, 0, $max - 3).'...';
    }

    /**
     * @return array<int, string>
     */
    private static function wrapText(string $text, int $maxChars): array
    {
        $clean = preg_replace('/\s+/', ' ', trim($text)) ?: '';
        if ($clean === '') {
            return [];
        }
        $words = explode(' ', $clean);
        $lines = [];
        $current = '';
        foreach ($words as $word) {
            if ($current === '') {
                $current = $word;
            } elseif (mb_strlen($current.' '.$word) <= $maxChars) {
                $current .= ' '.$word;
            } else {
                $lines[] = $current;
                $current = $word;
            }
        }
        if ($current !== '') {
            $lines[] = $current;
        }

        return $lines;
    }

    private static function escapePdfText(string $text): string
    {
        // Transliterate to ASCII/WinAnsi safe characters
        $clean = str_replace(
            ['•', '★', '—', '–', '“', '”', '‘', '’'],
            ['-', '*', '-', '-', '"', '"', "'", "'"],
            $text
        );
        $clean = preg_replace('/[^\x20-\x7E\xA0-\xFF]/', '', $clean) ?? '';

        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $clean);
    }

    private static function estimateTextWidth(string $text, string $font, float $size): float
    {
        if ($font === 'F4') {
            return strlen($text) * $size * 0.60;
        }
        $factor = ($font === 'F2') ? 0.55 : 0.51;
        $width = 0.0;
        $len = strlen($text);
        for ($i = 0; $i < $len; $i++) {
            $ch = $text[$i];
            if (in_array($ch, ['i', 'l', 'I', '1', '.', ',', ':', ';', '!', '|', ' ', "'", '(', ')'], true)) {
                $width += $size * 0.28;
            } elseif (in_array($ch, ['M', 'W', '@', '%', 'm', 'w'], true)) {
                $width += $size * 0.78;
            } elseif (ctype_upper($ch)) {
                $width += $size * ($factor + 0.09);
            } else {
                $width += $size * $factor;
            }
        }

        return $width;
    }

    /**
     * @param  array{0:float,1:float,2:float}  $rgb
     */
    private static function text(float $x, float $topY, string $text, string $font, float $size, array $rgb): string
    {
        $pdfY = self::PAGE_HEIGHT - $topY;
        $escaped = self::escapePdfText($text);

        return sprintf(
            'BT /%s %.2f Tf %.3f %.3f %.3f rg %.2f %.2f Td (%s) Tj ET',
            $font,
            $size,
            $rgb[0],
            $rgb[1],
            $rgb[2],
            $x,
            $pdfY,
            $escaped
        );
    }

    /**
     * @param  array{0:float,1:float,2:float}  $rgb
     */
    private static function textRight(float $rightX, float $topY, string $text, string $font, float $size, array $rgb): string
    {
        $w = self::estimateTextWidth($text, $font, $size);

        return self::text(max(12.0, $rightX - $w), $topY, $text, $font, $size, $rgb);
    }

    /**
     * @param  array{0:float,1:float,2:float}  $rgb
     */
    private static function textCentered(float $boxX, float $boxW, float $topY, string $text, string $font, float $size, array $rgb): string
    {
        $w = self::estimateTextWidth($text, $font, $size);
        $x = $boxX + max(0.0, ($boxW - $w) / 2.0);

        return self::text($x, $topY, $text, $font, $size, $rgb);
    }

    /**
     * @param  array{0:float,1:float,2:float}|null  $fillRgb
     * @param  array{0:float,1:float,2:float}|null  $strokeRgb
     */
    private static function rect(float $x, float $topY, float $w, float $h, ?array $fillRgb, ?array $strokeRgb, float $lineWidth = 1.0): string
    {
        $pdfY = self::PAGE_HEIGHT - ($topY + $h);
        $cmds = ['q'];
        if ($fillRgb !== null) {
            $cmds[] = sprintf('%.3f %.3f %.3f rg', $fillRgb[0], $fillRgb[1], $fillRgb[2]);
        }
        if ($strokeRgb !== null) {
            $cmds[] = sprintf('%.3f %.3f %.3f RG %.2f w', $strokeRgb[0], $strokeRgb[1], $strokeRgb[2], $lineWidth);
        }
        $op = ($fillRgb !== null && $strokeRgb !== null) ? 'B' : (($fillRgb !== null) ? 'f' : 'S');
        $cmds[] = sprintf('%.2f %.2f %.2f %.2f re %s Q', $x, $pdfY, $w, $h, $op);

        return implode(' ', $cmds);
    }

    /**
     * @param  array{0:float,1:float,2:float}  $rgb
     */
    private static function line(float $x1, float $topY1, float $x2, float $topY2, array $rgb, float $lineWidth = 1.0): string
    {
        $pdfY1 = self::PAGE_HEIGHT - $topY1;
        $pdfY2 = self::PAGE_HEIGHT - $topY2;

        return sprintf(
            'q %.3f %.3f %.3f RG %.2f w %.2f %.2f m %.2f %.2f l S Q',
            $rgb[0],
            $rgb[1],
            $rgb[2],
            $lineWidth,
            $x1,
            $pdfY1,
            $x2,
            $pdfY2
        );
    }

    private static function compilePdfDocument(string $stream): string
    {
        $objects = [];
        $objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
        $objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
        $objects[3] = sprintf(
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.2f %.2f] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R >> >> /Contents 8 0 R >>',
            self::PAGE_WIDTH,
            self::PAGE_HEIGHT
        );
        $objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
        $objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
        $objects[6] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>';
        $objects[7] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>';
        $objects[8] = "<< /Length ".strlen($stream)." >>\nstream\n{$stream}\nendstream";

        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [];

        foreach ($objects as $id => $body) {
            $offsets[$id] = strlen($pdf);
            $pdf .= "{$id} 0 obj\n{$body}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $count = count($objects) + 1;
        $pdf .= "xref\n0 {$count}\n";
        $pdf .= "0000000000 65535 f \n";
        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        $pdf .= "trailer\n<< /Size {$count} /Root 1 0 R >>\n";
        $pdf .= "startxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }
}
