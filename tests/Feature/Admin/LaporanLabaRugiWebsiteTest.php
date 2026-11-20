<?php

use App\Filament\Pages\LaporanLabaRugiWebsite;
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

test('laporan laba rugi website menu is registered in admin navigation sidebar', function () {
    expect(LaporanLabaRugiWebsite::shouldRegisterNavigation())->toBeTrue();
});

test('laporan laba rugi website computes only website orders and ignores pos orders and pos cash expenses', function () {
    $admin = User::factory()->admin()->create();

    $product = Product::create([
        'name' => 'Kopi Arabika Web Test',
        'slug' => 'kopi-arabika-web-test',
        'sku' => 'WEB-PL-01',
        'min_price' => 70000,
        'max_price' => 70000,
        'status' => 'active',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200g',
        'sku' => 'WEB-PL-200G',
        'price' => 70000,
        'cost_price' => 30000, // HPP = 30.000
        'stock' => 50,
        'stock_status' => 'in_stock',
    ]);

    // 1. Website Order (Paid): 2 pcs @ 70.000 = 140.000, HPP = 60.000, Laba = 80.000
    $webOrder = Order::create([
        'order_number' => 'SNB-261118-WEB',
        'customer_name' => 'Citra Pembeli Web',
        'customer_phone' => '081299998888',
        'customer_address' => 'Surabaya',
        'subtotal' => 140000,
        'shipping_cost' => 0,
        'total_amount' => 140000,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'shipping_courier' => 'J&T Express',
        'status' => 'processing',
        'created_at' => Carbon::today()->setHour(10),
    ]);

    OrderItem::create([
        'order_id' => $webOrder->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'variant_label' => '200g',
        'price' => 70000,
        'cost_price' => 30000,
        'quantity' => 2,
        'subtotal' => 140000,
    ]);

    // 2. POS Order (Paid): 1 pc @ 70.000 = 70.000 (must NOT be counted)
    $posOrder = Order::create([
        'order_number' => 'POS-261118-POS',
        'customer_name' => 'Pelanggan Toko Kasir',
        'customer_phone' => '-',
        'customer_address' => 'POS Kasir',
        'subtotal' => 70000,
        'shipping_cost' => 0,
        'total_amount' => 70000,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'payment_details' => ['source' => 'pos'],
        'shipping_courier' => 'POS Kasir (Retail Langsung)',
        'status' => 'completed',
        'created_at' => Carbon::today()->setHour(12),
    ]);

    OrderItem::create([
        'order_id' => $posOrder->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'variant_label' => '200g',
        'price' => 70000,
        'cost_price' => 30000,
        'quantity' => 1,
        'subtotal' => 70000,
    ]);

    // 3. Physical POS Cash Flow Expense (must NOT be subtracted from website sales)
    PosCashFlow::create([
        'type' => 'out',
        'category' => 'operasional',
        'amount' => 50000,
        'description' => 'Beli kantong plastik kasir',
        'user_id' => $admin->id,
        'recorded_at' => Carbon::today()->setHour(11),
    ]);

    // Query report for 'web'
    $report = ProfitLossService::getReport(Carbon::today()->startOfDay(), Carbon::today()->endOfDay(), 'web');

    // Only web order is counted:
    expect($report['summary']['total_transactions'])->toBe(1);
    expect($report['summary']['items_sold'])->toBe(2);
    expect($report['summary']['net_sales'])->toEqual(140000);
    expect($report['summary']['total_cogs'])->toEqual(60000);
    expect($report['summary']['gross_profit'])->toEqual(80000);
    expect($report['summary']['net_profit'])->toEqual(80000); // POS cash expenses excluded
    expect($report['summary']['total_expenses'])->toEqual(0);
    expect($report['summary']['is_profitable'])->toBeTrue();

    // Verify transactions list only has web order
    expect($report['transactions'])->toHaveCount(1);
    expect($report['transactions'][0]['order_number'])->toBe('SNB-261118-WEB');
    expect($report['transactions'][0]['customer_name'])->toBe('Citra Pembeli Web');
});

test('admin user can access and render filament laporan laba rugi website page with livewire', function () {
    $admin = User::factory()->admin()->create();

    Livewire::actingAs($admin)
        ->test(LaporanLabaRugiWebsite::class)
        ->assertSuccessful()
        ->assertSee('Laporan Laba Rugi Penjualan Website')
        ->assertSee('Khusus Penjualan Toko Online / Website Saja')
        ->assertSee('1. Penjualan Bersih (Omset)')
        ->assertSee('2. Total HPP Modal (COGS)')
        ->assertSee('3. Laba Kotor (Gross Profit)')
        ->assertSee('4. Margin Laba (%)')
        ->assertSet('channel', 'web')
        ->call('setPeriod', 'today')
        ->assertSet('period', 'today')
        ->call('setActiveTab', 'pesanan')
        ->assertSet('activeViewTab', 'pesanan')
        ->call('setActiveTab', 'bulanan')
        ->assertSet('activeViewTab', 'bulanan');
});
