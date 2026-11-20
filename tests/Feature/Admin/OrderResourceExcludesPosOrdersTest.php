<?php

use App\Filament\Resources\Orders\OrderResource;
use App\Filament\Resources\Orders\Pages\ListOrders;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('order resource eloquent query excludes pos orders and only includes website orders', function () {
    $webOrder = Order::create([
        'order_number' => 'SNB-261115-E06S',
        'customer_name' => 'Fajri Web Buyer',
        'customer_phone' => '081233398605',
        'customer_address' => 'Jl. Ijen No. 10 Malang',
        'subtotal' => 50000,
        'shipping_cost' => 0,
        'total_amount' => 50000,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'shipping_courier' => 'Ambil di Toko',
        'status' => 'processing',
    ]);

    $posOrder = Order::create([
        'order_number' => 'POS-261116-TTZX',
        'customer_name' => 'Pelanggan Kasir Retail',
        'customer_phone' => '-',
        'customer_address' => 'POS Kasir',
        'subtotal' => 235000,
        'shipping_cost' => 0,
        'total_amount' => 235000,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'payment_details' => ['source' => 'pos'],
        'shipping_courier' => 'POS Kasir (Retail Langsung)',
        'status' => 'completed',
    ]);

    $queriedIds = OrderResource::getEloquentQuery()->pluck('id')->all();

    expect($queriedIds)->toContain($webOrder->id);
    expect($queriedIds)->not->toContain($posOrder->id);
});

test('admin pesanan masuk list table only displays website orders and hides pos orders', function () {
    $admin = User::factory()->admin()->create();

    $webOrder = Order::create([
        'order_number' => 'SNB-261115-VTCF',
        'customer_name' => 'Dio Aliffashah Web',
        'customer_phone' => '0881036587320',
        'customer_address' => 'Malang',
        'subtotal' => 17000,
        'shipping_cost' => 0,
        'total_amount' => 17000,
        'payment_method' => 'qris',
        'payment_status' => 'paid',
        'shipping_courier' => 'Ambil di Toko',
        'status' => 'processing',
    ]);

    $posOrder = Order::create([
        'order_number' => 'POS-261116-98K6',
        'customer_name' => 'Pelanggan Kasir POS',
        'customer_phone' => '-',
        'customer_address' => 'POS Kasir',
        'subtotal' => 140000,
        'shipping_cost' => 0,
        'total_amount' => 140000,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'payment_details' => ['source' => 'pos'],
        'shipping_courier' => 'POS Kasir (Retail Langsung)',
        'status' => 'completed',
    ]);

    Livewire::actingAs($admin)
        ->test(ListOrders::class)
        ->assertCanSeeTableRecords([$webOrder])
        ->assertCanNotSeeTableRecords([$posOrder]);
});

test('order resource navigation badge only counts pending website orders', function () {
    // Pending web order
    Order::create([
        'order_number' => 'SNB-261117-PEND',
        'customer_name' => 'Buyer Pending Web',
        'customer_phone' => '0812345678',
        'customer_address' => 'Malang',
        'subtotal' => 88000,
        'shipping_cost' => 10000,
        'total_amount' => 98000,
        'payment_method' => 'bank_transfer',
        'payment_status' => 'pending',
        'status' => 'pending',
    ]);

    // Pending POS order (should be excluded from badge count)
    Order::create([
        'order_number' => 'POS-261117-PEND',
        'customer_name' => 'Pelanggan Kasir Pending',
        'customer_phone' => '-',
        'customer_address' => 'POS Kasir',
        'subtotal' => 70000,
        'shipping_cost' => 0,
        'total_amount' => 70000,
        'payment_method' => 'cash',
        'payment_status' => 'pending',
        'payment_details' => ['source' => 'pos'],
        'status' => 'pending',
    ]);

    expect(OrderResource::getNavigationBadge())->toBe('1');
});
