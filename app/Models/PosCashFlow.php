<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosCashFlow extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'category',
        'amount',
        'description',
        'recorded_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getTypeLabelAttribute(): string
    {
        return $this->type === 'in' ? 'Pemasukan Kas' : 'Pengeluaran Kas';
    }

    public function getCategoryLabelAttribute(): string
    {
        return match ($this->category) {
            'modal_awal' => 'Modal Awal Kasir',
            'pendapatan_lain' => 'Pemasukan Lain-lain',
            'operasional' => 'Operasional Toko',
            'bahan_baku' => 'Bahan Baku / Tambahan',
            'kebersihan' => 'Kebersihan & Keperluan Toko',
            'transport' => 'Transport / Logistik',
            'gaji' => 'Upah & Gaji Kasir/Barista',
            'lainnya' => 'Pengeluaran Lainnya',
            default => ucfirst(str_replace('_', ' ', $this->category)),
        };
    }
}
