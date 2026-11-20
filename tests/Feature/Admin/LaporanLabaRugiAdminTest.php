<?php

use App\Filament\Pages\LaporanLabaRugi;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PosCashFlow;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\ProfitLossService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('profit loss service computes consolidated website and pos metrics with cogs and expenses', function () {
    $admin = User::factory()->admin()->create();

    $product = Product::create([
        'name' => 'Kopi Arabika P&L Test',
        'slug' => 'kopi-arabika-pl-test',
        'sku' => 'PL-TEST-01',
        'price' => 60000,
        'is_active' => true,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '250g',
        'sku' => 'PL-TEST-250G',
        'price' => 60000,
        'cost_price' => 25000, // HPP = 25.000
        'stock' => 100,
        'is_active' => true,
    ]);

    // 1. Web Order (Paid): 2 pcs @ 60.000 = 120.000, HPP = 50.000
    $webOrder = Order::create([
        'order_number' => 'SNB-261117-WEB1',
        'customer_name' => 'Fajri Web',
        'customer_phone' => '0812345678',
        'customer_address' => 'Malang',
        'subtotal' => 120000,
        'shipping_cost' => 0,
        'total_amount' => 120000,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'shipping_courier' => 'J&T Express',
        'status' => 'processing',
        'created_at' => Carbon::today()->setHour(9),
    ]);

    OrderItem::create([
        'order_id' => $webOrder->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'variant_label' => '250g',
        'price' => 60000,
        'quantity' => 2,
        'subtotal' => 120000,
    ]);

    // 2. POS Order (Paid): 1 pc @ 60.000 = 60.000, HPP = 25.000
    $posOrder = Order::create([
        'order_number' => 'POS-261117-POS1',
        'customer_name' => 'Pelanggan Kasir',
        'customer_phone' => '-',
        'customer_address' => 'POS Kasir',
        'subtotal' => 60000,
        'shipping_cost' => 0,
        'total_amount' => 60000,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'payment_details' => ['source' => 'pos'],
        'shipping_courier' => 'POS Kasir (Retail Langsung)',
        'status' => 'completed',
        'created_at' => Carbon::today()->setHour(14),
    ]);

    OrderItem::create([
        'order_id' => $posOrder->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'variant_label' => '250g',
        'price' => 60000,
        'quantity' => 1,
        'subtotal' => 60000,
    ]);

    // 3. Cash Flow Expense: 30.000
    PosCashFlow::create([
        'type' => 'out',
        'category' => 'operasional',
        'amount' => 30000,
        'description' => 'Beli perlengkapan toko',
        'user_id' => $admin->id,
        'recorded_at' => Carbon::today()->setHour(11),
    ]);

    // Test ProfitLossService for today
    $report = ProfitLossService::getReport(Carbon::today()->startOfDay(), Carbon::today()->endOfDay(), 'all');

    // Consolidated:
    // Net sales = 120.000 (web) + 60.000 (pos) = 180.000
    // Total HPP = 50.000 (web) + 25.000 (pos) = 75.000
    // Gross Profit = 180.000 - 75.000 = 105.000
    // Expenses = 30.000
    // Net Profit = 105.000 - 30.000 = 75.000
    expect($report['summary']['total_transactions'])->toBe(2);
    expect($report['summary']['net_sales'])->toEqual(180000);
    expect($report['summary']['total_cogs'])->toEqual(75000);
    expect($report['summary']['gross_profit'])->toEqual(105000);
    expect($report['summary']['total_expenses'])->toEqual(30000);
    expect($report['summary']['net_profit'])->toEqual(75000);
    expect($report['summary']['is_profitable'])->toBeTrue();

    // Channel breakdown
    expect($report['channels']['web']['net_sales'])->toEqual(120000);
    expect($report['channels']['web']['total_cogs'])->toEqual(50000);
    expect($report['channels']['web']['gross_profit'])->toEqual(70000);

    expect($report['channels']['pos']['net_sales'])->toEqual(60000);
    expect($report['channels']['pos']['total_cogs'])->toEqual(25000);
    expect($report['channels']['pos']['gross_profit'])->toEqual(35000);

    // Expenses breakdown
    expect($report['expenses'])->toHaveCount(1);
    expect($report['expenses'][0]['description'])->toBe('Beli perlengkapan toko');
    expect($report['expenses'][0]['amount'])->toEqual(30000);
});

test('admin user can access and render filament laporan laba rugi page with livewire', function () {
    $admin = User::factory()->admin()->create();

    Livewire::actingAs($admin)
        ->test(LaporanLabaRugi::class)
        ->assertSuccessful()
        ->assertSee('Laporan Laba Rugi (Konsolidasi Web & POS)')
        ->assertSee('1. Penjualan Bersih (Omset)')
        ->assertSee('2. Total HPP Modal (COGS)')
        ->assertSee('3. Laba Kotor (Gross Profit)')
        ->assertSee('4. Beban Kas Keluar')
        ->assertSee('5. LABA BERSIH (NET PROFIT)')
        ->call('setPeriod', 'today')
        ->assertSet('period', 'today')
        ->call('setChannel', 'web')
        ->assertSet('channel', 'web')
        ->call('setActiveTab', 'pesanan')
        ->assertSet('activeViewTab', 'pesanan')
        ->call('setActiveTab', 'pengeluaran')
        ->assertSet('activeViewTab', 'pengeluaran');
});

test('laporan laba rugi menu is not registered in admin navigation sidebar', function () {
    expect(LaporanLabaRugi::shouldRegisterNavigation())->toBeFalse();
});
