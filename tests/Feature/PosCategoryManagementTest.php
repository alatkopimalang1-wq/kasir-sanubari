<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

test('authenticated pos user can list categories', function () {
    $user = User::factory()->kasir()->create();

    Category::create([
        'name' => ['id' => 'Kategori Khusus Test', 'en' => 'Special Test Category'],
        'slug' => 'kategori-khusus-test',
        'sort_order' => 1,
    ]);

    $response = $this->actingAs($user)->getJson('/pos/categories');

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ])
        ->assertJsonFragment([
            'slug' => 'kategori-khusus-test',
        ]);
});

test('authenticated pos user can create a new category', function () {
    $user = User::factory()->kasir()->create();

    $response = $this->actingAs($user)->postJson('/pos/categories', [
        'name' => 'Pastry & Bakery',
        'slug' => 'pastry-bakery',
        'description' => 'Aneka roti dan kue lezat',
        'sort_order' => 5,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('categories', [
        'slug' => 'pastry-bakery',
    ]);
});

test('authenticated pos user can update an existing category', function () {
    $user = User::factory()->kasir()->create();

    $category = Category::create([
        'name' => ['id' => 'Makanan Ringan', 'en' => 'Light Snacks'],
        'slug' => 'makanan-ringan',
        'sort_order' => 2,
    ]);

    $response = $this->actingAs($user)->putJson("/pos/categories/{$category->id}", [
        'name' => 'Camilan Gurih',
        'slug' => 'camilan-gurih',
        'description' => 'Camilan renyah dan gurih',
        'sort_order' => 3,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'slug' => 'camilan-gurih',
    ]);
});

test('authenticated pos user can delete a category and detach products safely', function () {
    $user = User::factory()->kasir()->create();

    $category = Category::create([
        'name' => ['id' => 'Kategori Dihapus', 'en' => 'To be deleted'],
        'slug' => 'kategori-dihapus',
    ]);

    $product = Product::create([
        'name' => 'Produk Uji Coba Kategori',
        'slug' => 'produk-uji-coba-kategori',
        'stock_status' => 'in_stock',
        'status' => 'active',
        'channel' => 'all',
    ]);
    $product->categories()->attach($category);

    $response = $this->actingAs($user)->deleteJson("/pos/categories/{$category->id}");

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseMissing('categories', [
        'id' => $category->id,
    ]);

    // Ensure product still exists safely
    $this->assertDatabaseHas('products', [
        'id' => $product->id,
    ]);
});
