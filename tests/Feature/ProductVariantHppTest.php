<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

test('product variant can store and retrieve cost_price and hpp alias', function () {
    $product = Product::create([
        'name' => 'Kopi Test HPP Unit',
        'slug' => 'kopi-test-hpp-unit',
        'status' => 'active',
        'stock_status' => 'in_stock',
        'min_price' => 75000,
        'max_price' => 75000,
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '250 gr',
        'weight_grams' => 250,
        'price' => 75000,
        'cost_price' => 45000,
        'original_price' => 85000,
        'stock_status' => 'in_stock',
    ]);

    expect((float) $variant->cost_price)->toBe(45000.0)
        ->and((float) $variant->hpp)->toBe(45000.0)
        ->and((float) $variant->base_price)->toBe(45000.0);

    // Test mutator alias
    $variant->hpp = 48000;
    $variant->save();

    expect((float) $variant->fresh()->cost_price)->toBe(48000.0);
});

test('pos endpoint includes cost_price for product variants', function () {
    $user = User::factory()->kasir()->create();
    $product = Product::create([
        'name' => 'Kopi Test HPP POS',
        'slug' => 'kopi-test-hpp-pos',
        'status' => 'active',
        'stock_status' => 'in_stock',
        'min_price' => 60000,
        'max_price' => 60000,
    ]);
    ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200 gr',
        'weight_grams' => 200,
        'price' => 60000,
        'cost_price' => 38000,
        'stock_status' => 'in_stock',
    ]);

    $response = $this->actingAs($user)->get('/pos');
    $response->assertOk();

    $props = $response->viewData('page')['props'];
    $foundProduct = collect($props['products'])->firstWhere('id', $product->id);
    expect($foundProduct)->not->toBeNull();
    $variant = collect($foundProduct['variants'])->first();
    expect($variant)->not->toBeNull();
    expect($variant['cost_price'])->toBe(38000.0);
});
