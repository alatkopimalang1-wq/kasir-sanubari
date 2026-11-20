<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PosHeldOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'queue_number',
        'invoice_token',
        'customer_name',
        'customer_phone',
        'notes',
        'payment_info',
        'items',
        'subtotal',
        'discount_amount',
        'total_amount',
        'status',
        'held_at',
    ];

    protected $casts = [
        'items' => 'array',
        'payment_info' => 'array',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'held_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeHolding($query)
    {
        return $query->where('status', 'holding')->orderByDesc('held_at');
    }

    public static function generateQueueNumber(): string
    {
        $today = now()->format('ymd');
        $count = static::whereDate('created_at', now()->format('Y-m-d'))->count() + 1;

        return 'Q-'.str_pad((string) $count, 3, '0', STR_PAD_LEFT);
    }

    public static function generateInvoiceToken(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(bin2hex(random_bytes(3))); // 6 hex chars

        return 'INV-POS-'.$date.'-'.$random;
    }
}
