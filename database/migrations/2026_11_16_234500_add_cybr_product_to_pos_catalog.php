<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ensure C.Y.B.R Category exists
        $category = Category::firstOrCreate(
            ['slug' => 'cybr'],
            [
                'name' => ['id' => 'C.Y.B.R', 'en' => 'C.Y.B.R'],
                'description' => ['id' => 'Layanan racik blend kopi kustom (Customize Your Blend Ratio)', 'en' => 'Customize Your Blend Ratio Studio'],
                'icon' => 'sliders-horizontal',
                'sort_order' => 5,
            ]
        );

        // 2. Find or Create C.Y.B.R Product
        $product = Product::firstOrNew(['slug' => 'byob']);
        $product->fill([
            'name' => 'C.Y.B.R: Customize Your Blend Ratio',
            'series' => 'cybr',
            'tagline' => 'Racik profil sangrai dan paduan biji kopi favorit Anda sendiri',
            'description' => 'Layanan C.Y.B.R (Custom Your Blend Ratio) Kopi Sanubari Roastery Malang. Pilih komponen biji kopi dan tentukan proporsi rasio sesuai selera seduh Anda.',
            'tasting_notes' => 'Custom Tasting Profile (Kustom)',
            'origin' => 'Malang & Nusantara',
            'process' => 'Custom Blend Process',
            'roast_level' => 'Medium Roast',
            'min_price' => 65000,
            'max_price' => 275000,
            'is_featured' => true,
            'status' => 'active',
            'stock_status' => 'in_stock',
            'released_at' => $product->released_at ?? now(),
        ]);
        $product->save();

        // 3. Attach Categories to Product (cybr & houseblend)
        $houseblendCat = Category::where('slug', 'houseblend')->first();
        $categoryIds = array_filter([$category->id, $houseblendCat?->id]);
        $product->categories()->syncWithoutDetaching($categoryIds);

        // 4. Ensure Packaging Variants with proper prices
        $variants = [
            ['label' => '200g', 'weight_grams' => 200, 'price' => 65000, 'sku' => 'BYOB-200'],
            ['label' => '500g', 'weight_grams' => 500, 'price' => 150000, 'sku' => 'BYOB-500'],
            ['label' => '1 kg', 'weight_grams' => 1000, 'price' => 275000, 'sku' => 'BYOB-1000'],
        ];

        foreach ($variants as $v) {
            ProductVariant::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'weight_grams' => $v['weight_grams'],
                ],
                [
                    'label' => $v['label'],
                    'price' => $v['price'],
                    'sku' => $v['sku'],
                    'stock_status' => 'in_stock',
                ]
            );
        }

        // 5. Ensure primary product image
        if (! ProductImage::where('product_id', $product->id)->exists()) {
            ProductImage::create([
                'product_id' => $product->id,
                'path' => 'taste-recommendations/taste-2.jpg',
                'alt' => 'C.Y.B.R Customize Your Blend Ratio',
                'sort_order' => 1,
                'is_primary' => true,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversible without destructive drop
    }
};
