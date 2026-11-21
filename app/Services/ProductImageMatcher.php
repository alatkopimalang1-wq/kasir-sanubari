<?php

namespace App\Services;

class ProductImageMatcher
{
    /**
     * Curated catalog of direct high-resolution images
     */
    public static array $imageUrls = [
        'es-kopi-susu.jpg' => 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
        'matcha-latte.jpg' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
        'chocolate.jpg' => 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80',
        'berry-lactose.jpg' => 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
        'biscoff-latte.jpg' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80',
        'cafe-latte.jpg' => 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80',
        'cappuccino.jpg' => 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
        'americano.jpg' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        'mochacino.jpg' => 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&auto=format&fit=crop&q=80',
        'hazelnut-latte.jpg' => 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80',
        'magic-latte.jpg' => 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80',
        'dirty-latte.jpg' => 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80',
        'v60-filter.jpg' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
        'kopi-tubruk.jpg' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
        'tubruk-susu.jpg' => 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600&auto=format&fit=crop&q=80',
        'vietnam-drip.jpg' => 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
        'rosella-tea.jpg' => 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
        'lychee-tea.jpg' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
        'lemon-tea.jpg' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        'sanubiru-blue.jpg' => 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
        'honeymoon-mocktail.jpg' => 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop&q=80',
        'tahu-cagram.jpg' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        'tempe-mendoan.jpg' => 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
        'donuts.jpg' => 'https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=600&auto=format&fit=crop&q=80',
        'mix-platter.jpg' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        'carbonara.jpg' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80',
        'bolognese.jpg' => 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80',
        'mie-goreng.jpg' => 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
        'mie-kuah.jpg' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
        'chicken-rice-bowl.jpg' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
        'french-fries.jpg' => 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
        'cookies.jpg' => 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80',
        'air-mineral.jpg' => 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=600&auto=format&fit=crop&q=80',
        'pain-au-choco.jpg' => 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&auto=format&fit=crop&q=80',
        'ribbon-choco.jpg' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
        'croissant-cheese.jpg' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
        'croissant-butter.jpg' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
        'croissant-almond.jpg' => 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&auto=format&fit=crop&q=80',
        'tumbler.jpg' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    ];

    /**
     * Download and cache images on disk if missing
     */
    public static function ensureImagesExist(?callable $logCallback = null): void
    {
        $targetDir = storage_path('app/public/products/auto');
        $publicDir = public_path('storage/products/auto');

        if (! is_dir($targetDir)) {
            @mkdir($targetDir, 0755, true);
        }
        if (! is_dir($publicDir)) {
            @mkdir($publicDir, 0755, true);
        }

        $ctx = stream_context_create([
            'http' => [
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'timeout' => 12,
            ],
        ]);

        foreach (self::$imageUrls as $filename => $url) {
            $targetPath = $targetDir . '/' . $filename;
            $publicPath = $publicDir . '/' . $filename;

            $hasTarget = file_exists($targetPath) && filesize($targetPath) > 1000;
            $hasPublic = file_exists($publicPath) && filesize($publicPath) > 1000;

            if ($hasTarget && $hasPublic) {
                continue;
            }

            if ($hasTarget && ! $hasPublic) {
                @copy($targetPath, $publicPath);
                continue;
            }

            $content = @file_get_contents($url, false, $ctx);
            if ($content && strlen($content) > 1000) {
                @file_put_contents($targetPath, $content);
                @file_put_contents($publicPath, $content);
                if ($logCallback) {
                    $logCallback("Downloaded {$filename}");
                }
            }
        }
    }

