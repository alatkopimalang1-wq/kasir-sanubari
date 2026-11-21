<?php

namespace App\Filament\Pages;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use BackedEnum;
use Carbon\Carbon;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\DB;

class PosDashboard extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::ComputerDesktop;

    protected static string|\UnitEnum|null $navigationGroup = 'Manajemen POS Kasir';

    protected static ?string $navigationLabel = 'Dashboard POS';

    protected static ?string $title = 'Dashboard POS (Backoffice)';

    protected static ?int $navigationSort = 0;

    protected string $view = 'filament.pages.pos-dashboard';

    public string $period = 'today';

    public function setPeriod(string $p): void
    {
        $this->period = $p;
    }

    public function getViewData(): array
    {
        $start = null;
        $end = null;

        if ($this->period === 'today') {
            $start = Carbon::today();
            $end = Carbon::now()->endOfDay();
        } elseif ($this->period === 'yesterday') {
            $start = Carbon::yesterday()->startOfDay();
            $end = Carbon::yesterday()->endOfDay();
        } elseif ($this->period === 'last_7_days') {
            $start = Carbon::today()->subDays(6)->startOfDay();
            $end = Carbon::now()->endOfDay();
        } elseif ($this->period === 'this_month') {
            $start = Carbon::now()->startOfMonth();
            $end = Carbon::now()->endOfDay();
        }

        $baseOrders = Order::query()->posOnly();
        if ($start && $end) {
            $baseOrders->whereBetween('created_at', [$start, $end]);
        }

        $paidOrders = (clone $baseOrders)->where('payment_status', 'paid')->where('status', '!=', 'cancelled');
        $refundedOrders = (clone $baseOrders)->where('status', 'cancelled');

        $totalSales = (float) $paidOrders->sum('total_amount');
        $totalTransactions = $paidOrders->count();
        $avgTicket = $totalTransactions > 0 ? round($totalSales / $totalTransactions) : 0;

        $refundCount = $refundedOrders->count();
        $refundAmount = (float) $refundedOrders->sum('total_amount');

        // Payment Methods Breakdown
        $cashSales = (float) (clone $paidOrders)->whereIn('payment_method', ['cash', 'tunai'])->sum('total_amount');
        $cashCount = (clone $paidOrders)->whereIn('payment_method', ['cash', 'tunai'])->count();

        $qrisSales = (float) (clone $paidOrders)->where('payment_method', 'qris')->sum('total_amount');
        $qrisCount = (clone $paidOrders)->where('payment_method', 'qris')->count();

        $transferSales = (float) (clone $paidOrders)->where('payment_method', 'bank_transfer')->sum('total_amount');
        $transferCount = (clone $paidOrders)->where('payment_method', 'bank_transfer')->count();

        $debitSales = (float) (clone $paidOrders)->where('payment_method', 'debit')->sum('total_amount');
        $debitCount = (clone $paidOrders)->where('payment_method', 'debit')->count();

        // Top 5 Products Sold in POS
        $topItemsQuery = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where(function ($sub) {
                $sub->where('orders.order_number', 'like', 'POS-%')
                    ->orWhere('orders.payment_details->source', 'pos');
            })
            ->where('orders.payment_status', 'paid')
            ->where('orders.status', '!=', 'cancelled');

        if ($start && $end) {
            $topItemsQuery->whereBetween('orders.created_at', [$start, $end]);
        }

        $topProducts = (clone $topItemsQuery)
            ->select('order_items.product_name', DB::raw('SUM(order_items.quantity) as total_qty'), DB::raw('SUM(order_items.subtotal) as total_revenue'))
            ->groupBy('order_items.product_name')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        $totalItemsSold = (int) (clone $topItemsQuery)->sum('order_items.quantity');

        // Recent 10 POS Orders
        $recentOrders = (clone $baseOrders)
            ->with(['items', 'user'])
            ->latest()
            ->take(10)
            ->get();

        $cashierCount = User::whereIn('role', ['kasir', 'admin', 'owner'])->orWhere('id', 1)->count();

        return [
            'period' => $this->period,
            'totalSales' => $totalSales,
            'totalTransactions' => $totalTransactions,
            'avgTicket' => $avgTicket,
            'refundCount' => $refundCount,
            'refundAmount' => $refundAmount,
            'totalItemsSold' => $totalItemsSold,
            'cashierCount' => $cashierCount,
            'payments' => [
                'cash' => ['amount' => $cashSales, 'count' => $cashCount],
                'qris' => ['amount' => $qrisSales, 'count' => $qrisCount],
                'transfer' => ['amount' => $transferSales, 'count' => $transferCount],
                'debit' => ['amount' => $debitSales, 'count' => $debitCount],
            ],
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
        ];
    }
}
