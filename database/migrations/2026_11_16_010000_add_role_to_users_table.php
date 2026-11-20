<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role', 20)->default('kasir')->after('email')->index();
            });
        }

        DB::table('users')
            ->whereNull('role')
            ->update(['role' => 'kasir']);

        // Update known existing accounts
        DB::table('users')->where('id', 1)->update(['role' => 'admin']);
        DB::table('users')->where('email', 'admin@app.com')->update(['role' => 'admin']);
        DB::table('users')->where('email', 'alatkopimalang2@gmail.com')->update(['role' => 'admin']);
        DB::table('users')->where('email', 'alatkopimalang1@gmail.com')->update(['role' => 'admin']);
        DB::table('users')->where('email', 'mr0604275@gmail.com')->update(['role' => 'owner']);
        DB::table('users')->where('email', 'mr0604000@gmail.com')->update(['role' => 'owner']);
        DB::table('users')->where('email', 'email@sanubariroastery.co.id')->update(['role' => 'kasir']);

        // Default password for newly created staff accounts
        $defaultPassword = Hash::make('password123');

        // 1. Admin Account: admin@sanubari.co.id
        $admin = DB::table('users')->where('email', 'admin@sanubari.co.id')->first();
        if (! $admin) {
            DB::table('users')->insert([
                'name' => 'Admin Sanubari',
                'email' => 'admin@sanubari.co.id',
                'role' => 'admin',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('users')->where('id', $admin->id)->update([
                'role' => 'admin',
                'password' => $defaultPassword,
            ]);
        }

        // 2. Owner Account: owner@sanubari.co.id
        $owner = DB::table('users')->where('email', 'owner@sanubari.co.id')->first();
        if (! $owner) {
            DB::table('users')->insert([
                'name' => 'Owner Sanubari',
                'email' => 'owner@sanubari.co.id',
                'role' => 'owner',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('users')->where('id', $owner->id)->update([
                'role' => 'owner',
                'password' => $defaultPassword,
            ]);
        }

        // 3. Kasir Account: kasir@sanubari.co.id
        $kasir = DB::table('users')->where('email', 'kasir@sanubari.co.id')->first();
        if (! $kasir) {
            DB::table('users')->insert([
                'name' => 'Kasir Sanubari',
                'email' => 'kasir@sanubari.co.id',
                'role' => 'kasir',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('users')->where('id', $kasir->id)->update([
                'role' => 'kasir',
                'password' => $defaultPassword,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                try {
                    $table->dropIndex(['role']);
                } catch (Throwable $e) {
                }
                $table->dropColumn('role');
            });
        }
    }
};
