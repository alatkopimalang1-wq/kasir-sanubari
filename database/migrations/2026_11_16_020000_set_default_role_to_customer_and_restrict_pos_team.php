<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Change column default on users table to 'customer'
        try {
            if (DB::getDriverName() === 'mysql' || DB::getDriverName() === 'mariadb') {
                DB::statement("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'customer'");
            } else {
                Schema::table('users', function (Blueprint $table) {
                    $table->string('role', 20)->default('customer')->change();
                });
            }
        } catch (Throwable $e) {
            // Silently fallback if column alter is restricted
        }

        // 2. Approved staff whitelist: Only explicit Sanubari team members
        $staffEmails = [
            'admin@sanubari.co.id' => 'admin',
            'owner@sanubari.co.id' => 'owner',
            'kasir@sanubari.co.id' => 'kasir',
            'email@sanubariroastery.co.id' => 'kasir',
            'admin@app.com' => 'admin',
            'mr0604275@gmail.com' => 'owner',
            'mr0604000@gmail.com' => 'owner',
            'alatkopimalang1@gmail.com' => 'admin',
            'alatkopimalang2@gmail.com' => 'admin',
        ];

        // Ensure approved staff accounts are set properly
        foreach ($staffEmails as $email => $role) {
            DB::table('users')->where('email', $email)->update(['role' => $role]);
        }

        // Primary system admin
        DB::table('users')->where('id', 1)->update(['role' => 'admin']);

        // Demote ALL other users to 'customer' so that regular customers/visitors CANNOT login to POS
        $whitelistedEmails = array_keys($staffEmails);

        DB::table('users')
            ->where('id', '!=', 1)
            ->whereNotIn('email', $whitelistedEmails)
            ->update(['role' => 'customer']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            if (DB::getDriverName() === 'mysql' || DB::getDriverName() === 'mariadb') {
                DB::statement("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'kasir'");
            }
        } catch (Throwable $e) {
            //
        }
    }
};
