<?php

namespace App\Filament\Resources\PosStaff;

use App\Filament\Resources\PosStaff\Pages\CreatePosStaff;
use App\Filament\Resources\PosStaff\Pages\EditPosStaff;
use App\Filament\Resources\PosStaff\Pages\ListPosStaff;
use App\Filament\Resources\PosStaff\Schemas\PosStaffForm;
use App\Filament\Resources\PosStaff\Tables\PosStaffTable;
use App\Models\User;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PosStaffResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Users;

    protected static string|\UnitEnum|null $navigationGroup = 'Manajemen POS Kasir';

    protected static ?string $navigationLabel = 'Kelola Staf & Kasir';

    protected static ?string $title = 'Kelola Staf Kasir POS';

    protected static ?int $navigationSort = 2;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->where(function ($query) {
                $query->whereIn('role', ['kasir', 'admin', 'owner'])
                    ->orWhere('id', 1);
            });
    }

    public static function form(Schema $schema): Schema
    {
        return PosStaffForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PosStaffTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPosStaff::route('/'),
            'create' => CreatePosStaff::route('/create'),
            'edit' => EditPosStaff::route('/{record}/edit'),
        ];
    }
}
