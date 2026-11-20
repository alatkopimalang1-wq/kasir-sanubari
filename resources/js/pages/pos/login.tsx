import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Coffee,
    Lock,
    Shield,
    Eye,
    EyeOff,
    Store,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    Users,
    KeyRound,
    Sun,
    Moon,
} from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

interface Props {
    status?: string | null;
    warning?: string | null;
    currentUser?: {
        name: string;
        email: string;
        role?: string;
    } | null;
    errors?: Record<string, string>;
}

export default function PosLogin({ status, warning, currentUser }: Props) {
    const { appearance, updateAppearance } = useAppearance();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pos/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-stone-950 font-sans text-stone-100 antialiased selection:bg-amber-600 selection:text-white">
            <Head title="Masuk Terminal Kasir — Sanubari POS" />

            {/* Background Decorative Glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
                <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
                <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-stone-800/20 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-15"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                    }}
                />
            </div>

            {/* Top Bar: Store Link & Theme Toggle */}
            <header className="relative z-10 flex items-center justify-between border-b border-stone-800/80 bg-stone-900/40 px-4 py-4 backdrop-blur-md sm:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg shadow-amber-900/40">
                        <Coffee className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="block text-sm font-bold tracking-tight text-stone-100 sm:text-base">
                            KASIR SANUBARI
                        </span>
                        <span className="block text-[10px] font-semibold tracking-wider text-amber-400 uppercase sm:text-xs">
                            Point of Sale • Terminal Kasir
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            updateAppearance(
                                appearance === 'dark' ? 'light' : 'dark',
                            )
                        }
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg p-2 text-xs text-stone-400 transition hover:bg-stone-800/60 hover:text-stone-200"
                        title="Ganti Mode Tampilan"
                    >
                        {appearance === 'dark' ? (
                            <Sun className="h-4 w-4 text-amber-400" />
                        ) : (
                            <Moon className="h-4 w-4 text-stone-300" />
                        )}
                        <span className="hidden text-xs sm:inline">
                            {appearance === 'dark' ? 'Terang' : 'Gelap'}
                        </span>
                    </button>

                    <Link
                        href="/"
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-400 transition hover:bg-stone-800/60 hover:text-stone-200"
                    >
                        <Store className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Ke Toko Online</span>
                    </Link>
                </div>
            </header>

            {/* Main Login Card Section */}
            <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-md">
                    {/* Security Badge */}
                    <div className="mb-4 flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-950/60 px-3 py-1.5 text-xs font-medium text-emerald-400 shadow-sm backdrop-blur-sm">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                            <Shield className="h-3.5 w-3.5" />
                            <span>Portal Terbatas — Khusus Tim Sanubari</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                        {/* Header */}
                        <div className="mb-6 text-center">
                            <h1 className="mb-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
                                Masuk ke Terminal POS
                            </h1>
                            <p className="text-xs text-stone-400 sm:text-sm">
                                Gunakan akun staf internal yang telah terdaftar
                                untuk membuka kasir.
                            </p>
                        </div>

                        {/* Status notification */}
                        {status && (
                            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-700/50 bg-emerald-950/60 p-3 text-xs font-medium text-emerald-300 sm:text-sm">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Warning notification */}
                        {warning && (
                            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-700/50 bg-amber-950/60 p-3 text-xs font-medium text-amber-200 sm:text-sm">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                                <span>{warning}</span>
                            </div>
                        )}

                        {/* Current User Logged In as Non-Staff Notice */}
                        {currentUser &&
                            !['admin', 'owner', 'kasir'].includes(
                                currentUser.role || '',
                            ) && (
                                <div className="mb-5 rounded-xl border border-amber-600/50 bg-amber-950/70 p-4 text-xs text-amber-200 sm:text-sm">
                                    <div className="mb-1 flex items-center gap-2 font-semibold text-amber-300">
                                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                                        <span>
                                            Sedang masuk: {currentUser.name}
                                        </span>
                                    </div>
                                    <p className="mb-3 text-xs text-stone-300">
                                        Akun ({currentUser.email}) terdaftar
                                        sebagai Pelanggan dan tidak diizinkan
                                        mengakses POS. Silakan keluar untuk
                                        berganti ke akun staf.
                                    </p>
                                    <Link
                                        href="/pos/logout"
                                        method="post"
                                        as="button"
                                        className="w-full cursor-pointer rounded-lg bg-amber-600 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-amber-500"
                                    >
                                        Keluar dari Akun Ini
                                    </Link>
                                </div>
                            )}

                        {/* General Error notification */}
                        {errors.email && (
                            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-700/50 bg-rose-950/60 p-3 text-xs font-medium text-rose-200 sm:text-sm">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                                <span>{errors.email}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="pos-email"
                                    className="mb-1.5 block text-xs font-semibold tracking-wider text-stone-300 uppercase"
                                >
                                    Email Akun Staf
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <input
                                        id="pos-email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="kasir / admin / owner@pos.test"
                                        required
                                        autoFocus
                                        autoComplete="username"
                                        className="w-full rounded-xl border border-stone-800 bg-stone-950/70 py-2.5 pr-4 pl-10 text-sm text-stone-100 placeholder-stone-500 transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label
                                        htmlFor="pos-password"
                                        className="block text-xs font-semibold tracking-wider text-stone-300 uppercase"
                                    >
                                        Kata Sandi / PIN
                                    </label>
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                                        <KeyRound className="h-4 w-4" />
                                    </div>
                                    <input
                                        id="pos-password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        className="w-full rounded-xl border border-stone-800 bg-stone-950/70 py-2.5 pr-11 pl-10 text-sm text-stone-100 placeholder-stone-500 transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3.5 text-stone-400 hover:text-stone-200"
                                        title={
                                            showPassword
                                                ? 'Sembunyikan sandi'
                                                : 'Tampilkan sandi'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs font-medium text-rose-400">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember Checkbox */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex cursor-pointer items-center gap-2 select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-stone-700 bg-stone-950 text-amber-600 focus:ring-amber-500 focus:ring-offset-stone-900"
                                    />
                                    <span className="text-xs text-stone-400">
                                        Ingat saya di terminal ini
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-900/30 transition hover:from-amber-500 hover:to-amber-700 active:scale-[0.99] disabled:opacity-60"
                            >
                                {processing ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        <span>Memverifikasi Akses...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        <span>Masuk ke Terminal POS</span>
                                        <ArrowRight className="ml-1 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Customer notice link */}
                        <div className="mt-6 border-t border-stone-800/80 pt-5 text-center">
                            <p className="text-xs text-stone-400">
                                Bukan staf kasir?{' '}
                                <Link
                                    href="/login"
                                    className="cursor-pointer font-medium text-amber-400 underline underline-offset-4 hover:text-amber-300"
                                >
                                    Masuk ke Akun Pelanggan Website
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Authorized Roles Footer Note */}
                    <div className="mt-6 rounded-xl border border-stone-800/60 bg-stone-900/50 p-3.5 backdrop-blur-xs">
                        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                            <Shield className="h-3.5 w-3.5 text-amber-400" />
                            <span>Peran yang Diizinkan Mengakses POS:</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="rounded-lg border border-stone-800/60 bg-stone-950/60 p-2">
                                <span className="block font-semibold text-emerald-400">
                                    Admin
                                </span>
                                <span className="block text-[10px] text-stone-400">
                                    Akses Penuh
                                </span>
                            </div>
                            <div className="rounded-lg border border-stone-800/60 bg-stone-950/60 p-2">
                                <span className="block font-semibold text-amber-400">
                                    Owner
                                </span>
                                <span className="block text-[10px] text-stone-400">
                                    Laporan & Toko
                                </span>
                            </div>
                            <div className="rounded-lg border border-stone-800/60 bg-stone-950/60 p-2">
                                <span className="block font-semibold text-sky-400">
                                    Kasir
                                </span>
                                <span className="block text-[10px] text-stone-400">
                                    Kasir & Transaksi
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-stone-900 bg-stone-950 px-4 py-3 text-center text-[11px] text-stone-400">
                &copy; {new Date().getFullYear()} Kasir Sanubari. Terminal
                Point of Sale.
            </footer>
        </div>
    );
}
