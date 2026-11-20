<x-filament-panels::page>
    @php
        $report = $this->reportData;
        $summary = $report['summary'];
        $channels = $report['channels'];
        $expenses = $report['expenses'];
        $expenseBreakdown = $report['expense_breakdown'];
        $dailySummary = $report['daily_summary'];
        $monthlySummary = $report['monthly_summary'];
        $transactions = $report['transactions'];
        $topProducts = $report['top_products'];

        // Filtered transactions for search
        $filteredTransactions = $transactions;
        if (!empty($this->searchTransaction)) {
            $q = strtolower($this->searchTransaction);
            $filteredTransactions = array_filter($transactions, function ($trx) use ($q) {
                return str_contains(strtolower($trx['order_number']), $q)
                    || str_contains(strtolower($trx['customer_name']), $q)
                    || str_contains(strtolower($trx['channel_label']), $q)
                    || str_contains(strtolower($trx['payment_method_label'] ?? ''), $q);
            });
        }

        // Filtered expenses for category and search
        $filteredExpenses = $expenses;
        if ($this->expenseCategory !== 'all') {
            $filteredExpenses = array_filter($filteredExpenses, fn ($e) => $e['category'] === $this->expenseCategory);
        }
        if (!empty($this->searchExpense)) {
            $qe = strtolower($this->searchExpense);
            $filteredExpenses = array_filter($filteredExpenses, function ($exp) use ($qe) {
                return str_contains(strtolower($exp['description']), $qe)
                    || str_contains(strtolower($exp['category_label']), $qe)
                    || str_contains(strtolower($exp['user_name']), $qe);
            });
        }
        $filteredExpenseTotal = array_sum(array_column($filteredExpenses, 'amount'));
    @endphp

    <div class="space-y-6">
        {{-- ========================================================================= --}}
        {{-- 1. FILTER BAR (PERIODE & CHANNEL)                                         --}}
        {{-- ========================================================================= --}}
        <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {{-- Quick Period Buttons --}}
                <div>
                    <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                        Periode Waktu
                    </span>
                    <div class="inline-flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-medium">
                        <button
                            type="button"
                            wire:click="setPeriod('today')"
                            class="px-3 py-1.5 rounded-lg transition {{ $period === 'today' ? 'bg-primary-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                        >
                            Hari Ini
                        </button>
                        <button
                            type="button"
                            wire:click="setPeriod('yesterday')"
                            class="px-3 py-1.5 rounded-lg transition {{ $period === 'yesterday' ? 'bg-primary-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                        >
                            Kemarin
                        </button>
                        <button
                            type="button"
                            wire:click="setPeriod('this_month')"
                            class="px-3 py-1.5 rounded-lg transition {{ $period === 'this_month' ? 'bg-primary-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                        >
                            Bulan Ini
                        </button>
                        <button
                            type="button"
                            wire:click="setPeriod('last_month')"
                            class="px-3 py-1.5 rounded-lg transition {{ $period === 'last_month' ? 'bg-primary-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                        >
                            Bulan Lalu
                        </button>
                        <button
                            type="button"
                            wire:click="setPeriod('custom_month')"
                            class="px-3 py-1.5 rounded-lg transition {{ $period === 'custom_month' ? 'bg-primary-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                        >
                            Pilih Bulan
                        </button>
                        <button
                            type="button"
                            wire:click="setPeriod('custom_range')"
                            class="px-3 py-1.5 rounded-lg transition {{ $period === 'custom_range' ? 'bg-primary-600 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                        >
                            Rentang Tanggal
                        </button>
                    </div>
                </div>

                {{-- Channel Filter --}}
                <div>
                    <span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                        Sumber Penjualan (Channel)
                    </span>
                    <div class="inline-flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-medium">
                        <button
                            type="button"
                            wire:click="setChannel('all')"
                            class="px-3 py-1.5 rounded-lg transition {{ $channel === 'all' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                        >
                            Konsolidasi (Web + POS)
                        </button>
                        <button
                            type="button"
                            wire:click="setChannel('web')"
                            class="px-3 py-1.5 rounded-lg transition {{ $channel === 'web' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                        >
                            Website Saja
                        </button>
                        <button
                            type="button"
                            wire:click="setChannel('pos')"
                            class="px-3 py-1.5 rounded-lg transition {{ $channel === 'pos' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' }}"
                        >
                            POS Kasir Saja
                        </button>
                    </div>
                </div>
            </div>

            {{-- Custom Period Controls --}}
            @if ($period === 'custom_month')
                <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 text-xs">
                    <label class="font-semibold text-gray-700 dark:text-gray-300">Pilih Bulan & Tahun:</label>
                    <input
                        type="month"
                        wire:model.live="selectedMonth"
                        class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                    />
                    <span class="text-gray-500">
                        Menampilkan laporan bulan {{ \Carbon\Carbon::parse(($selectedMonth ?: now()->format('Y-m')) . '-01')->translatedFormat('F Y') }}
                    </span>
                </div>
            @elseif ($period === 'custom_range')
                <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3 text-xs">
                    <label class="font-semibold text-gray-700 dark:text-gray-300">Dari Tanggal:</label>
                    <input
                        type="date"
                        wire:model.live="startDate"
                        class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                    />
                    <label class="font-semibold text-gray-700 dark:text-gray-300">Sampai:</label>
                    <input
                        type="date"
                        wire:model.live="endDate"
                        class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium"
                    />
                </div>
            @endif
        </div>

        {{-- ========================================================================= --}}
        {{-- 2. EXECUTIVE SUMMARY CARDS (5 METRICS)                                    --}}
        {{-- ========================================================================= --}}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {{-- 1. Penjualan Bersih --}}
            <div class="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        1. Penjualan Bersih (Omset)
                    </span>
                    <p class="text-xl font-black text-gray-900 dark:text-white mt-1">
                        Rp {{ number_format($summary['net_sales'], 0, ',', '.') }}
                    </p>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {{ $summary['total_transactions'] }} transaksi · {{ $summary['items_sold'] }} item
                    </p>
                </div>
                <div class="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[10px] space-y-1">
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Web (Online):</span>
                        <span class="font-semibold text-gray-900 dark:text-gray-200">Rp {{ number_format($channels['web']['net_sales'], 0, ',', '.') }} ({{ $channels['web']['orders_count'] }})</span>
                    </div>
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>POS (Kasir):</span>
                        <span class="font-semibold text-gray-900 dark:text-gray-200">Rp {{ number_format($channels['pos']['net_sales'], 0, ',', '.') }} ({{ $channels['pos']['orders_count'] }})</span>
                    </div>
                </div>
            </div>

            {{-- 2. Total HPP Modal Produk (COGS) --}}
            <div class="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        2. Total HPP Modal (COGS)
                    </span>
                    <p class="text-xl font-black text-gray-900 dark:text-white mt-1">
                        Rp {{ number_format($summary['total_cogs'], 0, ',', '.') }}
                    </p>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {{ $summary['items_with_hpp_count'] }} item ter-HPP
                        @if ($summary['items_without_hpp_count'] > 0)
                            <span class="text-amber-500 font-semibold">({{ $summary['items_without_hpp_count'] }} HPP 0)</span>
                        @endif
                    </p>
                </div>
                <div class="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[10px] space-y-1">
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>HPP Web:</span>
                        <span class="font-semibold text-gray-900 dark:text-gray-200">Rp {{ number_format($channels['web']['total_cogs'], 0, ',', '.') }}</span>
                    </div>
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>HPP POS:</span>
                        <span class="font-semibold text-gray-900 dark:text-gray-200">Rp {{ number_format($channels['pos']['total_cogs'], 0, ',', '.') }}</span>
                    </div>
                </div>
            </div>

            {{-- 3. Laba Kotor (Gross Profit) --}}
            <div class="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        3. Laba Kotor (Gross Profit)
                    </span>
                    <p class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        Rp {{ number_format($summary['gross_profit'], 0, ',', '.') }}
                    </p>
                    <p class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Margin Laba Kotor {{ $summary['gross_margin_pct'] }}%
                    </p>
                </div>
                <div class="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[10px] space-y-1">
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Margin Web:</span>
                        <span class="font-semibold text-emerald-600 dark:text-emerald-400">Rp {{ number_format($channels['web']['gross_profit'], 0, ',', '.') }} ({{ $channels['web']['margin_pct'] }}%)</span>
                    </div>
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Margin POS:</span>
                        <span class="font-semibold text-emerald-600 dark:text-emerald-400">Rp {{ number_format($channels['pos']['gross_profit'], 0, ',', '.') }} ({{ $channels['pos']['margin_pct'] }}%)</span>
                    </div>
                </div>
            </div>

            {{-- 4. Beban Pengeluaran Kasir --}}
            <div class="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        4. Beban Kas Keluar
                    </span>
                    <p class="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
                        - Rp {{ number_format($summary['total_expenses'], 0, ',', '.') }}
                    </p>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {{ count($expenses) }} transaksi kas keluar
                    </p>
                </div>
                <div class="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[10px] space-y-1">
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Pendapatan Lain:</span>
                        <span class="font-semibold text-emerald-600 dark:text-emerald-400">+ Rp {{ number_format($summary['other_income'], 0, ',', '.') }}</span>
                    </div>
                    <div class="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Kategori Beban:</span>
                        <span class="font-semibold text-gray-900 dark:text-gray-200">{{ count($expenseBreakdown) }} kategori</span>
                    </div>
                </div>
            </div>

            {{-- 5. LABA BERSIH (NET PROFIT) --}}
            <div class="p-4 rounded-2xl {{ $summary['is_profitable'] ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700' : 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700' }} shadow-sm flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between">
                        <span class="text-[11px] font-black uppercase tracking-wider {{ $summary['is_profitable'] ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300' }}">
                            5. LABA BERSIH (NET PROFIT)
                        </span>
                        <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase {{ $summary['is_profitable'] ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100' : 'bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100' }}">
                            {{ $summary['is_profitable'] ? 'SURPLUS' : 'DEFISIT' }}
                        </span>
                    </div>
                    <p class="text-xl font-black {{ $summary['is_profitable'] ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300' }} mt-1">
                        Rp {{ number_format($summary['net_profit'], 0, ',', '.') }}
                    </p>
                    <p class="text-[11px] font-bold {{ $summary['is_profitable'] ? 'text-emerald-800 dark:text-emerald-400' : 'text-rose-800 dark:text-rose-400' }} mt-0.5">
                        Net Margin: {{ $summary['net_margin_pct'] }}%
                    </p>
                </div>
                <div class="mt-3 pt-2.5 border-t {{ $summary['is_profitable'] ? 'border-emerald-200 dark:border-emerald-800/80' : 'border-rose-200 dark:border-rose-800/80' }} text-[10px] text-gray-600 dark:text-gray-300">
                    <span>Laba Kotor - Total Beban Kas Keluar</span>
                </div>
            </div>
        </div>

        {{-- ========================================================================= --}}
        {{-- 3. NAVIGATION TABS                                                        --}}
        {{-- ========================================================================= --}}
        <div class="border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-semibold">
            <button
                type="button"
                wire:click="setActiveTab('ringkasan')"
                class="px-4 py-2.5 border-b-2 transition flex items-center gap-2 {{ $activeViewTab === 'ringkasan' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300' }}"
            >
                <span>📊 Ikhtisar & Performa Channel</span>
            </button>
            <button
                type="button"
                wire:click="setActiveTab('bulanan')"
                class="px-4 py-2.5 border-b-2 transition flex items-center gap-2 {{ $activeViewTab === 'bulanan' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300' }}"
            >
                <span>📅 Rekap Transaksi Bulanan & Harian</span>
                <span class="px-1.5 py-0.2 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px]">{{ count($dailySummary) }}</span>
            </button>
            <button
                type="button"
                wire:click="setActiveTab('pesanan')"
                class="px-4 py-2.5 border-b-2 transition flex items-center gap-2 {{ $activeViewTab === 'pesanan' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300' }}"
            >
                <span>🛒 Daftar Seluruh Transaksi (Web & POS)</span>
                <span class="px-1.5 py-0.2 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px]">{{ count($transactions) }}</span>
            </button>
            <button
                type="button"
                wire:click="setActiveTab('pengeluaran')"
                class="px-4 py-2.5 border-b-2 transition flex items-center gap-2 {{ $activeViewTab === 'pengeluaran' ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300' }}"
            >
                <span>💸 Laporan Pengeluaran Bulanannya</span>
                <span class="px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 rounded-full text-[10px]">{{ count($expenses) }}</span>
            </button>
        </div>

        {{-- ========================================================================= --}}
        {{-- 4. TAB CONTENTS                                                           --}}
        {{-- ========================================================================= --}}

        {{-- TAB 1: IKHTISAR & PERFORMA CHANNEL --}}
        @if ($activeViewTab === 'ringkasan')
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {{-- Comparison Card: Website vs POS --}}
                <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>Perbandingan Performa: Website vs POS Kasir</span>
                    </h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {{-- Web Box --}}
                        <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-xs text-gray-900 dark:text-white">Website Online</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                    {{ $channels['web']['pct_of_sales'] }}% Omset
                                </span>
                            </div>
                            <p class="text-lg font-black text-gray-900 dark:text-white">
                                Rp {{ number_format($channels['web']['net_sales'], 0, ',', '.') }}
                            </p>
                            <div class="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5">
                                <div>Total Pesanan: <span class="font-semibold text-gray-700 dark:text-gray-200">{{ $channels['web']['orders_count'] }} pesanan</span></div>
                                <div>Total HPP Modal: <span class="font-semibold text-gray-700 dark:text-gray-200">Rp {{ number_format($channels['web']['total_cogs'], 0, ',', '.') }}</span></div>
                                <div>Laba Kotor: <span class="font-bold text-emerald-600 dark:text-emerald-400">Rp {{ number_format($channels['web']['gross_profit'], 0, ',', '.') }} ({{ $channels['web']['margin_pct'] }}%)</span></div>
                            </div>
                        </div>

                        {{-- POS Box --}}
                        <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-xs text-gray-900 dark:text-white">POS Kasir Toko</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                    {{ $channels['pos']['pct_of_sales'] }}% Omset
                                </span>
                            </div>
                            <p class="text-lg font-black text-gray-900 dark:text-white">
                                Rp {{ number_format($channels['pos']['net_sales'], 0, ',', '.') }}
                            </p>
                            <div class="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5">
                                <div>Total Pesanan: <span class="font-semibold text-gray-700 dark:text-gray-200">{{ $channels['pos']['orders_count'] }} pesanan</span></div>
                                <div>Total HPP Modal: <span class="font-semibold text-gray-700 dark:text-gray-200">Rp {{ number_format($channels['pos']['total_cogs'], 0, ',', '.') }}</span></div>
                                <div>Laba Kotor: <span class="font-bold text-emerald-600 dark:text-emerald-400">Rp {{ number_format($channels['pos']['gross_profit'], 0, ',', '.') }} ({{ $channels['pos']['margin_pct'] }}%)</span></div>
                            </div>
                        </div>
                    </div>

                    {{-- Channel Visual Bar --}}
                    <div class="space-y-1.5 pt-2">
                        <div class="flex justify-between text-[11px] text-gray-500">
                            <span>Kontribusi Omset:</span>
                            <span>Web {{ $channels['web']['pct_of_sales'] }}% | POS {{ $channels['pos']['pct_of_sales'] }}%</span>
                        </div>
                        <div class="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden flex">
                            <div style="width: {{ $channels['web']['pct_of_sales'] }}%" class="bg-blue-600 h-full" title="Website Online"></div>
                            <div style="width: {{ $channels['pos']['pct_of_sales'] }}%" class="bg-emerald-600 h-full" title="POS Kasir"></div>
                        </div>
                    </div>
                </div>

                {{-- Top Products by Gross Profit --}}
                <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                            Kontribusi Laba Produk Tertinggi (Top 10)
                        </h3>
                        <span class="text-[11px] text-gray-400">Urut Laba Kotor</span>
                    </div>

                    @if (count($topProducts) > 0)
                        <div class="overflow-y-auto max-h-80 space-y-2">
                            @foreach (array_slice($topProducts, 0, 10) as $tp)
                                <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                                    <div class="min-w-0 pr-3">
                                        <p class="font-bold text-gray-900 dark:text-white truncate">
                                            {{ $tp['product_name'] }}
                                        </p>
                                        <p class="text-[11px] text-gray-500 mt-0.5">
                                            {{ $tp['variant_label'] }} · Terjual {{ $tp['quantity'] }} pcs · HPP: Rp {{ number_format($tp['cost'], 0, ',', '.') }}
                                            @if (!$tp['has_hpp'])
                                                <span class="text-amber-500 font-bold ml-1">(HPP Belum Diset)</span>
                                            @endif
                                        </p>
                                    </div>
                                    <div class="text-right shrink-0">
                                        <p class="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                                            + Rp {{ number_format($tp['profit'], 0, ',', '.') }}
                                        </p>
                                        <p class="text-[10px] text-gray-400">
                                            Omset Rp {{ number_format($tp['revenue'], 0, ',', '.') }}
                                        </p>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="py-8 text-center text-xs text-gray-400">
                            Belum ada data penjualan pada periode ini.
                        </div>
                    @endif
                </div>
            </div>
        @endif

        {{-- TAB 2: REKAP TRANSAKSI BULANAN & HARIAN --}}
        @if ($activeViewTab === 'bulanan')
            <div class="space-y-6">
                {{-- Rekap Harian dalam Periode --}}
                <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                                Rekap Penjualan, HPP & Pengeluaran Harian
                            </h3>
                            <p class="text-xs text-gray-500 mt-0.5">
                                Mengelompokkan transaksi harian, perbandingan Web vs POS, total HPP, laba kotor, dan beban pengeluaran harian.
                            </p>
                        </div>
                        <span class="text-xs text-gray-400 font-semibold">
                            {{ count($dailySummary) }} Hari Aktif
                        </span>
                    </div>

                    @if (count($dailySummary) > 0)
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead>
                                    <tr class="border-b border-gray-200 dark:border-gray-800 text-gray-400 pb-2">
                                        <th class="py-2.5 font-semibold">Tanggal</th>
                                        <th class="py-2.5 font-semibold text-center">Trx (Web / POS)</th>
                                        <th class="py-2.5 font-semibold text-right">Penjualan Web</th>
                                        <th class="py-2.5 font-semibold text-right">Penjualan POS</th>
                                        <th class="py-2.5 font-semibold text-right">Total Penjualan</th>
                                        <th class="py-2.5 font-semibold text-right">HPP Modal</th>
                                        <th class="py-2.5 font-semibold text-right">Laba Kotor</th>
                                        <th class="py-2.5 font-semibold text-right">Beban Keluar</th>
                                        <th class="py-2.5 font-semibold text-right">Laba Bersih</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                    @foreach ($dailySummary as $day)
                                        @php
                                            $dayNetProfit = $day['gross_profit'] - $day['expenses_total'];
                                        @endphp
                                        <tr class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                                            <td class="py-3 font-bold text-gray-900 dark:text-gray-100">
                                                <div>{{ $day['date_label'] }}</div>
                                                <div class="text-[10px] font-normal text-gray-400">{{ $day['day_name'] }}</div>
                                            </td>
                                            <td class="py-3 text-center">
                                                <span class="font-bold text-gray-900 dark:text-gray-100">{{ $day['total_transactions'] }}</span>
                                                <div class="text-[10px] text-gray-400">({{ $day['web_transactions'] }} / {{ $day['pos_transactions'] }})</div>
                                            </td>
                                            <td class="py-3 text-right font-medium text-blue-600 dark:text-blue-400">
                                                Rp {{ number_format($day['web_sales'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                                                Rp {{ number_format($day['pos_sales'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right font-bold text-gray-900 dark:text-white">
                                                Rp {{ number_format($day['net_sales'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right text-gray-500">
                                                Rp {{ number_format($day['total_cogs'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                <div>Rp {{ number_format($day['gross_profit'], 0, ',', '.') }}</div>
                                                <div class="text-[10px] font-medium opacity-80">{{ $day['margin_pct'] }}%</div>
                                            </td>
                                            <td class="py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                                                - Rp {{ number_format($day['expenses_total'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right font-black {{ $dayNetProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300' }}">
                                                Rp {{ number_format($dayNetProfit, 0, ',', '.') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="py-8 text-center text-xs text-gray-400">
                            Belum ada rekapan transaksi pada periode ini.
                        </div>
                    @endif
                </div>

                {{-- Rekap Bulanan (Jika periode mencakup lebih dari 1 bulan) --}}
                @if (count($monthlySummary) > 1)
                    <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                            Rekapitulasi Antar Bulan
                        </h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead>
                                    <tr class="border-b border-gray-200 dark:border-gray-800 text-gray-400 pb-2">
                                        <th class="py-2.5 font-semibold">Bulan</th>
                                        <th class="py-2.5 font-semibold text-center">Trx</th>
                                        <th class="py-2.5 font-semibold text-right">Omset Web</th>
                                        <th class="py-2.5 font-semibold text-right">Omset POS</th>
                                        <th class="py-2.5 font-semibold text-right">Total Penjualan</th>
                                        <th class="py-2.5 font-semibold text-right">HPP Modal</th>
                                        <th class="py-2.5 font-semibold text-right">Laba Kotor</th>
                                        <th class="py-2.5 font-semibold text-right">Beban Pengeluaran</th>
                                        <th class="py-2.5 font-semibold text-right">Laba Bersih</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                    @foreach ($monthlySummary as $m)
                                        <tr class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                                            <td class="py-3 font-bold text-gray-900 dark:text-gray-100">
                                                {{ $m['month_label'] }}
                                            </td>
                                            <td class="py-3 text-center font-bold">
                                                {{ $m['total_transactions'] }}
                                            </td>
                                            <td class="py-3 text-right font-medium text-blue-600 dark:text-blue-400">
                                                Rp {{ number_format($m['web_sales'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                                                Rp {{ number_format($m['pos_sales'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right font-bold text-gray-900 dark:text-white">
                                                Rp {{ number_format($m['net_sales'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right text-gray-500">
                                                Rp {{ number_format($m['total_cogs'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                Rp {{ number_format($m['gross_profit'], 0, ',', '.') }} ({{ $m['margin_pct'] }}%)
                                            </td>
                                            <td class="py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                                                - Rp {{ number_format($m['expenses_total'], 0, ',', '.') }}
                                            </td>
                                            <td class="py-3 text-right font-black {{ $m['net_profit'] >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300' }}">
                                                Rp {{ number_format($m['net_profit'], 0, ',', '.') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                @endif
            </div>
        @endif

        {{-- TAB 3: DAFTAR SELURUH TRANSAKSI (WEB & POS) --}}
        @if ($activeViewTab === 'pesanan')
            <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                            Daftar Transaksi Pesanan (Website & POS Kasir)
                        </h3>
                        <p class="text-xs text-gray-500 mt-0.5">
                            Menampilkan seluruh pesanan berstatus paid, HPP per transaksi, dan laba kotor.
                        </p>
                    </div>

                    {{-- Search Input --}}
                    <div class="relative w-full sm:w-72">
                        <input
                            type="text"
                            wire:model.live.debounce.300ms="searchTransaction"
                            placeholder="Cari no. pesanan, pelanggan..."
                            class="w-full px-3 py-1.5 pl-8 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                        />
                        <div class="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</div>
                    </div>
                </div>

                @if (count($filteredTransactions) > 0)
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs">
                            <thead>
                                <tr class="border-b border-gray-200 dark:border-gray-800 text-gray-400 pb-2">
                                    <th class="py-2.5 font-semibold">No. Pesanan</th>
                                    <th class="py-2.5 font-semibold">Channel</th>
                                    <th class="py-2.5 font-semibold">Pelanggan</th>
                                    <th class="py-2.5 font-semibold">Metode Bayar</th>
                                    <th class="py-2.5 font-semibold text-right">Penjualan Bersih</th>
                                    <th class="py-2.5 font-semibold text-right">Total HPP</th>
                                    <th class="py-2.5 font-semibold text-right">Laba Kotor</th>
                                    <th class="py-2.5 font-semibold text-center">Rincian Item</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                @foreach ($filteredTransactions as $trx)
                                    <tr class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                                        <td class="py-3 font-bold text-gray-900 dark:text-gray-100">
                                            <div>{{ $trx['order_number'] }}</div>
                                            <div class="text-[10px] font-normal text-gray-400">{{ $trx['created_at_formatted'] }}</div>
                                        </td>
                                        <td class="py-3">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-bold {{ $trx['channel'] === 'web' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' }}">
                                                {{ $trx['channel_label'] }}
                                            </span>
                                        </td>
                                        <td class="py-3">
                                            <p class="font-semibold text-gray-900 dark:text-gray-200">{{ $trx['customer_name'] }}</p>
                                            @if ($trx['customer_phone'] && $trx['customer_phone'] !== '-')
                                                <p class="text-[10px] text-gray-400">{{ $trx['customer_phone'] }}</p>
                                            @endif
                                        </td>
                                        <td class="py-3 text-gray-600 dark:text-gray-300">
                                            {{ $trx['payment_method_label'] }}
                                        </td>
                                        <td class="py-3 text-right font-bold text-gray-900 dark:text-white">
                                            Rp {{ number_format($trx['net_sales'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 text-right text-gray-500">
                                            Rp {{ number_format($trx['total_cogs'], 0, ',', '.') }}
                                        </td>
                                        <td class="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                            <div>+ Rp {{ number_format($trx['gross_profit'], 0, ',', '.') }}</div>
                                            <div class="text-[10px] font-semibold opacity-80">{{ $trx['margin_pct'] }}%</div>
                                        </td>
                                        <td class="py-3 text-center">
                                            <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-medium" title="{{ collect($trx['items'])->pluck('product_name')->implode(', ') }}">
                                                {{ $trx['items_count'] }} item
                                            </span>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @else
                    <div class="py-8 text-center text-xs text-gray-400">
                        Tidak ada transaksi yang cocok dengan filter.
                    </div>
                @endif
            </div>
        @endif

        {{-- TAB 4: LAPORAN PENGELUARAN BULANANNYA --}}
        @if ($activeViewTab === 'pengeluaran')
            <div class="space-y-6">
                {{-- Category Summary Chips --}}
                <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                                Rincian Beban Kas Keluar per Kategori
                            </h3>
                            <p class="text-xs text-gray-500 mt-0.5">
                                Klik kategori untuk memfilter rincian pengeluaran di bawah.
                            </p>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-gray-400 block">Total Pengeluaran:</span>
                            <span class="text-base font-black text-rose-600 dark:text-rose-400">
                                - Rp {{ number_format($summary['total_expenses'], 0, ',', '.') }}
                            </span>
                        </div>
                    </div>

                    {{-- Category Buttons --}}
                    <div class="flex flex-wrap items-center gap-2 pt-2">
                        <button
                            type="button"
                            wire:click="setExpenseCategory('all')"
                            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer {{ $expenseCategory === 'all' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200' }}"
                        >
                            Semua Kategori ({{ count($expenses) }}) · Rp {{ number_format($summary['total_expenses'], 0, ',', '.') }}
                        </button>
                        @foreach ($expenseBreakdown as $cat)
                            <button
                                type="button"
                                wire:click="setExpenseCategory('{{ $cat['category'] }}')"
                                class="px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer {{ $expenseCategory === $cat['category'] ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200' }}"
                            >
                                {{ $cat['label'] }} ({{ $cat['count'] }}) · Rp {{ number_format($cat['total'], 0, ',', '.') }} ({{ $cat['pct_of_total'] }}%)
                            </button>
                        @endforeach
                    </div>
                </div>

                {{-- Itemized Expense Records Table --}}
                <div class="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                                Daftar Transaksi Kas Keluar ({{ count($filteredExpenses) }} item)
                            </h3>
                            <p class="text-xs text-gray-500 mt-0.5">
                                Menampilkan tanggal, deskripsi keterangan pengeluaran, kategori, kasir pencatat, dan nominal.
                            </p>
                        </div>

                        {{-- Search Expense --}}
                        <div class="relative w-full sm:w-72">
                            <input
                                type="text"
                                wire:model.live.debounce.300ms="searchExpense"
                                placeholder="Cari keterangan, kasir..."
                                class="w-full px-3 py-1.5 pl-8 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                            />
                            <div class="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</div>
                        </div>
                    </div>

                    @if (count($filteredExpenses) > 0)
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs">
                                <thead>
                                    <tr class="border-b border-gray-200 dark:border-gray-800 text-gray-400 pb-2">
                                        <th class="py-2.5 font-semibold">Waktu / Tanggal</th>
                                        <th class="py-2.5 font-semibold">Kategori</th>
                                        <th class="py-2.5 font-semibold">Keterangan / Deskripsi</th>
                                        <th class="py-2.5 font-semibold">Kasir / Pencatat</th>
                                        <th class="py-2.5 font-semibold text-right">Nominal Beban</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                    @foreach ($filteredExpenses as $exp)
                                        <tr class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                                            <td class="py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                <div>{{ $exp['date_time'] }}</div>
                                            </td>
                                            <td class="py-3">
                                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                    {{ $exp['category_label'] }}
                                                </span>
                                            </td>
                                            <td class="py-3 font-semibold text-gray-900 dark:text-gray-100">
                                                {{ $exp['description'] }}
                                            </td>
                                            <td class="py-3 text-gray-500">
                                                {{ $exp['user_name'] }}
                                            </td>
                                            <td class="py-3 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                                                - Rp {{ number_format($exp['amount'], 0, ',', '.') }}
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                                <tfoot>
                                    <tr class="border-t-2 border-gray-200 dark:border-gray-700 font-bold">
                                        <td colspan="4" class="py-3 text-gray-700 dark:text-gray-300">
                                            Total Beban Kas Keluar ({{ count($filteredExpenses) }} item)
                                        </td>
                                        <td class="py-3 text-right text-rose-600 dark:text-rose-400 text-sm">
                                            - Rp {{ number_format($filteredExpenseTotal, 0, ',', '.') }}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    @else
                        <div class="py-8 text-center text-xs text-gray-400">
                            Tidak ada data pengeluaran yang cocok dengan filter ini.
                        </div>
                    @endif
                </div>
            </div>
        @endif
    </div>
</x-filament-panels::page>
