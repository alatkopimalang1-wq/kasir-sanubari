<?php

namespace App\Filament\Resources\PosStaff\Pages;

use App\Filament\Concerns\RedirectsToPreviousUrl;
use App\Filament\Resources\PosStaff\PosStaffResource;
use App\Models\User;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPosStaff extends EditRecord
{
    use RedirectsToPreviousUrl;

    protected static string $resource = PosStaffResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()
                ->hidden(fn (User $record): bool => $record->id === 1 || $record->id === auth()->id()),
        ];
    }
}
