<?php

namespace App\Services;

use Shuchkin\SimpleXLSXGen;

class PosProfitLossExcelService
{
    /**
     * Generate multi-sheet Excel spreadsheet for POS Profit & Loss report.
     */
    public function generate(array $data): SimpleXLSXGen
    {
        $xlsx = new SimpleXLSXGen;

        $summary = (array) ($data['summary'] ?? []);
        $periodTitle = (string) ($data['period_title'] ?? 'Laporan Laba Rugi POS');
        $dailySummary = collect($data['daily_summary'] ?? [])->toArray();
        $expenses = collect($data['expenses'] ?? [])->toArray();
        $topProducts = collect($data['top_margin_products'] ?? [])->toArray();
        $transactions = collect($data['transactions'] ?? [])->toArray();

        // 1. SHEET 1: RINGKASAN LABA RUGI
        $sheetSummary = $this->buildSummarySheet($periodTitle, $summary);
        $xlsx->addSheet($sheetSummary, 'Ringkasan Laba Rugi');

        // 2. SHEET 2: REKAP TRANSAKSI HARIAN (HPP, PENGELUARAN & LABA BERSIH)
        $sheetDaily = $this->buildDailySummarySheet($periodTitle, $dailySummary, $summary);
        $xlsx->addSheet($sheetDaily, 'Rekap Harian');

        // 3. SHEET 3: RINCIAN PENGELUARAN (KAS KELUAR)
        $sheetExpenses = $this->buildExpensesSheet($periodTitle, $expenses, $summary);
        $xlsx->addSheet($sheetExpenses, 'Rincian Pengeluaran');

        // 4. SHEET 4: HPP & KONTRIBUSI LABA PRODUK
        $sheetProducts = $this->buildProductsSheet($periodTitle, $topProducts);
        $xlsx->addSheet($sheetProducts, 'HPP & Laba Produk');

        // 5. SHEET 5: DATA TRANSAKSI SATU PERSATU
        $sheetTransactions = $this->buildTransactionsSheet($periodTitle, $transactions);
        $xlsx->addSheet($sheetTransactions, 'Data Transaksi');

        return $xlsx;
    }

    protected function buildSummarySheet(string $periodTitle, array $summary): array
    {
        $rows = [
            ['<b>SANUBARI ROASTERY — POINT OF SALE (POS)</b>'],
            ['<b>LAPORAN LABA RUGI & ARUS KAS BULANAN</b>'],
            ['Periode:', $periodTitle],
            ['Waktu Cetak:', now()->translatedFormat('d F Y, H:i').' WIB'],
            [''],
            ['<b>RINGKASAN KINERJA KEUANGAN</b>', '<b>NOMINAL (RP)</b>', '<b>PERSENTASE / KETERANGAN</b>'],
            ['Total Transaksi Selesai', (int) ($summary['total_transactions'] ?? 0), 'Pesanan terbayar'],
            ['Total Item Produk Terjual', (int) ($summary['items_sold'] ?? 0), 'Unit'],
            ['Pendapatan Penjualan Kotor (Gross Sales)', (float) ($summary['gross_sales'] ?? 0), 'Total harga jual item sebelum diskon'],
            ['Total Potongan / Diskon Penjualan', (float) ($summary['total_discounts'] ?? 0), 'Diskon nota & item'],
            ['<b>Penjualan Bersih (Net Sales)</b>', (float) ($summary['net_sales'] ?? 0), '100%'],
            ['<b>Total HPP Produk (Biaya Modal Biji Kopi/Item)</b>', (float) ($summary['total_cogs'] ?? 0), 'Harga Pokok Penjualan'],
            ['<b>TOTAL LABA KOTOR (GROSS PROFIT)</b>', (float) ($summary['gross_profit'] ?? 0), 'Margin '.($summary['gross_margin_pct'] ?? 0).'%'],
            ['Total Beban Operasional Toko (Kas Keluar Kasir)', (float) ($summary['total_expenses'] ?? 0), 'Pengeluaran operasional toko'],
            ['Pendapatan Kas Toko Lain-lain', (float) ($summary['other_income'] ?? 0), 'Pemasukan non-penjualan di luar modal awal'],
            ['<b>TOTAL LABA BERSIH (NET PROFIT)</b>', (float) ($summary['net_profit'] ?? 0), 'Net Margin '.($summary['net_margin_pct'] ?? 0).'%'],
            [''],
            ['<b>STATUS KELENGKAPAN HPP PRODUK</b>', '', ''],
            ['Jumlah Item Terjual dengan HPP Terisi', (int) ($summary['items_with_hpp_count'] ?? 0), 'HPP akurat terhitung'],
            ['Jumlah Item Terjual tanpa HPP (HPP Rp 0)', (int) ($summary['items_without_hpp_count'] ?? 0), 'Perlu diset HPP di menu produk'],
        ];

        return $rows;
    }

