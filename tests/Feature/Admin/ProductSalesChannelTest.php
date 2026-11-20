<?php

use App\Filament\Resources\Products\Pages\ListProducts;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Livewire\Livewire;

test('product scopes correctly filter website vs pos channels', function () {
    $bothProduct = Product::create([
        'name' => 'Kopi Keduanya ' . uniqid(),
        'slug' => 'kopi-keduanya-' . uniqid(),
        'channel' => 'all',
        'status' => 'active',
        'min_price' => 50000,
        'max_price' => 50000,
    ]);

    $webOnlyProduct = Product::create([
        'name' => 'Kopi Web Saja ' . uniqid(),
        'slug' => 'kopi-web-saja-' . uniqid(),
        'channel' => 'web',
        'status' => 'active',
        'min_price' => 50000,
        'max_price' => 50000,
    ]);

    $posOnlyProduct = Product::create([
        'name' => 'Kopi POS Saja ' . uniqid(),
        'slug' => 'kopi-pos-saja-' . uniqid(),
        'channel' => 'pos',
        'status' => 'active',
        'min_price' => 50000,
        'max_price' => 50000,
    ]);

    $webIds = Product::forWebsite()->pluck('id')->all();
    expect($webIds)->toContain($bothProduct->id)
        ->toContain($webOnlyProduct->id)
        ->not->toContain($posOnlyProduct->id);

    $posIds = Product::forPos()->pluck('id')->all();
    expect($posIds)->toContain($bothProduct->id)
        ->toContain($posOnlyProduct->id)
        ->not->toContain($webOnlyProduct->id);
});

test('pos only product is excluded from website shop page', function () {
    $category = Category::first() ?? Category::create([
        'name' => 'Beans',
        'slug' => 'beans',
    ]);

    $webProduct = Product::create([
        'name' => 'Speciality Web Beans ' . uniqid(),
        'slug' => 'web-beans-' . uniqid(),
        'channel' => 'web',
        'status' => 'active',
        'min_price' => 60000,
        'max_price' => 60000,
    ]);
    $webProduct->categories()->attach($category->id);

    $posProduct = Product::create([
        'name' => 'Exclusive POS Beans ' . uniqid(),
        'slug' => 'pos-beans-' . uniqid(),
        'channel' => 'pos',
        'status' => 'active',
        'min_price' => 60000,
        'max_price' => 60000,
    ]);
    $posProduct->categories()->attach($category->id);

    $response = $this->get(route('shop.index'));
    $response->assertOk();

    $response->assertSee($webProduct->name);
    $response->assertDontSee($posProduct->name);
});

test('web only product is excluded from pos interface', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $category = Category::first() ?? Category::create([
        'name' => 'Filter Beans',
        'slug' => 'filter-beans',
    ]);

    $webProduct = Product::create([
        'name' => 'Web Only Product ' . uniqid(),
        'slug' => 'web-only-' . uniqid(),
        'channel' => 'web',
        'status' => 'active',
        'min_price' => 45000,
        'max_price' => 45000,
    ]);
    $webProduct->categories()->attach($category->id);

    $posProduct = Product::create([
        'name' => 'POS Only Product ' . uniqid(),
        'slug' => 'pos-only-' . uniqid(),
        'channel' => 'pos',
        'status' => 'active',
        'min_price' => 45000,
        'max_price' => 45000,
    ]);
    $posProduct->categories()->attach($category->id);

    $response = $this->actingAs($user)->get(route('pos.index'));
    $response->assertOk();

    $response->assertSee($posProduct->name);
    $response->assertDontSee($webProduct->name);
});

test('filament admin product list displays channel badge and filter works', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $webProduct = Product::create([
        'name' => 'Admin Test Web Only ' . uniqid(),
        'slug' => 'admin-test-web-' . uniqid(),
        'channel' => 'web',
        'status' => 'active',
        'min_price' => 50000,
        'max_price' => 50000,
    ]);

    $posProduct = Product::create([
        'name' => 'Admin Test POS Only ' . uniqid(),
        'slug' => 'admin-test-pos-' . uniqid(),
        'channel' => 'pos',
        'status' => 'active',
        'min_price' => 50000,
        'max_price' => 50000,
    ]);

    $this->actingAs($user);

    Livewire::test(ListProducts::class)
        ->assertCanSeeTableRecords([$webProduct, $posProduct])
        ->filterTable('channel', 'web')
        ->assertCanSeeTableRecords([$webProduct])
        ->assertCanNotSeeTableRecords([$posProduct]);
});

