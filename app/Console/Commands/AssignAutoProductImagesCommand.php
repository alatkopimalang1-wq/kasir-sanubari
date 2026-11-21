<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ProductImageMatcher;
use Illuminate\Console\Command;

class AssignAutoProductImagesCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'pos:assign-auto-images {--force : Overwrite existing product images}';

    /**
     * The console command description.
     */
    protected $description = 'Automatically assign matching high-quality images to cafe menu products';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $force = (bool) $this->option('force');

        $this->info("Checking and syncing high-quality menu photo assets...");
        ProductImageMatcher::ensureImagesExist(function ($msg) {
            $this->line(" <fg=cyan>↓</> {$msg}");
        });

        $products = Product::with(['images', 'categories'])->get();

        $this->info("Scanning {$products->count()} products...");
        $assigned = 0;
        $skipped = 0;

        foreach ($products as $product) {
            $hasImage = $product->images()->where('is_primary', true)->exists()
                || $product->images()->exists();

            if ($hasImage && ! $force) {
                $skipped++;
                continue;
            }

            $catName = $product->categories->first()?->name;
            $autoPath = ProductImageMatcher::match($product->name, $catName);

            if ($force) {
                // Delete previous auto or existing images
                $product->images()->delete();
            }

            ProductImage::create([
                'product_id' => $product->id,
                'path' => $autoPath,
                'alt' => $product->name,
                'is_primary' => true,
                'sort_order' => 1,
            ]);

            $this->line(" <fg=green>✔</> Assigned [{$autoPath}] to <options=bold>{$product->name}</>");
            $assigned++;
        }

        $this->newLine();
        $this->info("Complete: {$assigned} assigned, {$skipped} skipped.");

        return Command::SUCCESS;
    }
}
