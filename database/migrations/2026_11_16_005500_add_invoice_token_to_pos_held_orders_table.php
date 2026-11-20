<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_held_orders', function (Blueprint $table) {
            $table->string('invoice_token', 64)->nullable()->unique()->after('queue_number');
            $table->json('payment_info')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('pos_held_orders', function (Blueprint $table) {
            $table->dropColumn(['invoice_token', 'payment_info']);
        });
    }
};
