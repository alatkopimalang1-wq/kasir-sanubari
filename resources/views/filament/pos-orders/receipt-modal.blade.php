<div class="space-y-4 text-xs text-gray-800 dark:text-gray-200">
    {{-- Header Struk --}}
    <div class="border-b border-gray-200 pb-3 dark:border-gray-700">
        <div class="flex items-center justify-between">
            <div>
                <span class="font-mono text-base font-black text-amber-600 dark:text-amber-400">
                    {{ $order->order_number }}
                </span>
                <p class="text-[11px] text-gray-500">
                    {{ $order->created_at->format('d F Y, H:i:s') }}
                </p>
            </div>
            <div class="text-right">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase {{ match($order->payment_method) {
                    'cash', 'tunai' => 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                    'qris' => 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                    'bank_transfer' => 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
                    'debit' => 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                    default => 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                } }}">
                    {{ $order->payment_method_label }}
                </span>
                <div class="mt-1">
                    @if($order->status === 'cancelled')
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                            Refund / Dibatalkan
                        </span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Lunas
                        </span>
                    @endif
                </div>
            </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
                <span class="text-gray-500">Pelanggan / Meja:</span>
                <strong class="text-gray-900 dark:text-white block">{{ $order->customer_name ?: 'Pelanggan Walk-in' }}</strong>
            </div>
            <div>
                <span class="text-gray-500">Kasir Bertugas:</span>
                <strong class="text-gray-900 dark:text-white block">{{ $order->payment_details['cashier_name'] ?? ($order->user?->name ?? 'Kasir') }}</strong>
            </div>
        </div>

        @if(!empty($order->customer_notes))
            <div class="mt-2 text-[11px] bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg text-amber-900 dark:text-amber-200">
                <strong>Catatan:</strong> {{ $order->customer_notes }}
            </div>
        @endif
    </div>

    {{-- Daftar Menu / Item --}}
    <div>
        <h4 class="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">Item Pesanan</h4>
        <div class="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:border-gray-700 dark:divide-gray-800 overflow-hidden">
            @foreach($order->items as $item)
                <div class="p-3 flex items-start justify-between gap-3 bg-white dark:bg-gray-900">
                    <div class="space-y-0.5">
                        <div class="font-bold text-gray-900 dark:text-white">
                            {{ $item->product_name }}
                        </div>
                        @if($item->variant_label)
                            <div class="text-[11px] text-gray-500">
                                Varian: <span class="font-medium text-gray-700 dark:text-gray-300">{{ $item->variant_label }}</span>
                            </div>
                        @endif
                        @if($item->custom_notes)
                            <div class="text-[10px] italic text-amber-700 dark:text-amber-400">
                                {{ $item->custom_notes }}
                            </div>
                        @endif
                        <div class="text-[11px] text-gray-500">
                            {{ $item->quantity }} x Rp {{ number_format($item->price, 0, ',', '.') }}
                        </div>
                    </div>
                    <div class="text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        Rp {{ number_format($item->subtotal, 0, ',', '.') }}
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    {{-- Rincian Total --}}
    <div class="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60 space-y-1.5 text-xs">
        <div class="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal ({{ $order->items->sum('quantity') }} item)</span>
            <span>Rp {{ number_format($order->subtotal ?: $order->total_amount, 0, ',', '.') }}</span>
        </div>
        @if($order->shipping_cost > 0)
            <div class="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Ongkir / Biaya Kirim</span>
                <span>Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</span>
            </div>
        @endif
        <div class="flex justify-between border-t border-gray-200 pt-1.5 font-black text-sm text-gray-900 dark:border-gray-700 dark:text-white">
            <span>Total Tagihan</span>
            <span class="text-amber-600 dark:text-amber-400">Rp {{ number_format($order->total_amount, 0, ',', '.') }}</span>
        </div>
    </div>

    {{-- Detail Refund Jika Dibatalkan --}}
    @if($order->status === 'cancelled' || !empty($order->payment_details['refund']))
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200 space-y-1">
            <div class="font-bold flex items-center gap-1.5">
                <span>⚠️ Informasi Pengembalian Dana (Refund)</span>
            </div>
            <div class="text-[11px]">
                <div><strong>Alasan:</strong> {{ $order->payment_details['refund_reason'] ?? '-' }}</div>
                <div><strong>Diproses oleh:</strong> {{ $order->payment_details['refunded_by_name'] ?? '-' }}</div>
                @if(!empty($order->payment_details['refunded_at']))
                    <div><strong>Waktu:</strong> {{ \Carbon\Carbon::parse($order->payment_details['refunded_at'])->format('d M Y, H:i') }}</div>
                @endif
            </div>
        </div>
    @endif
</div>
