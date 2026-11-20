<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('cashier can refund a paid order with reason and amount', function () {
    $cashier = User::factory()->create([
        'name' => 'Kasir Utama',
        'role' => 'kasir',
    ]);

    $category = Category::create([
        'name' => 'Espresso Beans',
        'slug' => 'espresso-beans',
    ]);

    $product = Product::create([
        'name' => 'Sanubari House Blend',
        'slug' => 'sanubari-house-blend',
        'category_id' => $category->id,
        'is_active' => true,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '250 gr',
        'price' => 85000,
        'cost_price' => 45000,
        'stock' => 15,
    ]);

    $order = Order::create([
        'order_number' => 'POS-20261118-001',
        'customer_name' => 'Agus Setiawan',
        'customer_phone' => '08129876543',
        'customer_address' => 'Toko Fisik / POS Kasir',
        'total_amount' => 170000,
        'subtotal' => 170000,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'status' => 'completed',
        'payment_details' => [
            'source' => 'pos',
            'cash_tendered' => 200000,
            'cash_change' => 30000,
        ],
    ]);

    OrderItem::create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'variant_label' => $variant->label,
        'price' => 85000,
        'quantity' => 2,
        'subtotal' => 170000,
    ]);

    $response = $this->actingAs($cashier)->postJson("/pos/orders/{$order->id}/refund", [
        'reason' => 'Salah Masuk Pesanan / Kasir',
        'amount' => 170000,
    ]);

    $response->assertSuccessful();
    $data = $response->json();

    expect($data['success'])->toBeTrue()
        ->and($data['order']['payment_status'])->toBe('refunded')
        ->and($data['order']['refund_reason'])->toBe('Salah Masuk Pesanan / Kasir')
        ->and($data['order']['refund_amount'])->toEqual(170000)
        ->and($data['order']['refunded_by_name'])->toBe('Kasir Utama');

    $order->refresh();
    expect($order->payment_status)->toBe('refunded')
        ->and($order->status)->toBe('refunded')
        ->and($order->payment_details['refund_reason'])->toBe('Salah Masuk Pesanan / Kasir')
        ->and($order->payment_details['refund_amount'])->toEqual(170000)
        ->and($order->payment_details['refunded_by_name'])->toBe('Kasir Utama');
});

test('cannot refund an already refunded order', function () {
    $cashier = User::factory()->create([
        'name' => 'Kasir Utama',
        'role' => 'kasir',
    ]);

    $order = Order::create([
        'order_number' => 'POS-20261118-002',
        'customer_name' => 'Rina Wijaya',
        'customer_phone' => '08123456789',
        'customer_address' => 'Toko Fisik / POS Kasir',
        'total_amount' => 50000,
        'subtotal' => 50000,
        'payment_method' => 'cash',
        'payment_status' => 'refunded',
        'status' => 'refunded',
        'payment_details' => [
            'source' => 'pos',
            'refund_reason' => 'Sudah direfund sebelumnya',
        ],
    ]);

    $response = $this->actingAs($cashier)->postJson("/pos/orders/{$order->id}/refund", [
        'reason' => 'Coba refund lagi',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
            'message' => 'Transaksi #POS-20261118-002 sudah pernah di-refund sebelumnya.',
        ]);
});

test('regular customer without pos role cannot refund order', function () {
    $customer = User::factory()->create([
        'role' => 'customer',
    ]);

    $order = Order::create([
        'order_number' => 'POS-20261118-003',
        'customer_name' => 'Customer Biasa',
        'customer_phone' => '08123456789',
        'customer_address' => 'Toko Fisik / POS Kasir',
        'total_amount' => 50000,
        'subtotal' => 50000,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'status' => 'completed',
    ]);

    $response = $this->actingAs($customer)->postJson("/pos/orders/{$order->id}/refund", [
        'reason' => 'Mencoba refund dari customer',
    ]);

    $response->assertRedirect(route('pos.login'));
});
