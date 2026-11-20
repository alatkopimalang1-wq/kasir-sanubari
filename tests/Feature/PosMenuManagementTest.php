<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

test('authenticated pos user can create a cafe menu product with variants and HPP', function () {
    $user = User::factory()->kasir()->create();

    $category = Category::create([
        'name' => ['id' => 'Kopi Susu', 'en' => 'Milk Coffee'],
        'slug' => 'kopi-susu-' . uniqid(),
        'sort_order' => 1,
    ]);

    $payload = [
        'name' => 'Kopi Susu Gula Aren Spesial',
        'category_id' => $category->id,
        'description' => 'Espresso blend Sanubari dengan susu segar dan aren murni.',
        'stock_status' => 'in_stock',
        'channel' => 'pos',
        'variants' => [
            [
                'label' => 'Hot Reguler',
                'price' => 20000,
                'cost_price' => 8000,
                'stock_status' => 'in_stock',
            ],
            [
                'label' => 'Ice Large',
                'price' => 24000,
                'cost_price' => 9500,
                'stock_status' => 'in_stock',
            ],
        ],
    ];

    $response = $this->actingAs($user)->postJson('/pos/products', $payload);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('products', [
        'name' => 'Kopi Susu Gula Aren Spesial',
        'stock_status' => 'in_stock',
    ]);

    $createdProduct = Product::where('name', 'Kopi Susu Gula Aren Spesial')->first();
    expect($createdProduct->variants()->count())->toBe(2);
    expect($createdProduct->categories->pluck('id')->toArray())->toContain($category->id);

    $largeVariant = $createdProduct->variants()->where('label', 'Ice Large')->first();
    expect((float) $largeVariant->price)->toBe(24000.0);
    expect((float) $largeVariant->cost_price)->toBe(9500.0);
});

test('authenticated pos user can update an existing cafe menu item and variants', function () {
    $user = User::factory()->kasir()->create();

    $categoryA = Category::create([
        'name' => ['id' => 'Makanan Ringan', 'en' => 'Snacks'],
        'slug' => 'snack-' . uniqid(),
    ]);
    $categoryB = Category::create([
        'name' => ['id' => 'Pastry', 'en' => 'Pastry'],
        'slug' => 'pastry-' . uniqid(),
    ]);

    $product = Product::create([
        'name' => 'Croissant Butter Sanubari',
        'slug' => 'croissant-butter-sanubari-' . uniqid(),
        'description' => 'Butter croissant',
        'stock_status' => 'in_stock',
        'status' => 'active',
        'channel' => 'pos',
    ]);
    $product->categories()->attach($categoryA);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'sku' => 'CROISSANT-01',
        'label' => 'Single Porsi',
        'price' => 25000,
        'cost_price' => 12000,
        'stock_status' => 'in_stock',
        'weight_grams' => 0,
        'sort_order' => 1,
    ]);

    $updatePayload = [
        'name' => 'Croissant Butter Artisan Premium',
        'category_id' => $categoryB->id,
        'description' => 'Freshly baked premium butter croissant.',
        'stock_status' => 'in_stock',
        'variants' => [
            [
                'id' => $variant->id,
                'label' => 'Single Porsi Premium',
                'price' => 28000,
                'cost_price' => 13500,
                'stock_status' => 'in_stock',
            ],
            [
                'label' => 'Paket 2 Pcs',
                'price' => 50000,
                'cost_price' => 24000,
                'stock_status' => 'in_stock',
            ],
        ],
    ];

    $response = $this->actingAs($user)->postJson("/pos/products/{$product->id}", $updatePayload);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Croissant Butter Artisan Premium',
    ]);

    $product->refresh();
    expect($product->categories->first()->id)->toBe($categoryB->id);
    expect($product->variants()->count())->toBe(2);
});

test('authenticated pos user can toggle product stock status', function () {
    $user = User::factory()->kasir()->create();

    $product = Product::create([
        'name' => 'Mocktail Berry Blast',
        'slug' => 'mocktail-berry-blast-' . uniqid(),
        'stock_status' => 'in_stock',
        'status' => 'active',
        'channel' => 'pos',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'sku' => 'MOCKTAIL-01',
        'label' => 'Gelas',
        'price' => 22000,
        'stock_status' => 'in_stock',
        'weight_grams' => 0,
        'sort_order' => 1,
    ]);

    // Toggle to out of stock
    $response = $this->actingAs($user)->patchJson("/pos/products/{$product->id}/toggle-stock");

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'stock_status' => 'out_of_stock',
    ]);

    // Toggle back to in stock
    $response2 = $this->actingAs($user)->patchJson("/pos/products/{$product->id}/toggle-stock");

    $response2->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'stock_status' => 'in_stock',
    ]);
});

test('authenticated pos user can delete a product', function () {
    $user = User::factory()->kasir()->create();

    $product = Product::create([
        'name' => 'Menu Sementara Hapus',
        'slug' => 'menu-sementara-hapus-' . uniqid(),
        'stock_status' => 'in_stock',
        'status' => 'active',
        'channel' => 'pos',
    ]);

    ProductVariant::create([
        'product_id' => $product->id,
        'sku' => 'TEMP-01',
        'label' => 'Standard',
        'price' => 15000,
        'stock_status' => 'in_stock',
        'weight_grams' => 0,
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($user)->deleteJson("/pos/products/{$product->id}");

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseMissing('products', [
        'id' => $product->id,
    ]);
});