    protected function buildDailySummarySheet(string $periodTitle, iterable $dailySummary, array $summary): array
    {
        $rows = [
            ['<b>SANUBARI ROASTERY — REKAP TRANSAKSI HARIAN (HPP, PENGELUARAN & LABA BERSIH)</b>'],
            ['Periode:', $periodTitle],
            [''],
            [
                '<b>No</b>',
                '<b>Tanggal</b>',
                '<b>Hari</b>',
                '<b>Total Trx</b>',
                '<b>Item Terjual</b>',
                '<b>Penjualan Bersih (Rp)</b>',
                '<b>Total HPP Produk (Rp)</b>',
                '<b>Laba Kotor (Rp)</b>',
                '<b>Margin Kotor (%)</b>',
                '<b>Pengeluaran Harian (Rp)</b>',
                '<b>Laba Bersih Harian (Rp)</b>',
            ],
        ];

        $totalTrx = 0;
        $totalItems = 0;
        $totalSales = 0.0;
        $totalCogs = 0.0;
        $totalGross = 0.0;
        $totalExp = 0.0;
        $totalNet = 0.0;

        foreach ($dailySummary as $idx => $day) {
            $sales = (float) ($day['net_sales'] ?? 0);
            $cogs = (float) ($day['total_cogs'] ?? 0);
            $gross = (float) ($day['gross_profit'] ?? 0);
            $exp = (float) ($day['total_expenses'] ?? 0);
            $net = (float) ($day['net_profit'] ?? ($gross - $exp));
            $trx = (int) ($day['total_transactions'] ?? 0);
            $items = (int) ($day['items_sold'] ?? 0);

            $totalTrx += $trx;
            $totalItems += $items;
            $totalSales += $sales;
            $totalCogs += $cogs;
            $totalGross += $gross;
            $totalExp += $exp;
            $totalNet += $net;

            $rows[] = [
                $idx + 1,
                $day['date_label'] ?? $day['date'] ?? '-',
                $day['day_name'] ?? '-',
                $trx,
                $items,
                $sales,
                $cogs,
                $gross,
                ($day['margin_pct'] ?? 0).'%',
                $exp,
                $net,
            ];
        }

        // Summary Total Row
        $overallMargin = $totalSales > 0 ? round(($totalGross / $totalSales) * 100, 1) : 0;
        $rows[] = [
            '',
            '<b>TOTAL KESELURUHAN</b>',
            '',
            $totalTrx,
            $totalItems,
            $totalSales,
            $totalCogs,
            $totalGross,
            $overallMargin.'%',
            $totalExp,
            $totalNet,
        ];

        return $rows;
    }

    protected function buildExpensesSheet(string $periodTitle, iterable $expenses, array $summary): array
    {
        $rows = [
            ['<b>SANUBARI ROASTERY — RINCIAN PENGELUARAN KASIR (KAS KELUAR)</b>'],
            ['Periode:', $periodTitle],
            ['Total Pengeluaran Kasir:', (float) ($summary['total_expenses'] ?? 0)],
            [''],
            [
                '<b>No</b>',
                '<b>Tanggal & Waktu</b>',
                '<b>Kategori</b>',
                '<b>Keterangan / Deskripsi Pengeluaran</b>',
                '<b>Pencatat (Kasir)</b>',
                '<b>Nominal Pengeluaran (Rp)</b>',
            ],
        ];

        $totalExp = 0.0;
        foreach ($expenses as $idx => $exp) {
            $amount = (float) ($exp['amount'] ?? 0);
            $totalExp += $amount;

            $rows[] = [
                $idx + 1,
                $exp['date_time'] ?? ($exp['date'].' '.$exp['time']),
                $exp['category_label'] ?? ucfirst((string) $exp['category']),
                $exp['description'] ?? 'Pengeluaran Kas',
                $exp['user_name'] ?? 'Kasir',
                $amount,
            ];
        }

        $rows[] = [
            '',
            '<b>TOTAL PENGELUARAN</b>',
            '',
            '',
            '',
            $totalExp,
        ];

        return $rows;
    }

