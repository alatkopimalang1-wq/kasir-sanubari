<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosManualOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_pos_checkout_with_manual_order_item_saves_cost_price_and_price(): void
    {
        $kasir = User::factory()->kasir()->create();

        $payload = [
            'items' => [
                [
                    'product_id' => 0,
                    'variant_id' => 0,
                    'product_name' => 'Katering Kopi Acara Komunitas',
                    'variant_label' => '50 Cup',
                    'price' => 750000,
                    'cost_price' => 300000, // HPP = Rp 300.000
                    'quantity' => 1,
                    'is_manual' => true,
                ],
            ],
            'payment_method' => 'cash',
            'cash_tendered' => 800000,
            'customer_name' => 'Komunitas Barista',
            'customer_phone' => '081299998888',
        ];

        $response = $this->actingAs($kasir)->postJson('/pos/checkout', $payload);
        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'order' => [
                'customer_name' => 'Komunitas Barista',
                'subtotal' => 750000,
                'total_amount' => 750000,
                'cash_tendered' => 800000,
                'cash_change' => 50000,
            ],
        ]);

        $order = Order::latest('id')->first();
        $this->assertNotNull($order);
        $this->assertEquals('Komunitas Barista', $order->customer_name);
        $this->assertCount(1, $order->items);

        $item = $order->items->first();
        $this->assertEquals('Katering Kopi Acara Komunitas', $item->product_name);
        $this->assertEquals('50 Cup', $item->variant_label);
        $this->assertEquals(750000, (float) $item->price);
        $this->assertEquals(300000, (float) $item->cost_price);
        $this->assertEquals(1, $item->quantity);
        $this->assertEquals(750000, (float) $item->subtotal);
    }

    public function test_manual_order_calculates_real_profit_and_loss_in_pos_report(): void
    {
        $owner = User::factory()->owner()->create();

        // 1. Regular catalog product
        $product = Product::create([
            'name' => 'Espresso Blend Sanubari',
            'slug' => 'espresso-blend-sanubari',
            'price' => 100000,
            'is_active' => true,
        ]);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'label' => '500g',
            'price' => 100000,
            'cost_price' => 45000, // HPP Rp 45.000
            'stock' => 20,
            'is_active' => true,
        ]);

        // Checkout combining 1 regular product + 1 manual product
        $payload = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'variant_id' => $variant->id,
                    'product_name' => $product->name,
                    'variant_label' => $variant->label,
                    'price' => 100000,
                    'quantity' => 2, // 2 * 100.000 = 200.000, HPP = 2 * 45.000 = 90.000
                ],
                [
                    'product_id' => 0,
                    'variant_id' => 0,
                    'product_name' => 'Snack Titipan Vendor',
                    'variant_label' => 'Porsi',
                    'price' => 25000,
                    'cost_price' => 15000, // HPP Rp 15.000
                    'quantity' => 4, // 4 * 25.000 = 100.000, HPP = 4 * 15.000 = 60.000
                    'is_manual' => true,
                ],
            ],
            'payment_method' => 'cash',
            'cash_tendered' => 300000,
            'customer_name' => 'Budi Santoso',
        ];

        $resCheckout = $this->actingAs($owner)->postJson('/pos/checkout', $payload);
        $resCheckout->assertOk();

        // Total sales = 200.000 + 100.000 = 300.000
        // Total HPP = 90.000 + 60.000 = 150.000
        // Total Laba Kotor = 300.000 - 150.000 = 150.000

        $resReport = $this->actingAs($owner)->getJson('/pos/profit-loss?period=today');
        $resReport->assertOk();

        $summary = $resReport->json('summary');
        $this->assertEquals(300000, $summary['net_sales']);
        $this->assertEquals(150000, $summary['total_cogs']);
        $this->assertEquals(150000, $summary['gross_profit']);
        $this->assertEquals(150000, $summary['net_profit']);

        $productBreakdown = $resReport->json('top_margin_products');
        $this->assertCount(2, $productBreakdown);

        $manualItemData = collect($productBreakdown)->firstWhere('product_name', 'Snack Titipan Vendor');
        $this->assertNotNull($manualItemData);
        $this->assertEquals(4, $manualItemData['quantity']);
        $this->assertEquals(100000, $manualItemData['total_revenue']);
        $this->assertEquals(60000, $manualItemData['total_cost']);
        $this->assertEquals(40000, $manualItemData['gross_profit']);
        $this->assertTrue($manualItemData['has_hpp']);
    }

    public function test_sync_offline_orders_with_manual_item_preserves_cost_price(): void
    {
        $kasir = User::factory()->kasir()->create();

        $offlinePayload = [
            'orders' => [
                [
                    'offline_id' => 'OFFLINE-MANUAL-001',
                    'customer_name' => 'Pelanggan Offline Manual',
                    'customer_phone' => '0855667788',
                    'payment_method' => 'cash',
                    'cash_tendered' => 200000,
                    'discount_amount' => 0,
                    'created_at' => Carbon::today()->toIso8601String(),
                    'items' => [
                        [
                            'product_id' => 0,
                            'variant_id' => 0,
                            'product_name' => 'Custom Gift Box',
                            'variant_label' => 'Manual',
                            'price' => 150000,
                            'cost_price' => 80000, // HPP = 80.000
                            'quantity' => 1,
                            'is_manual' => true,
                        ],
                    ],
                ],
            ],
        ];

        $resSync = $this->actingAs($kasir)->postJson('/pos/sync-offline-orders', $offlinePayload);
        $resSync->assertOk();
        $resSync->assertJson([
            'success' => true,
            'synced_count' => 1,
        ]);

        $order = Order::where('customer_name', 'Pelanggan Offline Manual')->first();
        $this->assertNotNull($order);
        $this->assertEquals(150000, (float) $order->total_amount);

        $item = $order->items->first();
        $this->assertEquals('Custom Gift Box', $item->product_name);
        $this->assertEquals(80000, (float) $item->cost_price);
        $this->assertEquals(150000, (float) $item->price);
    }
}
