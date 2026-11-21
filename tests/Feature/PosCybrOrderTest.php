<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;

beforeEach(function () {
    $this->cashier = User::factory()->create([
        'role' => 'kasir',
    ]);

    // Ensure BYOB product and variants exist
    $this->byobProduct = Product::firstOrCreate(
        ['slug' => 'byob'],
        [
            'name' => 'C.Y.B.R - Custom Your Blend Ratio',
            'series' => 'cybr',
            'min_price' => 65000,
            'max_price' => 275000,
            'status' => 'published',
            'channel' => 'all',
        ]
    );

    $this->variant200g = ProductVariant::firstOrCreate(
        [
            'product_id' => $this->byobProduct->id,
            'weight_grams' => 200,
        ],
        [
            'label' => '200g',
            'price' => 65000,
            'sku' => 'BYOB-200',
            'stock_status' => 'in_stock',
        ]
    );

    // Setup BYOB settings
    Setting::set('byob_settings', [
        'hero_title' => 'C.Y.B.R: Custom Your Blend Ratio',
        'byob_beans' => [
            [
                'name' => 'Robusta Dampit',
                'origin' => 'Dampit, Malang',
                'process' => 'Natural',
                'price_per_10g' => 1700,
                'cost_price_per_10g' => 900,
                'is_active' => true,
            ],
            [
                'name' => 'Arabika Kawi Fullwash',
                'origin' => 'Kawi, Malang',
                'process' => 'Fullwash',
                'price_per_10g' => 2800,
                'cost_price_per_10g' => 1500,
                'is_active' => true,
            ],
        ],
        'byob_variants' => [
            [
                'label' => '200g',
                'weight_grams' => 200,
                'discount_type' => 'percentage',
                'discount_value' => 0,
                'is_default' => true,
            ],
        ],
        'byob_grind_options' => [
            ['name' => 'Whole Bean'],
        ],
    ]);
});

test('pos index provides byobSettings to inertia page', function () {
    $response = $this->actingAs($this->cashier)->get('/pos');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pos')
        ->has('byobSettings')
        ->has('byobSettings.byob_beans')
    );
});

test('pos catalog api includes byob_settings for offline caching', function () {
    $response = $this->actingAs($this->cashier)->getJson('/pos/catalog');

    $response->assertOk();
    $response->assertJsonStructure([
        'categories',
        'products',
        'byob_settings',
    ]);
});

test('pos checkout accurately processes custom cybr blend item with dynamic price and cost_price', function () {
    $recipeNotes = 'Blend: 70% Robusta Dampit + 30% Arabika Kawi Fullwash';
    $customPrice = 40600; // Calculated based on recipe & weight
    $customCostPrice = 21600; // Calculated HPP

    $payload = [
        'payment_method' => 'cash',
        'amount_paid' => 50000,
        'customer_name' => 'Pak Budi',
        'order_channel' => 'pos',
        'items' => [
            [
                'product_id' => $this->byobProduct->id,
                'variant_id' => $this->variant200g->id,
                'quantity' => 1,
                'price' => $customPrice,
                'cost_price' => $customCostPrice,
                'product_name' => 'C.Y.B.R Blend (70/30)',
                'variant_label' => '200g',
                'notes' => $recipeNotes,
            ],
        ],
    ];

    $response = $this->actingAs($this->cashier)->postJson('/pos/checkout', $payload);

    $response->assertOk();
    $response->assertJsonPath('success', true);
    $response->assertJsonPath('order.total_amount', 40600);

    $order = Order::with('items')->latest()->first();
    expect($order)->not->toBeNull();
    expect($order->payment_status)->toBe('paid');
    expect((float) $order->total_amount)->toBe(40600.0);
    expect($order->items)->toHaveCount(1);

    $item = $order->items->first();
    expect($item->product_id)->toBe($this->byobProduct->id);
    expect((float) $item->price)->toBe(40600.0);
    expect((float) $item->cost_price)->toBe(21600.0);
    expect($item->custom_notes)->toBe($recipeNotes);
    expect($item->product_name)->toBe('C.Y.B.R Blend (70/30)');
    expect($item->variant_label)->toBe('200g');
});

test('pos direct invoice pdf download returns binary pdf attachment', function () {
    $invoicePayload = [
        'store_name' => 'Sanubari Roastery',
        'tagline' => 'Close to Your Every Brew',
        'customer_name' => 'Pak Budi',
        'cashier_name' => 'Kasir Sanubari',
        'date' => '18 Nov 2026, 21.36',
        'subtotal' => 295000,
        'discount_amount' => 0,
        'total_amount' => 295000,
        'items' => [
            [
                'product_name' => 'Blueberry Pasundan',
                'variant_label' => '200 gr',
                'price' => 155000,
                'quantity' => 1,
                'subtotal' => 155000,
            ],
            [
                'product_name' => 'Arabika Java Ijen Fullwash',
                'variant_label' => '500 gr',
                'price' => 140000,
                'quantity' => 1,
                'subtotal' => 140000,
            ],
        ],
    ];

    $encoded = rtrim(strtr(base64_encode(json_encode($invoicePayload)), '+/', '-_'), '=');
    $response = $this->get('/pos/download-apk?invoice_pdf=1&payload='.urlencode($encoded));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/pdf');
    expect($response->headers->get('Content-Disposition'))->toContain('attachment; filename="Invoice-');
    expect($response->getContent())->toStartWith('%PDF-1.4');
    expect($response->getContent())->toContain('Blueberry Pasundan');
    expect($response->getContent())->toContain('%%EOF');
});
