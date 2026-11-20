<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class ListUsersCommand extends Command
{
    protected $signature = 'users:list';

    protected $description = 'List all users and their roles';

    public function handle(): int
    {
        $users = User::all(['id', 'name', 'email', 'role', 'created_at']);
        $rows = $users->map(fn ($u) => [
            $u->id,
            $u->name,
            $u->email,
            $u->role ?? '(null)',
            $u->created_at?->format('Y-m-d H:i') ?? '-',
        ])->toArray();

        $this->table(['ID', 'Name', 'Email', 'Role', 'Created At'], $rows);

        return self::SUCCESS;
    }
}
