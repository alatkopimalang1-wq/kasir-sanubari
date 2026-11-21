<?php

namespace App\Filament\Resources\PosOrders\Tables;

use App\Models\Order;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Forms\Components\DatePicker;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PosOrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order_number')
                    ->label('No. Struk POS')
                    ->searchable()
                    ->sortable()
                    ->fontFamily('mono')
                    ->weight('bold')
                    ->copyable()
                    ->color('primary'),

                TextColumn::make('created_at')
                    ->label('Waktu Transaksi')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),

                TextColumn::make('customer_name')
                    ->label('Pelanggan / Meja')
                    ->searchable()
                    ->sortable()
                    ->formatStateUsing(fn ($state) => $state ?: 'Pelanggan Walk-in'),

                TextColumn::make('cashier_name')
                    ->label('Kasir Bertugas')
                    ->state(fn (Order $record) => $record->payment_details['cashier_name'] ?? ($record->user?->name ?? 'Kasir'))
                    ->searchable(query: function (Builder $query, string $search): Builder {
                        return $query->where('payment_details->cashier_name', 'like', "%{$search}%")
                            ->orWhereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                    }),

                TextColumn::make('payment_method')
                    ->label('Metode Bayar')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'cash', 'tunai' => 'Tunai / Cash',
                        'qris' => 'QRIS Toko',
                        'bank_transfer' => 'Transfer Bank',
                        'debit' => 'Kartu Debit',
                        default => ucfirst($state),
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'cash', 'tunai' => 'success',
                        'qris' => 'primary',
                        'bank_transfer' => 'info',
                        'debit' => 'warning',
                        default => 'gray',
                    }),

                TextColumn::make('total_amount')
                    ->label('Total Transaksi')
                    ->money('IDR', locale: 'id')
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'cancelled' => 'danger',
                        'completed' => 'success',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'cancelled' => 'Refund / Batal',
                        'completed' => 'Lunas',
                        default => ucfirst($state),
                    }),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Filter::make('created_at')
                    ->form([
                        DatePicker::make('created_from')->label('Dari Tanggal'),
                        DatePicker::make('created_until')->label('Sampai Tanggal'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['created_from'], fn (Builder $q, $date) => $q->whereDate('created_at', '>=', $date))
                            ->when($data['created_until'], fn (Builder $q, $date) => $q->whereDate('created_at', '<=', $date));
                    }),

                SelectFilter::make('payment_method')
                    ->label('Metode Bayar')
                    ->options([
                        'cash' => 'Tunai / Cash',
                        'qris' => 'QRIS Toko',
                        'bank_transfer' => 'Transfer Bank',
                        'debit' => 'Kartu Debit',
                    ]),

                SelectFilter::make('status')
                    ->label('Status Pesanan')
                    ->options([
                        'completed' => 'Lunas / Selesai',
                        'cancelled' => 'Refund / Dibatalkan',
                    ]),
            ])
            ->actions([
                Action::make('viewReceipt')
                    ->label('Lihat Struk')
                    ->icon(Heroicon::ReceiptPercent)
                    ->color('primary')
                    ->modalHeading(fn (Order $record) => "Detail Transaksi POS: {$record->order_number}")
                    ->modalContent(fn (Order $record) => view('filament.pos-orders.receipt-modal', [
                        'order' => $record->loadMissing('items'),
                    ]))
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Tutup'),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
