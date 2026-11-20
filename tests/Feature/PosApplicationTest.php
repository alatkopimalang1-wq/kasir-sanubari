<?php

use App\Models\Category;
use App\Models\Order;
use App\Models\PosCashFlow;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('unauthenticated user is redirected from pos to login', function () {
    $response = $this->get('/pos');
    $response->assertRedirect('/pos/login');
});

test('authenticated user can view pos dashboard with products and categories', function () {
    $user = User::factory()->kasir()->create([
        'name' => 'Kasir Sanubari',
        'email' => 'kasir@sanubari.id',
    ]);

    $category = Category::create([
        'name' => ['id' => 'Kopi Biji', 'en' => 'Coffee Beans'],
        'slug' => 'kopi-biji-test-2',
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'name' => 'Flores Bajawa Test 2',
        'slug' => 'flores-bajawa-test-2',
        'min_price' => 75000,
        'max_price' => 75000,
        'stock_status' => 'in_stock',
        'status' => 'published',
    ]);
    $product->categories()->attach($category);

    ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200g',
        'price' => 75000,
        'stock_status' => 'in_stock',
        'weight_grams' => 200,
    ]);

    $response = $this->actingAs($user)->get('/pos');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pos')
        ->has('products')
        ->has('categories')
        ->has('cashier')
        ->has('printerSettings')
        ->has('paymentSettings')
        ->has('cashDrawerToday')
        ->where('cashier.name', 'Kasir Sanubari')
    );
});

test('pos checkout successfully creates an order with pos order number', function () {
    $user = User::factory()->kasir()->create();

    $product = Product::create([
        'name' => 'Kopi Gayo Test 2',
        'slug' => 'kopi-gayo-test-2',
        'min_price' => 80000,
        'max_price' => 80000,
        'stock_status' => 'in_stock',
        'status' => 'published',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '200g',
        'price' => 80000,
        'stock_status' => 'in_stock',
        'weight_grams' => 200,
    ]);

    $payload = [
        'items' => [
            [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 2,
            ],
        ],
        'payment_method' => 'cash',
        'cash_tendered' => 200000,
        'discount_amount' => 10000,
        'customer_name' => 'Dika',
        'customer_phone' => '081234567890',
        'notes' => 'Catatan kasir',
    ];

    $response = $this->actingAs($user)->postJson('/pos/checkout', $payload);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'order' => [
            'customer_name' => 'Dika',
            'customer_phone' => '081234567890',
            'subtotal' => 160000,
            'discount_amount' => 10000,
            'total_amount' => 150000,
            'cash_tendered' => 200000,
            'cash_change' => 50000,
        ],
    ]);

    $order = Order::where('customer_name', 'Dika')->latest()->first();
    expect($order)->not->toBeNull();
    expect($order->order_number)->toStartWith('POS-');
    expect($order->status)->toBe('completed');
    expect($order->payment_status)->toBe('paid');
    expect($order->payment_method)->toBe('cash');
});

test('pos reports endpoint returns accurate aggregated sales and top products', function () {
    $user = User::factory()->kasir()->create();

    $order = Order::create([
        'order_number' => 'POS-261115-RPT1',
        'customer_name' => 'Customer Report',
        'customer_phone' => '0812999999',
        'customer_address' => 'POS Kasir',
        'payment_method' => 'cash',
        'payment_channel' => 'Kasir Tunai',
        'payment_status' => 'paid',
        'status' => 'completed',
        'subtotal' => 100000,
        'total_amount' => 100000,
        'created_at' => now(),
    ]);

    $order->items()->create([
        'product_name' => 'Wamena Washed',
        'variant_label' => '200g',
        'price' => 100000,
        'quantity' => 1,
        'subtotal' => 100000,
    ]);

    $response = $this->actingAs($user)->getJson('/pos/reports?period=daily&date='.now()->format('Y-m-d'));

    $response->assertOk();
    $response->assertJson([
        'success' => true,
    ]);
    expect($response->json('report.total_revenue'))->toBeGreaterThanOrEqual(100000);
    expect($response->json('report.total_transactions'))->toBeGreaterThanOrEqual(1);
    expect($response->json('report.payment_breakdown'))->toBeArray();
});

