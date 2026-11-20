<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_held_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('queue_number')->nullable();
            $table->string('customer_name')->default('Pelanggan Antrian');
            $table->string('customer_phone')->nullable();
            $table->text('notes')->nullable();
            $table->json('items');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('status', 20)->default('holding'); // holding, restored, cancelled
            $table->timestamp('held_at')->useCurrent();
            $table->timestamps();

            $table->index(['status', 'held_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_held_orders');
    }
};
