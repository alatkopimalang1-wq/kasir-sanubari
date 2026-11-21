<?php

namespace App\Filament\Resources\PosOrders\Pages;

use App\Filament\Resources\PosOrders\PosOrderResource;
use Filament\Actions\Action;
use Filament\Resources\Pages\ListRecords;
use Filament\Support\Icons\Heroicon;

class ListPosOrders extends ListRecords
{
    protected static string $resource = PosOrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('openPos')
                ->label('Buka Kasir POS')
                ->icon(Heroicon::ComputerDesktop)
                ->color('success')
                ->url(fn (): string => route('pos.index'))
                ->openUrlInNewTab(),
        ];
    }
}
