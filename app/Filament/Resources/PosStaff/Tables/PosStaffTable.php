<?php

namespace App\Filament\Resources\PosStaff\Tables;

use App\Models\User;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PosStaffTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nama Staf')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('email')
                    ->label('Email Login')
                    ->searchable()
                    ->copyable()
                    ->sortable(),

                TextColumn::make('role')
                    ->label('Peran / Role')
                    ->badge()
                    ->formatStateUsing(fn (?string $state, User $record): string => match ($state) {
                        'owner' => 'Owner',
                        'admin' => 'Admin POS',
                        'kasir' => 'Kasir',
                        default => $record->id === 1 ? 'Owner (Superadmin)' : ucfirst((string) $state),
                    })
                    ->color(fn (?string $state, User $record): string => match ($state) {
                        'owner' => 'danger',
                        'admin' => 'primary',
                        'kasir' => 'success',
                        default => $record->id === 1 ? 'danger' : 'gray',
                    }),

                TextColumn::make('phone')
                    ->label('No. WhatsApp')
                    ->placeholder('-')
                    ->searchable(),

                TextColumn::make('created_at')
                    ->label('Terdaftar Sejak')
                    ->dateTime('d M Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('role')
                    ->label('Filter Peran')
                    ->options([
                        'kasir' => 'Kasir POS',
                        'admin' => 'Admin POS',
                        'owner' => 'Owner',
                    ]),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make()
                    ->hidden(fn (User $record): bool => $record->id === 1 || $record->id === auth()->id()),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