test('cash flow entries can be stored, listed, and deleted', function () {
    $user = User::factory()->kasir()->create();

    // 1. Store cash in (Modal awal)
    $resIn = $this->actingAs($user)->postJson('/pos/cash-flows', [
        'type' => 'in',
        'category' => 'modal_awal',
        'amount' => 300000,
        'description' => 'Modal awal kasir pagi',
        'date' => now()->format('Y-m-d'),
    ]);
    $resIn->assertOk();
    $resIn->assertJson(['success' => true]);
    expect($resIn->json('summary.total_in'))->toBeGreaterThanOrEqual(300000);
    $inId = $resIn->json('flow.id');

    // 2. Store cash out (Operasional) with custom date
    $resOut = $this->actingAs($user)->postJson('/pos/cash-flows', [
        'type' => 'out',
        'category' => 'operasional',
        'amount' => 35000,
        'description' => 'Beli es batu 2 sak',
        'date' => now()->format('Y-m-d'),
    ]);
    $resOut->assertOk();
    expect($resOut->json('summary.total_out'))->toBeGreaterThanOrEqual(35000);
    $outId = $resOut->json('flow.id');

    // 3. List cash flows (daily, this_month, custom_month)
    $resList = $this->actingAs($user)->getJson('/pos/cash-flows?period=daily&date='.now()->format('Y-m-d'));
    $resList->assertOk();
    expect($resList->json('summary.total_in'))->toBeGreaterThanOrEqual(300000);
    expect($resList->json('summary.total_out'))->toBeGreaterThanOrEqual(35000);

    $resThisMonth = $this->actingAs($user)->getJson('/pos/cash-flows?period=this_month');
    $resThisMonth->assertOk();
    expect($resThisMonth->json('summary.total_in'))->toBeGreaterThanOrEqual(300000);
    expect($resThisMonth->json('summary.is_monthly'))->toBeTrue();

    $resCustomMonth = $this->actingAs($user)->getJson('/pos/cash-flows?period=custom_month&month='.now()->format('Y-m'));
    $resCustomMonth->assertOk();
    expect($resCustomMonth->json('summary.total_in'))->toBeGreaterThanOrEqual(300000);
    expect($resCustomMonth->json('summary.is_monthly'))->toBeTrue();

    // 4. Delete
    $resDel = $this->actingAs($user)->deleteJson('/pos/cash-flows/'.$outId);
    $resDel->assertOk();
    expect(PosCashFlow::find($outId))->toBeNull();
});

