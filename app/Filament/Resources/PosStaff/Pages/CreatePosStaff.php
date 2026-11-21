<?php

namespace App\Filament\Resources\PosStaff\Pages;

use App\Filament\Concerns\RedirectsToPreviousUrl;
use App\Filament\Resources\PosStaff\PosStaffResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePosStaff extends CreateRecord
{
    use RedirectsToPreviousUrl;

    protected static string $resource = PosStaffResource::class;
}
