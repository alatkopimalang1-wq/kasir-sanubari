<?php

namespace App\Filament\Resources\PosOrders;

use App\Filament\Resources\PosOrders\Pages\ListPosOrders;
use App\Filament\Resources\PosOrders\Tables\PosOrdersTable;
use App\Models\Order;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PosOrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::ReceiptPercent;

    protected static string|\UnitEnum|null $navigationGroup = 'Manajemen POS Kasir';

    protected static ?string $navigationLabel = 'Riwayat Transaksi POS';

    protected static ?string $title = 'Riwayat Transaksi POS Kasir';

    protected static ?int $navigationSort = 1;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->posOnly()->latest();
    }

    public static function table(Table $table): Table
    {
        return PosOrdersTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPosOrders::route('/'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        $todayCount = static::getEloquentQuery()
            ->whereDate('created_at', today())
            ->count();

        return $todayCount > 0 ? (string) $todayCount : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'primary';
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Jumlah transaksi POS hari ini';
    }
}
