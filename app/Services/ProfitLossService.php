<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PosCashFlow;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ProfitLossService
{
    /**
     * Expense category human-readable labels.
     *
     * @var array<string, string>
     */
    public const EXPENSE_CATEGORIES = [
        'operasional' => 'Operasional Toko',
        'bahan_baku' => 'Bahan Baku & Tambahan',
        'kebersihan' => 'Kebersihan & Perlengkapan',
        'transport' => 'Transport & Logistik',
        'gaji' => 'Upah & Gaji Kasir/Barista',
        'lainnya' => 'Pengeluaran Lainnya',
    ];

    /**
     * Calculate consolidated profit and loss report for a given date range.
     *
     * @param  string  $channel  'all' | 'web' | 'pos'
     * @return array<string, mixed>
     */
    public static function getReport(Carbon $start, Carbon $end, string $channel = 'all'): array
    {
        // 1. Fetch Paid Orders
        $ordersQuery = Order::query()
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end]);

        if ($channel === 'web') {
            $ordersQuery->webOnly();
        } elseif ($channel === 'pos') {
            $ordersQuery->posOnly();
        }

        /** @var Collection<int, Order> $orders */
        $orders = $ordersQuery->with(['items.variant', 'user'])->latest('created_at')->get();

        $totalTransactions = $orders->count();
        $netSales = 0.0;
        $grossSales = 0.0;
        $totalCogs = 0.0;
        $itemsSold = 0;
        $itemsWithHppCount = 0;
        $itemsWithoutHppCount = 0;

        // Channel counters
        $webOrdersCount = 0;
        $webNetSales = 0.0;
        $webCogs = 0.0;

        $posOrdersCount = 0;
        $posNetSales = 0.0;
        $posCogs = 0.0;

        $dailySummaryMap = [];
        $monthlySummaryMap = [];
        $transactionsList = [];
        $productBreakdowns = [];

        foreach ($orders as $order) {
            $isPos = $order->is_pos;
            $orderNet = (float) $order->total_amount;
            $orderGross = 0.0;
            $orderCogs = 0.0;
            $orderItems = [];

            foreach ($order->items as $item) {
                $qty = (int) $item->quantity;
                $itemsSold += $qty;
                $itemSubtotal = (float) $item->subtotal;
                $grossSales += $itemSubtotal;
                $orderGross += $itemSubtotal;

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

                // Product performance aggregation
                $pKey = $item->product_name.' ('.($item->variant_label ?: 'Standar').')';
                if (! isset($productBreakdowns[$pKey])) {
                    $productBreakdowns[$pKey] = [
                        'product_name' => $item->product_name,
                        'variant_label' => $item->variant_label ?: 'Standar',
                        'quantity' => 0,
                        'revenue' => 0.0,
                        'cost' => 0.0,
                        'profit' => 0.0,
                        'has_hpp' => $unitCost > 0,
                    ];
                }
                $productBreakdowns[$pKey]['quantity'] += $qty;
                $productBreakdowns[$pKey]['revenue'] += $itemSubtotal;
                $productBreakdowns[$pKey]['cost'] += $itemCost;
                $productBreakdowns[$pKey]['profit'] += ($itemSubtotal - $itemCost);
            }

            $netSales += $orderNet;
            $orderGrossProfit = $orderNet - $orderCogs;
            $orderMarginPct = $orderNet > 0 ? round(($orderGrossProfit / $orderNet) * 100, 1) : 0.0;

            if ($isPos) {
                $posOrdersCount++;
                $posNetSales += $orderNet;
                $posCogs += $orderCogs;
            } else {
                $webOrdersCount++;
                $webNetSales += $orderNet;
                $webCogs += $orderCogs;
            }

            // Daily Map
            $dateKey = $order->created_at->format('Y-m-d');
            if (! isset($dailySummaryMap[$dateKey])) {
                $carbonDate = Carbon::parse($dateKey);
                $dailySummaryMap[$dateKey] = [
                    'date' => $dateKey,
                    'date_label' => $carbonDate->translatedFormat('d F Y'),
                    'short_date' => $carbonDate->format('d/m'),
                    'day_name' => $carbonDate->translatedFormat('l'),
                    'total_transactions' => 0,
                    'web_transactions' => 0,
                    'pos_transactions' => 0,
                    'items_sold' => 0,
                    'net_sales' => 0.0,
                    'web_sales' => 0.0,
                    'pos_sales' => 0.0,
                    'total_cogs' => 0.0,
                    'gross_profit' => 0.0,
                    'expenses_total' => 0.0,
                    'margin_pct' => 0.0,
                ];
            }
            $dailySummaryMap[$dateKey]['total_transactions']++;
            $dailySummaryMap[$dateKey][$isPos ? 'pos_transactions' : 'web_transactions']++;
            $dailySummaryMap[$dateKey]['items_sold'] += $order->items->sum('quantity');
            $dailySummaryMap[$dateKey]['net_sales'] += $orderNet;
            $dailySummaryMap[$dateKey][$isPos ? 'pos_sales' : 'web_sales'] += $orderNet;
            $dailySummaryMap[$dateKey]['total_cogs'] += $orderCogs;
            $dailySummaryMap[$dateKey]['gross_profit'] += $orderGrossProfit;

            // Monthly Map
            $monthKey = $order->created_at->format('Y-m');
            if (! isset($monthlySummaryMap[$monthKey])) {
                $carbonMonth = Carbon::parse($monthKey.'-01');
                $monthlySummaryMap[$monthKey] = [
                    'month' => $monthKey,
                    'month_label' => $carbonMonth->translatedFormat('F Y'),
                    'total_transactions' => 0,
                    'web_transactions' => 0,
                    'pos_transactions' => 0,
                    'items_sold' => 0,
                    'net_sales' => 0.0,
                    'web_sales' => 0.0,
                    'pos_sales' => 0.0,
                    'total_cogs' => 0.0,
                    'gross_profit' => 0.0,
                    'expenses_total' => 0.0,
                    'net_profit' => 0.0,
                    'margin_pct' => 0.0,
                ];
            }
            $monthlySummaryMap[$monthKey]['total_transactions']++;
            $monthlySummaryMap[$monthKey][$isPos ? 'pos_transactions' : 'web_transactions']++;
            $monthlySummaryMap[$monthKey]['items_sold'] += $order->items->sum('quantity');
            $monthlySummaryMap[$monthKey]['net_sales'] += $orderNet;
            $monthlySummaryMap[$monthKey][$isPos ? 'pos_sales' : 'web_sales'] += $orderNet;
            $monthlySummaryMap[$monthKey]['total_cogs'] += $orderCogs;
            $monthlySummaryMap[$monthKey]['gross_profit'] += $orderGrossProfit;

            $transactionsList[] = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'channel' => $isPos ? 'pos' : 'web',
                'channel_label' => $isPos ? 'POS Kasir' : 'Website Online',
                'customer_name' => $order->customer_name ?: ($isPos ? 'Pelanggan Kasir' : 'Pelanggan Web'),
                'customer_phone' => $order->customer_phone,
                'payment_method' => $order->payment_method,
                'payment_method_label' => $order->payment_method_label,
                'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                'created_at_formatted' => $order->created_at->format('d/m/Y H:i'),
                'created_date' => $order->created_at->format('Y-m-d'),
                'created_time' => $order->created_at->format('H:i'),
                'items_count' => $order->items->sum('quantity'),
                'gross_sales' => $orderGross,
                'discount_amount' => (float) $order->discount_amount,
                'net_sales' => $orderNet,
                'total_cogs' => $orderCogs,
                'gross_profit' => $orderGrossProfit,
                'margin_pct' => $orderMarginPct,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'items' => $orderItems,
            ];
        }

        // 2. Fetch Expenses (PosCashFlow out)
        // PosCashFlow is POS register physical cash. Exclude from web-only report so physical drawer expenses do not skew website sales profit.
        if ($channel === 'web') {
            $expenseRecords = collect();
            $totalExpenses = 0.0;
            $expenseBreakdown = [];
            $allExpenses = [];
            $otherIncome = 0.0;
        } else {
            $expenseQuery = PosCashFlow::where('type', 'out')
                ->whereBetween('recorded_at', [$start, $end])
                ->with('user')
                ->latest('recorded_at');

            /** @var Collection<int, PosCashFlow> $expenseRecords */
            $expenseRecords = $expenseQuery->get();
            $totalExpenses = (float) $expenseRecords->sum('amount');

            $expenseBreakdown = [];
            foreach ($expenseRecords->groupBy('category') as $cat => $records) {
                $catLabel = self::EXPENSE_CATEGORIES[$cat] ?? ucfirst(str_replace('_', ' ', (string) $cat));
                $catSum = (float) $records->sum('amount');
                $expenseBreakdown[] = [
                    'category' => $cat,
                    'label' => $catLabel,
                    'count' => $records->count(),
                    'total' => $catSum,
                    'pct_of_total' => $totalExpenses > 0 ? round(($catSum / $totalExpenses) * 100, 1) : 0.0,
                    'records' => $records->map(fn (PosCashFlow $r) => [
                        'id' => $r->id,
                        'category' => $r->category,
                        'category_label' => $catLabel,
                        'description' => $r->description ?: 'Pengeluaran Kas',
                        'amount' => (float) $r->amount,
                        'date' => $r->recorded_at->format('d/m/Y'),
                        'time' => $r->recorded_at->format('H:i'),
                        'date_time' => $r->recorded_at->format('d/m/Y H:i'),
                        'user_name' => $r->user?->name ?? 'Kasir / Admin',
                    ])->values()->all(),
                ];
            }

            // Sort expense breakdown by highest total
            usort($expenseBreakdown, fn ($a, $b) => $b['total'] <=> $a['total']);

            // Flat list of all expenses
            $allExpenses = $expenseRecords->map(fn (PosCashFlow $r) => [
                'id' => $r->id,
                'category' => $r->category,
                'category_label' => self::EXPENSE_CATEGORIES[$r->category] ?? ucfirst(str_replace('_', ' ', (string) $r->category)),
                'description' => $r->description ?: 'Pengeluaran Kas',
                'amount' => (float) $r->amount,
                'date' => $r->recorded_at->format('d/m/Y'),
                'date_key' => $r->recorded_at->format('Y-m-d'),
                'month_key' => $r->recorded_at->format('Y-m'),
                'time' => $r->recorded_at->format('H:i'),
                'date_time' => $r->recorded_at->format('d/m/Y H:i'),
                'user_name' => $r->user?->name ?? 'Kasir / Admin',
            ])->values()->all();

            // 3. Other Income
            $otherIncome = (float) PosCashFlow::where('type', 'in')
                ->where('category', '!=', 'modal_awal')
                ->whereBetween('recorded_at', [$start, $end])
                ->sum('amount');
        }

        // Map expenses into daily and monthly summary
        foreach ($expenseRecords as $exp) {
            $dKey = $exp->recorded_at->format('Y-m-d');
            $mKey = $exp->recorded_at->format('Y-m');

            if (isset($dailySummaryMap[$dKey])) {
                $dailySummaryMap[$dKey]['expenses_total'] += (float) $exp->amount;
            } else {
                $carbonDate = Carbon::parse($dKey);
                $dailySummaryMap[$dKey] = [
                    'date' => $dKey,
                    'date_label' => $carbonDate->translatedFormat('d F Y'),
                    'short_date' => $carbonDate->format('d/m'),
                    'day_name' => $carbonDate->translatedFormat('l'),
                    'total_transactions' => 0,
                    'web_transactions' => 0,
                    'pos_transactions' => 0,
                    'items_sold' => 0,
                    'net_sales' => 0.0,
                    'web_sales' => 0.0,
                    'pos_sales' => 0.0,
                    'total_cogs' => 0.0,
                    'gross_profit' => 0.0,
                    'expenses_total' => (float) $exp->amount,
                    'margin_pct' => 0.0,
                ];
            }

            if (isset($monthlySummaryMap[$mKey])) {
                $monthlySummaryMap[$mKey]['expenses_total'] += (float) $exp->amount;
            } else {
                $carbonMonth = Carbon::parse($mKey.'-01');
                $monthlySummaryMap[$mKey] = [
                    'month' => $mKey,
                    'month_label' => $carbonMonth->translatedFormat('F Y'),
                    'total_transactions' => 0,
                    'web_transactions' => 0,
                    'pos_transactions' => 0,
                    'items_sold' => 0,
                    'net_sales' => 0.0,
                    'web_sales' => 0.0,
                    'pos_sales' => 0.0,
                    'total_cogs' => 0.0,
                    'gross_profit' => 0.0,
                    'expenses_total' => (float) $exp->amount,
                    'net_profit' => 0.0,
                    'margin_pct' => 0.0,
                ];
            }
        }

        // Calculate margin % for each day in dailySummaryMap
        foreach ($dailySummaryMap as &$day) {
            $day['margin_pct'] = $day['net_sales'] > 0
                ? round(($day['gross_profit'] / $day['net_sales']) * 100, 1)
                : 0.0;
        }
        unset($day);
        krsort($dailySummaryMap);
        $dailySummaryList = array_values($dailySummaryMap);

        // Calculate net profit for each month in monthlySummaryMap
        foreach ($monthlySummaryMap as &$month) {
            $month['net_profit'] = $month['gross_profit'] - $month['expenses_total'];
            $month['margin_pct'] = $month['net_sales'] > 0
                ? round(($month['gross_profit'] / $month['net_sales']) * 100, 1)
                : 0.0;
        }
        unset($month);
        krsort($monthlySummaryMap);
        $monthlySummaryList = array_values($monthlySummaryMap);

        // 3. Other Income
        if ($channel === 'web') {
            $otherIncome = 0.0;
        } else {
            $otherIncome = (float) PosCashFlow::where('type', 'in')
                ->where('category', '!=', 'modal_awal')
                ->whereBetween('recorded_at', [$start, $end])
                ->sum('amount');
        }

        // 4. Consolidated Totals
        $totalDiscounts = max(0.0, round($grossSales - $netSales, 2));
        $grossProfit = $netSales - $totalCogs;
        $grossMarginPct = $netSales > 0 ? round(($grossProfit / $netSales) * 100, 2) : 0.0;

        $netProfit = $grossProfit - $totalExpenses + $otherIncome;
        $netMarginPct = $netSales > 0 ? round(($netProfit / $netSales) * 100, 2) : 0.0;

        // Channel Breakdown object
        $webGrossProfit = $webNetSales - $webCogs;
        $webMarginPct = $webNetSales > 0 ? round(($webGrossProfit / $webNetSales) * 100, 1) : 0.0;

        $posGrossProfit = $posNetSales - $posCogs;
        $posMarginPct = $posNetSales > 0 ? round(($posGrossProfit / $posNetSales) * 100, 1) : 0.0;

        // Top products by gross profit
        uasort($productBreakdowns, fn ($a, $b) => $b['profit'] <=> $a['profit']);
        $topProducts = array_values(array_slice($productBreakdowns, 0, 15));

        return [
            'start_date' => $start->format('Y-m-d H:i:s'),
            'end_date' => $end->format('Y-m-d H:i:s'),
            'channel' => $channel,
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
                'is_profitable' => $netProfit >= 0,
                'items_with_hpp_count' => $itemsWithHppCount,
                'items_without_hpp_count' => $itemsWithoutHppCount,
            ],
            'channels' => [
                'web' => [
                    'label' => 'Website Online',
                    'orders_count' => $webOrdersCount,
                    'net_sales' => $webNetSales,
                    'total_cogs' => $webCogs,
                    'gross_profit' => $webGrossProfit,
                    'margin_pct' => $webMarginPct,
                    'pct_of_sales' => $netSales > 0 ? round(($webNetSales / $netSales) * 100, 1) : 0.0,
                ],
                'pos' => [
                    'label' => 'POS Kasir Toko',
                    'orders_count' => $posOrdersCount,
                    'net_sales' => $posNetSales,
                    'total_cogs' => $posCogs,
                    'gross_profit' => $posGrossProfit,
                    'margin_pct' => $posMarginPct,
                    'pct_of_sales' => $netSales > 0 ? round(($posNetSales / $netSales) * 100, 1) : 0.0,
                ],
            ],
            'expense_breakdown' => $expenseBreakdown,
            'expenses' => $allExpenses,
            'daily_summary' => $dailySummaryList,
            'monthly_summary' => $monthlySummaryList,
            'transactions' => $transactionsList,
            'top_products' => $topProducts,
        ];
    }
}
