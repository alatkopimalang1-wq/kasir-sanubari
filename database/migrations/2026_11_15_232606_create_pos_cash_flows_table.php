<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_cash_flows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['in', 'out'])->default('out'); // 'in' = pemasukan, 'out' = pengeluaran
            $table->string('category')->default('operasional'); // modal_awal, operasional, bahan_baku, kebersihan, dll
            $table->decimal('amount', 12, 2)->default(0);
            $table->text('description')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();

            $table->index(['type', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_cash_flows');
    }
};
