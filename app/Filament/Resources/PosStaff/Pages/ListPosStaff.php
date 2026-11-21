<?php

namespace App\Filament\Resources\PosStaff\Pages;

use App\Filament\Resources\PosStaff\PosStaffResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPosStaff extends ListRecords
{
    protected static string $resource = PosStaffResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()->label('Tambah Staf Baru'),
        ];
    }
}
