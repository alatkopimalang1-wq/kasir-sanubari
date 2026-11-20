<?php

namespace App\Filament\Pages;

use App\Services\ProfitLossService;
use BackedEnum;
use Carbon\Carbon;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class LaporanLabaRugi extends Page
{
    protected static bool $shouldRegisterNavigation = false;

    public static function shouldRegisterNavigation(): bool
    {
        return false;
    }

    protected static string|BackedEnum|null $navigationIcon = Heroicon::PresentationChartLine;

    protected static string|\UnitEnum|null $navigationGroup = 'Katalog & Toko';

    protected static ?string $navigationLabel = 'Laporan Laba Rugi';

    protected static ?string $title = 'Laporan Laba Rugi (Konsolidasi Web & POS)';

    protected static ?int $navigationSort = 1;

    protected string $view = 'filament.pages.laporan-laba-rugi';

    /**
     * Active period filter: 'today', 'yesterday', 'this_month', 'last_month', 'custom_month', 'custom_range'.
     */
    public string $period = 'this_month';

    public string $selectedMonth = '';

    public string $startDate = '';

    public string $endDate = '';

    /**
     * Sales channel filter: 'all', 'web', 'pos'.
     */
    public string $channel = 'all';

    /**
     * Active view tab: 'ringkasan', 'bulanan', 'pesanan', 'pengeluaran'.
     */
    public string $activeViewTab = 'ringkasan';

    /**
     * Expense category filter: 'all' or category key.
     */
    public string $expenseCategory = 'all';

    public string $searchTransaction = '';

    public string $searchExpense = '';

    public function mount(): void
    {
        $now = Carbon::now();
        $this->selectedMonth = $now->format('Y-m');
        $this->startDate = $now->copy()->startOfMonth()->format('Y-m-d');
        $this->endDate = $now->copy()->endOfMonth()->format('Y-m-d');
    }

    public function setPeriod(string $newPeriod): void
    {
        $this->period = $newPeriod;
        $now = Carbon::now();

        if ($newPeriod === 'today') {
            $this->startDate = $now->format('Y-m-d');
            $this->endDate = $now->format('Y-m-d');
        } elseif ($newPeriod === 'yesterday') {
            $yesterday = Carbon::yesterday();
            $this->startDate = $yesterday->format('Y-m-d');
            $this->endDate = $yesterday->format('Y-m-d');
        } elseif ($newPeriod === 'this_month') {
            $this->selectedMonth = $now->format('Y-m');
            $this->startDate = $now->copy()->startOfMonth()->format('Y-m-d');
            $this->endDate = $now->copy()->endOfMonth()->format('Y-m-d');
        } elseif ($newPeriod === 'last_month') {
            $lastMonth = $now->copy()->subMonth();
            $this->selectedMonth = $lastMonth->format('Y-m');
            $this->startDate = $lastMonth->copy()->startOfMonth()->format('Y-m-d');
            $this->endDate = $lastMonth->copy()->endOfMonth()->format('Y-m-d');
        } elseif ($newPeriod === 'custom_month') {
            if (! empty($this->selectedMonth)) {
                $m = Carbon::parse($this->selectedMonth.'-01');
                $this->startDate = $m->copy()->startOfMonth()->format('Y-m-d');
                $this->endDate = $m->copy()->endOfMonth()->format('Y-m-d');
            }
        }
    }

    public function updatedSelectedMonth(): void
    {
        if ($this->period === 'custom_month' && ! empty($this->selectedMonth)) {
            $m = Carbon::parse($this->selectedMonth.'-01');
            $this->startDate = $m->copy()->startOfMonth()->format('Y-m-d');
            $this->endDate = $m->copy()->endOfMonth()->format('Y-m-d');
        }
    }

    public function setChannel(string $newChannel): void
    {
        $this->channel = in_array($newChannel, ['all', 'web', 'pos']) ? $newChannel : 'all';
    }

    public function setActiveTab(string $tab): void
    {
        $this->activeViewTab = $tab;
    }

    public function setExpenseCategory(string $cat): void
    {
        $this->expenseCategory = $cat;
    }

    /**
     * Get computed Profit & Loss Report data.
     *
     * @return array<string, mixed>
     */
    public function getReportDataProperty(): array
    {
        if ($this->period === 'today') {
            $start = Carbon::today()->startOfDay();
            $end = Carbon::today()->endOfDay();
        } elseif ($this->period === 'yesterday') {
            $start = Carbon::yesterday()->startOfDay();
            $end = Carbon::yesterday()->endOfDay();
        } elseif ($this->period === 'this_month') {
            $start = Carbon::now()->startOfMonth();
            $end = Carbon::now()->endOfMonth();
        } elseif ($this->period === 'last_month') {
            $start = Carbon::now()->subMonth()->startOfMonth();
            $end = Carbon::now()->subMonth()->endOfMonth();
        } elseif ($this->period === 'custom_month') {
            $m = Carbon::parse(($this->selectedMonth ?: Carbon::now()->format('Y-m')).'-01');
            $start = $m->copy()->startOfMonth();
            $end = $m->copy()->endOfMonth();
        } else {
            // custom_range
            $start = Carbon::parse($this->startDate ?: Carbon::now()->startOfMonth()->format('Y-m-d'))->startOfDay();
            $end = Carbon::parse($this->endDate ?: Carbon::now()->endOfMonth()->format('Y-m-d'))->endOfDay();
        }

        return ProfitLossService::getReport($start, $end, $this->channel);
    }
}