test('pos settings can be saved and retrieved', function () {
    $user = User::factory()->kasir()->create();

    $printerSettings = [
        'paper_width' => '80mm',
        'store_name' => 'Sanubari Roastery Malang',
        'tagline' => 'Specialty Coffee',
        'address' => 'Jl. Candi Mendut',
        'phone' => '085121930454',
        'instagram' => '@sanubariroastery',
        'receipt_footer' => 'Terima kasih!',
        'auto_print' => true,
        'receipt_columns' => 44,
        'receipt_columns_58mm' => 32,
        'receipt_columns_80mm' => 44,
        'font_family' => 'sans-serif',
        'font_size' => 'compact',
        'font_weight' => 'bold',
    ];

    $res = $this->actingAs($user)->postJson('/pos/settings', [
        'type' => 'printer',
        'settings' => $printerSettings,
    ]);

    $res->assertOk();
    $res->assertJson(['success' => true]);

    $saved = Setting::get('pos_printer_settings');
    expect($saved['paper_width'])->toBe('80mm');
    expect($saved['store_name'])->toBe('Sanubari Roastery Malang');
    expect($saved['font_family'])->toBe('sans-serif');
    expect($saved['font_size'])->toBe('compact');
    expect($saved['font_weight'])->toBe('bold');
    expect($saved['receipt_columns_58mm'])->toBe(32);
    expect($saved['receipt_columns_80mm'])->toBe(44);

    // Test saving layout settings
    $layoutSettings = [
        'grid_density' => 'compact',
        'grid_columns' => 4,
    ];

    $resLayout = $this->actingAs($user)->postJson('/pos/settings', [
        'type' => 'layout',
        'settings' => $layoutSettings,
    ]);
    $resLayout->assertOk();
    $resLayout->assertJson(['success' => true]);

    $savedLayout = Setting::get('pos_layout_settings');
    expect($savedLayout['grid_density'])->toBe('compact');
    expect($savedLayout['grid_columns'])->toBe(4);

    // Test saving payment settings with both 'payment' and 'payments'
    $paymentSettings = [
        'enable_cash' => true,
        'enable_qris' => true,
        'enable_debit' => true,
        'enable_bank_transfer' => true,
        'qris_instructions' => 'Scan QRIS Kasir',
        'bank_info' => 'BCA 123-456-7890',
    ];

    $resPay = $this->actingAs($user)->postJson('/pos/settings', [
        'type' => 'payment',
        'settings' => $paymentSettings,
    ]);
    $resPay->assertOk();
    $resPay->assertJson(['success' => true]);

    $resPays = $this->actingAs($user)->postJson('/pos/settings', [
        'type' => 'payments',
        'settings' => $paymentSettings,
    ]);
    $resPays->assertOk();
    $resPays->assertJson(['success' => true]);

    $savedPay = Setting::get('pos_payment_settings');
    expect($savedPay['enable_debit'])->toBeTrue();
    expect($savedPay['enable_bank_transfer'])->toBeTrue();
});

test('pos checkout supports debit and bank transfer payment methods', function () {
    $user = User::factory()->kasir()->create();

    $product = Product::create([
        'name' => 'Kopi Robusta POS',
        'slug' => 'kopi-robusta-pos',
        'min_price' => 50000,
        'max_price' => 50000,
        'stock_status' => 'in_stock',
        'status' => 'published',
    ]);

    $variant = ProductVariant::create([
        'product_id' => $product->id,
        'label' => '250g',
        'price' => 50000,
        'stock_status' => 'in_stock',
        'weight_grams' => 250,
    ]);

    // 1. Checkout with Debit
    $payloadDebit = [
        'items' => [
            [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 1,
            ],
        ],
        'payment_method' => 'debit',
        'customer_name' => 'Pelanggan Debit',
    ];

    $resDebit = $this->actingAs($user)->postJson('/pos/checkout', $payloadDebit);
    $resDebit->assertOk();
    $resDebit->assertJson([
        'success' => true,
        'order' => [
            'payment_method' => 'debit',
            'total_amount' => 50000,
        ],
    ]);

    // 2. Checkout with Bank Transfer
    $payloadTransfer = [
        'items' => [
            [
                'product_id' => $product->id,
                'variant_id' => $variant->id,
                'quantity' => 2,
            ],
        ],
        'payment_method' => 'bank_transfer',
        'customer_name' => 'Pelanggan Transfer',
    ];

    $resTransfer = $this->actingAs($user)->postJson('/pos/checkout', $payloadTransfer);
    $resTransfer->assertOk();
    $resTransfer->assertJson([
        'success' => true,
        'order' => [
            'payment_method' => 'bank_transfer',
            'total_amount' => 100000,
        ],
    ]);
});

