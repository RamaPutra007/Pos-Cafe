<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    /**
     * Display menu & categories management.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $categoryId = $request->input('category_id');

        $query = Product::with('category')->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($categoryId && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        $products = $query->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'category_id' => $p->category_id,
                'category_name' => $p->category?->name,
                'name' => $p->name,
                'sku' => $p->sku,
                'description' => $p->description,
                'purchase_price' => (float) $p->purchase_price,
                'selling_price' => (float) $p->selling_price,
                'unit' => $p->unit,
                'temperature_option' => $p->temperature_option ?? 'none',
                'image' => $p->image,
                'is_active' => (bool) $p->is_active,
                'current_stock' => $p->current_stock,
                'min_stock' => $p->min_stock,
                'rack_location' => $p->rack_location,
            ];
        });

        $categories = Category::withCount('products')->get();

        return Inertia::render('menus/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId ?? 'all',
            ],
        ]);
    }

    /**
     * Store a newly created menu product.
     */
    public function storeProduct(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products,sku',
            'description' => 'nullable|string',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'temperature_option' => 'nullable|string|in:none,both,hot_only,ice_only',
            'is_active' => 'boolean',
            'current_stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'rack_location' => 'nullable|string|max:100',
        ]);

        $validated['temperature_option'] = $validated['temperature_option'] ?? 'none';

        $product = Product::create($validated);

        // If initial stock is specified, automatically generate initial batch and Stock Movement IN
        if ($product->current_stock > 0) {
            $batchNumber = 'BATCH-'.strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $product->sku), 0, 4)).'-'.date('Ymd');

            $batch = ProductBatch::create([
                'product_id' => $product->id,
                'batch_number' => $batchNumber,
                'initial_qty' => $product->current_stock,
                'current_qty' => $product->current_stock,
                'purchase_price' => $product->purchase_price,
                'received_at' => Carbon::now(),
                'notes' => 'Stok awal pendaftaran menu baru',
            ]);

            StockMovement::create([
                'product_id' => $product->id,
                'product_batch_id' => $batch->id,
                'user_id' => $request->user()?->id,
                'type' => 'IN',
                'quantity' => $product->current_stock,
                'balance_after' => $product->current_stock,
                'reason' => 'initial_stock',
                'notes' => "Stok awal menu baru ({$product->current_stock} {$product->unit})",
            ]);
        }

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Menu '{$validated['name']}' dengan stok {$product->current_stock} {$product->unit} berhasil ditambahkan!",
            ],
        ]);
    }

    /**
     * Update an existing product.
     */
    public function updateProduct(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products,sku,'.$product->id,
            'description' => 'nullable|string',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'temperature_option' => 'nullable|string|in:none,both,hot_only,ice_only',
            'is_active' => 'boolean',
            'current_stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'rack_location' => 'nullable|string|max:100',
        ]);

        $validated['temperature_option'] = $validated['temperature_option'] ?? 'none';

        $product->update($validated);

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Menu '{$product->name}' berhasil diperbarui!",
            ],
        ]);
    }

    /**
     * Toggle product active status.
     */
    public function toggleProductStatus(Product $product): RedirectResponse
    {
        $product->update(['is_active' => ! $product->is_active]);

        $status = $product->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Menu '{$product->name}' berhasil {$status}.",
            ],
        ]);
    }

    /**
     * Delete product.
     */
    public function destroyProduct(Product $product): RedirectResponse
    {
        $name = $product->name;
        $product->delete();

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Menu '{$name}' telah dihapus.",
            ],
        ]);
    }

    /**
     * Store new category.
     */
    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']).'-'.rand(10, 99);
        $validated['is_active'] = true;

        Category::create($validated);

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Kategori '{$validated['name']}' berhasil ditambahkan!",
            ],
        ]);
    }

    /**
     * Delete category.
     */
    public function destroyCategory(Category $category): RedirectResponse
    {
        if ($category->products()->count() > 0) {
            return back()->with([
                'toast' => [
                    'type' => 'error',
                    'message' => 'Tidak dapat menghapus kategori yang masih memiliki menu/produk.',
                ],
            ]);
        }

        $name = $category->name;
        $category->delete();

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Kategori '{$name}' telah dihapus.",
            ],
        ]);
    }
}
