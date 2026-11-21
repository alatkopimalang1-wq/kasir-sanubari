<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PosInvoicePdfGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PosAuthController extends Controller
{
    /**
     * Display the dedicated POS login screen.
     */
    public function showLogin(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // If already authenticated with POS staff role, go straight to POS
        if ($user && $user->hasPosAccess()) {
            return redirect()->route('pos.index');
        }

        return Inertia::render('pos/login', [
            'status' => $request->session()->get('status'),
            'warning' => $request->session()->get('warning') ?? (
                $user && ! $user->hasPosAccess()
                    ? 'Akses Ditolak: Akun Anda saat ini ('.$user->email.') bukan akun Tim Kasir Sanubari. Silakan keluar dan masuk menggunakan akun Admin, Owner, atau Kasir.'
                    : null
            ),
            'currentUser' => $user ? [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ] : null,
        ]);
    }

    /**
     * Handle dedicated authentication attempt for POS.
     * Only Sanubari team members (admin, owner, kasir) are authorized.
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => trans('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }

        $user = User::where('email', $request->input('email'))->first();

        // Check password
        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'email' => 'Email atau kata sandi yang Anda masukkan tidak sesuai.',
            ]);
        }

        // STRICT ACCESS CHECK: Only Sanubari team members (Admin, Owner, Kasir)
        if (! $user->hasPosAccess()) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'email' => 'Akses ditolak. Portal ini khusus untuk tim Kasir Sanubari (Admin, Owner, Kasir). Pengunjung toko silakan masuk melalui halaman login website utama.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        // Login user
        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(route('pos.index'));
    }

    /**
     * Download Android APK for Kasir Sanubari (or direct A4 Invoice PDF attachment for Android POS WebView).
     */
    public function downloadApk(Request $request)
    {
        if ($request->boolean('invoice_pdf') && $request->filled('payload')) {
            return $this->streamInvoicePdfFromPayload((string) $request->query('payload'));
        }

        $posPath = public_path('downloads/Sanubari-POS.apk');
        if (file_exists($posPath)) {
            return response()->download($posPath, 'Sanubari-POS.apk', [
                'Content-Type' => 'application/vnd.android.package-archive',
            ]);
        }

        $kasirPath = public_path('downloads/Kasir-Sanubari.apk');
        if (file_exists($kasirPath)) {
            return response()->download($kasirPath, 'Kasir-Sanubari.apk', [
                'Content-Type' => 'application/vnd.android.package-archive',
            ]);
        }

        return redirect()->away('https://github.com/alatkopimalang1-wq/sanubari/releases/download/pos-apk-latest/Sanubari-POS.apk');
    }

    /**
     * Decode base64/base64url JSON invoice payload and return binary A4 PDF download response.
     */
    public function streamInvoicePdfFromPayload(string $encodedPayload): HttpResponse
    {
        $normalized = strtr($encodedPayload, '-_', '+/');
        $pad = strlen($normalized) % 4;
        if ($pad > 0) {
            $normalized .= str_repeat('=', 4 - $pad);
        }

        $decodedJson = base64_decode($normalized, true);
        $data = is_string($decodedJson) ? json_decode($decodedJson, true) : null;
        if (! is_array($data)) {
            $data = [];
        }

        $pdfBinary = PosInvoicePdfGenerator::generate($data);

        $custSlug = Str::slug((string) ($data['customer_name'] ?? 'Pelanggan')) ?: 'Pelanggan';
        $filename = 'Invoice-Kasir-Sanubari-'.$custSlug.'-'.now()->format('Ymd-His').'.pdf';

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Content-Length' => (string) strlen($pdfBinary),
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }

    /**
     * Download Windows PC Application for Kasir Sanubari.
     */
    public function downloadPc()
    {
        $filePath = public_path('downloads/Kasir-Sanubari-Setup.exe');

        if (file_exists($filePath)) {
            return response()->download($filePath, 'Kasir-Sanubari-Setup.exe', [
                'Content-Type' => 'application/vnd.microsoft.portable-executable',
            ]);
        }

        return redirect()->route('pos.login')->with('status', 'File installer PC (.exe) sedang disiapkan. Anda dapat langsung memasang aplikasi ke komputer/PC kasir sekarang dengan mengklik tombol "Pasang di PC (PWA Windows)" di layar ini.');
    }

    /**
     * Log out from POS and return to POS login.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('pos.login')->with('status', 'Anda telah berhasil keluar dari Terminal POS.');
    }
}