    /**
     * Map keywords to image filenames in products/auto/
     */
    protected static array $rules = [
        // Pastries / Croissant (checked before generic choco/cheese)
        ['keywords' => ['pain au choco', 'pain au chocolat'], 'image' => 'pain-au-choco.jpg'],
        ['keywords' => ['ribbon choco', 'ribbon'], 'image' => 'ribbon-choco.jpg'],
        ['keywords' => ['cheezma', 'cheese croissant', 'keju'], 'image' => 'croissant-cheese.jpg'],
        ['keywords' => ['almond', 'double almond'], 'image' => 'croissant-almond.jpg'],
        ['keywords' => ['buttrella', 'croissant', 'cr '], 'image' => 'croissant-butter.jpg'],

        // Food & Snacks
        ['keywords' => ['mix platter', 'platter', 'sharing'], 'image' => 'mix-platter.jpg'],
        ['keywords' => ['tahu cagram', 'tahu cabe garam', 'tahu', 'tofu'], 'image' => 'tahu-cagram.jpg'],
        ['keywords' => ['tempe mendoan', 'mendoan', 'tempe'], 'image' => 'tempe-mendoan.jpg'],
        ['keywords' => ['doble donut', 'donut', 'donat'], 'image' => 'donuts.jpg'],
        ['keywords' => ['french fries', 'fries', 'kentang goreng', 'kentang'], 'image' => 'french-fries.jpg'],
        ['keywords' => ['soft cookies', 'cookie', 'cookies'], 'image' => 'cookies.jpg'],
        ['keywords' => ['carbonara', 'creamy pasta'], 'image' => 'carbonara.jpg'],
        ['keywords' => ['bolongnese', 'bolognese', 'sphagetti', 'spaghetti', 'pasta'], 'image' => 'bolognese.jpg'],
        ['keywords' => ['mie goreng', 'bakmi goreng'], 'image' => 'mie-goreng.jpg'],
        ['keywords' => ['mie ghodog', 'mie godhog', 'mie kuah', 'ramen'], 'image' => 'mie-kuah.jpg'],
        ['keywords' => ['chiken', 'chicken', 'rice bowl', 'nasi ayam'], 'image' => 'chicken-rice-bowl.jpg'],

        // Espresso & Coffee
        ['keywords' => ['es kopi susu', 'kopi susu', 'gula aren'], 'image' => 'es-kopi-susu.jpg'],
        ['keywords' => ['matcha', 'green tea'], 'image' => 'matcha-latte.jpg'],
        ['keywords' => ['salted choco', 'choco', 'chocolate', 'cokelat', 'coklat'], 'image' => 'chocolate.jpg'],
        ['keywords' => ['berry lactose', 'berry', 'strawberry', 'blueberry'], 'image' => 'berry-lactose.jpg'],
        ['keywords' => ['biscofee', 'biscoff', 'lotus'], 'image' => 'biscoff-latte.jpg'],
        ['keywords' => ['split', 'magic'], 'image' => 'magic-latte.jpg'],
        ['keywords' => ['dirty latte', 'dirty'], 'image' => 'dirty-latte.jpg'],
        ['keywords' => ['hazelnut'], 'image' => 'hazelnut-latte.jpg'],
        ['keywords' => ['mochacino', 'mochaccino', 'mocha'], 'image' => 'mochacino.jpg'],
        ['keywords' => ['cappucino', 'cappuccino'], 'image' => 'cappuccino.jpg'],
        ['keywords' => ['americano', 'long black', 'espresso'], 'image' => 'americano.jpg'],
        ['keywords' => ['cafe latte', 'caffe latte', 'latte'], 'image' => 'cafe-latte.jpg'],
        ['keywords' => ['filter', 'v60', 'manual brew', 'pourover', 'pour over'], 'image' => 'v60-filter.jpg'],
        ['keywords' => ['tubruk susu'], 'image' => 'tubruk-susu.jpg'],
        ['keywords' => ['tubruk', 'kopi tubruk'], 'image' => 'kopi-tubruk.jpg'],
        ['keywords' => ['vietnam drip', 'drip'], 'image' => 'vietnam-drip.jpg'],

        // Tea & Mocktails
        ['keywords' => ['roasella', 'rosella', 'hibiscus'], 'image' => 'rosella-tea.jpg'],
        ['keywords' => ['lychee', 'leci'], 'image' => 'lychee-tea.jpg'],
        ['keywords' => ['lemon tea', 'tea', 'teh'], 'image' => 'lemon-tea.jpg'],
        ['keywords' => ['sanubiru', 'blue ocean', 'curacao', 'blue'], 'image' => 'sanubiru-blue.jpg'],
        ['keywords' => ['honey moon', 'la la land', 'mocktail', 'squash', 'sunset'], 'image' => 'honeymoon-mocktail.jpg'],
        ['keywords' => ['air mineral', 'mineral', 'water', 'aqua'], 'image' => 'air-mineral.jpg'],

        // Retail
        ['keywords' => ['tumbler', 'botol', 'mug'], 'image' => 'tumbler.jpg'],
    ];

    /**
     * Category fallbacks
     */
    protected static array $categoryFallbacks = [
        'minuman' => 'es-kopi-susu.jpg',
        'kopi' => 'cafe-latte.jpg',
        'non-kopi' => 'chocolate.jpg',
        'tea' => 'lemon-tea.jpg',
        'teh' => 'lemon-tea.jpg',
        'makanan' => 'french-fries.jpg',
        'snack' => 'french-fries.jpg',
        'croissant' => 'croissant-butter.jpg',
        'pastry' => 'croissant-butter.jpg',
        'retail' => 'tumbler.jpg',
    ];

    /**
     * Get image storage path for a product (relative to storage/app/public)
     */
    public static function match(string $productName, string|array|null $categoryName = null): string
    {
        $nameLower = strtolower(trim($productName));

        // 1. Match specific product name keywords
        foreach (self::$rules as $rule) {
            foreach ($rule['keywords'] as $kw) {
                if (str_contains($nameLower, strtolower($kw))) {
                    return 'products/auto/' . $rule['image'];
                }
            }
        }

        // 2. Match category if provided
        $catStr = '';
        if (is_array($categoryName)) {
            $catStr = (string) ($categoryName['id'] ?? reset($categoryName) ?? '');
        } elseif (is_string($categoryName)) {
            $catStr = $categoryName;
        }

        if ($catStr !== '') {
            $catLower = strtolower(trim($catStr));
            foreach (self::$categoryFallbacks as $catKw => $img) {
                if (str_contains($catLower, $catKw)) {
                    return 'products/auto/' . $img;
                }
            }
        }

        // 3. Fallback generic cafe latte
        return 'products/auto/cafe-latte.jpg';
    }

    /**
     * Get web URL for the matched image
     */
    public static function getUrl(string $productName, string|array|null $categoryName = null): string
    {
        $path = self::match($productName, $categoryName);
        return '/storage/' . $path;
    }
}
