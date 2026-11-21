<x-filament-panels::page>
    <div class="space-y-6">
        {{-- Top Bar: Filter Periode & Action Buka Kasir --}}
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-4 shadow-xs border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Filter Periode:</span>
                <button
                    type="button"
                    wire:click="setPeriod('today')"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg transition {{ $period === 'today' ? 'bg-amber-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' }}"
                >
                    Hari Ini
                </button>
                <button
                    type="button"
                    wire:click="setPeriod('yesterday')"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg transition {{ $period === 'yesterday' ? 'bg-amber-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' }}"
                >
                    Kemarin
                </button>
                <button
                    type="button"
                    wire:click="setPeriod('last_7_days')"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg transition {{ $period === 'last_7_days' ? 'bg-amber-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' }}"
                >
                    7 Hari Terakhir
                </button>
                <button
                    type="button"
                    wire:click="setPeriod('this_month')"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg transition {{ $period === 'this_month' ? 'bg-amber-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' }}"
                >
                    Bulan Ini
                </button>
                <button
                    type="button"
                    wire:click="setPeriod('all')"
                    class="px-3 py-1.5 text-xs font-semibold rounded-lg transition {{ $period === 'all' ? 'bg-amber-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' }}"
                >
                    Semua Waktu
                </button>
            </div>

            <div class="flex items-center gap-2">
                <a
                    href="{{ route('pos.index') }}"
                    target="_blank"
                    class="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition active:scale-95"
                >
                    <x-filament::icon icon="heroicon-o-computer-desktop" class="w-4 h-4" />
                    <span>Buka Layar Kasir POS</span>
                </a>
            </div>
        </div>

        {{-- 4 Stat Cards --}}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {{-- Omset POS --}}
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Omset Penjualan POS</span>
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                        <x-filament::icon icon="heroicon-o-banknotes" class="h-5 w-5" />
                    </div>
                </div>
                <div class="mt-3">
                    <div class="text-2xl font-black text-gray-900 dark:text-white">
                        Rp {{ number_format($totalSales, 0, ',', '.') }}
                    </div>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Dari <strong class="text-gray-700 dark:text-gray-300">{{ $totalTransactions }}</strong> transaksi lunas
                    </p>
                </div>
            </div>

            {{-- Total Transaksi --}}
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Transaksi Kasir</span>
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <x-filament::icon icon="heroicon-o-receipt-percent" class="h-5 w-5" />
                    </div>
                </div>
                <div class="mt-3">
                    <div class="text-2xl font-black text-gray-900 dark:text-white">
                        {{ $totalTransactions }}
                    </div>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Rata-rata: <strong class="text-gray-700 dark:text-gray-300">Rp {{ number_format($avgTicket, 0, ',', '.') }}</strong> / order
                    </p>
                </div>
            </div>

            {{-- Total Item Terjual --}}
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Item / Menu Terjual</span>
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <x-filament::icon icon="heroicon-o-shopping-bag" class="h-5 w-5" />
                    </div>
                </div>
                <div class="mt-3">
                    <div class="text-2xl font-black text-gray-900 dark:text-white">
                        {{ number_format($totalItemsSold, 0, ',', '.') }} item
                    </div>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Makanan & minuman cafe
                    </p>
                </div>
            </div>

            {{-- Total Refund / Dibatalkan --}}
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Refund / Batal</span>
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                        <x-filament::icon icon="heroicon-o-arrow-path" class="h-5 w-5" />
                    </div>
                </div>
                <div class="mt-3">
                    <div class="text-2xl font-black text-gray-900 dark:text-white">
                        {{ $refundCount }}
                    </div>
                    <p class="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        Total refund: Rp {{ number_format($refundAmount, 0, ',', '.') }}
                    </p>
                </div>
            </div>
        </div>

        {{-- 2 Columns: Breakdown Pembayaran & Top 5 Menu --}}
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {{-- Breakdown Metode Pembayaran --}}
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <x-filament::icon icon="heroicon-o-credit-card" class="h-4 w-4 text-amber-600" />
                        <span>Breakdown Metode Pembayaran</span>
                    </h3>
                    <span class="text-xs text-gray-500">Omset Lunas</span>
                </div>

                <div class="mt-4 space-y-3">
                    {{-- Cash --}}
                    <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                                💵
                            </div>
                            <div>
                                <div class="text-xs font-bold text-gray-900 dark:text-white">Tunai / Cash</div>
                                <div class="text-[11px] text-gray-500">{{ $payments['cash']['count'] }} transaksi</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold text-gray-900 dark:text-white">
                                Rp {{ number_format($payments['cash']['amount'], 0, ',', '.') }}
                            </div>
                            <div class="text-[10px] text-gray-500">
                                {{ $totalSales > 0 ? round(($payments['cash']['amount'] / $totalSales) * 100, 1) : 0 }}%
                            </div>
                        </div>
                    </div>

                    {{-- QRIS --}}
                    <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                                📱
                            </div>
                            <div>
                                <div class="text-xs font-bold text-gray-900 dark:text-white">QRIS (Toko Resmi)</div>
                                <div class="text-[11px] text-gray-500">{{ $payments['qris']['count'] }} transaksi</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold text-gray-900 dark:text-white">
                                Rp {{ number_format($payments['qris']['amount'], 0, ',', '.') }}
                            </div>
                            <div class="text-[10px] text-gray-500">
                                {{ $totalSales > 0 ? round(($payments['qris']['amount'] / $totalSales) * 100, 1) : 0 }}%
                            </div>
                        </div>
                    </div>

                    {{-- Transfer Bank --}}
                    <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                                🏦
                            </div>
                            <div>
                                <div class="text-xs font-bold text-gray-900 dark:text-white">Transfer Bank</div>
                                <div class="text-[11px] text-gray-500">{{ $payments['transfer']['count'] }} transaksi</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold text-gray-900 dark:text-white">
                                Rp {{ number_format($payments['transfer']['amount'], 0, ',', '.') }}
                            </div>
                            <div class="text-[10px] text-gray-500">
                                {{ $totalSales > 0 ? round(($payments['transfer']['amount'] / $totalSales) * 100, 1) : 0 }}%
                            </div>
                        </div>
                    </div>

                    {{-- Debit / EDC --}}
                    <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                                💳
                            </div>
                            <div>
                                <div class="text-xs font-bold text-gray-900 dark:text-white">Kartu Debit / EDC</div>
                                <div class="text-[11px] text-gray-500">{{ $payments['debit']['count'] }} transaksi</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold text-gray-900 dark:text-white">
                                Rp {{ number_format($payments['debit']['amount'], 0, ',', '.') }}
                            </div>
                            <div class="text-[10px] text-gray-500">
                                {{ $totalSales > 0 ? round(($payments['debit']['amount'] / $totalSales) * 100, 1) : 0 }}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Top 5 Menu Paling Laris --}}
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <x-filament::icon icon="heroicon-o-fire" class="h-4 w-4 text-amber-600" />
                        <span>5 Menu Terlaris POS</span>
                    </h3>
                    <span class="text-xs text-gray-500">Urut Kuantitas</span>
                </div>

                <div class="mt-4 space-y-3">
                    @forelse($topProducts as $idx => $prod)
                        <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <div class="flex items-center gap-3">
                                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-black text-amber-700 dark:text-amber-300">
                                    #{{ $idx + 1 }}
                                </span>
                                <div>
                                    <div class="text-xs font-bold text-gray-900 dark:text-white truncate max-w-xs">
                                        {{ $prod->product_name }}
                                    </div>
                                    <div class="text-[11px] text-gray-500">
                                        Terjual: <strong class="text-gray-700 dark:text-gray-300">{{ $prod->total_qty }} porsi</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="text-right font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                Rp {{ number_format($prod->total_revenue, 0, ',', '.') }}
                            </div>
                        </div>
                    @empty
                        <div class="py-8 text-center text-xs text-gray-400">
                            Belum ada data penjualan menu pada periode ini.
                        </div>
                    @endforelse
                </div>
            </div>
        </div>

        {{-- Tabel 10 Transaksi POS Terbaru --}}
        <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <div>
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                        10 Transaksi POS Terakhir
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Riwayat pesanan kasir toko secara real-time
                    </p>
                </div>
                <a
                    href="{{ url('/admin/pos-orders') }}"
                    class="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400"
                >
                    Lihat Semua Transaksi &rarr;
                </a>
            </div>

            <div class="mt-4 overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="border-b border-gray-200 bg-gray-50 font-bold text-gray-600 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                            <th class="p-3">No. Struk</th>
                            <th class="p-3">Waktu</th>
                            <th class="p-3">Pelanggan / Meja</th>
                            <th class="p-3">Kasir</th>
                            <th class="p-3">Metode Bayar</th>
                            <th class="p-3 text-right">Total</th>
                            <th class="p-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 text-gray-800 dark:divide-gray-800 dark:text-gray-200">
                        @forelse($recentOrders as $order)
                            <tr class="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                                <td class="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                                    {{ $order->order_number }}
                                </td>
                                <td class="p-3 text-gray-500">
                                    {{ $order->created_at->format('d/m/Y H:i') }}
                                </td>
                                <td class="p-3 font-medium">
                                    {{ $order->customer_name ?: 'Pelanggan Kasir' }}
                                </td>
                                <td class="p-3 text-gray-500">
                                    {{ $order->payment_details['cashier_name'] ?? ($order->user?->name ?? 'Kasir') }}
                                </td>
                                <td class="p-3">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase {{ match($order->payment_method) {
                                        'cash', 'tunai' => 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                                        'qris' => 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                                        'bank_transfer' => 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
                                        'debit' => 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                                        default => 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                                    } }}">
                                        {{ $order->payment_method }}
                                    </span>
                                </td>
                                <td class="p-3 text-right font-black text-gray-900 dark:text-white">
                                    Rp {{ number_format($order->total_amount, 0, ',', '.') }}
                                </td>
                                <td class="p-3 text-center">
                                    @if($order->status === 'cancelled')
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                                            Refund
                                        </span>
                                    @else
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                            Lunas
                                        </span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="p-6 text-center text-gray-400">
                                    Belum ada transaksi POS yang tercatat.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-filament-panels::page>