test('cashier can hold orders in queue with customer name and list or delete them', function () {
    $user = User::factory()->kasir()->create(['name' => 'Kasir Queue']);

    $payload = [
        'customer_name' => 'Kak Rendy Meja 3',
        'customer_phone' => '08123456789',
        'notes' => 'Menunggu teman datang',
        'items' => [
            [
                'product_id' => 1,
                'product_name' => 'Kopi Bajawa',
                'variant_id' => 1,
                'variant_label' => '200g',
                'price' => 75000,
                'quantity' => 2,
            ],
        ],
        'discount_amount' => 5000,
    ];

    // 1. Store to queue
    $resStore = $this->actingAs($user)->postJson('/pos/queue', $payload);
    $resStore->assertOk();
    $resStore->assertJson([
        'success' => true,
        'held_order' => [
            'customer_name' => 'Kak Rendy Meja 3',
            'subtotal' => 150000,
            'discount_amount' => 5000,
            'total_amount' => 145000,
        ],
    ]);
    $heldId = $resStore->json('held_order.id');

    // 2. List queue
    $resList = $this->actingAs($user)->getJson('/pos/queue');
    $resList->assertOk();
    expect($resList->json('count'))->toBeGreaterThanOrEqual(1);

    // 3. Delete queue
    $resDelete = $this->actingAs($user)->deleteJson("/pos/queue/{$heldId}");
    $resDelete->assertOk();
    $resDelete->assertJson(['success' => true]);
});

test('cashier can create digital a4 invoice prebill for whatsapp sharing and view it publicly', function () {
    $user = User::factory()->kasir()->create();

    $payload = [
        'customer_name' => 'Bpk. Ahmad Subarjo',
        'customer_phone' => '081298765432',
        'notes' => 'Meja Outdoor 5',
        'items' => [
            [
                'product_id' => 1,
                'product_name' => 'Single Origin Gayo Honey',
                'variant_id' => 1,
                'variant_label' => '200g',
                'price' => 85000,
                'quantity' => 2,
            ],
            [
                'product_id' => 2,
                'product_name' => 'Cold Brew Bottle',
                'variant_id' => 2,
                'variant_label' => '250ml',
                'price' => 35000,
                'quantity' => 1,
            ],
        ],
        'discount_amount' => 10000,
        'include_bank' => true,
    ];

    // 1. POST /pos/prebill
    $resPrebill = $this->actingAs($user)->postJson('/pos/prebill', $payload);
    $resPrebill->assertOk();
    $resPrebill->assertJson([
        'success' => true,
        'customer_name' => 'Bpk. Ahmad Subarjo',
        'customer_phone' => '081298765432',
        'total_amount' => 195000,
    ]);

    $token = $resPrebill->json('token');
    expect($token)->toStartWith('INV-POS-');
    expect($resPrebill->json('invoice_url'))->toContain("/pos/invoice/{$token}");
    expect($resPrebill->json('pdf_download_url'))->toContain("/pos/invoice/{$token}?download=1");
    expect($resPrebill->json('whatsapp_url'))->toContain('wa.me/6281298765432');
    expect($resPrebill->json('whatsapp_message'))->toContain('INVOICE DIGITAL RESMI (A4 PDF)');
    expect($resPrebill->json('whatsapp_message'))->toContain($token);

    // 2. GET /pos/invoice/{token} as public guest (no login needed)
    $resPublicInvoice = $this->get("/pos/invoice/{$token}");
    $resPublicInvoice->assertOk();
    $resPublicInvoice->assertInertia(fn ($page) => $page
        ->component('pos/invoice')
        ->has('order')
        ->where('order.order_number', $token)
        ->where('order.customer_name', 'Bpk. Ahmad Subarjo')
        ->where('order.total_amount', 195000)
        ->where('order.status', 'prebill')
    );
});

