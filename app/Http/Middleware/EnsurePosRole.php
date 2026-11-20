<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePosRole
{
    /**
     * Roles allowed to access POS.
     *
     * @var array<string>
     */
    private const ALLOWED_ROLES = ['admin', 'owner', 'kasir'];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Redirect unauthenticated visitors to dedicated POS login
        if (! $user) {
            return redirect()->guest(route('pos.login'))->with('status', 'Silakan masuk dengan akun tim Sanubari (Admin, Owner, atau Kasir) untuk membuka POS.');
        }

        // Primary admin (ID 1) or allowed staff roles
        if ($user->hasPosAccess()) {
            return $next($request);
        }

        // User is authenticated as customer or non-staff: redirect to pos.login with clear warning
        return redirect()->route('pos.login')->with('warning', 'Akses Ditolak: Akun Anda ('.$user->email.') terdaftar sebagai Pelanggan. Portal POS hanya dapat diakses oleh Tim Internal Sanubari (Admin, Owner, Kasir).');
    }
}
