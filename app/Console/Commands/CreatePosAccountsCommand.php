<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreatePosAccountsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pos:create-accounts {--password=password123 : Password to set for the POS accounts}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or update POS staff accounts for admin, owner, and kasir';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $password = (string) $this->option('password');
        $hashed = Hash::make($password);

        $accounts = [
            [
                'role' => 'admin',
                'name' => 'Admin Sanubari',
                'email' => 'admin@sanubari.co.id',
            ],
            [
                'role' => 'owner',
                'name' => 'Owner Sanubari',
                'email' => 'owner@sanubari.co.id',
            ],
            [
                'role' => 'kasir',
                'name' => 'Kasir Sanubari',
                'email' => 'kasir@sanubari.co.id',
            ],
        ];

        $rows = [];

        foreach ($accounts as $acc) {
            $user = User::updateOrCreate(
                ['email' => $acc['email']],
                [
                    'name' => $acc['name'],
                    'role' => $acc['role'],
                    'password' => $hashed,
                    'email_verified_at' => now(),
                ]
            );

            $rows[] = [
                $acc['role'],
                $user->name,
                $user->email,
                $password,
            ];
        }

        // Also update existing known emails
        User::where('id', 1)->update(['role' => 'admin']);
        User::where('email', 'admin@app.com')->update(['role' => 'admin']);
        User::where('email', 'alatkopimalang2@gmail.com')->update(['role' => 'admin']);
        User::where('email', 'alatkopimalang1@gmail.com')->update(['role' => 'admin']);
        User::where('email', 'mr0604275@gmail.com')->update(['role' => 'owner']);
        User::where('email', 'mr0604000@gmail.com')->update(['role' => 'owner']);
        User::where('email', 'email@sanubariroastery.co.id')->update(['role' => 'kasir']);

        // Demote all other users to 'customer'
        User::where('email', 'like', 'wa_%')->update(['role' => 'customer']);
        User::whereNotIn('email', [
            'admin@sanubari.co.id',
            'owner@sanubari.co.id',
            'kasir@sanubari.co.id',
            'email@sanubariroastery.co.id',
            'admin@app.com',
            'alatkopimalang1@gmail.com',
            'alatkopimalang2@gmail.com',
            'mr0604275@gmail.com',
            'mr0604000@gmail.com',
        ])->where('id', '!=', 1)->update(['role' => 'customer']);

        $this->info('Akun POS berhasil dibuat / diperbarui!');
        $this->table(['Peran (Role)', 'Nama Akun', 'Email Login', 'Password'], $rows);

        return self::SUCCESS;
    }
}
