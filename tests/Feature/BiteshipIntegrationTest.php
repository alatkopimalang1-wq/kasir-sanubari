<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Setting;
use App\Services\BiteshipService;
use App\Services\ShippingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BiteshipIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_biteship_test_connection_successful(): void
    {
        Http::fake([
            'https://api.biteship.com/v1/couriers' => Http::response([
                'success' => true,
                'couriers' => [
                    ['courier_code' => 'jne', 'courier_name' => 'JNE Express'],
                    ['courier_code' => 'jnt', 'courier_name' => 'J&T Express'],
                ],
            ], 200),
        ]);

        $res = BiteshipService::testConnection('biteship_test.secret123');

        $this->assertTrue($res['success']);
        $this->assertSame(2, $res['couriers_count']);
        $this->assertStringContainsString('Koneksi ke API Biteship berhasil', $res['message']);
    }

    public function test_biteship_test_connection_failed(): void
    {
        Http::fake([
            'https://api.biteship.com/v1/couriers' => Http::response([
                'success' => false,
                'error' => 'Invalid API Key',
            ], 401),
        ]);

        $res = BiteshipService::testConnection('biteship_test.invalid_key');

        $this->assertFalse($res['success']);
        $this->assertStringContainsString('Invalid API Key', $res['message']);
    }

    public function test_biteship_search_areas(): void
    {
        Setting::set('biteship_api_key', 'biteship_test.dummy');

        Http::fake([
            'https://api.biteship.com/v1/locations/areas*' => Http::response([
                'success' => true,
                'areas' => [
                    [
                        'id' => 'IDnp0001',
                        'name' => 'Lowokwaru, Kota Malang',
                        'administrative_division_level_1_name' => 'Jawa Timur',
                        'administrative_division_level_2_name' => 'Kota Malang',
                        'administrative_division_level_3_name' => 'Lowokwaru',
                        'postal_code' => 65144,
                    ],
                ],
            ], 200),
        ]);

        $areas = BiteshipService::searchAreas('Lowokwaru');

        $this->assertCount(1, $areas);
        $this->assertSame('IDnp0001', $areas[0]['id']);
        $this->assertSame('Kota Malang', $areas[0]['city']);
        $this->assertSame(65144, $areas[0]['postal_code']);

        // Check controller endpoint
        $response = $this->getJson('/api/shipping/areas?query=Lowokwaru');
        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.id', 'IDnp0001');
    }

    public function test_biteship_get_rates_and_shipping_service_integration(): void
    {
        Setting::set('biteship_enabled', true);
        Setting::set('biteship_api_key', 'biteship_test.dummy');
        Setting::set('shipping_couriers', ['jne', 'jnt', 'sicepat']);

        Http::fake([
            'https://api.biteship.com/v1/rates/couriers' => Http::response([
                'success' => true,
                'pricing' => [
                    [
                        'company' => 'jne',
                        'courier_name' => 'JNE Express',
                        'courier_code' => 'jne',
                        'courier_service_name' => 'Reguler',
                        'courier_service_code' => 'reg',
                        'description' => 'Layanan Reguler JNE',
                        'duration' => '1 - 2 Hari',
                        'price' => 18000,
                        'service_type' => 'standard',
                    ],
                    [
                        'company' => 'jnt',
                        'courier_name' => 'J&T Express',
                        'courier_code' => 'jnt',
                        'courier_service_name' => 'EZ',
                        'courier_service_code' => 'ez',
                        'description' => 'J&T Standar',
                        'duration' => '1 - 2 Hari',
                        'price' => 19000,
                        'service_type' => 'standard',
                    ],
                ],
            ], 200),
        ]);

        $rates = ShippingService::calculateRates([
            'destination_city_id' => 577, // Surabaya
            'destination_postal_code' => '60119',
            'province_id' => 18,
            'weight_grams' => 500,
            'subtotal' => 100000,
        ]);

        $this->assertNotEmpty($rates);
        $jne = collect($rates)->firstWhere('courier_code', 'jne');
        $this->assertNotNull($jne);
        $this->assertSame('biteship', $jne['gateway']);
        $this->assertEquals(18000, $jne['cost']);
    }

    public function test_shipping_service_falls_back_to_builtin_when_biteship_disabled(): void
    {
        Setting::set('biteship_enabled', false);
        Setting::set('shipping_couriers', ['jne', 'jnt']);

        $rates = ShippingService::calculateRates([
            'destination_city_id' => 577, // Surabaya
            'province_id' => 18,
            'weight_grams' => 500,
            'subtotal' => 100000,
        ]);

        $this->assertNotEmpty($rates);
        $jne = collect($rates)->firstWhere('courier_code', 'jne');
        $this->assertNotNull($jne);
        $this->assertSame('builtin_matrix', $jne['gateway'] ?? 'builtin_matrix');
    }

    public function test_biteship_create_order_and_waybill(): void
    {
        Setting::set('biteship_enabled', true);
        Setting::set('biteship_api_key', 'biteship_test.dummy');

        $order = Order::create([
            'order_number' => 'ORD-TEST-001',
            'customer_name' => 'Budi Santoso',
            'customer_phone' => '081234567890',
            'customer_address' => 'Jl. Basuki Rahmat No. 10',
            'shipping_address' => 'Jl. Basuki Rahmat No. 10',
            'shipping_city' => 'Kota Surabaya',
            'shipping_postal_code' => '60119',
            'shipping_courier' => 'jne',
            'shipping_service' => 'reg',
            'shipping_cost' => 18000,
            'total_amount' => 118000,
            'total_weight_grams' => 500,
            'status' => 'pending',
            'payment_status' => 'paid',
        ]);

        Http::fake([
            'https://api.biteship.com/v1/orders' => Http::response([
                'success' => true,
                'id' => 'ord_biteship_123',
                'waybill_id' => 'JNE-BS-998877',
                'status' => 'allocated',
                'courier' => [
                    'company' => 'jne',
                    'waybill_id' => 'JNE-BS-998877',
                    'tracking_id' => 'trk_998877',
                ],
            ], 200),
        ]);

        $res = BiteshipService::createOrder($order);

        $this->assertTrue($res['success']);
        $this->assertSame('JNE-BS-998877', $res['waybill']);

        $order->refresh();
        $this->assertSame('JNE-BS-998877', $order->tracking_number);
        $this->assertSame('processing', $order->status);
        $this->assertSame('ord_biteship_123', $order->payment_details['biteship']['order_id']);
    }

    public function test_biteship_webhook_updates_order_status(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-TEST-WH',
            'customer_name' => 'Siti Rahma',
            'customer_phone' => '081234567891',
            'customer_address' => 'Jl. Ijen No. 5, Malang',
            'shipping_address' => 'Jl. Ijen No. 5, Malang',
            'shipping_courier' => 'jnt',
            'tracking_number' => 'JNT-998811',
            'status' => 'processing',
            'payment_status' => 'paid',
            'total_amount' => 85000,
        ]);

        $response = $this->postJson('/api/webhooks/biteship', [
            'event' => 'order.status',
            'waybill_id' => 'JNT-998811',
            'status' => 'delivered',
            'updated_at' => now()->toIso8601String(),
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $order->refresh();
        $this->assertSame('completed', $order->status);
        $this->assertSame('delivered', $order->payment_details['biteship']['last_webhook_status']);
    }

    public function test_shipping_cities_and_subdistricts_by_province(): void
    {
        // Request cities for Sumatera Utara (province_id: 16)
        $resSumut = $this->getJson('/api/shipping/cities?province_id=16');
        $resSumut->assertOk()
            ->assertJsonPath('success', true);

        $cities = $resSumut->json('data');
        $this->assertNotEmpty($cities);
        $medan = collect($cities)->firstWhere('name', 'Medan');
        $this->assertNotNull($medan);
        $this->assertSame(16, $medan['province_id']);

        // Check subdistricts for Medan (city_id: 278)
        $resSub = $this->getJson('/api/shipping/subdistricts?city_id=278');
        $resSub->assertOk()
            ->assertJsonPath('success', true);

        $subdistricts = $resSub->json('data');
        $this->assertNotEmpty($subdistricts);
        $this->assertSame('Medan Kota', $subdistricts[0]['name']);

        // Check subdistricts for Badung (city_id: 17, Bali)
        $resBadung = $this->getJson('/api/shipping/subdistricts?city_id=17');
        $resBadung->assertOk()
            ->assertJsonPath('success', true);
        $badungSubs = $resBadung->json('data');
        $this->assertNotEmpty($badungSubs);
        $this->assertSame('Kuta', $badungSubs[0]['name']);
    }

    public function test_biteship_environment_and_webhook_secret_handling(): void
    {
        Setting::set('biteship_environment', 'testing');
        Setting::set('biteship_webhook_secret', 'secret_biteship_123');

        $this->assertSame('testing', BiteshipService::getEnvironment());
        $this->assertFalse(BiteshipService::isProduction());
        $this->assertSame('secret_biteship_123', BiteshipService::getWebhookSecret());

        // Test webhook rejects invalid signature
        $payload = json_encode(['waybill_id' => 'INVALID', 'status' => 'delivered']);
        $response = $this->call(
            'POST',
            '/api/webhooks/biteship',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_BITESHIP_SIGNATURE' => 'wrong_signature',
            ],
            $payload
        );
        $response->assertStatus(401);

        // Test webhook accepts valid signature
        $validSignature = hash_hmac('sha256', $payload, 'secret_biteship_123');
        $responseValid = $this->call(
            'POST',
            '/api/webhooks/biteship',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_BITESHIP_SIGNATURE' => $validSignature,
            ],
            $payload
        );
        $responseValid->assertOk();
    }

    public function test_complete_indonesian_administrative_regions_count(): void
    {
        $allCities = ShippingService::getBuiltInCities();
        $this->assertCount(514, $allCities);

        $kabupaten = array_filter($allCities, fn ($c) => $c['type'] === 'Kabupaten');
        $kota = array_filter($allCities, fn ($c) => $c['type'] === 'Kota');

        $this->assertCount(416, $kabupaten);
        $this->assertCount(98, $kota);

        $districtsPath = resource_path('data/wilayah/districts_by_city.json');
        $this->assertFileExists($districtsPath);

        $districtsMap = json_decode(file_get_contents($districtsPath), true);
        $totalDistricts = 0;
        foreach ($districtsMap as $cityId => $subs) {
            $totalDistricts += count($subs);
        }

        $this->assertSame(7285, $totalDistricts);
    }

    public function test_places_search_and_reverse_geocode_endpoints(): void
    {
        // 1. Test search with valid query
        $resSearch = $this->getJson('/api/shipping/places/search?q=taman&city=Malang');
        $resSearch->assertOk()
            ->assertJsonPath('success', true);

        // 2. Test search with short query (returns empty list)
        $resShort = $this->getJson('/api/shipping/places/search?q=a');
        $resShort->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data', []);

        // 3. Test reverse geocode
        $resRev = $this->getJson('/api/shipping/places/reverse?lat=-7.9339&lng=112.6175');
        $resRev->assertOk()
            ->assertJsonPath('success', true);
    }
}