    protected function buildProductsSheet(string $periodTitle, iterable $products): array
    {
        $rows = [
            ['<b>SANUBARI ROASTERY — KONTRIBUSI LABA PRODUK & HPP</b>'],
            ['Periode:', $periodTitle],
            [''],
            [
                '<b>No</b>',
                '<b>Nama Produk</b>',
                '<b>Varian</b>',
                '<b>Qty Terjual</b>',
                '<b>Harga Satuan (Rp)</b>',
                '<b>HPP Modal Satuan (Rp)</b>',
                '<b>Total Penjualan (Rp)</b>',
                '<b>Total HPP Modal (Rp)</b>',
                '<b>Kontribusi Laba Kotor (Rp)</b>',
                '<b>Status HPP</b>',
            ],
        ];

        $totalQty = 0;
        $totalRev = 0.0;
        $totalCost = 0.0;
        $totalProfit = 0.0;

        foreach ($products as $idx => $prod) {
            $qty = (int) ($prod['quantity'] ?? 0);
            $rev = (float) ($prod['total_revenue'] ?? 0);
            $cost = (float) ($prod['total_cost'] ?? 0);
            $profit = (float) ($prod['gross_profit'] ?? 0);

            $totalQty += $qty;
            $totalRev += $rev;
            $totalCost += $cost;
            $totalProfit += $profit;

            $rows[] = [
                $idx + 1,
                $prod['product_name'] ?? '-',
                $prod['variant_label'] ?? 'Standar',
                $qty,
                (float) ($prod['unit_price'] ?? 0),
                (float) ($prod['unit_cost'] ?? 0),
                $rev,
                $cost,
                $profit,
                ! empty($prod['has_hpp']) ? 'Lengkap' : 'HPP Rp 0 (Belum Diatur)',
            ];
        }

        $rows[] = [
            '',
            '<b>TOTAL KONTRIBUSI PRODUK</b>',
            '',
            $totalQty,
            '',
            '',
            $totalRev,
            $totalCost,
            $totalProfit,
            '',
        ];

        return $rows;
    }

    protected function buildTransactionsSheet(string $periodTitle, iterable $transactions): array
    {
        $rows = [
            ['<b>SANUBARI ROASTERY — DATA TRANSAKSI PESANAN SATU PER SATU</b>'],
            ['Periode:', $periodTitle],
            [''],
            [
                '<b>No</b>',
                '<b>No. Pesanan</b>',
                '<b>Tanggal & Waktu</b>',
                '<b>Nama Pelanggan</b>',
                '<b>Metode Bayar</b>',
                '<b>Total Item</b>',
                '<b>Penjualan Bersih (Rp)</b>',
                '<b>Total HPP Modal (Rp)</b>',
                '<b>Laba Kotor (Rp)</b>',
                '<b>Margin (%)</b>',
            ],
        ];

        $totalSales = 0.0;
        $totalCogs = 0.0;
        $totalProfit = 0.0;
        $totalItems = 0;

        foreach ($transactions as $idx => $trx) {
            $sales = (float) ($trx['net_sales'] ?? 0);
            $cogs = (float) ($trx['total_cogs'] ?? 0);
            $profit = (float) ($trx['gross_profit'] ?? 0);
            $items = (int) ($trx['items_count'] ?? 0);

            $totalSales += $sales;
            $totalCogs += $cogs;
            $totalProfit += $profit;
            $totalItems += $items;

            $rows[] = [
                $idx + 1,
                $trx['order_number'] ?? '-',
                $trx['created_at_formatted'] ?? ($trx['created_date'].' '.$trx['created_time']),
                $trx['customer_name'] ?? 'Pelanggan Kasir',
                $trx['payment_method_label'] ?? $trx['payment_method'] ?? 'Cash',
                $items,
                $sales,
                $cogs,
                $profit,
                ($trx['margin_pct'] ?? 0).'%',
            ];
        }

        $rows[] = [
            '',
            '<b>TOTAL TRANSAKSI</b>',
            '',
            '',
            '',
            $totalItems,
            $totalSales,
            $totalCogs,
            $totalProfit,
            '',
        ];

        return $rows;
    }
}