test('pos checkout supports item-level discounts and cart percentage discount', function () {
    $user = User::factory()->kasir()->create();

    $product1 = Product::create([
        'name' => 'Single Origin Toraja',
        'slug' => 'single-origin-toraja-disc',
        'min_price' => 50000,
        'max_price' => 50000,
        'stock_status' => 'in_stock',
        'status' => 'published',
    ]);
    $variant1 = ProductVariant::create([
        'product_id' => $product1->id,
        'label' => '200g',
        'price' => 50000,
        'stock_status' => 'in_stock',
        'weight_grams' => 200,
    ]);

    $product2 = Product::create([
        'name' => 'Cold Brew Bottle',
        'slug' => 'cold-brew-bottle-disc',
        'min_price' => 30000,
        'max_price' => 30000,
        'stock_status' => 'in_stock',
        'status' => 'published',
    ]);
    $variant2 = ProductVariant::create([
        'product_id' => $product2->id,
        'label' => '250ml',
        'price' => 30000,
        'stock_status' => 'in_stock',
        'weight_grams' => 250,
    ]);

    // Item 1: 50,000 x 2 = 100,000. Item discount: 10,000 -> line subtotal: 90,000
    // Item 2: 30,000 x 1 = 30,000. Item discount: 3,000 -> line subtotal: 27,000
    // Net after item discounts = 117,000.
    // Cart discount: 11,700 (10%).
    // Final total = 117,000 - 11,700 = 105,300.
    // Total discount = 10,000 + 3,000 + 11,700 = 24,700.
    $payload = [
        'items' => [
            [
                'product_id' => $product1->id,
                'variant_id' => $variant1->id,
                'quantity' => 2,
                'price' => 50000,
                'discount_amount' => 10000,
                'discount_type' => 'fixed',
                'discount_value' => 10000,
            ],
            [
                'product_id' => $product2->id,
                'variant_id' => $variant2->id,
                'quantity' => 1,
                'price' => 30000,
                'discount_amount' => 3000,
                'discount_type' => 'percent',
                'discount_value' => 10,
            ],
        ],
        'payment_method' => 'cash',
        'cash_tendered' => 150000,
        'discount_amount' => 11700,
        'cart_discount_type' => 'percent',
        'cart_discount_value' => 10,
        'customer_name' => 'Budi Santoso',
    ];

    $response = $this->actingAs($user)->postJson('/pos/checkout', $payload);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'order' => [
            'total_amount' => 105300,
            'discount_amount' => 24700,
        ],
    ]);

    $order = Order::where('customer_name', 'Budi Santoso')->latest()->first();
    expect($order)->not->toBeNull();
    expect((int) $order->total_amount)->toBe(105300);

    $paymentDetails = $order->payment_details;
    expect($paymentDetails['discount_breakdown']['item_discounts'])->toBe(13000);
    expect($paymentDetails['discount_breakdown']['cart_discount'])->toBe(11700);
    expect($paymentDetails['discount_breakdown']['total_discount'])->toBe(24700);
});

