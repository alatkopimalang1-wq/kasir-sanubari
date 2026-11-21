<?php

namespace App\Filament\Resources\PosStaff\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class PosStaffForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                Section::make('Informasi Akun Staf POS')
                    ->description('Atur identitas login dan wewenang akun kasir / backoffice POS.')
                    ->schema([
                        Grid::make(2)->schema([
                            TextInput::make('name')
                                ->label('Nama Lengkap Kasir / Staf')
                                ->placeholder('Contoh: Barista Budi')
                                ->required()
                                ->maxLength(255),

                            TextInput::make('email')
                                ->label('Alamat Email (Login)')
                                ->email()
                                ->placeholder('budi@sanubari.id')
                                ->required()
                                ->unique(ignoreRecord: true)
                                ->maxLength(255),
                        ]),

                        Grid::make(2)->schema([
                            TextInput::make('phone')
                                ->label('Nomor WhatsApp / HP')
                                ->tel()
                                ->placeholder('08123456789'),

                            Select::make('role')
                                ->label('Peran / Hak Akses POS')
                                ->options([
                                    'kasir' => 'Kasir POS (Transaksi, Cetak Struk, Laporan Harian)',
                                    'admin' => 'Admin POS (Akses Backoffice, Menu, Kategori, Struk)',
                                    'owner' => 'Owner / Pemilik (Akses Penuh Seluruh POS & Laba Rugi)',
                                ])
                                ->default('kasir')
                                ->required(),
                        ]),

                        Grid::make(1)->schema([
                            TextInput::make('password')
                                ->label('Kata Sandi (Password)')
                                ->password()
                                ->revealable()
                                ->dehydrated(fn (?string $state): bool => filled($state))
                                ->required(fn (string $operation): bool => $operation === 'create')
                                ->helperText('Kosongkan jika tidak ingin mengubah password yang sudah ada.')
                                ->maxLength(255),
                        ]),
                    ]),
            ]);
    }
}
