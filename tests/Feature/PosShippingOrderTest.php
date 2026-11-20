<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('pos checkout correctly processes order with shipping cost and delivery address', function () {
    $cashier = User::factory()->create([
        'role' => 'admin',
    ]);

    $category = Category::create([
        'name' => 'Filter Beans',
        'slug' => 'filter-beans',
    ]);

    $product = Product::create([
        'name' => 'Gayo Anaerob',
        'slug' => 'gayo-anaerob',
        'category_id' => $category->id,
        'is_active' => true,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'price' => 120000,
        'cost_price' => 70000,
        'stock' => 10,
    ]);

    $response = $this->actingAs($cashier)->postJson('/pos/checkout', [
        'items' => [
            [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'product_name' => $product->name,
                'variant_label' => $variant->label,
                'price' => 120000,
                'quantity' => 2,
                'cost_price' => 70000,
            ],
        ],
        'discount_amount' => 10000,
        'shipping_cost' => 25000,
        'shipping_courier' => 'J&T Express',
        'customer_name' => 'Budi Santoso',
        'customer_phone' => '08123456789',
        'customer_address' => 'Jl. Ijen No. 10, Malang',
        'payment_method' => 'cash',
        'cash_tendered' => 300000,
    ]);

    $response->assertSuccessful();
    $data = $response->json();

    expect($data['success'])->toBeTrue();
    // Subtotal: 2 * 120.000 = 240.000
    // Discount: 10.000 -> 230.000
    // Shipping: 25.000 -> Total: 255.000
    expect((float) $data['order']['subtotal'])->toBe(240000.0);
    expect((float) $data['order']['discount_amount'])->toBe(10000.0);
    expect((float) $data['order']['shipping_cost'])->toBe(25000.0);
    expect((float) $data['order']['total_amount'])->toBe(255000.0);
    expect((float) $data['order']['cash_change'])->toBe(45000.0);
    expect($data['order']['customer_name'])->toBe('Budi Santoso');
    expect($data['order']['customer_address'])->toBe('Jl. Ijen No. 10, Malang');
    expect($data['order']['shipping_courier'])->toBe('J&T Express');

    $order = Order::where('order_number', $data['order']['order_number'])->first();
    expect($order)->not->toBeNull();
    expect((float) $order->shipping_cost)->toBe(25000.0);
    expect($order->customer_address)->toBe('Jl. Ijen No. 10, Malang');
    expect($order->shipping_courier)->toBe('J&T Express');
    expect((float) $order->total_amount)->toBe(255000.0);
    // Ensure POS order does not appear in Web-only queries
    expect(Order::webOnly()->where('id', $order->id)->exists())->toBeFalse();
});

test('pos queue holding stores and retrieves shipping cost and delivery address', function () {
    $cashier = User::factory()->create([
        'role' => 'admin',
    ]);

    $response = $this->actingAs($cashier)->postJson('/pos/queue', [
        'customer_name' => 'Siti Nurhaliza',
        'customer_phone' => '08987654321',
        'customer_address' => 'Jl. Veteran No. 5, Malang',
        'shipping_cost' => 18000,
        'shipping_courier' => 'SiCepat BEST',
        'notes' => 'Tolong kirim sore',
        'items' => [
            [
                'product_id' => 99,
                'product_name' => 'Manual Coffee',
                'variant_id' => 0,
                'variant_label' => 'Special',
                'price' => 50000,
                'quantity' => 1,
            ],
        ],
        'discount_amount' => 0,
    ]);

    $response->assertSuccessful();
    $data = $response->json();
    expect($data['success'])->toBeTrue();
    expect((float) $data['held_order']['shipping_cost'])->toBe(18000.0);
    expect($data['held_order']['customer_address'])->toBe('Jl. Veteran No. 5, Malang');
    expect($data['held_order']['shipping_courier'])->toBe('SiCepat BEST');
    expect((float) $data['held_order']['total_amount'])->toBe(68000.0); // 50.000 + 18.000

    $getQueueRes = $this->actingAs($cashier)->getJson('/pos/queue');
    $getQueueRes->assertSuccessful();
    $held = collect($getQueueRes->json('queue'))->firstWhere('customer_name', 'Siti Nurhaliza');
    expect($held)->not->toBeNull();
    expect((float) $held['shipping_cost'])->toBe(18000.0);
    expect($held['customer_address'])->toBe('Jl. Veteran No. 5, Malang');
    expect($held['shipping_courier'])->toBe('SiCepat BEST');
});

test('pos sync offline orders correctly stores shipping cost and delivery address', function () {
    $cashier = User::factory()->create([
        'role' => 'admin',
    ]);

    $offlineId = 'POS-OFF-TEST-'.time();
    $response = $this->actingAs($cashier)->postJson('/pos/sync-offline-orders', [
        'orders' => [
            [
                'offline_id' => $offlineId,
                'customer_name' => 'Rahmat Hidayat',
                'customer_phone' => '0877112233',
                'customer_address' => 'Jl. Borobudur No. 12, Malang',
                'shipping_cost' => 15000,
                'shipping_courier' => 'JNE Reguler',
                'payment_method' => 'qris',
                'items' => [
                    [
                        'product_id' => 1,
                        'variant_id' => 1,
                        'product_name' => 'Single Origin',
                        'variant_label' => '250gr',
                        'price' => 100000,
                        'quantity' => 1,
                        'cost_price' => 60000,
                    ],
                ],
                'discount_amount' => 5000,
            ],
        ],
    ]);

    $response->assertSuccessful();
    $order = Order::whereJsonContains('payment_details->offline_id', $offlineId)->first();
    expect($order)->not->toBeNull();
    expect((float) $order->subtotal)->toBe(100000.0);
    expect((float) $order->shipping_cost)->toBe(15000.0);
    expect((float) $order->total_amount)->toBe(110000.0); // (100k - 5k) + 15k = 110k
    expect($order->customer_address)->toBe('Jl. Borobudur No. 12, Malang');
    expect($order->shipping_courier)->toBe('JNE Reguler');
});
