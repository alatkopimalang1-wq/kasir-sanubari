<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PosCashFlow;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosProfitLossTest extends TestCase
{
    use RefreshDatabase;

    public function test_pos_profit_loss_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/pos/profit-loss');
        $response->assertStatus(401);
    }

    public function test_kasir_user_cannot_access_pos_profit_loss_report(): void
    {
        $kasir = User::factory()->kasir()->create();

        $response = $this->actingAs($kasir)->getJson('/pos/profit-loss');
        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
            'message' => 'Laporan laba rugi hanya dapat diakses oleh akun Admin dan Owner.',
        ]);
    }

    public function test_pos_profit_loss_calculates_daily_yesterday_and_monthly_metrics(): void
    {
        $owner = User::factory()->owner()->create();

        $product = Product::create([
            'name' => 'Kopi Sanubari P&L',
            'slug' => 'kopi-sanubari-pl',
            'sku' => 'PL-001',
            'price' => 50000,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'label' => '200g',
            'sku' => 'PL-001-200G',
            'price' => 50000,
            'cost_price' => 20000, // HPP = Rp 20.000 per unit
            'stock' => 50,
            'is_active' => true,
        ]);

        // Order today
        $orderToday = Order::create([
            'order_number' => 'POS-20261117-001',
            'customer_name' => 'Pelanggan POS Hari Ini',
            'customer_phone' => '08123456789',
            'customer_address' => 'POS Kasir',
            'subtotal' => 100000,
            'discount_amount' => 10000,
            'total_amount' => 90000, // net sales = 90.000
            'payment_status' => 'paid',
            'payment_method' => 'cash',
            'payment_details' => ['source' => 'pos'],
            'created_at' => Carbon::today()->setHour(10),
        ]);

        OrderItem::create([
            'order_id' => $orderToday->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_label' => '200g',
            'price' => 50000,
            'quantity' => 2, // 2 units * HPP 20.000 = HPP 40.000
            'subtotal' => 100000,
        ]);

        // Cash out today
        PosCashFlow::create([
            'type' => 'out',
            'category' => 'operasional',
            'amount' => 15000,
            'description' => 'Beli es batu',
            'user_id' => $owner->id,
            'recorded_at' => Carbon::today()->setHour(11),
        ]);

        // Test Today
        $responseToday = $this->actingAs($owner)->getJson('/pos/profit-loss?period=today');
        $responseToday->assertOk();
        $responseToday->assertJson([
            'success' => true,
            'period' => 'today',
            'is_monthly' => false,
            'summary' => [
                'total_transactions' => 1,
                'items_sold' => 2,
                'gross_sales' => 100000,
                'total_discounts' => 10000,
                'net_sales' => 90000,
                'total_cogs' => 40000,
                'gross_profit' => 50000, // 90000 - 40000 = 50000
                'total_expenses' => 15000,
                'net_profit' => 35000, // 50000 - 15000 = 35000
            ],
        ]);
        $transactions = $responseToday->json('transactions');
        $this->assertCount(1, $transactions);
        $this->assertEquals('POS-20261117-001', $transactions[0]['order_number']);
        $this->assertEquals(40000, $transactions[0]['total_cogs']);
        $this->assertEquals(50000, $transactions[0]['gross_profit']);
        $this->assertCount(1, $transactions[0]['items']);

        $expenses = $responseToday->json('expenses');
        $this->assertCount(1, $expenses);
        $this->assertEquals('Beli es batu', $expenses[0]['description']);
        $this->assertEquals(15000, $expenses[0]['amount']);
        $this->assertEquals('operasional', $expenses[0]['category']);
        $this->assertEquals('Operasional Toko', $expenses[0]['category_label']);

        $breakdown = $responseToday->json('expense_breakdown');
        $this->assertCount(1, $breakdown);
        $this->assertCount(1, $breakdown[0]['records']);
        $this->assertEquals('Beli es batu', $breakdown[0]['records'][0]['description']);

        // Test Yesterday (should have 0 transactions since order was today)
        $responseYesterday = $this->actingAs($owner)->getJson('/pos/profit-loss?period=yesterday');
        $responseYesterday->assertOk();
        $responseYesterday->assertJson([
            'period' => 'yesterday',
            'is_monthly' => false,
            'summary' => [
                'total_transactions' => 0,
                'net_sales' => 0,
            ],
        ]);

        // Test This Month (includes today's transaction)
        $responseMonth = $this->actingAs($owner)->getJson('/pos/profit-loss?period=this_month');
        $responseMonth->assertOk();
        $responseMonth->assertJson([
            'period' => 'this_month',
            'is_monthly' => true,
            'summary' => [
                'total_transactions' => 1,
                'net_sales' => 90000,
            ],
        ]);
        $dailySummary = $responseMonth->json('daily_summary');
        $this->assertCount(1, $dailySummary);
        $this->assertEquals(1, $dailySummary[0]['total_transactions']);
        $this->assertEquals(90000, $dailySummary[0]['net_sales']);
        $this->assertEquals(40000, $dailySummary[0]['total_cogs']);
        $this->assertEquals(50000, $dailySummary[0]['gross_profit']);
        $this->assertEquals(15000, $dailySummary[0]['total_expenses']);
        $this->assertEquals(35000, $dailySummary[0]['net_profit']);

        // Test Custom Month
        $currentMonthStr = Carbon::now()->format('Y-m');
        $responseCustomMonth = $this->actingAs($owner)->getJson('/pos/profit-loss?period=custom_month&month='.$currentMonthStr);
        $responseCustomMonth->assertOk();
        $responseCustomMonth->assertJson([
            'period' => 'custom_month',
            'summary' => [
                'total_transactions' => 1,
                'net_sales' => 90000,
            ],
        ]);

        // Test Admin User access
        $admin = User::factory()->admin()->create();
        $responseAdmin = $this->actingAs($admin)->getJson('/pos/profit-loss?period=today');
        $responseAdmin->assertOk();
        $responseAdmin->assertJson(['success' => true]);
    }

    public function test_kasir_user_cannot_export_profit_loss_excel(): void
    {
        $kasir = User::factory()->kasir()->create();

        $response = $this->actingAs($kasir)->get('/pos/profit-loss/export-excel?period=this_month');
        $response->assertStatus(403);
    }

    public function test_owner_and_admin_can_export_monthly_profit_loss_excel(): void
    {
        $owner = User::factory()->owner()->create();

        $response = $this->actingAs($owner)->get('/pos/profit-loss/export-excel?period=this_month');
        $response->assertOk();
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $this->assertStringContainsString('.xlsx', (string) $response->headers->get('content-disposition'));
        $this->assertNotEmpty($response->getContent());
    }
}