test('pos transaction history can be filtered by today, yesterday, and custom date range', function () {
    $user = User::factory()->kasir()->create();

    // 1. Create Order Today
    $todayOrder = Order::create([
        'user_id' => $user->id,
        'order_number' => 'POS-TODAY-01',
        'customer_name' => 'Pelanggan Hari Ini',
        'customer_phone' => '0811111111',
        'customer_address' => 'Toko Fisik / POS Kasir',
        'shipping_courier' => 'POS Kasir',
        'shipping_service' => 'Langsung',
        'payment_method' => 'cash',
        'payment_channel' => 'Kasir Tunai',
        'payment_status' => 'paid',
        'status' => 'completed',
        'subtotal' => 50000,
        'unique_code' => 0,
        'total_amount' => 50000,
        'created_at' => now(),
        'updated_at' => now(),
        'payment_details' => ['source' => 'pos'],
    ]);

    // 2. Create Order Yesterday
    $yesterdayOrder = Order::create([
        'user_id' => $user->id,
        'order_number' => 'POS-YEST-02',
        'customer_name' => 'Pelanggan Kemarin',
        'customer_phone' => '0822222222',
        'customer_address' => 'Toko Fisik / POS Kasir',
        'shipping_courier' => 'POS Kasir',
        'shipping_service' => 'Langsung',
        'payment_method' => 'qris',
        'payment_channel' => 'QRIS Toko Resmi',
        'payment_status' => 'paid',
        'status' => 'completed',
        'subtotal' => 75000,
        'unique_code' => 0,
        'total_amount' => 75000,
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
        'payment_details' => ['source' => 'pos'],
    ]);

    // 3. Create Order 5 days ago
    $pastOrder = Order::create([
        'user_id' => $user->id,
        'order_number' => 'POS-PAST-03',
        'customer_name' => 'Pelanggan Lampau',
        'customer_phone' => '0833333333',
        'customer_address' => 'Toko Fisik / POS Kasir',
        'shipping_courier' => 'POS Kasir',
        'shipping_service' => 'Langsung',
        'payment_method' => 'debit',
        'payment_channel' => 'Mesin EDC',
        'payment_status' => 'paid',
        'status' => 'completed',
        'subtotal' => 120000,
        'unique_code' => 0,
        'total_amount' => 120000,
        'created_at' => now()->subDays(5),
        'updated_at' => now()->subDays(5),
        'payment_details' => ['source' => 'pos'],
    ]);

    // Filter Today
    $resToday = $this->actingAs($user)->getJson('/pos/orders?filter=today');
    $resToday->assertOk();
    $todayNumbers = collect($resToday->json('orders'))->pluck('order_number')->all();
    expect($todayNumbers)->toContain('POS-TODAY-01');
    expect($todayNumbers)->not->toContain('POS-YEST-02');
    expect($todayNumbers)->not->toContain('POS-PAST-03');

    // Filter Yesterday
    $resYesterday = $this->actingAs($user)->getJson('/pos/orders?filter=yesterday');
    $resYesterday->assertOk();
    $yesterdayNumbers = collect($resYesterday->json('orders'))->pluck('order_number')->all();
    expect($yesterdayNumbers)->toContain('POS-YEST-02');
    expect($yesterdayNumbers)->not->toContain('POS-TODAY-01');
    expect($yesterdayNumbers)->not->toContain('POS-PAST-03');

    // Filter Custom Range (past 7 days to past 2 days)
    $resCustom = $this->actingAs($user)->getJson('/pos/orders?filter=custom&start_date='.now()->subDays(7)->format('Y-m-d').'&end_date='.now()->subDays(2)->format('Y-m-d'));
    $resCustom->assertOk();
    $customNumbers = collect($resCustom->json('orders'))->pluck('order_number')->all();
    expect($customNumbers)->toContain('POS-PAST-03');
    expect($customNumbers)->not->toContain('POS-TODAY-01');
    expect($customNumbers)->not->toContain('POS-YEST-02');

    // Search query
    $resSearch = $this->actingAs($user)->getJson('/pos/orders?filter=today&search=Pelanggan Hari Ini');
    $resSearch->assertOk();
    $searchNumbers = collect($resSearch->json('orders'))->pluck('order_number')->all();
    expect($searchNumbers)->toContain('POS-TODAY-01');
});

test('pos index only displays allowed categories Filter Beans, Arabica Espresso, Houseblend, and Fine Robusta', function () {
    $user = User::factory()->kasir()->create();

    // Create standard categories
    Category::firstOrCreate(['slug' => 'filter-beans'], [
        'name' => ['id' => 'Filter Beans', 'en' => 'Filter Beans'],
        'sort_order' => 1,
    ]);
    Category::firstOrCreate(['slug' => 'arabica'], [
        'name' => ['id' => 'Arabica Espresso', 'en' => 'Arabica Espresso'],
        'sort_order' => 21,
    ]);
    Category::firstOrCreate(['slug' => 'houseblend'], [
        'name' => ['id' => 'Houseblend', 'en' => 'Houseblend'],
        'sort_order' => 22,
    ]);
    Category::firstOrCreate(['slug' => 'robusta'], [
        'name' => ['id' => 'Fine Robusta', 'en' => 'Fine Robusta'],
        'sort_order' => 23,
    ]);

    // Create other categories that should NOT appear in POS
    Category::firstOrCreate(['slug' => 'classic-process'], [
        'name' => ['id' => 'Classic Process', 'en' => 'Classic Process'],
        'sort_order' => 30,
    ]);
    Category::firstOrCreate(['slug' => 'experimental-process'], [
        'name' => ['id' => 'Experimental Process', 'en' => 'Experimental Process'],
        'sort_order' => 31,
    ]);

    $response = $this->actingAs($user)->get('/pos');
    $response->assertOk();
    $response->assertInertia(function ($page) {
        $cats = collect($page->toArray()['props']['categories']);
        $slugs = $cats->pluck('slug')->all();
        expect($slugs)->toContain('filter-beans');
        expect($slugs)->toContain('arabica');
        expect($slugs)->toContain('houseblend');
        expect($slugs)->toContain('robusta');
        expect($slugs)->not->toContain('classic-process');
        expect($slugs)->not->toContain('experimental-process');
    });
});

