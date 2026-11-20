<x-filament-panels::page>
    @php
        $report = $this->reportData;
        $summary = $report['summary'];
        $dailySummary = $report['daily_summary'];
        $monthlySummary = $report['monthly_summary'];
        $transactions = $report['transactions'];
        $topProducts = $report['top_products'];

        // Filter transactions by search query
        $filteredTransactions = $transactions;
        if (!empty($this->searchTransaction)) {
            $q = strtolower($this->searchTransaction);
            $filteredTransactions = array_filter($transactions, function ($trx) use ($q) {
                return str_contains(strtolower($trx['order_number']), $q)
                    || str_contains(strtolower($trx['customer_name']), $q)
                    || str_contains(strtolower($trx['customer_phone'] ?? ''), $q)
                    || str_contains(strtolower($trx['payment_method_label'] ?? ''), $q);
            });
        }
    @endphp

    <div class="space-y-6">
        {{-- ========================================================================= --}}
        {{-- 1. HEADER INFO & BADGES                                                   --}}
        {{-- ========================================================================= --}}
        <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white shadow-lg border border-emerald-700/40">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1">
                    <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Khusus Penjualan Toko Online / Website Saja
                    </div>
                    <h2 class="text-2xl font-black tracking-tight text-white">
                        Laporan Laba Rugi Penjualan Website
                    </h2>
                    <p class="text-xs md:text-sm text-emerald-100/80">
                        Kalkulasi real-time omset penjualan bersih, HPP biji kopi/produk, dan laba kotor murni pesanan website Sanubari Roastery.
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <span class="px-3 py-1.5 rounded-xl bg-black/40 text-emerald-200 text-xs font-mono border border-emerald-500/30">
                        {{ \Carbon\Carbon::parse($report['start_date'])->translatedFormat('d M Y') }} — {{ \Carbon\Carbon::parse($report['end_date'])->translatedFormat('d M Y') }}
                    </span>
                    @if ($summary['is_profitable'])
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/30 text-emerald-200 text-xs font-bold border border-emerald-400/50">
                            <svg class="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            Profit Positif
                        </span>
                    @else
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/30 text-rose-200 text-xs font-bold border border-rose-400/50">
                            Defisit
                        </span>
                    @endif
                </div>
            </div>
        </div>

        {{-- ========================================================================= --}}
        {{-- 2. FILTER PERIODE WAKTU                                                   --}}
        {{-- ========================================================================= --}}
        <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Pilih Periode Penjualan:
                </span>
                <div class="inline-flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-medium">
                    <button
                        type="button"
                        wire:click="setPeriod('today')"
                        class="px-3 py-1.5 rounded-lg transition {{ $period === 'today' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Hari Ini
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('yesterday')"
                        class="px-3 py-1.5 rounded-lg transition {{ $period === 'yesterday' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Kemarin
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('this_month')"
                        class="px-3 py-1.5 rounded-lg transition {{ $period === 'this_month' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Bulan Ini
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('last_month')"
                        class="px-3 py-1.5 rounded-lg transition {{ $period === 'last_month' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Bulan Lalu
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('custom_month')"
                        class="px-3 py-1.5 rounded-lg transition {{ $period === 'custom_month' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Pilih Bulan
                    </button>
                    <button
                        type="button"
                        wire:click="setPeriod('custom_range')"
                        class="px-3 py-1.5 rounded-lg transition {{ $period === 'custom_range' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                    >
                        Rentang Tanggal
                    </button>
                </div>
            </div>

            {{-- Custom Month Input --}}
            @if ($period === 'custom_month')
                <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 text-xs">
                    <label class="font-semibold text-gray-700 dark:text-gray-300">Pilih Bulan & Tahun:</label>
                    <input
                        type="month"
                        wire:model.live="selectedMonth"
                        class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                    />
                    <span class="text-gray-500">
                        Menampilkan bulan {{ \Carbon\Carbon::parse(($selectedMonth ?: now()->format('Y-m')) . '-01')->translatedFormat('F Y') }}
                    </span>
                </div>
            @endif

            {{-- Custom Date Range Input --}}
            @if ($period === 'custom_range')
                <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3 text-xs">
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700 dark:text-gray-300">Mulai:</label>
                        <input
                            type="date"
                            wire:model.live="startDate"
                            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                        />
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700 dark:text-gray-300">Sampai:</label>
                        <input
                            type="date"
                            wire:model.live="endDate"
                            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                        />
                    </div>
                </div>
            @endif
        </div>

        {{-- ========================================================================= --}}
        {{-- 3. 4 KPI UTAMA LAPORAN LABA RUGI                                           --}}
        {{-- ========================================================================= --}}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {{-- Omset Penjualan Bersih --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div class="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    <span>1. Penjualan Bersih (Omset)</span>
                    <span class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                </div>
                <div class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    Rp {{ number_format($summary['net_sales'], 0, ',', '.') }}
                </div>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span>Nilai Kotor: Rp {{ number_format($summary['gross_sales'], 0, ',', '.') }}</span>
                    @if ($summary['total_discounts'] > 0)
                        <span class="text-amber-600 font-semibold">-Rp {{ number_format($summary['total_discounts'], 0, ',', '.') }}</span>
                    @endif
                </div>
            </div>

            {{-- Total HPP Modal (COGS) --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div class="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    <span>2. Total HPP Modal (COGS)</span>
                    <span class="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </span>
                </div>
                <div class="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                    Rp {{ number_format($summary['total_cogs'], 0, ',', '.') }}
                </div>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span>{{ $summary['items_with_hpp_count'] }} item terdata HPP</span>
                    @if ($summary['items_without_hpp_count'] > 0)
                        <span class="text-rose-500 font-medium">{{ $summary['items_without_hpp_count'] }} belum set HPP</span>
                    @endif
                </div>
            </div>

            {{-- Laba Kotor (Gross Profit) --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div class="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    <span>3. Laba Kotor (Gross Profit)</span>
                    <span class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </span>
                </div>
                <div class="text-2xl font-black {{ $summary['gross_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600' }} tracking-tight">
                    Rp {{ number_format($summary['gross_profit'], 0, ',', '.') }}
                </div>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Omset dikurangi HPP modal produk
                </div>
            </div>

            {{-- Margin Keuntungan (%) --}}
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div class="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    <span>4. Margin Laba (%)</span>
                    <span class="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </span>
                </div>
                <div class="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                    {{ number_format($summary['gross_margin_pct'], 1, ',', '.') }}%
                </div>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    @if ($summary['gross_margin_pct'] >= 40)
                        <span class="text-emerald-600 font-bold">Margin Sangat Sehat (≥ 40%)</span>
                    @elseif ($summary['gross_margin_pct'] >= 20)
                        <span class="text-blue-600 font-bold">Margin Sehat (20 - 40%)</span>
                    @else
                        <span class="text-amber-600 font-bold">Perlu Optimalisasi</span>
                    @endif
                </div>
            </div>
        </div>

        {{-- ========================================================================= --}}
        {{-- 4. INFORMASI OPERASIONAL PENJUALAN WEBSITE                                --}}
        {{-- ========================================================================= --}}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    📦
                </div>
                <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Total Pesanan Website</div>
                    <div class="text-lg font-black text-gray-900 dark:text-white">{{ $summary['total_transactions'] }} Pesanan</div>
                </div>
            </div>
            <div class="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                    ☕
                </div>
                <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Total Item Terjual</div>
                    <div class="text-lg font-black text-gray-900 dark:text-white">{{ $summary['items_sold'] }} Pcs / Pack Biji Kopi</div>
                </div>
            </div>
            <div class="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                    💳
                </div>
                <div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Rata-rata Nilai Pesanan (AOV)</div>
                    <div class="text-lg font-black text-gray-900 dark:text-white">
                        Rp {{ number_format($summary['total_transactions'] > 0 ? $summary['net_sales'] / $summary['total_transactions'] : 0, 0, ',', '.') }}
                    </div>
                </div>
            </div>
        </div>

        {{-- ========================================================================= --}}
        {{-- 5. TAB NAVIGASI RINCIAN                                                   --}}
        {{-- ========================================================================= --}}
        <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
            <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
                <button
                    type="button"
                    wire:click="setActiveTab('ringkasan')"
                    class="px-4 py-2 rounded-xl text-xs font-bold transition {{ $activeViewTab === 'ringkasan' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
                >
                    Ringkasan & Produk Terlaris
                </button>
                <button
                    type="button"
                    wire:click="setActiveTab('pesanan')"
                    class="px-4 py-2 rounded-xl text-xs font-bold transition {{ $activeViewTab === 'pesanan' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
                >
                    Rincian Pesanan Masuk ({{ count($transactions) }})
                </button>
                <button
                    type="button"
                    wire:click="setActiveTab('bulanan')"
                    class="px-4 py-2 rounded-xl text-xs font-bold transition {{ $activeViewTab === 'bulanan' ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800' }}"
                >
                    Rekap Harian & Bulanan
                </button>
            </div>

            {{-- ----------------------------------------------------------------- --}}
            {{-- TAB 1: RINGKASAN & TOP PRODUK WEBSITE                             --}}
            {{-- ----------------------------------------------------------------- --}}
            @if ($activeViewTab === 'ringkasan')
                <div class="space-y-6">
                    <div>
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                            Produk Biji Kopi Terlaris & Paling Menguntungkan di Website
                        </h3>
                        @if (empty($topProducts))
                            <div class="p-6 text-center text-xs text-gray-500 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                Belum ada data penjualan produk website pada periode ini.
                            </div>
                        @else
                            <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                                <table class="w-full text-left text-xs">
                                    <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-bold text-[11px]">
                                        <tr>
                                            <th class="py-3 px-4">Nama Produk & Varian</th>
                                            <th class="py-3 px-4 text-center">Qty Terjual</th>
                                            <th class="py-3 px-4 text-right">Omset (Penjualan)</th>
                                            <th class="py-3 px-4 text-right">Total HPP Modal</th>
                                            <th class="py-3 px-4 text-right">Laba Kotor</th>
                                            <th class="py-3 px-4 text-center">Status HPP</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                        @foreach ($topProducts as $prod)
                                            <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                                <td class="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                    {{ $prod['product_name'] }}
                                                    <span class="block text-[11px] text-gray-500 font-normal">{{ $prod['variant_label'] }}</span>
                                                </td>
                                                <td class="py-3 px-4 text-center font-bold text-gray-700 dark:text-gray-300">
                                                    {{ $prod['quantity'] }} pcs
                                                </td>
                                                <td class="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                                                    Rp {{ number_format($prod['revenue'], 0, ',', '.') }}
                                                </td>
                                                <td class="py-3 px-4 text-right font-medium text-amber-600 dark:text-amber-400">
                                                    Rp {{ number_format($prod['cost'], 0, ',', '.') }}
                                                </td>
                                                <td class="py-3 px-4 text-right font-bold {{ $prod['profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600' }}">
                                                    Rp {{ number_format($prod['profit'], 0, ',', '.') }}
                                                </td>
                                                <td class="py-3 px-4 text-center">
                                                    @if ($prod['has_hpp'])
                                                        <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                            Terhitung
                                                        </span>
                                                    @else
                                                        <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                            Belum ada HPP
                                                        </span>
                                                    @endif
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        @endif
                    </div>
                </div>
            @endif

            {{-- ----------------------------------------------------------------- --}}
            {{-- TAB 2: RINCIAN PESANAN MASUK (WEBSITE)                            --}}
            {{-- ----------------------------------------------------------------- --}}
            @if ($activeViewTab === 'pesanan')
                <div class="space-y-4">
                    <div class="flex items-center justify-between gap-4">
                        <input
                            type="text"
                            wire:model.live.debounce.300ms="searchTransaction"
                            placeholder="Cari nomor pesanan, nama pembeli, atau metode pembayaran..."
                            class="w-full sm:max-w-md px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                        />
                        <span class="text-xs text-gray-500 whitespace-nowrap">
                            Menampilkan {{ count($filteredTransactions) }} pesanan
                        </span>
                    </div>

                    @if (empty($filteredTransactions))
                        <div class="p-8 text-center text-xs text-gray-500 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            Tidak ditemukan transaksi pesanan website pada filter ini.
                        </div>
                    @else
                        <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-bold text-[11px]">
                                    <tr>
                                        <th class="py-3 px-4">No. Pesanan & Waktu</th>
                                        <th class="py-3 px-4">Customer</th>
                                        <th class="py-3 px-4">Rincian Item Biji Kopi (HPP Modal)</th>
                                        <th class="py-3 px-4">Metode Bayar</th>
                                        <th class="py-3 px-4 text-right">Nilai Pesanan</th>
                                        <th class="py-3 px-4 text-right">Total HPP</th>
                                        <th class="py-3 px-4 text-right">Laba Kotor</th>
                                        <th class="py-3 px-4 text-center">Margin</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                    @foreach ($filteredTransactions as $trx)
                                        <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                            <td class="py-3 px-4">
                                                <a href="/admin/orders/{{ $trx['id'] }}" class="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                                                    {{ $trx['order_number'] }}
                                                </a>
                                                <div class="text-[11px] text-gray-500 font-mono">{{ $trx['created_at_formatted'] }}</div>
                                            </td>
                                            <td class="py-3 px-4">
                                                <div class="font-semibold text-gray-900 dark:text-white">{{ $trx['customer_name'] }}</div>
                                                @if (!empty($trx['customer_phone']))
                                                    <div class="text-[11px] text-gray-500">{{ $trx['customer_phone'] }}</div>
                                                @endif
                                            </td>
                                            <td class="py-3 px-4">
                                                <div class="space-y-1">
                                                    @foreach ($trx['items'] as $item)
                                                        <div class="text-[11px] text-gray-800 dark:text-gray-200">
                                                            <span class="font-bold text-gray-900 dark:text-white">{{ $item['quantity'] }}x</span>
                                                            {{ $item['product_name'] }}
                                                            <span class="text-gray-500">({{ $item['variant_label'] }})</span>
                                                            @if ($item['unit_cost'] > 0)
                                                                <span class="text-amber-600 dark:text-amber-400 font-mono text-[10px] ml-1">
                                                                    [HPP: Rp {{ number_format($item['unit_cost'], 0, ',', '.') }}]
                                                                </span>
                                                            @endif
                                                        </div>
                                                    @endforeach
                                                </div>
                                            </td>
                                            <td class="py-3 px-4">
                                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase">
                                                    {{ $trx['payment_method_label'] ?: $trx['payment_method'] }}
                                                </span>
                                            </td>
                                            <td class="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                                                Rp {{ number_format($trx['net_sales'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-right font-medium text-amber-600 dark:text-amber-400">
                                                Rp {{ number_format($trx['total_cogs'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-right font-bold {{ $trx['gross_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600' }}">
                                                Rp {{ number_format($trx['gross_profit'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 px-4 text-center font-bold text-purple-600 dark:text-purple-400">
                                                {{ $trx['margin_pct'] }}%
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @endif
                </div>
            @endif

            {{-- ----------------------------------------------------------------- --}}
            {{-- TAB 3: REKAPITULASI HARIAN & BULANAN                              --}}
            {{-- ----------------------------------------------------------------- --}}
            @if ($activeViewTab === 'bulanan')
                <div class="space-y-6">
                    <div>
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                            Rekapitulasi Harian Penjualan Website
                        </h3>
                        @if (empty($dailySummary))
                            <div class="p-6 text-center text-xs text-gray-500 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                Belum ada transaksi website pada periode ini.
                            </div>
                        @else
                            <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                                <table class="w-full text-left text-xs">
                                    <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-bold text-[11px]">
                                        <tr>
                                            <th class="py-3 px-4">Tanggal & Hari</th>
                                            <th class="py-3 px-4 text-center">Jumlah Pesanan</th>
                                            <th class="py-3 px-4 text-center">Item Terjual</th>
                                            <th class="py-3 px-4 text-right">Omset Bersih</th>
                                            <th class="py-3 px-4 text-right">Total HPP Modal</th>
                                            <th class="py-3 px-4 text-right">Laba Kotor</th>
                                            <th class="py-3 px-4 text-center">Margin (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                        @foreach ($dailySummary as $day)
                                            <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                                <td class="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                                                    {{ $day['date_label'] }}
                                                    <span class="block text-[11px] text-gray-500 font-normal">{{ $day['day_name'] }}</span>
                                                </td>
                                                <td class="py-3 px-4 text-center font-bold text-gray-700 dark:text-gray-300">
                                                    {{ $day['total_transactions'] }} pesanan
                                                </td>
                                                <td class="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                                                    {{ $day['items_sold'] }} pcs
                                                </td>
                                                <td class="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                                                    Rp {{ number_format($day['net_sales'], 0, ',', '.') }}
                                                </td>
                                                <td class="py-3 px-4 text-right font-medium text-amber-600 dark:text-amber-400">
                                                    Rp {{ number_format($day['total_cogs'], 0, ',', '.') }}
                                                </td>
                                                <td class="py-3 px-4 text-right font-bold {{ $day['gross_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600' }}">
                                                    Rp {{ number_format($day['gross_profit'], 0, ',', '.') }}
                                                </td>
                                                <td class="py-3 px-4 text-center font-bold text-purple-600 dark:text-purple-400">
                                                    {{ $day['margin_pct'] }}%
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        @endif
                    </div>

                    <div>
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                            Rekapitulasi Bulanan Penjualan Website
                        </h3>
                        @if (empty($monthlySummary))
                            <div class="p-6 text-center text-xs text-gray-500 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                Belum ada rekapitulasi bulanan pada periode ini.
                            </div>
                        @else
                            <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                                <table class="w-full text-left text-xs">
                                    <thead class="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-bold text-[11px]">
                                        <tr>
                                            <th class="py-3 px-4">Bulan</th>
                                            <th class="py-3 px-4 text-center">Jumlah Pesanan</th>
                                            <th class="py-3 px-4 text-center">Item Terjual</th>
                                            <th class="py-3 px-4 text-right">Omset Bersih</th>
                                            <th class="py-3 px-4 text-right">Total HPP Modal</th>
                                            <th class="py-3 px-4 text-right">Laba Kotor</th>
                                            <th class="py-3 px-4 text-center">Margin (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                        @foreach ($monthlySummary as $m)
                                            <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                                <td class="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                                    {{ $m['month_label'] }}
                                                </td>
                                                <td class="py-3 px-4 text-center font-bold text-gray-700 dark:text-gray-300">
                                                    {{ $m['total_transactions'] }} pesanan
                                                </td>
                                                <td class="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                                                    {{ $m['items_sold'] }} pcs
                                                </td>
                                                <td class="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                                                    Rp {{ number_format($m['net_sales'], 0, ',', '.') }}
                                                </td>
                                                <td class="py-3 px-4 text-right font-medium text-amber-600 dark:text-amber-400">
                                                    Rp {{ number_format($m['total_cogs'], 0, ',', '.') }}
                                                </td>
                                                <td class="py-3 px-4 text-right font-bold {{ $m['gross_profit'] >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600' }}">
                                                    Rp {{ number_format($m['gross_profit'], 0, ',', '.') }}
                                                </td>
                                                <td class="py-3 px-4 text-center font-bold text-purple-600 dark:text-purple-400">
                                                    {{ $m['margin_pct'] }}%
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        @endif
                    </div>
                </div>
            @endif
        </div>
    </div>
</x-filament-panels::page>
