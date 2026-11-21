<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PosCashFlow;
use App\Models\PosHeldOrder;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use App\Services\PosProfitLossExcelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    /**
     * Render the POS application interface.
     */
    public function index(): Response
    {
        $products = $this->getPosProducts();
        $categories = $this->getPosCategories();

        $user = auth()->user();
        $isStaffCashier = (bool) ($user && $user->isKasir() && ! $user->isAdmin() && ! $user->isOwner());

        $recentOrdersQuery = Order::where(function ($query) {
            $query->where('order_number', 'like', 'POS-%')
                ->orWhere('payment_details->source', 'pos');
        });

        if ($isStaffCashier && $user) {
            $recentOrdersQuery->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('payment_details->cashier_id', $user->id);
            });
        }

        $recentOrders = $recentOrdersQuery
            ->whereDate('created_at', now()->format('Y-m-d'))
            ->latest('created_at')
            ->take(50)
            ->with('items')
            ->get()
            ->map(fn (Order $o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'customer_name' => $o->customer_name,
                'customer_phone' => $o->customer_phone,
                'customer_address' => $o->customer_address,
                'shipping_cost' => (float) $o->shipping_cost,
                'shipping_courier' => $o->shipping_courier,
                'shipping_service' => $o->shipping_service,
                'total_amount' => (float) $o->total_amount,
                'subtotal' => (float) $o->subtotal,
                'payment_method' => $o->payment_method,
                'payment_method_label' => $o->payment_method_label,
                'payment_status' => $o->payment_status,
                'payment_status_label' => $o->payment_status_label,
                'status' => $o->status,
                'status_label' => $o->status_label,
                'refunded_at' => $o->payment_details['refunded_at'] ?? null,
                'refund_reason' => $o->payment_details['refund_reason'] ?? null,
                'refunded_by_name' => $o->payment_details['refunded_by_name'] ?? null,
                'refund_amount' => isset($o->payment_details['refund_amount']) ? (float) $o->payment_details['refund_amount'] : null,
                'created_at' => $o->created_at->format('d/m/Y H:i'),
                'items_count' => $o->items->sum('quantity'),
                'items' => $o->items->map(fn (OrderItem $i) => [
                    'product_name' => $i->product_name,
                    'variant_label' => $i->variant_label,
                    'price' => (float) $i->price,
                    'quantity' => $i->quantity,
                    'subtotal' => (float) $i->subtotal,
                ]),
                'payment_details' => $o->payment_details,
            ]);

        $settings = Setting::all()->pluck('value', 'key')->toArray();

        // Printer & Receipt Settings
        $defaultPrinterSettings = [
            'paper_width' => '80mm',
            'store_name' => $settings['store_name'] ?? 'Kasir Sanubari',
            'tagline' => $settings['store_tagline'] ?? 'Menyentuh Hati, Merangkai Cerita',
            'address' => $settings['address'] ?? $settings['store_address'] ?? 'Jl. Candi Mendut No. 3, Lowokwaru, Kota Malang',
            'phone' => $settings['whatsapp_number'] ?? $settings['phone'] ?? '0851-2193-0454',
            'instagram' => $settings['instagram_handle'] ?? '@kasir.sanubari',
            'receipt_footer' => "Terima kasih atas kunjungan Anda!\nFreshly Roasted with Heart.",
            'auto_print' => false,
            'printer_name' => 'Kassen BTP-3100',
            'printer_driver' => 'Kassen BTP-3100',
            'receipt_columns' => 44,
            'receipt_columns_58mm' => 32,
            'receipt_columns_80mm' => 44,
            'custom_paper_width_mm' => 80,
            'custom_printable_width_mm' => 72,
            'custom_receipt_columns' => 44,
            'max_item_name_length' => 30,
            'margin_horizontal' => '1mm',
            'margin_feed_lines' => 2,
            'copies' => 1,
            'show_logo' => true,
            'formatting' => 'formatted',
            'open_cash_drawer' => true,
            'line_display' => 'none',
            'is_cashier_printer' => true,
            'font_family' => 'monospace',
            'font_size' => 'normal',
            'font_weight' => 'bold',
            'connection_type' => 'usb',
            'usb_printer_name' => 'Kassen BTP-3100',
        ];
        $printerSettings = array_merge(
            $defaultPrinterSettings,
            is_array($settings['pos_printer_settings'] ?? null) ? $settings['pos_printer_settings'] : []
        );

        // Layout & Grid Settings
        $defaultLayoutSettings = [
            'grid_density' => 'normal',
            'grid_columns' => 'auto',
        ];
        $layoutSettings = array_merge(
            $defaultLayoutSettings,
            is_array($settings['pos_layout_settings'] ?? null) ? $settings['pos_layout_settings'] : []
        );

        // Payment Settings
        $paymentSettings = $settings['pos_payment_settings'] ?? [
            'enable_cash' => true,
            'enable_qris' => true,
            'enable_debit' => true,
            'enable_bank_transfer' => true,
            'qris_instructions' => 'Tunjukkan kode QRIS Kasir Sanubari di meja kasir.',
            'bank_info' => 'BCA 123-456-7890 a/n Sanubari Roastery',
        ];

        // Today's Cash Flow Summary
        $todayDate = now()->format('Y-m-d');
        $cashSalesQuery = Order::where(function ($q) {
            $q->where('order_number', 'like', 'POS-%')->orWhere('payment_details->source', 'pos');
        })
            ->where('payment_method', 'cash')
            ->where('payment_status', 'paid')
            ->whereDate('created_at', $todayDate);

        $refundsQuery = Order::where(function ($q) {
            $q->where('order_number', 'like', 'POS-%')->orWhere('payment_details->source', 'pos');
        })
            ->where('payment_status', 'refunded')
            ->whereDate('updated_at', $todayDate);

        $cashInQuery = PosCashFlow::whereDate('recorded_at', $todayDate)->where('type', 'in');
        $cashOutQuery = PosCashFlow::whereDate('recorded_at', $todayDate)->where('type', 'out');

        if ($isStaffCashier && $user) {
            $cashSalesQuery->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('payment_details->cashier_id', $user->id);
            });
            $refundsQuery->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('payment_details->cashier_id', $user->id);
            });
            $cashInQuery->where('user_id', $user->id);
            $cashOutQuery->where('user_id', $user->id);
        }

        $todayCashSales = (float) $cashSalesQuery->sum('total_amount');
        $todayRefunds = (float) $refundsQuery->sum('total_amount');
        $todayRefundCount = $refundsQuery->count();
        $todayCashIn = (float) $cashInQuery->sum('amount');
        $todayCashOut = (float) $cashOutQuery->sum('amount');

        $cashDrawerToday = [
            'cash_sales' => $todayCashSales,
            'refund_total' => $todayRefunds,
            'refund_count' => $todayRefundCount,
            'cash_in' => $todayCashIn,
            'cash_out' => $todayCashOut,
            'net_cash' => $todayCashSales + $todayCashIn - $todayCashOut,
        ];

        $heldOrders = PosHeldOrder::holding()
            ->with('user')
            ->get()
            ->map(fn (PosHeldOrder $h) => [
                'id' => $h->id,
                'queue_number' => $h->queue_number,
                'customer_name' => $h->customer_name,
                'customer_phone' => $h->customer_phone,
                'notes' => $h->notes,
                'items' => $h->items,
                'items_count' => collect($h->items)->sum('quantity'),
                'subtotal' => (float) $h->subtotal,
                'discount_amount' => (float) $h->discount_amount,
                'total_amount' => (float) $h->total_amount,
                'held_at' => $h->held_at ? $h->held_at->format('H:i') : $h->created_at->format('H:i'),
                'cashier_name' => $h->user?->name ?? 'Kasir',
            ]);

        return Inertia::render('pos', [
            'products' => $products,
            'categories' => $categories,
            'recentOrders' => $recentOrders,
            'heldOrders' => $heldOrders,
            'queueOrders' => $heldOrders,
            'printerSettings' => $printerSettings,
            'paymentSettings' => $paymentSettings,
            'layoutSettings' => $layoutSettings,
            'byobSettings' => Setting::get('byob_settings', []),
            'cashDrawerToday' => $cashDrawerToday,
            'settings' => [
                'printer' => $printerSettings,
                'payments' => $paymentSettings,
                'layout' => $layoutSettings,
            ],
            'todayCashDrawer' => $cashDrawerToday,
            'cashier' => [
                'id' => auth()->id(),
                'name' => auth()->user()?->name ?? 'Kasir Sanubari',
                'email' => auth()->user()?->email,
                'role' => auth()->user()?->role ?? 'kasir',
                'is_owner' => auth()->user() && auth()->user()->isOwner(),
                'is_admin' => auth()->user() && auth()->user()->isAdmin(),
                'is_staff_restricted' => $isStaffCashier,
                'can_view_profit_loss' => auth()->user() && (auth()->user()->isAdmin() || auth()->user()->isOwner()),
            ],
            'staffList' => (auth()->user() && (auth()->user()->isOwner() || auth()->user()->isAdmin()))
                ? User::query()
                    ->whereIn('role', ['owner', 'admin', 'kasir'])
                    ->orWhere('id', 1)
                    ->orderBy('name')
                    ->get(['id', 'name', 'email', 'role', 'phone', 'created_at'])
                : [],
        ]);
    }

    /**
     * Process checkout for POS order.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer',
            'items.*.variant_id' => 'nullable|integer',
            'items.*.product_name' => 'nullable|string|max:255',
            'items.*.variant_label' => 'nullable|string|max:100',
            'items.*.cost_price' => 'nullable|numeric|min:0',
            'items.*.price' => 'nullable|numeric|min:0',
            'items.*.is_manual' => 'nullable|boolean',
            'items.*.quantity' => 'required|integer|min:1|max:9999',
            'items.*.notes' => 'nullable|string|max:255',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
            'items.*.discount_type' => 'nullable|string|in:fixed,percent',
            'items.*.discount_value' => 'nullable|numeric|min:0',
            'payment_method' => 'required|string|in:cash,qris,debit,bank_transfer',
            'cash_tendered' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'customer_name' => 'nullable|string|max:100',
            'customer_phone' => 'nullable|string|max:30',
            'customer_address' => 'nullable|string|max:500',
            'shipping_cost' => 'nullable|numeric|min:0',
            'shipping_courier' => 'nullable|string|max:100',
            'shipping_service' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($validated) {
            $subtotal = 0;
            $totalItemDiscounts = 0;
            $orderLines = [];

            foreach ($validated['items'] as $itemData) {
                $variantId = $itemData['variant_id'] ?? null;
                $isManual = ! empty($itemData['is_manual']) || empty($variantId) || $variantId <= 0;

                if ($isManual) {
                    $product = null;
                    $variant = null;
                    $price = max(0, (float) ($itemData['price'] ?? 0));
                    $costPrice = isset($itemData['cost_price']) && $itemData['cost_price'] !== null && $itemData['cost_price'] !== ''
                        ? max(0, (float) $itemData['cost_price'])
                        : 0.0;
                    $productName = ! empty($itemData['product_name']) ? trim($itemData['product_name']) : 'Item Manual';
                    $variantLabel = ! empty($itemData['variant_label']) ? trim($itemData['variant_label']) : 'Manual';
                } else {
                    $variant = ProductVariant::with('product')->lockForUpdate()->find($variantId);
                    if (! $variant) {
                        $product = null;
                        $price = max(0, (float) ($itemData['price'] ?? 0));
                        $costPrice = isset($itemData['cost_price']) && $itemData['cost_price'] !== null && $itemData['cost_price'] !== ''
                            ? max(0, (float) $itemData['cost_price'])
                            : 0.0;
                        $productName = ! empty($itemData['product_name']) ? trim($itemData['product_name']) : 'Item Manual';
                        $variantLabel = ! empty($itemData['variant_label']) ? trim($itemData['variant_label']) : 'Manual';
                    } else {
                        $product = $variant->product;
                        $isByob = $product && ($product->slug === 'byob' || $product->series === 'cybr' || $product->series === 'custom-blend');
                        $price = ($isByob && isset($itemData['price']) && (float) $itemData['price'] > 0)
                            ? (float) $itemData['price']
                            : (float) $variant->price;
                        $costPrice = isset($itemData['cost_price']) && $itemData['cost_price'] !== null && $itemData['cost_price'] !== ''
                            ? max(0, (float) $itemData['cost_price'])
                            : (float) ($variant->cost_price ?? 0);
                        $productName = ($isByob && ! empty($itemData['product_name']))
                            ? trim($itemData['product_name'])
                            : ($product ? $product->name : ($itemData['product_name'] ?? 'Item Produk'));
                        $variantLabel = ($isByob && ! empty($itemData['variant_label']))
                            ? trim($itemData['variant_label'])
                            : ($variant->label ?: ($itemData['variant_label'] ?? 'Standar'));
                    }
                }

                $quantity = (int) $itemData['quantity'];
                $lineGross = $price * $quantity;
                $itemDiscount = max(0, min($lineGross, (float) ($itemData['discount_amount'] ?? 0)));
                $lineSubtotal = max(0, $lineGross - $itemDiscount);

                $subtotal += $lineGross;
                $totalItemDiscounts += $itemDiscount;

                $notes = $itemData['notes'] ?? null;
                if ($itemDiscount > 0) {
                    $discountNote = 'Diskon: -Rp '.number_format($itemDiscount, 0, ',', '.');
                    $notes = $notes ? "{$notes} ({$discountNote})" : $discountNote;
                }

                $orderLines[] = [
                    'product_id' => $product?->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $productName,
                    'variant_label' => $variantLabel,
                    'grind_option' => null,
                    'cost_price' => $costPrice,
                    'price' => $price,
                    'quantity' => $quantity,
                    'subtotal' => $lineSubtotal,
                    'custom_notes' => $notes,
                ];
            }

            // Global cart discount is applied on remaining subtotal
            $cartDiscount = max(0, min(max(0, $subtotal - $totalItemDiscounts), (float) ($validated['discount_amount'] ?? 0)));
            $totalDiscount = $totalItemDiscounts + $cartDiscount;
            $shippingCost = max(0, (float) ($validated['shipping_cost'] ?? 0));
            $totalAmount = max(0, ($subtotal - $totalDiscount) + $shippingCost);

            $cashTendered = (float) ($validated['cash_tendered'] ?? 0);
            $cashChange = ($validated['payment_method'] === 'cash')
                ? max(0, $cashTendered - $totalAmount)
                : 0;

            $isShipping = $shippingCost > 0 || ! empty($validated['customer_address']) || ! empty($validated['shipping_courier']);
            $customerAddress = ! empty($validated['customer_address'])
                ? trim($validated['customer_address'])
                : ($isShipping ? 'Alamat Pengiriman' : 'Toko Fisik / POS Kasir');
            $shippingCourier = ! empty($validated['shipping_courier'])
                ? trim($validated['shipping_courier'])
                : ($shippingCost > 0 ? 'Kurir Ekspedisi' : 'POS Kasir (Retail Langsung)');
            $shippingService = ! empty($validated['shipping_service'])
                ? trim($validated['shipping_service'])
                : ($shippingCost > 0 ? 'Pengiriman' : 'Langsung Diterima');

            $orderNumber = Order::generatePosOrderNumber();

            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => $orderNumber,
                'customer_name' => ! empty($validated['customer_name']) ? trim($validated['customer_name']) : 'Pelanggan Kasir',
                'customer_phone' => ! empty($validated['customer_phone']) ? trim($validated['customer_phone']) : '-',
                'customer_address' => $customerAddress,
                'customer_notes' => $validated['notes'] ?? null,
                'shipping_courier' => $shippingCourier,
                'shipping_service' => $shippingService,
                'shipping_cost' => $shippingCost,
                'total_weight_grams' => 0,
                'payment_method' => $validated['payment_method'],
                'payment_channel' => match ($validated['payment_method']) {
                    'qris' => 'QRIS Toko Resmi',
                    'debit' => 'Mesin EDC',
                    'bank_transfer' => 'Transfer Bank',
                    default => 'Kasir Tunai',
                },
                'payment_status' => 'paid',
                'status' => 'completed',
                'subtotal' => $subtotal,
                'unique_code' => 0,
                'total_amount' => $totalAmount,
                'paid_at' => now(),
                'payment_details' => [
                    'source' => 'pos',
                    'cashier_id' => auth()->id(),
                    'cashier_name' => auth()->user()?->name ?? 'Kasir',
                    'cash_tendered' => $cashTendered,
                    'cash_change' => $cashChange,
                    'item_discounts' => $totalItemDiscounts,
                    'cart_discount' => $cartDiscount,
                    'discount_amount' => $totalDiscount,
                    'shipping_cost' => $shippingCost,
                    'shipping_courier' => $shippingCourier,
                    'customer_address' => $customerAddress,
                    'discount_breakdown' => [
                        'item_discounts' => $totalItemDiscounts,
                        'cart_discount' => $cartDiscount,
                        'total_discount' => $totalDiscount,
                    ],
                    'notes' => $validated['notes'] ?? null,
                ],
            ]);

            foreach ($orderLines as $line) {
                $order->items()->create($line);
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi POS berhasil dicatat.',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'customer_phone' => $order->customer_phone,
                    'customer_address' => $order->customer_address,
                    'shipping_cost' => (float) $order->shipping_cost,
                    'shipping_courier' => $order->shipping_courier,
                    'shipping_service' => $order->shipping_service,
                    'payment_method' => $order->payment_method,
                    'payment_method_label' => $order->payment_method_label,
                    'subtotal' => (float) $order->subtotal,
                    'discount_amount' => (float) $totalDiscount,
                    'item_discounts' => (float) $totalItemDiscounts,
                    'cart_discount' => (float) $cartDiscount,
                    'total_amount' => (float) $order->total_amount,
                    'cash_tendered' => $cashTendered,
                    'cash_change' => $cashChange,
                    'created_at' => $order->created_at->format('d/m/Y H:i'),
                    'items_count' => count($orderLines),
                    'items' => $order->items->map(fn (OrderItem $i) => [
                        'product_name' => $i->product_name,
                        'variant_label' => $i->variant_label,
                        'price' => (float) $i->price,
                        'quantity' => $i->quantity,
                        'subtotal' => (float) $i->subtotal,
                    ]),
                ],
            ]);
        });
    }

    /**
     * Get Sales Report (Harian, Bulanan, Custom).
     */
    public function reports(Request $request): JsonResponse
    {
        $user = auth()->user();
        $isStaffCashier = (bool) ($user && $user->isKasir() && ! $user->isAdmin() && ! $user->isOwner());

        $period = $request->input('period', 'daily');

        if ($period === 'monthly') {
            $monthStr = $request->input('month', now()->format('Y-m'));
            $start = Carbon::parse($monthStr.'-01')->startOfMonth();
            $end = Carbon::parse($monthStr.'-01')->endOfMonth();
            $periodTitle = 'Bulan '.$start->format('F Y');
        } elseif ($period === 'custom') {
            $startDate = $request->input('start_date', now()->subDays(7)->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->format('Y-m-d'));
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
            $periodTitle = $start->format('d/m/Y').' - '.$end->format('d/m/Y');
        } else {
            // daily
            $dateStr = $request->input('date', now()->format('Y-m-d'));
            $start = Carbon::parse($dateStr)->startOfDay();
            $end = Carbon::parse($dateStr)->endOfDay();
            $periodTitle = 'Hari '.$start->format('d/m/Y');
        }

        // Determine staff scope
        $staffOptions = [];
        $staffBreakdown = [];
        $activeStaffId = 'all';
        $activeStaffName = 'Semua Staf Kasir';

        if ($isStaffCashier && $user) {
            // Strict: Cashier staff can ONLY see their own sales
            $activeStaffId = (string) $user->id;
            $activeStaffName = $user->name;
            $periodTitle .= " (Shift: {$user->name})";
        } else {
            // Owner / Admin can filter by staff_id or view all
            $requestedStaffId = (string) $request->input('staff_id', 'all');
            if ($requestedStaffId !== 'all' && is_numeric($requestedStaffId)) {
                $targetUser = User::find($requestedStaffId);
                if ($targetUser) {
                    $activeStaffId = (string) $targetUser->id;
                    $activeStaffName = $targetUser->name;
                    $periodTitle .= " (Staf: {$targetUser->name})";
                }
            }
        }

        $ordersQuery = Order::where(function ($query) {
            $query->where('order_number', 'like', 'POS-%')
                ->orWhere('payment_details->source', 'pos');
        })
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end]);

        $refundedQuery = Order::where(function ($query) {
            $query->where('order_number', 'like', 'POS-%')
                ->orWhere('payment_details->source', 'pos');
        })
            ->where('payment_status', 'refunded')
            ->whereBetween('updated_at', [$start, $end]);

        $cashFlowInQuery = PosCashFlow::where('type', 'in')->whereBetween('recorded_at', [$start, $end]);
        $cashFlowOutQuery = PosCashFlow::where('type', 'out')->whereBetween('recorded_at', [$start, $end]);

        if ($activeStaffId !== 'all') {
            $filterId = (int) $activeStaffId;
            $staffFilterFn = function ($q) use ($filterId) {
                $q->where('user_id', $filterId)
                    ->orWhere('payment_details->cashier_id', $filterId);
            };
            $ordersQuery->where($staffFilterFn);
            $refundedQuery->where($staffFilterFn);
            $cashFlowInQuery->where('user_id', $filterId);
            $cashFlowOutQuery->where('user_id', $filterId);
        }

        $orders = (clone $ordersQuery)->with('items')->latest()->get();

        $totalRefunds = (float) $refundedQuery->sum('total_amount');
        $refundTransactions = $refundedQuery->count();

        $totalRevenue = (float) $orders->sum('total_amount');
        $totalTransactions = $orders->count();
        $averageOrderValue = $totalTransactions > 0 ? (float) round($totalRevenue / $totalTransactions) : 0;

        // Payment Breakdown
        $methods = [
            'cash' => 'Tunai (Cash)',
            'qris' => 'QRIS',
            'debit' => 'Kartu Debit / EDC',
            'bank_transfer' => 'Transfer Bank',
        ];

        $paymentBreakdown = [];
        foreach ($methods as $mKey => $mLabel) {
            $matching = $orders->where('payment_method', $mKey);
            $paymentBreakdown[] = [
                'method' => $mKey,
                'label' => $mLabel,
                'count' => $matching->count(),
                'total' => (float) $matching->sum('total_amount'),
            ];
        }

        // Cash Drawer Breakdown
        $cashSales = (float) $orders->where('payment_method', 'cash')->sum('total_amount');
        $cashIn = (float) $cashFlowInQuery->sum('amount');
        $cashOut = (float) $cashFlowOutQuery->sum('amount');
        $netCash = $cashSales + $cashIn - $cashOut;

        // Top Selling Products
        $orderIds = $orders->pluck('id')->toArray();
        $topProducts = [];

        if (! empty($orderIds)) {
            $topProducts = OrderItem::whereIn('order_id', $orderIds)
                ->select('product_name', 'variant_label', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_rev'))
                ->groupBy('product_name', 'variant_label')
                ->orderByDesc('total_qty')
                ->take(10)
                ->get()
                ->map(fn ($r) => [
                    'name' => $r->product_name,
                    'variant' => $r->variant_label,
                    'quantity' => (int) $r->total_qty,
                    'total' => (float) $r->total_rev,
                ])
                ->toArray();
        }

        // For Owner/Admin: calculate staffBreakdown and staffOptions
        if (! $isStaffCashier) {
            $allStaffUsers = User::whereIn('role', ['kasir', 'admin', 'owner'])
                ->orWhere('id', 1)
                ->orderBy('name')
                ->get(['id', 'name', 'role', 'email']);

            $staffOptions = $allStaffUsers->map(fn ($u) => [
                'id' => (string) $u->id,
                'name' => $u->name,
                'role' => $u->role,
            ])->toArray();

            // All paid POS orders in that period to compute breakdown
            $allPeriodOrders = Order::where(function ($query) {
                $query->where('order_number', 'like', 'POS-%')
                    ->orWhere('payment_details->source', 'pos');
            })
                ->where('payment_status', 'paid')
                ->whereBetween('created_at', [$start, $end])
                ->get();

            $totalAllRevenue = (float) $allPeriodOrders->sum('total_amount');
            $userMap = $allStaffUsers->keyBy('id');

            $grouped = $allPeriodOrders->groupBy(function ($o) {
                return (string) ($o->payment_details['cashier_id'] ?? $o->user_id ?? 0);
            });

            foreach ($grouped as $staffIdKey => $staffOrders) {
                $numericStaffId = (int) $staffIdKey;
                $stafObj = $userMap->get($numericStaffId);
                $stafName = $stafObj?->name ?? ($staffOrders->first()->payment_details['cashier_name'] ?? 'Kasir #'.$staffIdKey);
                $stafRole = $stafObj?->role ?? 'kasir';
                $stafRev = (float) $staffOrders->sum('total_amount');
                $stafCash = (float) $staffOrders->where('payment_method', 'cash')->sum('total_amount');
                $stafNonCash = $stafRev - $stafCash;
                $stafTrx = $staffOrders->count();

                $staffBreakdown[] = [
                    'staff_id' => (string) $staffIdKey,
                    'name' => $stafName,
                    'role' => $stafRole,
                    'total_revenue' => $stafRev,
                    'total_transactions' => $stafTrx,
                    'cash_sales' => $stafCash,
                    'non_cash_sales' => $stafNonCash,
                    'average_order_value' => $stafTrx > 0 ? round($stafRev / $stafTrx) : 0,
                    'percentage' => $totalAllRevenue > 0 ? round(($stafRev / $totalAllRevenue) * 100, 1) : 0,
                ];
            }

            usort($staffBreakdown, fn ($a, $b) => $b['total_revenue'] <=> $a['total_revenue']);
        }

        $reportPayload = [
            'period' => $period,
            'period_title' => $periodTitle,
            'start_date' => $start->format('Y-m-d H:i:s'),
            'end_date' => $end->format('Y-m-d H:i:s'),
            'is_staff_restricted' => $isStaffCashier,
            'active_staff_id' => $activeStaffId,
            'active_staff_name' => $activeStaffName,
            'staff_options' => $staffOptions,
            'staff_breakdown' => $staffBreakdown,
            'total_revenue' => $totalRevenue,
            'total_transactions' => $totalTransactions,
            'total_refunds' => $totalRefunds,
            'refund_transactions' => $refundTransactions,
            'average_order_value' => $averageOrderValue,
            'payment_breakdown' => $paymentBreakdown,
            'cash_drawer' => [
                'cash_sales' => $cashSales,
                'cash_in' => $cashIn,
                'cash_out' => $cashOut,
                'net_cash' => $netCash,
            ],
            'top_products' => $topProducts,
            'orders' => $orders->take(50)->map(fn (Order $o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'customer_name' => $o->customer_name,
                'total_amount' => (float) $o->total_amount,
                'payment_method_label' => $o->payment_method_label,
                'items_count' => $o->items->sum('quantity'),
                'created_at' => $o->created_at->format('d/m/Y H:i'),
            ]),
        ];

        return response()->json(array_merge([
            'success' => true,
            'report' => $reportPayload,
        ], $reportPayload));
    }

    /**
     * Get Profit & Loss Report (Laporan Laba Rugi POS).
     * Filterable by: today, yesterday, this_month, last_month, custom_month.
     */
    public function profitLossReport(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || (! $user->isAdmin() && ! $user->isOwner())) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan laba rugi hanya dapat diakses oleh akun Admin dan Owner.',
            ], 403);
        }

        $payload = $this->calculateProfitLossData($request);

        return response()->json(array_merge([
            'success' => true,
            'profit_loss' => $payload,
        ], $payload));
    }

    /**
     * Export Profit & Loss Report as multi-sheet Excel (.xlsx).
     */
    public function exportProfitLossExcel(Request $request, PosProfitLossExcelService $excelService): \Illuminate\Http\Response
    {
        $user = $request->user();
        if (! $user || (! $user->isAdmin() && ! $user->isOwner())) {
            abort(403, 'Laporan laba rugi hanya dapat diakses oleh akun Admin dan Owner.');
        }

        $data = $this->calculateProfitLossData($request);
        $xlsx = $excelService->generate($data);

        $periodSlug = Str::slug($data['period_title'] ?? 'laporan-laba-rugi');
        $filename = "Laporan_Laba_Rugi_Kasir_Sanubari_{$periodSlug}_".now()->format('Ymd_His').'.xlsx';

        return response((string) $xlsx, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0, no-cache, no-store, must-revalidate',
        ]);
    }

    /**
     * Core calculation logic for Profit & Loss Report.
     */
    protected function calculateProfitLossData(Request $request): array
    {
        $period = $request->input('period', 'today');

        if ($period === 'yesterday') {
            $start = Carbon::yesterday()->startOfDay();
            $end = Carbon::yesterday()->endOfDay();
            $periodTitle = 'Kemarin ('.$start->format('d/m/Y').')';
        } elseif ($period === 'this_month') {
            $start = Carbon::now()->startOfMonth();
            $end = Carbon::now()->endOfMonth();
            $periodTitle = 'Bulan Ini ('.$start->translatedFormat('F Y').')';
        } elseif ($period === 'last_month') {
            $start = Carbon::now()->subMonth()->startOfMonth();
            $end = Carbon::now()->subMonth()->endOfMonth();
            $periodTitle = 'Bulan Lalu ('.$start->translatedFormat('F Y').')';
        } elseif ($period === 'custom_month') {
            $monthStr = $request->input('month', Carbon::now()->format('Y-m'));
            $start = Carbon::parse($monthStr.'-01')->startOfMonth();
            $end = Carbon::parse($monthStr.'-01')->endOfMonth();
            $periodTitle = 'Bulan '.$start->translatedFormat('F Y');
        } else {
            // today or specific date
            $dateStr = $request->input('date', Carbon::today()->format('Y-m-d'));
            $start = Carbon::parse($dateStr)->startOfDay();
            $end = Carbon::parse($dateStr)->endOfDay();
            $periodTitle = ($dateStr === Carbon::today()->format('Y-m-d'))
                ? 'Hari Ini ('.$start->format('d/m/Y').')'
                : 'Tanggal '.$start->format('d/m/Y');
        }

        // Paid POS Orders
        $ordersQuery = Order::where(function ($query) {
            $query->where('order_number', 'like', 'POS-%')
                ->orWhere('payment_details->source', 'pos');
        })
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end]);

        $orders = (clone $ordersQuery)->with(['items.variant'])->latest()->get();

        $totalTransactions = $orders->count();
        $netSales = (float) $orders->sum('total_amount');
        $grossSales = 0.0;
        $totalCogs = 0.0;
        $itemsSold = 0;
        $itemsWithHppCount = 0;
        $itemsWithoutHppCount = 0;
        $itemBreakdowns = [];
        $dailyTransactions = [];
        $dailyBreakdown = [];

        foreach ($orders as $order) {
            $orderCogs = 0.0;
            $orderGrossSales = 0.0;
            $orderItems = [];

            foreach ($order->items as $item) {
                $qty = (int) $item->quantity;
                $itemsSold += $qty;
                $itemSubtotal = (float) $item->subtotal;
                $grossSales += $itemSubtotal;
                $orderGrossSales += $itemSubtotal;

                $unitCost = ($item->cost_price !== null && $item->cost_price !== '')
                    ? (float) $item->cost_price
                    : (float) ($item->variant?->cost_price ?? 0);
                $itemCost = $qty * $unitCost;
                $totalCogs += $itemCost;
                $orderCogs += $itemCost;

                if ($unitCost > 0) {
                    $itemsWithHppCount += $qty;
                } else {
                    $itemsWithoutHppCount += $qty;
                }

                $key = $item->product_name.' ('.($item->variant_label ?: 'Standar').')';
                if (! isset($itemBreakdowns[$key])) {
                    $itemBreakdowns[$key] = [
                        'product_name' => $item->product_name,
                        'variant_label' => $item->variant_label ?: 'Standar',
                        'quantity' => 0,
                        'unit_price' => (float) $item->price,
                        'unit_cost' => $unitCost,
                        'total_revenue' => 0.0,
                        'total_cost' => 0.0,
                        'gross_profit' => 0.0,
                        'has_hpp' => $unitCost > 0,
                    ];
                }

                $itemBreakdowns[$key]['quantity'] += $qty;
                $itemBreakdowns[$key]['total_revenue'] += $itemSubtotal;
                $itemBreakdowns[$key]['total_cost'] += $itemCost;
                $itemBreakdowns[$key]['gross_profit'] += ($itemSubtotal - $itemCost);

                $orderItems[] = [
                    'product_name' => $item->product_name,
                    'variant_label' => $item->variant_label ?: 'Standar',
                    'quantity' => $qty,
                    'price' => (float) $item->price,
                    'unit_cost' => $unitCost,
                    'subtotal' => $itemSubtotal,
                    'total_cost' => $itemCost,
                    'gross_profit' => ($itemSubtotal - $itemCost),
                    'has_hpp' => $unitCost > 0,
                ];
            }

            $orderNetSales = (float) $order->total_amount;
            $orderGrossProfit = $orderNetSales - $orderCogs;
            $orderMarginPct = $orderNetSales > 0 ? round(($orderGrossProfit / $orderNetSales) * 100, 1) : 0.0;

            $dailyTransactions[] = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name ?: 'Pelanggan Kasir',
                'customer_phone' => $order->customer_phone,
                'payment_method' => $order->payment_method,
                'payment_method_label' => $order->payment_method_label,
                'created_at_formatted' => $order->created_at->format('d/m/Y H:i'),
                'created_time' => $order->created_at->format('H:i'),
                'created_date' => $order->created_at->format('Y-m-d'),
                'items_count' => $order->items->sum('quantity'),
                'gross_sales' => $orderGrossSales,
                'discount_amount' => (float) $order->discount_amount,
                'net_sales' => $orderNetSales,
                'total_cogs' => $orderCogs,
                'gross_profit' => $orderGrossProfit,
                'margin_pct' => $orderMarginPct,
                'items' => $orderItems,
            ];

            // For monthly: aggregate by day
            $dateKey = $order->created_at->format('Y-m-d');
            if (! isset($dailyBreakdown[$dateKey])) {
                $carbonDate = Carbon::parse($dateKey);
                $dailyBreakdown[$dateKey] = [
                    'date' => $dateKey,
                    'date_label' => $carbonDate->translatedFormat('d F Y'),
                    'short_date' => $carbonDate->format('d/m'),
                    'day_name' => $carbonDate->translatedFormat('l'),
                    'total_transactions' => 0,
                    'items_sold' => 0,
                    'net_sales' => 0.0,
                    'total_cogs' => 0.0,
                    'gross_profit' => 0.0,
                    'total_expenses' => 0.0,
                    'net_profit' => 0.0,
                ];
            }

            $dailyBreakdown[$dateKey]['total_transactions'] += 1;
            $dailyBreakdown[$dateKey]['items_sold'] += $order->items->sum('quantity');
            $dailyBreakdown[$dateKey]['net_sales'] += $orderNetSales;
            $dailyBreakdown[$dateKey]['total_cogs'] += $orderCogs;
            $dailyBreakdown[$dateKey]['gross_profit'] += $orderGrossProfit;
        }

        $totalDiscounts = max(0.0, round($grossSales - $netSales, 2));
        $grossProfit = $netSales - $totalCogs;
        $grossMarginPct = $netSales > 0 ? round(($grossProfit / $netSales) * 100, 2) : 0.0;

        // Cash Flow Expenses (Beban Kas Keluar)
        $expenseQuery = PosCashFlow::where('type', 'out')
            ->whereBetween('recorded_at', [$start, $end]);
        $totalExpenses = (float) (clone $expenseQuery)->sum('amount');

        $expenseCategories = [
            'operasional' => 'Operasional Toko',
            'bahan_baku' => 'Bahan Baku & Tambahan',
            'kebersihan' => 'Kebersihan & Perlengkapan',
            'transport' => 'Transport & Logistik',
            'gaji' => 'Upah & Gaji Kasir/Barista',
            'lainnya' => 'Pengeluaran Lainnya',
        ];

        $expenseList = (clone $expenseQuery)->with('user')->latest('recorded_at')->get();
        $expenseBreakdown = [];
        foreach ($expenseList->groupBy('category') as $cat => $records) {
            $catLabel = $expenseCategories[$cat] ?? ucfirst(str_replace('_', ' ', $cat));
            $expenseBreakdown[] = [
                'category' => $cat,
                'label' => $catLabel,
                'count' => $records->count(),
                'total' => (float) $records->sum('amount'),
                'records' => $records->map(fn ($r) => [
                    'id' => $r->id,
                    'category' => $r->category,
                    'category_label' => $catLabel,
                    'description' => $r->description ?: 'Pengeluaran Kas',
                    'amount' => (float) $r->amount,
                    'date' => $r->recorded_at->format('d/m/Y'),
                    'time' => $r->recorded_at->format('H:i'),
                    'date_time' => $r->recorded_at->format('d/m/Y H:i'),
                    'short_date_time' => $r->recorded_at->format('d/m H:i'),
                    'user_name' => $r->user?->name ?? 'Kasir',
                ])->values(),
            ];
        }

        $allExpenses = $expenseList->map(fn ($r) => [
            'id' => $r->id,
            'category' => $r->category,
            'category_label' => $expenseCategories[$r->category] ?? ucfirst(str_replace('_', ' ', $r->category)),
            'description' => $r->description ?: 'Pengeluaran Kas',
            'amount' => (float) $r->amount,
            'date' => $r->recorded_at->format('d/m/Y'),
            'time' => $r->recorded_at->format('H:i'),
            'date_time' => $r->recorded_at->format('d/m/Y H:i'),
            'short_date_time' => $r->recorded_at->format('d/m H:i'),
            'user_name' => $r->user?->name ?? 'Kasir',
        ])->values();

        // Calculate daily expenses and daily net profit for each day in dailyBreakdown
        $dailyExpensesMap = [];
        foreach ($expenseList as $exp) {
            $expDate = $exp->recorded_at->format('Y-m-d');
            $dailyExpensesMap[$expDate] = ($dailyExpensesMap[$expDate] ?? 0.0) + (float) $exp->amount;
        }

        // Also include days that had expenses even without order transactions
        foreach ($dailyExpensesMap as $dateKey => $expAmount) {
            if (! isset($dailyBreakdown[$dateKey])) {
                $carbonDate = Carbon::parse($dateKey);
                $dailyBreakdown[$dateKey] = [
                    'date' => $dateKey,
                    'date_label' => $carbonDate->translatedFormat('d F Y'),
                    'short_date' => $carbonDate->format('d/m'),
                    'day_name' => $carbonDate->translatedFormat('l'),
                    'total_transactions' => 0,
                    'items_sold' => 0,
                    'net_sales' => 0.0,
                    'total_cogs' => 0.0,
                    'gross_profit' => 0.0,
                    'total_expenses' => 0.0,
                    'net_profit' => 0.0,
                ];
            }
        }

        foreach ($dailyBreakdown as $dateKey => &$day) {
            $dayExp = $dailyExpensesMap[$dateKey] ?? 0.0;
            $day['total_expenses'] = $dayExp;
            $day['net_profit'] = $day['gross_profit'] - $dayExp;
            $day['margin_pct'] = $day['net_sales'] > 0
                ? round(($day['gross_profit'] / $day['net_sales']) * 100, 1)
                : 0.0;
            $day['net_margin_pct'] = $day['net_sales'] > 0
                ? round(($day['net_profit'] / $day['net_sales']) * 100, 1)
                : 0.0;
        }
        unset($day);

        // Sort dailyBreakdown by date descending
        krsort($dailyBreakdown);
        $dailySummaryList = array_values($dailyBreakdown);

        // Pendapatan Lain-lain (di luar modal awal kasir)
        $otherIncome = (float) PosCashFlow::where('type', 'in')
            ->where('category', '!=', 'modal_awal')
            ->whereBetween('recorded_at', [$start, $end])
            ->sum('amount');

        // Laba Bersih (Net Profit)
        $netProfit = $grossProfit - $totalExpenses + $otherIncome;
        $netMarginPct = $netSales > 0 ? round(($netProfit / $netSales) * 100, 2) : 0.0;

        // Sort items by highest gross profit
        uasort($itemBreakdowns, fn ($a, $b) => $b['gross_profit'] <=> $a['gross_profit']);
        $topMarginProducts = array_values(array_slice($itemBreakdowns, 0, 50));

        $isMonthly = in_array($period, ['this_month', 'last_month', 'custom_month']);

        return [
            'period' => $period,
            'period_title' => $periodTitle,
            'is_monthly' => $isMonthly,
            'start_date' => $start->format('Y-m-d H:i:s'),
            'end_date' => $end->format('Y-m-d H:i:s'),
            'summary' => [
                'total_transactions' => $totalTransactions,
                'items_sold' => $itemsSold,
                'gross_sales' => $grossSales,
                'total_discounts' => $totalDiscounts,
                'net_sales' => $netSales,
                'total_cogs' => $totalCogs,
                'gross_profit' => $grossProfit,
                'gross_margin_pct' => $grossMarginPct,
                'total_expenses' => $totalExpenses,
                'other_income' => $otherIncome,
                'net_profit' => $netProfit,
                'net_margin_pct' => $netMarginPct,
                'items_with_hpp_count' => $itemsWithHppCount,
                'items_without_hpp_count' => $itemsWithoutHppCount,
            ],
            'expense_breakdown' => $expenseBreakdown,
            'expenses' => $allExpenses,
            'top_margin_products' => $topMarginProducts,
            'transactions' => $dailyTransactions,
            'daily_summary' => $dailySummaryList,
        ];
    }

    /**
     * Get Cash Flows (Pemasukan & Pengeluaran Kas Toko).
     * Filterable by: daily, this_month, custom_month.
     */
    public function getCashFlows(Request $request): JsonResponse
    {
        $period = $request->input('period', 'daily');

        if ($period === 'this_month') {
            $start = Carbon::now()->startOfMonth();
            $end = Carbon::now()->endOfMonth();
            $periodTitle = 'Bulan Ini ('.$start->translatedFormat('F Y').')';
            $isMonthly = true;
        } elseif ($period === 'custom_month') {
            $monthStr = $request->input('month', Carbon::now()->format('Y-m'));
            $start = Carbon::parse($monthStr.'-01')->startOfMonth();
            $end = Carbon::parse($monthStr.'-01')->endOfMonth();
            $periodTitle = 'Bulan '.$start->translatedFormat('F Y');
            $isMonthly = true;
        } else {
            // daily
            $date = $request->input('date', now()->format('Y-m-d'));
            $start = Carbon::parse($date)->startOfDay();
            $end = Carbon::parse($date)->endOfDay();
            $periodTitle = ($date === now()->format('Y-m-d'))
                ? 'Hari Ini ('.$start->format('d/m/Y').')'
                : 'Tanggal '.$start->format('d/m/Y');
            $isMonthly = false;
        }

        $user = auth()->user();
        $isStaffCashier = (bool) ($user && $user->isKasir() && ! $user->isAdmin() && ! $user->isOwner());

        $flowsQuery = PosCashFlow::whereBetween('recorded_at', [$start, $end]);
        $cashInQuery = PosCashFlow::whereBetween('recorded_at', [$start, $end])->where('type', 'in');
        $cashOutQuery = PosCashFlow::whereBetween('recorded_at', [$start, $end])->where('type', 'out');
        $cashSalesQuery = Order::where(function ($q) {
            $q->where('order_number', 'like', 'POS-%')->orWhere('payment_details->source', 'pos');
        })
            ->where('payment_method', 'cash')
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end]);

        if ($isStaffCashier && $user) {
            $flowsQuery->where('user_id', $user->id);
            $cashInQuery->where('user_id', $user->id);
            $cashOutQuery->where('user_id', $user->id);
            $cashSalesQuery->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('payment_details->cashier_id', $user->id);
            });
        }

        $flows = $flowsQuery
            ->latest('recorded_at')
            ->with('user')
            ->get()
            ->map(fn (PosCashFlow $f) => [
                'id' => $f->id,
                'type' => $f->type,
                'type_label' => $f->type_label,
                'category' => $f->category,
                'category_label' => $f->category_label,
                'amount' => (float) $f->amount,
                'description' => $f->description,
                'recorded_date' => $f->recorded_at->format('Y-m-d'),
                'recorded_time' => $f->recorded_at->format('H:i'),
                'recorded_at' => $isMonthly ? $f->recorded_at->format('d/m H:i') : $f->recorded_at->format('H:i'),
                'user_name' => $f->user?->name ?? 'Kasir',
            ]);

        $totalIn = (float) $cashInQuery->sum('amount');
        $totalOut = (float) $cashOutQuery->sum('amount');
        $todayCashSales = (float) $cashSalesQuery->sum('total_amount');

        $summary = [
            'cash_sales' => $todayCashSales,
            'total_in' => $totalIn,
            'total_out' => $totalOut,
            'net_cash' => $todayCashSales + $totalIn - $totalOut,
            'cash_in' => $totalIn,
            'cash_out' => $totalOut,
            'period' => $period,
            'period_title' => $periodTitle,
            'is_monthly' => $isMonthly,
        ];

        return response()->json([
            'success' => true,
            'period' => $period,
            'period_title' => $periodTitle,
            'flows' => $flows,
            'cash_flows' => $flows,
            'summary' => $summary,
            'cash_drawer' => $summary,
        ]);
    }

    /**
     * Store new Cash Flow (Pemasukan / Pengeluaran Kas).
     */
    public function storeCashFlow(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:in,out',
            'category' => 'required|string|max:50',
            'amount' => 'required|numeric|min:1',
            'description' => 'required|string|max:255',
            'date' => 'nullable|date',
        ]);

        $recordedAt = now();
        if (! empty($validated['date'])) {
            try {
                $targetDate = Carbon::parse($validated['date']);
                if ($targetDate->isToday()) {
                    $recordedAt = now();
                } else {
                    $recordedAt = $targetDate->setTime(now()->hour, now()->minute, now()->second);
                }
            } catch (\Exception $e) {
                $recordedAt = now();
            }
        }

        $flow = PosCashFlow::create([
            'user_id' => auth()->id(),
            'type' => $validated['type'],
            'category' => $validated['category'],
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'recorded_at' => $recordedAt,
        ]);

        $targetDateStr = $recordedAt->format('Y-m-d');
        $totalIn = (float) PosCashFlow::whereDate('recorded_at', $targetDateStr)->where('type', 'in')->sum('amount');
        $totalOut = (float) PosCashFlow::whereDate('recorded_at', $targetDateStr)->where('type', 'out')->sum('amount');
        $cashSales = (float) Order::where(function ($q) {
            $q->where('order_number', 'like', 'POS-%')->orWhere('payment_details->source', 'pos');
        })
            ->where('payment_method', 'cash')
            ->where('payment_status', 'paid')
            ->whereDate('created_at', $targetDateStr)
            ->sum('total_amount');

        $summary = [
            'cash_sales' => $cashSales,
            'total_in' => $totalIn,
            'total_out' => $totalOut,
            'net_cash' => $cashSales + $totalIn - $totalOut,
            'cash_in' => $totalIn,
            'cash_out' => $totalOut,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Catatan kas berhasil dicatat.',
            'flow' => [
                'id' => $flow->id,
                'type' => $flow->type,
                'type_label' => $flow->type_label,
                'category' => $flow->category,
                'category_label' => $flow->category_label,
                'amount' => (float) $flow->amount,
                'description' => $flow->description,
                'recorded_date' => $targetDateStr,
                'recorded_at' => $flow->recorded_at->format('H:i'),
                'user_name' => auth()->user()?->name ?? 'Kasir',
            ],
            'summary' => $summary,
            'cash_drawer' => $summary,
        ]);
    }

    /**
     * Delete a Cash Flow entry.
     */
    public function destroyCashFlow(int $id): JsonResponse
    {
        $flow = PosCashFlow::findOrFail($id);
        $dateStr = $flow->recorded_at->format('Y-m-d');
        $flow->delete();

        $totalIn = (float) PosCashFlow::whereDate('recorded_at', $dateStr)->where('type', 'in')->sum('amount');
        $totalOut = (float) PosCashFlow::whereDate('recorded_at', $dateStr)->where('type', 'out')->sum('amount');
        $cashSales = (float) Order::where(function ($q) {
            $q->where('order_number', 'like', 'POS-%')->orWhere('payment_details->source', 'pos');
        })
            ->where('payment_method', 'cash')
            ->where('payment_status', 'paid')
            ->whereDate('created_at', $dateStr)
            ->sum('total_amount');

        $summary = [
            'cash_sales' => $cashSales,
            'total_in' => $totalIn,
            'total_out' => $totalOut,
            'net_cash' => $cashSales + $totalIn - $totalOut,
            'cash_in' => $totalIn,
            'cash_out' => $totalOut,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Catatan kas berhasil dihapus.',
            'summary' => $summary,
            'cash_drawer' => $summary,
        ]);
    }

    /**
     * Save Printer or Payment Settings.
     */
    public function saveSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:printer,payment,payments,appearance,layout',
            'settings' => 'required|array',
        ]);

        $type = $validated['type'];
        if ($type === 'printer') {
            Setting::set('pos_printer_settings', $validated['settings']);
        } elseif ($type === 'payment' || $type === 'payments') {
            Setting::set('pos_payment_settings', $validated['settings']);
        } elseif ($type === 'appearance' || $type === 'layout') {
            Setting::set('pos_layout_settings', $validated['settings']);
        }

        $message = match ($type) {
            'printer' => 'Pengaturan printer & struk berhasil disimpan.',
            'appearance', 'layout' => 'Pengaturan layout & density tampilan berhasil disimpan.',
            default => 'Pengaturan pembayaran berhasil disimpan.',
        };

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Get recent POS orders with date filter (Hari Ini, Kemarin, Custom Tanggal).
     */
    public function orders(Request $request): JsonResponse
    {
        $user = auth()->user();
        $isStaffCashier = (bool) ($user && $user->isKasir() && ! $user->isAdmin() && ! $user->isOwner());

        $filter = $request->input('filter', 'today');
        $search = trim((string) $request->input('search', ''));

        $query = Order::where(function ($q) {
            $q->where('order_number', 'like', 'POS-%')
                ->orWhere('payment_details->source', 'pos');
        });

        if ($isStaffCashier && $user) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('payment_details->cashier_id', $user->id);
            });
        } elseif ($request->filled('staff_id') && $request->input('staff_id') !== 'all') {
            $staffId = (int) $request->input('staff_id');
            $query->where(function ($q) use ($staffId) {
                $q->where('user_id', $staffId)
                    ->orWhere('payment_details->cashier_id', $staffId);
            });
        }

        if ($filter === 'today') {
            $query->whereDate('created_at', now()->format('Y-m-d'));
        } elseif ($filter === 'yesterday') {
            $query->whereDate('created_at', now()->subDay()->format('Y-m-d'));
        } elseif ($filter === 'custom') {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            if ($startDate && $endDate) {
                $start = Carbon::parse($startDate)->startOfDay();
                $end = Carbon::parse($endDate)->endOfDay();
                $query->whereBetween('created_at', [$start, $end]);
            } elseif ($startDate) {
                $query->whereDate('created_at', $startDate);
            } elseif ($endDate) {
                $query->whereDate('created_at', $endDate);
            }
        }

        $statusFilter = $request->input('status', 'all');
        if ($statusFilter === 'paid') {
            $query->where('payment_status', 'paid');
        } elseif ($statusFilter === 'refunded') {
            $query->where('payment_status', 'refunded');
        }

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $orders = $query
            ->latest('created_at')
            ->take(150)
            ->with('items')
            ->get()
            ->map(fn (Order $o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'customer_name' => $o->customer_name,
                'customer_phone' => $o->customer_phone,
                'customer_address' => $o->customer_address,
                'shipping_cost' => (float) $o->shipping_cost,
                'shipping_courier' => $o->shipping_courier,
                'shipping_service' => $o->shipping_service,
                'total_amount' => (float) $o->total_amount,
                'subtotal' => (float) $o->subtotal,
                'payment_method' => $o->payment_method,
                'payment_method_label' => $o->payment_method_label,
                'payment_status' => $o->payment_status,
                'payment_status_label' => $o->payment_status_label,
                'status' => $o->status,
                'status_label' => $o->status_label,
                'refunded_at' => $o->payment_details['refunded_at'] ?? null,
                'refund_reason' => $o->payment_details['refund_reason'] ?? null,
                'refunded_by_name' => $o->payment_details['refunded_by_name'] ?? null,
                'refund_amount' => isset($o->payment_details['refund_amount']) ? (float) $o->payment_details['refund_amount'] : null,
                'created_at' => $o->created_at->format('d/m/Y H:i'),
                'items_count' => $o->items->sum('quantity'),
                'items' => $o->items->map(fn (OrderItem $i) => [
                    'product_name' => $i->product_name,
                    'variant_label' => $i->variant_label,
                    'price' => (float) $i->price,
                    'quantity' => $i->quantity,
                    'subtotal' => (float) $i->subtotal,
                ]),
                'payment_details' => $o->payment_details,
            ]);

        $summary = [
            'total_count' => $orders->count(),
            'total_amount' => (float) $orders->where('payment_status', '!=', 'refunded')->sum('total_amount'),
            'refund_count' => $orders->where('payment_status', 'refunded')->count(),
            'refund_amount' => (float) $orders->where('payment_status', 'refunded')->sum('total_amount'),
        ];

        return response()->json([
            'success' => true,
            'orders' => $orders,
            'summary' => $summary,
            'filter' => $filter,
            'status' => $statusFilter,
            'is_staff_restricted' => $isStaffCashier,
        ]);
    }

    /**
     * Process Refund for a POS transaction.
     */
    public function refundOrder(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'refund_amount' => 'nullable|numeric|min:0',
        ]);

        $order = Order::with('items')->findOrFail($id);

        if ($order->payment_status === 'refunded') {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi #'.$order->order_number.' sudah pernah di-refund sebelumnya.',
            ], 422);
        }

        $user = $request->user();
        $refundAmount = isset($validated['refund_amount']) && (float) $validated['refund_amount'] > 0
            ? min((float) $order->total_amount, (float) $validated['refund_amount'])
            : (float) $order->total_amount;

        $order->payment_status = 'refunded';
        $order->status = 'refunded';

        $details = is_array($order->payment_details) ? $order->payment_details : [];
        $details['refunded_at'] = now()->format('d/m/Y H:i');
        $details['refunded_by_id'] = $user?->id;
        $details['refunded_by_name'] = $user?->name ?? 'Kasir';
        $details['refund_reason'] = trim($validated['reason']);
        $details['refund_amount'] = $refundAmount;

        $order->payment_details = $details;
        $order->save();

        // Calculate updated cash drawer for today
        $todayDate = now()->format('Y-m-d');
        $todayCashSales = (float) Order::where(function ($q) {
            $q->where('order_number', 'like', 'POS-%')->orWhere('payment_details->source', 'pos');
        })
            ->where('payment_method', 'cash')
            ->where('payment_status', 'paid')
            ->whereDate('created_at', $todayDate)
            ->sum('total_amount');

        $todayCashIn = (float) PosCashFlow::whereDate('recorded_at', $todayDate)->where('type', 'in')->sum('amount');
        $todayCashOut = (float) PosCashFlow::whereDate('recorded_at', $todayDate)->where('type', 'out')->sum('amount');

        return response()->json([
            'success' => true,
            'message' => "Transaksi #{$order->order_number} berhasil di-refund sebesar Rp ".number_format($refundAmount, 0, ',', '.').'.',
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'customer_address' => $order->customer_address,
                'shipping_cost' => (float) $order->shipping_cost,
                'shipping_courier' => $order->shipping_courier,
                'shipping_service' => $order->shipping_service,
                'total_amount' => (float) $order->total_amount,
                'subtotal' => (float) $order->subtotal,
                'payment_method' => $order->payment_method,
                'payment_method_label' => $order->payment_method_label,
                'payment_status' => $order->payment_status,
                'payment_status_label' => $order->payment_status_label,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'refunded_at' => $details['refunded_at'],
                'refund_reason' => $details['refund_reason'],
                'refunded_by_name' => $details['refunded_by_name'],
                'refund_amount' => $refundAmount,
                'created_at' => $order->created_at->format('d/m/Y H:i'),
                'items_count' => $order->items->sum('quantity'),
                'items' => $order->items->map(fn (OrderItem $i) => [
                    'product_name' => $i->product_name,
                    'variant_label' => $i->variant_label,
                    'price' => (float) $i->price,
                    'quantity' => $i->quantity,
                    'subtotal' => (float) $i->subtotal,
                ]),
                'payment_details' => $order->payment_details,
            ],
            'cash_drawer' => [
                'cash_sales' => $todayCashSales,
                'cash_in' => $todayCashIn,
                'cash_out' => $todayCashOut,
                'net_cash' => $todayCashSales + $todayCashIn - $todayCashOut,
            ],
        ]);
    }

    /**
     * Get list of active held queue orders.
     */
    public function getQueue(): JsonResponse
    {
        $held = PosHeldOrder::holding()
            ->with('user')
            ->get()
            ->map(fn (PosHeldOrder $h) => [
                'id' => $h->id,
                'queue_number' => $h->queue_number,
                'customer_name' => $h->customer_name,
                'customer_phone' => $h->customer_phone,
                'customer_address' => $h->payment_info['customer_address'] ?? null,
                'shipping_cost' => (float) ($h->payment_info['shipping_cost'] ?? 0),
                'shipping_courier' => $h->payment_info['shipping_courier'] ?? null,
                'notes' => $h->notes,
                'items' => $h->items,
                'items_count' => collect($h->items)->sum('quantity'),
                'subtotal' => (float) $h->subtotal,
                'discount_amount' => (float) $h->discount_amount,
                'total_amount' => (float) $h->total_amount,
                'held_at' => $h->held_at ? $h->held_at->format('H:i') : $h->created_at->format('H:i'),
                'cashier_name' => $h->user?->name ?? 'Kasir',
            ]);

        return response()->json([
            'success' => true,
            'queue' => $held,
            'count' => $held->count(),
        ]);
    }

    /**
     * Store new held queue order.
     */
    public function storeQueue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:100',
            'customer_phone' => 'nullable|string|max:30',
            'customer_address' => 'nullable|string|max:500',
            'shipping_cost' => 'nullable|numeric|min:0',
            'shipping_courier' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        $subtotal = 0;
        $totalItemDiscounts = 0;
        foreach ($validated['items'] as $item) {
            $gross = (float) ($item['price'] ?? 0) * (int) ($item['quantity'] ?? 1);
            $subtotal += $gross;
            $itemDisc = max(0, min($gross, (float) ($item['discount_amount'] ?? 0)));
            $totalItemDiscounts += $itemDisc;
        }

        $cartDiscount = min(max(0, $subtotal - $totalItemDiscounts), (float) ($validated['discount_amount'] ?? 0));
        $totalDiscount = $totalItemDiscounts + $cartDiscount;
        $shippingCost = max(0, (float) ($validated['shipping_cost'] ?? 0));
        $totalAmount = max(0, ($subtotal - $totalDiscount) + $shippingCost);

        $heldOrder = PosHeldOrder::create([
            'user_id' => auth()->id(),
            'queue_number' => PosHeldOrder::generateQueueNumber(),
            'customer_name' => trim($validated['customer_name']),
            'customer_phone' => $validated['customer_phone'] ? trim($validated['customer_phone']) : null,
            'notes' => $validated['notes'] ? trim($validated['notes']) : null,
            'payment_info' => [
                'shipping_cost' => $shippingCost,
                'shipping_courier' => $validated['shipping_courier'] ?? null,
                'customer_address' => $validated['customer_address'] ?? null,
            ],
            'items' => $validated['items'],
            'subtotal' => $subtotal,
            'discount_amount' => $totalDiscount,
            'total_amount' => $totalAmount,
            'status' => 'holding',
            'held_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Pesanan atas nama {$heldOrder->customer_name} berhasil disimpan ke antrian.",
            'held_order' => [
                'id' => $heldOrder->id,
                'queue_number' => $heldOrder->queue_number,
                'customer_name' => $heldOrder->customer_name,
                'customer_phone' => $heldOrder->customer_phone,
                'customer_address' => $heldOrder->payment_info['customer_address'] ?? null,
                'shipping_cost' => (float) ($heldOrder->payment_info['shipping_cost'] ?? 0),
                'shipping_courier' => $heldOrder->payment_info['shipping_courier'] ?? null,
                'notes' => $heldOrder->notes,
                'items' => $heldOrder->items,
                'items_count' => collect($heldOrder->items)->sum('quantity'),
                'subtotal' => (float) $heldOrder->subtotal,
                'discount_amount' => (float) $heldOrder->discount_amount,
                'total_amount' => (float) $heldOrder->total_amount,
                'held_at' => now()->format('H:i'),
                'cashier_name' => auth()->user()?->name ?? 'Kasir',
            ],
            'queue_count' => PosHeldOrder::where('status', 'holding')->count(),
        ]);
    }

    /**
     * Delete or restore a held queue order.
     */
    public function destroyQueue(int $id): JsonResponse
    {
        $held = PosHeldOrder::findOrFail($id);
        $held->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pesanan di antrian berhasil dihapus.',
            'queue_count' => PosHeldOrder::where('status', 'holding')->count(),
        ]);
    }

    /**
     * Create a digital pre-bill record and generate an A4 PDF invoice link for WhatsApp.
     */
    public function createPreBill(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:100',
            'customer_phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'discount_amount' => 'nullable|numeric|min:0',
            'include_bank' => 'nullable|boolean',
        ]);

        $subtotal = 0;
        $totalItemDiscounts = 0;
        foreach ($validated['items'] as $item) {
            $gross = (float) ($item['price'] ?? 0) * (int) ($item['quantity'] ?? 1);
            $subtotal += $gross;
            $itemDisc = max(0, min($gross, (float) ($item['discount_amount'] ?? 0)));
            $totalItemDiscounts += $itemDisc;
        }

        $cartDiscount = min(max(0, $subtotal - $totalItemDiscounts), (float) ($validated['discount_amount'] ?? 0));
        $totalDiscount = $totalItemDiscounts + $cartDiscount;
        $totalAmount = max(0, $subtotal - $totalDiscount);

        $customerName = trim($validated['customer_name'] ?? '') ?: 'Pelanggan';
        $customerPhone = $validated['customer_phone'] ? trim($validated['customer_phone']) : null;
        $notes = $validated['notes'] ? trim($validated['notes']) : null;

        $token = PosHeldOrder::generateInvoiceToken();

        // Get payment settings
        $paymentSettings = Setting::get('pos_payment_settings', [
            'enable_cash' => true,
            'enable_qris' => true,
            'enable_debit' => true,
            'enable_bank_transfer' => true,
            'qris_instructions' => 'Tunjukkan kode QRIS Kasir Sanubari di meja kasir.',
            'bank_info' => 'BCA 123-456-7890 a/n Sanubari Roastery',
        ]);

        $heldOrder = PosHeldOrder::create([
            'user_id' => auth()->id(),
            'queue_number' => PosHeldOrder::generateQueueNumber(),
            'invoice_token' => $token,
            'customer_name' => $customerName,
            'customer_phone' => $customerPhone,
            'notes' => $notes,
            'payment_info' => [
                'bank_info' => $paymentSettings['bank_info'] ?? null,
                'qris_instructions' => $paymentSettings['qris_instructions'] ?? null,
                'include_bank' => (bool) ($validated['include_bank'] ?? true),
            ],
            'items' => $validated['items'],
            'subtotal' => $subtotal,
            'discount_amount' => $totalDiscount,
            'total_amount' => $totalAmount,
            'status' => 'prebill',
            'held_at' => now(),
        ]);

        $invoiceUrl = url("/pos/invoice/{$token}");
        $pdfDownloadUrl = url("/pos/invoice/{$token}?download=1");

        // Format clean WhatsApp message containing the A4 PDF invoice link
        $cleanPhone = preg_replace('/[^0-9]/', '', $customerPhone ?? '');
        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '62'.substr($cleanPhone, 1);
        }

        $formattedTotal = number_format($totalAmount, 0, ',', '.');
        $itemCount = collect($validated['items'])->sum('quantity');

        $waMessage = "*INVOICE DIGITAL RESMI (A4 PDF) — KASIR SANUBARI*\n";
        $waMessage .= "Menyentuh Hati, Merangkai Cerita\n";
        $waMessage .= "========================================\n";
        $waMessage .= "Halo Kak *{$customerName}*,\n";
        $waMessage .= "Berikut adalah tautan Invoice Digital Resmi (A4) untuk pesanan Anda:\n\n";
        $waMessage .= "*DOWNLOAD & LIHAT INVOICE PDF (A4):*\n";
        $waMessage .= "{$pdfDownloadUrl}\n\n";
        $waMessage .= "----------------------------------------\n";
        $waMessage .= "No. Invoice   : #{$token}\n";
        $waMessage .= "Jumlah Item   : {$itemCount} item\n";
        $waMessage .= "Total Tagihan : Rp {$formattedTotal}\n";
        $waMessage .= "Status        : Menunggu Pembayaran\n";
        $waMessage .= "----------------------------------------\n";
        if (! empty($validated['include_bank']) && ! empty($paymentSettings['bank_info'])) {
            $waMessage .= "*Rekening Transfer:*\n{$paymentSettings['bank_info']}\n";
            $waMessage .= "----------------------------------------\n";
        }
        $waMessage .= "Tautan di atas dapat langsung dibuka untuk mengunduh invoice A4 PDF resmi atau dicetak.\n";
        $waMessage .= 'Terima kasih telah berbelanja di Kasir Sanubari!';

        $waUrl = $cleanPhone
            ? "https://wa.me/{$cleanPhone}?text=".rawurlencode($waMessage)
            : 'https://wa.me/?text='.rawurlencode($waMessage);

        return response()->json([
            'success' => true,
            'token' => $token,
            'invoice_url' => $invoiceUrl,
            'pdf_download_url' => $pdfDownloadUrl,
            'whatsapp_url' => $waUrl,
            'whatsapp_message' => $waMessage,
            'customer_name' => $customerName,
            'customer_phone' => $customerPhone,
            'total_amount' => $totalAmount,
            'held_order_id' => $heldOrder->id,
        ]);
    }

    /**
     * Show digital A4 invoice PDF view for a pre-bill or completed POS order.
     */
    public function showInvoice(string $token, Request $request)
    {
        $held = PosHeldOrder::where('invoice_token', $token)
            ->orWhere('queue_number', $token)
            ->with('user')
            ->first();

        if ($held) {
            $siteSettings = [
                'site_name' => Setting::get('site_name', 'Kasir Sanubari'),
                'tagline' => Setting::get('site_tagline', 'Menyentuh Hati, Merangkai Cerita'),
                'address' => Setting::get('contact_address', 'Jl. Candi Mendut No. 3, Lowokwaru, Kota Malang, Jawa Timur 65141'),
                'phone' => Setting::get('contact_phone', '0851-2193-0454'),
                'email' => Setting::get('contact_email', 'halo@kasir.sanubari.id'),
            ];

            $paymentSettings = Setting::get('pos_payment_settings', [
                'qris_instructions' => 'Tunjukkan kode QRIS Kasir Sanubari di meja kasir.',
                'bank_info' => 'BCA 123-456-7890 a/n Sanubari Roastery',
            ]);

            $orderData = [
                'id' => $held->id,
                'order_number' => $held->invoice_token ?: $held->queue_number,
                'queue_number' => $held->queue_number,
                'customer_name' => $held->customer_name ?: 'Pelanggan',
                'customer_phone' => $held->customer_phone ?: '-',
                'customer_notes' => $held->notes,
                'cashier_name' => $held->user?->name ?? 'Muhamad Ridwan',
                'payment_method_label' => 'Kasir / Transfer Bank / QRIS',
                'payment_status' => 'pending',
                'payment_status_label' => 'MENUNGGU PEMBAYARAN',
                'status' => 'prebill',
                'status_label' => 'Estimasi Pesanan (Pre-Bill)',
                'subtotal' => (float) $held->subtotal,
                'discount_amount' => (float) $held->discount_amount,
                'total_amount' => (float) $held->total_amount,
                'created_at' => $held->created_at->format('d/m/Y H:i'),
                'bank_info' => $held->payment_info['bank_info'] ?? $paymentSettings['bank_info'] ?? null,
                'qris_instructions' => $held->payment_info['qris_instructions'] ?? $paymentSettings['qris_instructions'] ?? null,
                'items' => collect($held->items)->map(function ($it, $idx) {
                    $qty = (int) ($it['quantity'] ?? 1);
                    $price = (float) ($it['price'] ?? 0);
                    $disc = (float) ($it['discount_amount'] ?? 0);
                    $gross = $price * $qty;

                    return [
                        'id' => $idx + 1,
                        'product_name' => $it['product_name'] ?? 'Item Kopi',
                        'variant_label' => $it['variant_label'] ?? 'Standar',
                        'price' => $price,
                        'quantity' => $qty,
                        'discount_amount' => $disc,
                        'subtotal' => max(0, $gross - $disc),
                    ];
                })->toArray(),
            ];

            return Inertia::render('pos/invoice', [
                'order' => $orderData,
                'settings' => $siteSettings,
                'autoDownload' => $request->query('download') === '1',
            ]);
        }

        // Fallback: Check if it's an online/completed Order number
        $order = Order::where('order_number', $token)->with('items')->first();
        if ($order) {
            return redirect()->route('orders.invoice', [
                'orderNumber' => $order->order_number,
                'download' => $request->query('download'),
            ]);
        }

        abort(404, 'Invoice tidak ditemukan atau telah kedaluwarsa.');
    }

    /**
     * Download or fetch catalog data for offline POS operation.
     */
    public function catalog(Request $request): JsonResponse
    {
        $products = $this->getPosProducts();
        $categories = $this->getPosCategories();
        $settings = Setting::get('pos_settings', []);

        $payload = [
            'success' => true,
            'source' => 'kasir_sanubari_server',
            'timestamp' => now()->toIso8601String(),
            'categories' => $categories,
            'products' => $products,
            'byob_settings' => Setting::get('byob_settings', []),
            'settings' => $settings,
        ];

        if ($request->boolean('download')) {
            $filename = 'kasir_sanubari_catalog_'.now()->format('Ymd_His').'.json';

            return response()->json($payload, 200, [
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]);
        }

        return response()->json($payload);
    }

    /**
     * Synchronize offline orders batch from local storage into the central database.
     */
    public function syncOfflineOrders(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'orders' => 'required|array|min:1',
            'orders.*.offline_id' => 'required|string',
            'orders.*.items' => 'required|array|min:1',
            'orders.*.payment_method' => 'required|string',
            'orders.*.cash_tendered' => 'nullable|numeric|min:0',
            'orders.*.discount_amount' => 'nullable|numeric|min:0',
            'orders.*.customer_name' => 'nullable|string|max:100',
            'orders.*.customer_phone' => 'nullable|string|max:30',
            'orders.*.customer_address' => 'nullable|string|max:500',
            'orders.*.shipping_cost' => 'nullable|numeric|min:0',
            'orders.*.shipping_courier' => 'nullable|string|max:100',
            'orders.*.shipping_service' => 'nullable|string|max:100',
            'orders.*.notes' => 'nullable|string|max:500',
            'orders.*.created_at' => 'nullable|string',
        ]);

        $syncedOrders = [];

        DB::transaction(function () use ($validated, &$syncedOrders) {
            foreach ($validated['orders'] as $orderData) {
                // Prevent duplicate syncing using offline_id
                $offlineId = (string) $orderData['offline_id'];
                $existing = Order::whereJsonContains('payment_details->offline_id', $offlineId)->first();
                if ($existing) {
                    $syncedOrders[] = [
                        'offline_id' => $offlineId,
                        'order_number' => $existing->order_number,
                        'total_amount' => (float) $existing->total_amount,
                        'status' => 'already_synced',
                    ];

                    continue;
                }

                $subtotal = 0;
                $totalItemDiscounts = 0;
                $orderLines = [];

                foreach ($orderData['items'] as $itemData) {
                    $variantId = $itemData['variant_id'] ?? null;
                    $variant = (! empty($variantId) && $variantId > 0)
                        ? ProductVariant::with('product')->find($variantId)
                        : null;
                    $product = $variant?->product
                        ?? ((! empty($itemData['product_id']) && $itemData['product_id'] > 0) ? Product::find($itemData['product_id']) : null);

                    $price = isset($itemData['price']) && is_numeric($itemData['price'])
                        ? (float) $itemData['price']
                        : ($variant ? (float) $variant->price : 0.0);

                    $costPrice = isset($itemData['cost_price']) && $itemData['cost_price'] !== null && $itemData['cost_price'] !== ''
                        ? max(0, (float) $itemData['cost_price'])
                        : (float) ($variant?->cost_price ?? 0);

                    $quantity = max(1, (int) ($itemData['quantity'] ?? 1));
                    $lineGross = $price * $quantity;
                    $itemDiscount = max(0, min($lineGross, (float) ($itemData['discount_amount'] ?? 0)));
                    $lineSubtotal = max(0, $lineGross - $itemDiscount);

                    $subtotal += $lineGross;
                    $totalItemDiscounts += $itemDiscount;

                    $notes = $itemData['notes'] ?? null;
                    if ($itemDiscount > 0) {
                        $discountNote = 'Diskon: -Rp '.number_format($itemDiscount, 0, ',', '.');
                        $notes = $notes ? "{$notes} ({$discountNote})" : $discountNote;
                    }

                    $orderLines[] = [
                        'product_id' => $product?->id,
                        'product_variant_id' => $variant?->id,
                        'product_name' => $product?->name ?? ($itemData['product_name'] ?? 'Item Manual'),
                        'variant_label' => $variant?->label ?? ($itemData['variant_label'] ?? 'Manual'),
                        'grind_option' => null,
                        'cost_price' => $costPrice,
                        'price' => $price,
                        'quantity' => $quantity,
                        'subtotal' => $lineSubtotal,
                        'custom_notes' => $notes,
                    ];
                }

                $cartDiscount = max(0, min(max(0, $subtotal - $totalItemDiscounts), (float) ($orderData['discount_amount'] ?? 0)));
                $totalDiscount = $totalItemDiscounts + $cartDiscount;
                $shippingCost = max(0, (float) ($orderData['shipping_cost'] ?? 0));
                $totalAmount = max(0, ($subtotal - $totalDiscount) + $shippingCost);

                $cashTendered = (float) ($orderData['cash_tendered'] ?? 0);
                $cashChange = ($orderData['payment_method'] === 'cash')
                    ? max(0, $cashTendered - $totalAmount)
                    : 0;

                $orderNumber = Order::generatePosOrderNumber();
                $createdAt = ! empty($orderData['created_at'])
                    ? Carbon::parse($orderData['created_at'])
                    : now();

                $isShipping = $shippingCost > 0 || ! empty($orderData['customer_address']) || ! empty($orderData['shipping_courier']);
                $customerAddress = ! empty($orderData['customer_address'])
                    ? trim($orderData['customer_address'])
                    : ($isShipping ? 'Alamat Pengiriman' : 'Toko Fisik / POS Kasir');
                $shippingCourier = ! empty($orderData['shipping_courier'])
                    ? trim($orderData['shipping_courier'])
                    : ($shippingCost > 0 ? 'Kurir Ekspedisi' : 'POS Kasir (Retail Langsung)');
                $shippingService = ! empty($orderData['shipping_service'])
                    ? trim($orderData['shipping_service'])
                    : ($shippingCost > 0 ? 'Pengiriman' : 'Langsung Diterima (Sinkronisasi Offline)');

                $order = Order::create([
                    'user_id' => auth()->id(),
                    'order_number' => $orderNumber,
                    'customer_name' => ! empty($orderData['customer_name']) ? trim($orderData['customer_name']) : 'Pelanggan Kasir',
                    'customer_phone' => ! empty($orderData['customer_phone']) ? trim($orderData['customer_phone']) : '-',
                    'customer_address' => $customerAddress,
                    'customer_notes' => $orderData['notes'] ?? null,
                    'shipping_courier' => $shippingCourier,
                    'shipping_service' => $shippingService,
                    'shipping_cost' => $shippingCost,
                    'total_weight_grams' => 0,
                    'payment_method' => $orderData['payment_method'],
                    'payment_channel' => match ($orderData['payment_method']) {
                        'qris' => 'QRIS Toko Resmi (Offline)',
                        'debit' => 'Mesin EDC (Offline)',
                        'bank_transfer' => 'Transfer Bank (Offline)',
                        default => 'Kasir Tunai (Offline)',
                    },
                    'payment_status' => 'paid',
                    'status' => 'completed',
                    'subtotal' => $subtotal,
                    'unique_code' => 0,
                    'total_amount' => $totalAmount,
                    'paid_at' => $createdAt,
                    'created_at' => $createdAt,
                    'updated_at' => now(),
                    'payment_details' => [
                        'source' => 'pos_offline_sync',
                        'offline_id' => $offlineId,
                        'cashier_id' => auth()->id(),
                        'cashier_name' => auth()->user()?->name ?? 'Kasir',
                        'cash_tendered' => $cashTendered,
                        'cash_change' => $cashChange,
                        'item_discounts' => $totalItemDiscounts,
                        'cart_discount' => $cartDiscount,
                        'discount_amount' => $totalDiscount,
                        'shipping_cost' => $shippingCost,
                        'shipping_courier' => $shippingCourier,
                        'customer_address' => $customerAddress,
                        'notes' => $orderData['notes'] ?? null,
                    ],
                ]);

                foreach ($orderLines as $line) {
                    $order->items()->create($line);
                }

                $syncedOrders[] = [
                    'offline_id' => $offlineId,
                    'order_number' => $order->order_number,
                    'total_amount' => (float) $order->total_amount,
                    'status' => 'synced',
                ];
            }
        });

        return response()->json([
            'success' => true,
            'message' => count($syncedOrders).' transaksi offline berhasil disinkronkan ke database server.',
            'synced_count' => count($syncedOrders),
            'synced_orders' => $syncedOrders,
        ]);
    }

    /**
     * Import offline sales orders from uploaded JSON file or raw payload.
     */
    public function importOrders(Request $request): JsonResponse
    {
        if ($request->hasFile('file')) {
            $request->validate([
                'file' => 'required|file|mimes:json,txt|max:10240',
            ]);

            $content = file_get_contents($request->file('file')->getRealPath());
            $json = json_decode($content, true);

            if (! is_array($json)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Format file JSON tidak valid.',
                ], 422);
            }

            $orders = $json['orders'] ?? (isset($json[0]) ? $json : [$json]);
            $request->merge(['orders' => $orders]);
        }

        return $this->syncOfflineOrders($request);
    }

    /**
     * List all staff members with POS access (Owner only).
     */
    public function listStaff(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya akun Owner yang memiliki akses ke menu kelola staf POS.',
            ], 403);
        }

        $staff = User::query()
            ->whereIn('role', ['owner', 'admin', 'kasir'])
            ->orWhere('id', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'phone', 'created_at']);

        return response()->json([
            'success' => true,
            'staff' => $staff,
        ]);
    }

    /**
     * Store a new staff member created by Owner through POS.
     */
    public function storeStaff(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya akun Owner yang dapat menambahkan staf baru lewat POS.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email',
            'password' => 'required|string|min:6|max:100',
            'role' => 'required|string|in:kasir,admin,owner',
            'phone' => 'nullable|string|max:30',
        ], [
            'name.required' => 'Nama lengkap staf wajib diisi.',
            'email.required' => 'Email login staf wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar sebagai akun lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal 6 karakter.',
            'role.required' => 'Pilihan peran / role wajib dipilih.',
            'role.in' => 'Role staf harus berupa Kasir, Admin, atau Owner.',
        ]);

        $staff = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => ! empty($validated['phone']) ? trim($validated['phone']) : null,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Staf baru \"{$staff->name}\" ({$staff->role}) berhasil ditambahkan dan dapat langsung login ke POS.",
            'staff' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                'role' => $staff->role,
                'phone' => $staff->phone,
                'created_at' => $staff->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Remove / revoke staff access (Owner only).
     */
    public function destroyStaff(int $id, Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya akun Owner yang dapat menghapus staf.',
            ], 403);
        }

        if ($id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 422);
        }

        if ($id === 1) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Super Admin utama (ID 1) tidak dapat dihapus.',
            ], 422);
        }

        $staff = User::findOrFail($id);
        $staffName = $staff->name;
        $staff->delete();

        return response()->json([
            'success' => true,
            'message' => "Akses staf \"{$staffName}\" berhasil dihapus dari sistem POS.",
        ]);
    }

    /**
     * Get normalized POS products dataset for both Inertia index and offline API catalog.
     */
    protected function getPosProducts()
    {
        return Product::active()
            ->forPos()
            ->with(['variants', 'images', 'categories'])
            ->orderBy('name')
            ->get()
            ->map(function (Product $product) {
                $minPrice = (float) ($product->min_price > 0 ? $product->min_price : ($product->variants->min('price') ?? 0));
                $maxPrice = (float) ($product->max_price > 0 ? $product->max_price : ($product->variants->max('price') ?? $minPrice));

                $imageUrl = $product->primaryImage?->url
                    ?? $product->images->first()?->url;

                if (! $imageUrl && ! empty($product->all_images)) {
                    $firstImg = $product->all_images[0]['path'] ?? null;
                    if ($firstImg) {
                        $imageUrl = (str_starts_with($firstImg, '/') || str_starts_with($firstImg, 'http'))
                            ? $firstImg
                            : Storage::url($firstImg);
                    }
                }

                $isCybrProduct = $product->slug === 'byob'
                    || $product->series === 'cybr'
                    || $product->series === 'custom-blend'
                    || str_contains(strtolower((string) $product->name), 'c.y.b.r');

                $firstCat = $product->categories->first();
                $firstCatName = $firstCat
                    ? ($firstCat->getTranslation('name', 'id') ?? (is_array($firstCat->name) ? ($firstCat->name['id'] ?? reset($firstCat->name)) : $firstCat->name) ?? $firstCat->slug)
                    : null;

                $prodName = $product->getTranslation('name', 'id')
                    ?? (is_array($product->name) ? ($product->name['id'] ?? reset($product->name)) : $product->name)
                    ?? $product->slug;

                if ($isCybrProduct) {
                    $imageUrl = '/brand/cybr-custom-blend.jpg';
                } elseif (! $imageUrl || $imageUrl === '/brand/logo-circle.png') {
                    $imageUrl = \App\Services\ProductImageMatcher::getUrl((string) $prodName, $firstCatName);
                }

                if ($imageUrl && ! str_starts_with($imageUrl, '/brand/')) {
                    $ts = $product->updated_at ? $product->updated_at->timestamp : time();
                    $imageUrl = str_contains($imageUrl, '?') ? "{$imageUrl}&v={$ts}" : "{$imageUrl}?v={$ts}";
                }

                return [
                    'id' => $product->id,
                    'name' => (string) $prodName,
                    'slug' => $product->slug,
                    'series' => $product->series,
                    'series_label' => $product->series_label,
                    'series_badge_color' => Product::getSeriesBadgeColor($product->series),
                    'category_id' => $firstCat?->id,
                    'category_name' => $firstCatName ? (string) $firstCatName : null,
                    'category_slug' => $firstCat?->slug,
                    'category_ids' => $product->categories->pluck('id')->toArray(),
                    'image' => $imageUrl,
                    'price' => $minPrice,
                    'min_price' => $minPrice,
                    'max_price' => $maxPrice,
                    'description' => (string) ($product->getTranslation('description', 'id')
                        ?? (is_array($product->description) ? ($product->description['id'] ?? reset($product->description)) : $product->description)
                        ?? ''),
                    'stock_status' => $product->stock_status,
                    'is_out_of_stock' => (bool) $product->is_out_of_stock,
                    'variants' => $product->variants->map(fn (ProductVariant $v) => [
                        'id' => $v->id,
                        'label' => $v->label,
                        'price' => (float) $v->price,
                        'original_price' => $v->original_price ? (float) $v->original_price : null,
                        'cost_price' => $v->cost_price !== null ? (float) $v->cost_price : 0.0,
                        'weight_grams' => (int) $v->weight_grams,
                        'sku' => $v->sku,
                        'stock_status' => $v->stock_status,
                    ])->values(),
                ];
            });
    }

    /**
     * Create a new cafe product/menu item from POS.
     */
    public function storeProduct(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'category_id' => 'nullable|integer|exists:categories,id',
            'description' => 'nullable|string|max:1000',
            'stock_status' => 'nullable|in:in_stock,out_of_stock',
            'variants' => 'required|array|min:1',
            'variants.*.label' => 'required|string|max:100',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.cost_price' => 'nullable|numeric|min:0',
            'variants.*.stock_status' => 'nullable|in:in_stock,out_of_stock',
            'image' => 'nullable|image|max:5120',
        ]);

        $name = trim($validated['name']);
        $slug = Str::slug($name);
        $baseSlug = $slug ?: 'menu';
        $uniqueSlug = $baseSlug;
        $counter = 1;
        while (Product::where('slug', $uniqueSlug)->exists()) {
            $uniqueSlug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $minPrice = collect($validated['variants'])->min('price') ?? 0;
        $maxPrice = collect($validated['variants'])->max('price') ?? $minPrice;

        $product = Product::create([
            'name' => $name,
            'slug' => $uniqueSlug,
            'description' => ! empty($validated['description']) ? [
                'id' => trim($validated['description']),
                'en' => trim($validated['description']),
            ] : null,
            'status' => 'active',
            'channel' => 'all',
            'stock_status' => $validated['stock_status'] ?? 'in_stock',
            'min_price' => $minPrice,
            'max_price' => $maxPrice,
            'series' => 'cafe-menu',
        ]);

        if (! empty($validated['category_id'])) {
            $product->categories()->sync([$validated['category_id']]);
        }

        foreach ($validated['variants'] as $idx => $v) {
            $product->variants()->create([
                'label' => trim($v['label']),
                'price' => (float) $v['price'],
                'cost_price' => isset($v['cost_price']) && is_numeric($v['cost_price']) ? (float) $v['cost_price'] : 0.0,
                'stock_status' => $v['stock_status'] ?? ($product->stock_status ?: 'in_stock'),
                'weight_grams' => 0,
                'sku' => 'CAFE-' . strtoupper(Str::random(6)),
            ]);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $dest = public_path('storage/' . $path);
            if (! file_exists(dirname($dest))) {
                @mkdir(dirname($dest), 0755, true);
            }
            @copy(storage_path('app/public/' . $path), $dest);

            $product->images()->create([
                'path' => $path,
                'is_primary' => true,
                'alt' => $name,
            ]);
        } else {
            $cat = ! empty($validated['category_id']) ? Category::find($validated['category_id']) : null;
            $catName = $cat ? ($cat->getTranslation('name', 'id') ?? $cat->name) : null;
            $autoPath = \App\Services\ProductImageMatcher::match($name, $catName);
            $product->images()->create([
                'path' => $autoPath,
                'is_primary' => true,
                'alt' => $name,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Menu \"{$name}\" berhasil ditambahkan ke katalog kasir.",
            'products' => $this->getPosProducts(),
        ]);
    }

    /**
     * Update an existing cafe product/menu item from POS.
     */
    public function updateProduct(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'category_id' => 'nullable|integer|exists:categories,id',
            'description' => 'nullable|string|max:1000',
            'stock_status' => 'nullable|in:in_stock,out_of_stock',
            'variants' => 'required|array|min:1',
            'variants.*.id' => 'nullable|integer',
            'variants.*.label' => 'required|string|max:100',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.cost_price' => 'nullable|numeric|min:0',
            'variants.*.stock_status' => 'nullable|in:in_stock,out_of_stock',
            'image' => 'nullable|image|max:5120',
        ]);

        $name = trim($validated['name']);
        $slug = Str::slug($name);
        if ($slug !== $product->slug && Product::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            $slug = "{$slug}-{$id}";
        }

        $minPrice = collect($validated['variants'])->min('price') ?? 0;
        $maxPrice = collect($validated['variants'])->max('price') ?? $minPrice;

        $descData = is_array($product->description) ? $product->description : [];
        if (! empty($validated['description'])) {
            $descText = trim($validated['description']);
            $descData['id'] = $descText;
            if (empty($descData['en'])) {
                $descData['en'] = $descText;
            }
        } else {
            $descData = null;
        }

        $product->update([
            'name' => $name,
            'slug' => $slug,
            'description' => $descData,
            'stock_status' => $validated['stock_status'] ?? $product->stock_status,
            'min_price' => $minPrice,
            'max_price' => $maxPrice,
        ]);

        if (array_key_exists('category_id', $validated)) {
            $product->categories()->sync($validated['category_id'] ? [$validated['category_id']] : []);
        }

        // Sync variants
        $existingVariantIds = [];
        foreach ($validated['variants'] as $v) {
            $varId = $v['id'] ?? null;
            $data = [
                'label' => trim($v['label']),
                'price' => (float) $v['price'],
                'cost_price' => isset($v['cost_price']) && is_numeric($v['cost_price']) ? (float) $v['cost_price'] : 0.0,
                'stock_status' => $v['stock_status'] ?? ($product->stock_status ?: 'in_stock'),
                'weight_grams' => 0,
            ];

            if ($varId && $variant = $product->variants()->find($varId)) {
                $variant->update($data);
                $existingVariantIds[] = $variant->id;
            } else {
                $newVar = $product->variants()->create(array_merge($data, [
                    'sku' => 'CAFE-' . strtoupper(Str::random(6)),
                ]));
                $existingVariantIds[] = $newVar->id;
            }
        }

        // Delete removed variants
        $product->variants()->whereNotIn('id', $existingVariantIds)->delete();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $dest = public_path('storage/' . $path);
            if (! file_exists(dirname($dest))) {
                @mkdir(dirname($dest), 0755, true);
            }
            @copy(storage_path('app/public/' . $path), $dest);

            $product->images()->update(['is_primary' => false]);
            $product->images()->create([
                'path' => $path,
                'is_primary' => true,
                'alt' => $name,
            ]);
            $product->touch();
        } elseif ($request->boolean('remove_image')) {
            $product->images()->delete();
            $cat = ! empty($validated['category_id']) ? Category::find($validated['category_id']) : $product->categories->first();
            $catName = $cat ? ($cat->getTranslation('name', 'id') ?? $cat->name) : null;
            $autoPath = \App\Services\ProductImageMatcher::match($name, $catName);
            $product->images()->create([
                'path' => $autoPath,
                'is_primary' => true,
                'alt' => $name,
            ]);
            $product->touch();
        } elseif (! $product->images()->exists()) {
            $cat = ! empty($validated['category_id']) ? Category::find($validated['category_id']) : $product->categories->first();
            $catName = $cat ? ($cat->getTranslation('name', 'id') ?? $cat->name) : null;
            $autoPath = \App\Services\ProductImageMatcher::match($name, $catName);
            $product->images()->create([
                'path' => $autoPath,
                'is_primary' => true,
                'alt' => $name,
            ]);
            $product->touch();
        } else {
            $product->touch();
        }

        return response()->json([
            'success' => true,
            'message' => "Menu \"{$name}\" berhasil diperbarui.",
            'products' => $this->getPosProducts(),
        ]);
    }

    /**
     * Quick toggle stock status (in_stock <-> out_of_stock).
     */
    public function toggleProductStock(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $newStatus = $product->stock_status === 'in_stock' ? 'out_of_stock' : 'in_stock';

        $product->update(['stock_status' => $newStatus]);
        $product->variants()->update(['stock_status' => $newStatus]);

        $statusLabel = $newStatus === 'in_stock' ? 'Tersedia' : 'Habis (Sold Out)';

        return response()->json([
            'success' => true,
            'message' => "Status menu \"{$product->name}\" diubah menjadi: {$statusLabel}",
            'products' => $this->getPosProducts(),
        ]);
    }

    /**
     * Delete a product/menu item from POS.
     */
    public function destroyProduct(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $name = $product->name;

        // Detach relations safely
        $product->categories()->detach();
        $product->variants()->delete();
        $product->images()->delete();
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => "Menu \"{$name}\" berhasil dihapus dari sistem POS.",
            'products' => $this->getPosProducts(),
        ]);
    }

    /**
     * List all categories for POS management.
     */
    public function listCategories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'categories' => $this->getPosCategories(),
        ]);
    }

    /**
     * Create a new category from POS.
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $name = trim($validated['name']);
        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($name);

        // Ensure unique slug
        $baseSlug = $slug ?: 'kategori';
        $uniqueSlug = $baseSlug;
        $counter = 1;
        while (Category::where('slug', $uniqueSlug)->exists()) {
            $uniqueSlug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $sortOrder = $validated['sort_order'] ?? ((int) Category::max('sort_order') + 1);

        $category = Category::create([
            'name' => [
                'id' => $name,
                'en' => $name,
            ],
            'slug' => $uniqueSlug,
            'description' => ! empty($validated['description']) ? [
                'id' => trim($validated['description']),
                'en' => trim($validated['description']),
            ] : null,
            'icon' => ! empty($validated['icon']) ? trim($validated['icon']) : null,
            'sort_order' => $sortOrder,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Kategori \"{$name}\" berhasil ditambahkan.",
            'category' => [
                'id' => $category->id,
                'name' => $name,
                'slug' => $category->slug,
                'icon' => $category->icon,
                'description' => $validated['description'] ?? '',
                'sort_order' => (int) $category->sort_order,
                'products_count' => 0,
            ],
            'categories' => $this->getPosCategories(),
        ]);
    }

    /**
     * Update an existing category from POS.
     */
    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $name = trim($validated['name']);
        $slug = ! empty($validated['slug']) ? Str::slug($validated['slug']) : Str::slug($name);

        if ($slug !== $category->slug && Category::where('slug', $slug)->where('id', '!=', $id)->exists()) {
            $slug = "{$slug}-{$id}";
        }

        // Maintain translation structure
        $nameData = is_array($category->name) ? $category->name : [];
        $nameData['id'] = $name;
        if (empty($nameData['en'])) {
            $nameData['en'] = $name;
        }

        $descData = is_array($category->description) ? $category->description : [];
        if (! empty($validated['description'])) {
            $descText = trim($validated['description']);
            $descData['id'] = $descText;
            if (empty($descData['en'])) {
                $descData['en'] = $descText;
            }
        } else {
            $descData = null;
        }

        $category->update([
            'name' => $nameData,
            'slug' => $slug,
            'description' => $descData,
            'icon' => ! empty($validated['icon']) ? trim($validated['icon']) : $category->icon,
            'sort_order' => $validated['sort_order'] ?? $category->sort_order,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Kategori \"{$name}\" berhasil diperbarui.",
            'category' => [
                'id' => $category->id,
                'name' => $name,
                'slug' => $category->slug,
                'icon' => $category->icon,
                'description' => $validated['description'] ?? '',
                'sort_order' => (int) $category->sort_order,
                'products_count' => (int) $category->products()->count(),
            ],
            'categories' => $this->getPosCategories(),
        ]);
    }

    /**
     * Delete an existing category from POS.
     */
    public function destroyCategory(int $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $name = $category->getTranslation('name', 'id') ?? (is_array($category->name) ? ($category->name['id'] ?? reset($category->name)) : $category->name) ?? $category->slug;

        // Detach products safely from pivot so products are not deleted
        $category->products()->detach();

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => "Kategori \"{$name}\" berhasil dihapus.",
            'categories' => $this->getPosCategories(),
        ]);
    }

    /**
     * Get normalized POS categories.
     */
    protected function getPosCategories()
    {
        return Category::query()
            ->whereNotIn('slug', ['classic-process', 'experimental-process'])
            ->where('slug', 'not like', '%-process')
            ->where(function ($q) {
                $q->whereNull('type')->orWhere('type', '!=', 'process');
            })
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(function (Category $c) {
                $name = $c->getTranslation('name', 'id')
                    ?? (is_array($c->name) ? ($c->name['id'] ?? reset($c->name)) : $c->name)
                    ?? $c->slug;

                $desc = $c->getTranslation('description', 'id')
                    ?? (is_array($c->description) ? ($c->description['id'] ?? reset($c->description)) : $c->description)
                    ?? '';

                return [
                    'id' => $c->id,
                    'name' => $name,
                    'slug' => $c->slug,
                    'icon' => $c->icon,
                    'description' => $desc,
                    'sort_order' => (int) ($c->sort_order ?? 0),
                    'products_count' => (int) ($c->products_count ?? 0),
                ];
            });
    }
}