test('pos catalog can be fetched and downloaded for offline use', function () {
    $user = User::factory()->kasir()->create();

    $category = Category::firstOrCreate(['slug' => 'filter-beans'], [
        'name' => ['id' => 'Filter Beans', 'en' => 'Filter Beans'],
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'name' => 'Offline Test Product',
        'slug' => 'offline-test-product',
        'min_price' => 75000,
        'max_price' => 75000,
        'stock_status' => 'in_stock',
        'is_active' => true,
    ]);
    $product->categories()->attach($category->id);

    $product->variants()->create([
        'label' => '200g',
        'price' => 75000,
        'stock_status' => 'in_stock',
        'weight_grams' => 200,
    ]);

    // Fetch JSON
    $res = $this->actingAs($user)->getJson('/pos/catalog');
    $res->assertOk();
    $res->assertJsonStructure([
        'success',
        'source',
        'categories',
        'products',
        'settings',
    ]);

    $catalogData = $res->json();
    expect($catalogData['products'])->not->toBeEmpty();
    $firstProduct = collect($catalogData['products'])->firstWhere('id', $product->id);
    expect($firstProduct)->not->toBeNull();
    expect((float) $firstProduct['min_price'])->toEqual(75000.0);
    expect((float) $firstProduct['max_price'])->toEqual(75000.0);
    expect($firstProduct['image'])->not->toBeEmpty();
    expect($firstProduct['category_ids'])->toContain($category->id);

    // Download attachment
    $resDownload = $this->actingAs($user)->get('/pos/catalog?download=1');
    $resDownload->assertOk();
    $resDownload->assertHeader('Content-Disposition');
});

test('pos sync offline orders saves offline transactions into database and prevents duplicates', function () {
    $user = User::factory()->kasir()->create();

    $product = Product::create([
        'name' => 'Kopi Offline Sync',
        'slug' => 'kopi-offline-sync-'.uniqid(),
        'min_price' => 50000,
        'max_price' => 50000,
        'stock_status' => 'in_stock',
        'is_active' => true,
    ]);
    $variant = $product->variants()->create([
        'label' => '250g',
        'price' => 50000,
        'stock_status' => 'in_stock',
        'weight_grams' => 250,
    ]);

    $offlineId = 'POS-OFF-'.uniqid();

    $payload = [
        'orders' => [
            [
                'offline_id' => $offlineId,
                'customer_name' => 'Pelanggan Offline 1',
                'customer_phone' => '08123456789',
                'payment_method' => 'cash',
                'cash_tendered' => 100000,
                'discount_amount' => 5000,
                'items' => [
                    [
                        'product_id' => $product->id,
                        'variant_id' => $variant->id,
                        'product_name' => $product->name,
                        'variant_label' => $variant->label,
                        'quantity' => 2,
                        'price' => 50000,
                        'discount_amount' => 5000,
                    ],
                ],
            ],
        ],
    ];

    $response = $this->actingAs($user)->postJson('/pos/sync-offline-orders', $payload);
    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'synced_count' => 1,
    ]);

    // Verify order created in database
    $createdOrder = Order::whereJsonContains('payment_details->offline_id', $offlineId)->first();
    expect($createdOrder)->not->toBeNull();
    expect((float) $createdOrder->total_amount)->toBe(90000.0);
    expect($createdOrder->items)->toHaveCount(1);

    // Syncing the same order again should NOT duplicate
    $resRepeat = $this->actingAs($user)->postJson('/pos/sync-offline-orders', $payload);
    $resRepeat->assertOk();
    $resRepeat->assertJsonFragment([
        'status' => 'already_synced',
    ]);
    expect(Order::whereJsonContains('payment_details->offline_id', $offlineId)->count())->toBe(1);
});

