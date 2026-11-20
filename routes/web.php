<?php

use App\Http\Controllers\PosAuthController;
use App\Http\Controllers\PosController;
use App\Http\Middleware\EnsurePosRole;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Dedicated POS Application
|--------------------------------------------------------------------------
*/

// Akses utama root URL langsung mengarahkan ke POS Kasir
Route::get('/', fn () => redirect()->route('pos.index'))->name('home');

// Public Invoice View via Token (Dapat diakses pelanggan via QR code struk)
Route::get('/pos/invoice/{token}', [PosController::class, 'showInvoice'])->name('pos.invoice');

// POS Authentication (Login / Logout Staf Kasir)
Route::get('/pos/login', [PosAuthController::class, 'showLogin'])->name('pos.login');
Route::post('/pos/login', [PosAuthController::class, 'login'])->name('pos.login.store');
Route::post('/pos/logout', [PosAuthController::class, 'logout'])->name('pos.logout');

// Opsional: Endpoint Download Aplikasi POS (Android / Desktop Windows)
Route::get('/pos/download-apk', [PosAuthController::class, 'downloadApk'])->name('pos.download-apk');
Route::get('/downloads/Kasir-Sanubari.apk', [PosAuthController::class, 'downloadApk'])->name('pos.download-apk.direct');
Route::get('/downloads/Sanubari-POS.apk', [PosAuthController::class, 'downloadApk']);
Route::get('/pos/download-pc', [PosAuthController::class, 'downloadPc'])->name('pos.download-pc');
Route::get('/downloads/Kasir-Sanubari-Setup.exe', [PosAuthController::class, 'downloadPc'])->name('pos.download-pc.direct');
Route::get('/downloads/Sanubari-POS-Setup.exe', [PosAuthController::class, 'downloadPc']);

// Protected POS Operasional (Hanya peran Kasir, Admin, dan Owner)
Route::middleware(['auth', EnsurePosRole::class])->group(function () {
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');

    // Riwayat Transaksi & Refund
    Route::get('/pos/orders', [PosController::class, 'orders'])->name('pos.orders');
    Route::post('/pos/orders/{id}/refund', [PosController::class, 'refundOrder'])->name('pos.orders.refund');

    // Laporan Penjualan & Laba/Rugi
    Route::get('/pos/reports', [PosController::class, 'reports'])->name('pos.reports');
    Route::get('/pos/profit-loss', [PosController::class, 'profitLossReport'])->name('pos.profit-loss');
    Route::get('/pos/profit-loss/export-excel', [PosController::class, 'exportProfitLossExcel'])->name('pos.profit-loss.export-excel');

    // Arus Kas Laci (Cash Drawer: Modal Awal, Cash In, Cash Out)
    Route::get('/pos/cash-flows', [PosController::class, 'getCashFlows'])->name('pos.cash-flows.index');
    Route::post('/pos/cash-flows', [PosController::class, 'storeCashFlow'])->name('pos.cash-flows.store');
    Route::delete('/pos/cash-flows/{id}', [PosController::class, 'destroyCashFlow'])->name('pos.cash-flows.destroy');

    // Pengaturan Kasir & Profil Printer
    Route::post('/pos/settings', [PosController::class, 'saveSettings'])->name('pos.settings.save');

    // Antrean / Hold Orders (Simpan Sementara / Pre-bill)
    Route::get('/pos/queue', [PosController::class, 'getQueue'])->name('pos.queue.index');
    Route::post('/pos/queue', [PosController::class, 'storeQueue'])->name('pos.queue.store');
    Route::delete('/pos/queue/{id}', [PosController::class, 'destroyQueue'])->name('pos.queue.destroy');
    Route::post('/pos/prebill', [PosController::class, 'createPreBill'])->name('pos.prebill');

    // Katalog Produk & Sinkronisasi Offline
    Route::get('/pos/catalog', [PosController::class, 'catalog'])->name('pos.catalog');
    Route::post('/pos/sync-offline-orders', [PosController::class, 'syncOfflineOrders'])->name('pos.sync-offline-orders');
    Route::post('/pos/import-orders', [PosController::class, 'importOrders'])->name('pos.import-orders');

    // Manajemen Staf Kasir (Admin / Owner)
    Route::get('/pos/staff', [PosController::class, 'listStaff'])->name('pos.staff.index');
    Route::post('/pos/staff', [PosController::class, 'storeStaff'])->name('pos.staff.store');
    Route::delete('/pos/staff/{id}', [PosController::class, 'destroyStaff'])->name('pos.staff.destroy');
});

// Fallback jika ada akses rute lain langsung diarahkan ke POS
Route::fallback(fn () => redirect()->route('pos.index'));
