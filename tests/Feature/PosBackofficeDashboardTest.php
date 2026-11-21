<?php

use App\Filament\Pages\PosDashboard;
use App\Filament\Resources\PosOrders\PosOrderResource;
use App\Filament\Resources\PosStaff\PosStaffResource;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;

uses(RefreshDatabase::class);

test('admin can view pos dashboard page in filament backoffice', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $this->actingAs($admin);

    // Create sample POS and Web orders
    $posOrder = Order::create([
        'order_number' => 'POS-261121-0001',
        'customer_name' => 'Meja 01',
        'customer_phone' => '081234567890',
        'customer_address' => 'Dine In Meja 01',
        'payment_status' => 'paid',
        'payment_method' => 'cash',
        'total_amount' => 50000,
        'subtotal' => 50000,
        'status' => 'completed',
        'payment_details' => ['source' => 'pos'],
    ]);

    $webOrder = Order::create([
        'order_number' => 'SNB-261121-WEB1',
        'customer_name' => 'Pelanggan Web',
        'customer_phone' => '081234567891',
        'customer_address' => 'Jl. Kopi No 1 Jakarta',
        'payment_status' => 'paid',
        'payment_method' => 'qris',
        'total_amount' => 150000,
        'subtotal' => 150000,
        'status' => 'completed',
    ]);

    Livewire::test(PosDashboard::class)
        ->assertSuccessful()
        ->assertSee('Dashboard POS (Backoffice)')
        ->assertSee('Omset Penjualan POS')
        ->assertSee('POS-261121-0001');
});

test('pos order resource only displays pos orders and excludes website orders', function () {
    $posOrder = Order::create([
        'order_number' => 'POS-261121-0002',
        'customer_name' => 'Walk In Pelanggan',
        'customer_phone' => '081234567892',
        'customer_address' => 'POS Kasir Toko',
        'payment_status' => 'paid',
        'payment_method' => 'cash',
        'total_amount' => 25000,
        'subtotal' => 25000,
        'status' => 'completed',
        'payment_details' => ['source' => 'pos'],
    ]);

    $webOrder = Order::create([
        'order_number' => 'SNB-261121-WEB2',
        'customer_name' => 'Web Customer',
        'customer_phone' => '081234567893',
        'customer_address' => 'Jl. Mawar No 2 Bandung',
        'payment_status' => 'paid',
        'payment_method' => 'bank_transfer',
        'total_amount' => 100000,
        'subtotal' => 100000,
        'status' => 'completed',
    ]);

    $posQuery = PosOrderResource::getEloquentQuery()->get();

    expect($posQuery->pluck('order_number'))->toContain($posOrder->order_number);
    expect($posQuery->pluck('order_number'))->not->toContain($webOrder->order_number);
});

test('pos staff resource queries staff with role kasir, admin, owner or id 1', function () {
    $kasir = User::factory()->create(['role' => 'kasir']);
    $admin = User::factory()->create(['role' => 'admin']);
    $owner = User::factory()->create(['role' => 'owner']);
    $regularCustomer = User::factory()->create(['role' => 'customer']);

    $staffUsers = PosStaffResource::getEloquentQuery()->pluck('id')->all();

    expect($staffUsers)->toContain($kasir->id);
    expect($staffUsers)->toContain($admin->id);
    expect($staffUsers)->toContain($owner->id);
    expect($staffUsers)->not->toContain($regularCustomer->id);
});