test('pos import orders accepts uploaded json file and imports into database', function () {
    $user = User::factory()->kasir()->create();

    $product = Product::create([
        'name' => 'Kopi Import Test',
        'slug' => 'kopi-import-test-'.uniqid(),
        'min_price' => 80000,
        'max_price' => 80000,
        'stock_status' => 'in_stock',
        'is_active' => true,
    ]);
    $variant = $product->variants()->create([
        'label' => '500g',
        'price' => 80000,
        'stock_status' => 'in_stock',
        'weight_grams' => 500,
    ]);

    $offlineId = 'POS-IMPORT-'.uniqid();
    $content = json_encode([
        'orders' => [
            [
                'offline_id' => $offlineId,
                'customer_name' => 'Pelanggan Import File',
                'payment_method' => 'qris',
                'items' => [
                    [
                        'product_id' => $product->id,
                        'variant_id' => $variant->id,
                        'product_name' => $product->name,
                        'variant_label' => $variant->label,
                        'quantity' => 1,
                        'price' => 80000,
                    ],
                ],
            ],
        ],
    ]);

    $file = UploadedFile::fake()->createWithContent('offline_sales.json', $content);

    $response = $this->actingAs($user)->post('/pos/import-orders', [
        'file' => $file,
    ], ['Accept' => 'application/json']);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'synced_count' => 1,
    ]);

    $imported = Order::whereJsonContains('payment_details->offline_id', $offlineId)->first();
    expect($imported)->not->toBeNull();
    expect((float) $imported->total_amount)->toBe(80000.0);
});

test('pos includes cybr custom blend product and can checkout with custom ratio', function () {
    $user = User::factory()->kasir()->create();

    $cybrCategory = Category::firstOrCreate(['slug' => 'cybr'], [
        'name' => ['id' => 'C.Y.B.R', 'en' => 'C.Y.B.R'],
    ]);

    $cybrProduct = Product::firstOrCreate(['slug' => 'byob'], [
        'name' => 'C.Y.B.R: Customize Your Blend Ratio',
        'series' => 'cybr',
        'status' => 'active',
        'min_price' => 65000,
        'max_price' => 275000,
        'stock_status' => 'in_stock',
    ]);
    $cybrProduct->categories()->syncWithoutDetaching([$cybrCategory->id]);

    $cybrVariant = ProductVariant::firstOrCreate([
        'product_id' => $cybrProduct->id,
        'weight_grams' => 200,
    ], [
        'label' => '200g',
        'price' => 65000,
        'sku' => 'BYOB-200',
        'stock_status' => 'in_stock',
    ]);

    $response = $this->actingAs($user)->get('/pos');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pos')
        ->has('products')
        ->has('categories')
    );

    $pageProps = $response->viewData('page')['props'];
    $productSlugs = collect($pageProps['products'])->pluck('slug')->all();
    $categorySlugs = collect($pageProps['categories'])->pluck('slug')->all();
    expect($productSlugs)->toContain('byob');
    expect($categorySlugs)->toContain('cybr');

    $checkoutResponse = $this->actingAs($user)->postJson('/pos/checkout', [
        'items' => [
            [
                'product_id' => $cybrProduct->id,
                'variant_id' => $cybrVariant->id,
                'quantity' => 1,
                'notes' => 'Rasio: 60% Arabica Kawi + 40% Robusta Dampit (Giling Halus)',
            ],
        ],
        'payment_method' => 'cash',
        'cash_tendered' => 70000,
        'customer_name' => 'Pelanggan CYBR',
    ]);

    $checkoutResponse->assertOk();
    $checkoutResponse->assertJson(['success' => true]);

    $order = Order::latest('id')->first();
    expect($order->customer_name)->toBe('Pelanggan CYBR');
    expect((float) $order->total_amount)->toBe(65000.0);
    expect($order->items->first()->custom_notes)->toBe('Rasio: 60% Arabica Kawi + 40% Robusta Dampit (Giling Halus)');
});
