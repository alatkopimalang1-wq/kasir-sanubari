<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ClearPosSessionsCommand extends Command
{
    protected $signature = 'pos:clear-sessions';

    protected $description = 'Clear all active login sessions and cache so only authorized Sanubari team members can access POS';

    public function handle(): int
    {
        $this->info('Membersihkan sesi login dan cache POS...');

        // 1. Truncate active sessions table
        if (Schema::hasTable('sessions')) {
            $count = DB::table('sessions')->count();
            DB::table('sessions')->truncate();
            $this->info("✓ Berhasil membersihkan {$count} sesi aktif dari tabel sessions.");
        }

        // 2. Clear application cache
        try {
            Cache::flush();
            $this->info('✓ Cache aplikasi dan rate limiter berhasil dibersihkan.');
        } catch (\Throwable $e) {
            $this->warn('Gagal membersihkan cache aplikasi: '.$e->getMessage());
        }

        // 3. Clear optimize cache
        Artisan::call('optimize:clear');
        $this->info('✓ Cache konfigurasi, rute, dan tampilan (views) berhasil dibersihkan.');

        $this->newLine();
        $this->info('SEMUA PENGGUNA BERHASIL DI-LOGOUT.');
        $this->line('Setiap pengguna sekarang diwajibkan login ulang.');
        $this->line('Hanya akun Tim Sanubari (Admin, Owner, Kasir) yang diizinkan masuk ke POS.');

        return self::SUCCESS;
    }
}
