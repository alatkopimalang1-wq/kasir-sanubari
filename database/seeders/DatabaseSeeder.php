<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed sample POS store data (Generic Retail & F&B).
     */
    public function run(): void
    {
        // 1. Akun Pengguna POS
        User::firstOrCreate(
            ['email' => 'kasir@pos.test'],
            [
                'name' => 'Staf Kasir 1',
                'password' => Hash::make('password123'),
                'role' => 'kasir',
            ]
        );

        User::firstOrCreate(
            ['email' => 'owner@pos.test'],
            [
                'name' => 'Pemilik Toko (Owner)',
                'password' => Hash::make('password123'),
                'role' => 'owner',
            ]
        );

        User::firstOrCreate(
            ['email' => 'admin@pos.test'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // 2. Kategori Produk Generic
        $catMinuman = Category::firstOrCreate(
            ['slug' => 'minuman'],
            ['name' => 'Minuman', 'description' => 'Aneka menu minuman kopi dan non-kopi']
        );

        $catMakanan = Category::firstOrCreate(
            ['slug' => 'makanan'],
            ['name' => 'Makanan & Snack', 'description' => 'Aneka makanan ringan dan hidangan utama']
        );

        $catRetail = Category::firstOrCreate(
            ['slug' => 'retail'],
            ['name' => 'Retail / Barang', 'description' => 'Barang dagangan dan merchandise']
        );

        // 3. Sampel Produk untuk Kasir
        $sampleProducts = [
            [
                'category' => $catMinuman,
                'name' => 'Kopi Susu Gula Aren',
                'min_price' => 18000,
                'max_price' => 22000,
                'variants' => [
                    ['name' => 'Reguler (Ice)', 'price' => 18000, 'cost_price' => 8000],
                    ['name' => 'Large (Ice)', 'price' => 22000, 'cost_price' => 10000],
                ],
            ],
            [
                'category' => $catMinuman,
                'name' => 'Americano / Long Black',
                'min_price' => 15000,
                'max_price' => 16000,
                'variants' => [
                    ['name' => 'Hot', 'price' => 15000, 'cost_price' => 5000],
                    ['name' => 'Iced', 'price' => 16000, 'cost_price' => 5500],
                ],
            ],
            [
                'category' => $catMinuman,
                'name' => 'Matcha Latte',
                'min_price' => 22000,
                'max_price' => 22000,
                'variants' => [
                    ['name' => 'Reguler', 'price' => 22000, 'cost_price' => 10000],
                ],
            ],
            [
                'category' => $catMakanan,
                'name' => 'Croissant Butter',
                'min_price' => 20000,
                'max_price' => 20000,
                'variants' => [
                    ['name' => 'Standard', 'price' => 20000, 'cost_price' => 11000],
                ],
            ],
            [
                'category' => $catMakanan,
                'name' => 'Kentang Goreng (French Fries)',
                'min_price' => 17000,
                'max_price' => 17000,
                'variants' => [
                    ['name' => 'Porsi Reguler', 'price' => 17000, 'cost_price' => 7000],
                ],
            ],
            [
                'category' => $catRetail,
                'name' => 'Tumbler Stainless 500ml',
                'min_price' => 75000,
                'max_price' => 75000,
                'variants' => [
                    ['name' => 'Hitam Doff', 'price' => 75000, 'cost_price' => 45000],
                ],
            ],
        ];

        foreach ($sampleProducts as $sp) {
            $product = Product::firstOrCreate(
                ['slug' => Str::slug($sp['name'])],
                [
                    'name' => $sp['name'],
                    'min_price' => $sp['min_price'],
                    'max_price' => $sp['max_price'],
                    'status' => 'active',
                    'stock_status' => 'in_stock',
                    'is_featured' => true,
                    'channel' => 'all',
                ]
            );

            $product->categories()->syncWithoutDetaching([$sp['category']->id]);

            if (! empty($sp['variants'])) {
                foreach ($sp['variants'] as $v) {
                    ProductVariant::firstOrCreate(
                        [
                            'product_id' => $product->id,
                            'label' => $v['name'],
                        ],
                        [
                            'price' => $v['price'],
                            'cost_price' => $v['cost_price'] ?? 0,
                            'sku' => strtoupper(Str::slug($sp['name'].'-'.$v['name'])),
                            'stock_status' => 'in_stock',
                        ]
                    );
                }
            }
        }
    }
}
