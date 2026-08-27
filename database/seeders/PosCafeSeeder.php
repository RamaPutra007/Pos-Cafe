<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PosCafeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seeds initial admin & cashier accounts, categories, and standard coffee shop menus with Hot/Ice options.
     */
    public function run(): void
    {
        // 1. Admin Account (admin@gmail.com / admin123)
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin Pos Cafe',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Cashier Account (kasir@gmail.com / kasir123)
        User::updateOrCreate(
            ['email' => 'kasir@gmail.com'],
            [
                'name' => 'Kasir Utama',
                'password' => Hash::make('kasir123'),
                'role' => 'cashier',
                'email_verified_at' => now(),
            ]
        );

        // 3. Categories
        $categoriesData = [
            'coffee' => ['name' => 'Coffee', 'description' => 'Menu racikan kopi espresso & latte pilihan', 'icon' => 'Coffee'],
            'non-coffee' => ['name' => 'Non-Coffee', 'description' => 'Minuman segar teh, cokelat & matcha', 'icon' => 'CupSoda'],
            'pastry' => ['name' => 'Pastry & Bakery', 'description' => 'Croissant, kue dan roti segar', 'icon' => 'CakeSlice'],
            'main-course' => ['name' => 'Main Course & Snacks', 'description' => 'Makanan utama dan camilan cafe', 'icon' => 'Utensils'],
        ];

        $categories = [];
        foreach ($categoriesData as $slug => $cat) {
            $categories[$slug] = Category::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'icon' => $cat['icon'],
                    'is_active' => true,
                ]
            );
        }

        // 4. Standard Coffee Shop Products
        $productsData = [
            // --- COFFEE (Kopi) ---
            [
                'category' => 'coffee',
                'name' => 'Americano Classic',
                'sku' => 'COF-AMR-01',
                'description' => 'Espresso ganda dipadu air mineral dengan crema lembut khas',
                'purchase_price' => 8000,
                'selling_price' => 26000,
                'unit' => 'cup',
                'temperature_option' => 'both', // Panas / Dingin
                'stock' => 50,
                'min_stock' => 10,
                'rack_location' => 'Bar 1',
            ],
            [
                'category' => 'coffee',
                'name' => 'Caffe Latte',
                'sku' => 'COF-LAT-01',
                'description' => 'Espresso kaya rasa dipadu susu segar steamed yang lembut',
                'purchase_price' => 12000,
                'selling_price' => 32000,
                'unit' => 'cup',
                'temperature_option' => 'both', // Panas / Dingin
                'stock' => 45,
                'min_stock' => 10,
                'rack_location' => 'Bar 1',
            ],
            [
                'category' => 'coffee',
                'name' => 'Cappuccino Italiano',
                'sku' => 'COF-CAP-01',
                'description' => 'Espresso pekat dengan microfoam tebal dan taburan bubuk cokelat',
                'purchase_price' => 12000,
                'selling_price' => 32000,
                'unit' => 'cup',
                'temperature_option' => 'both', // Panas / Dingin
                'stock' => 35,
                'min_stock' => 8,
                'rack_location' => 'Bar 1',
            ],
            [
                'category' => 'coffee',
                'name' => 'Caramel Macchiato',
                'sku' => 'COF-CMC-01',
                'description' => 'Susu vanila segar dengan lapisan espresso dan saus karamel lezat',
                'purchase_price' => 14000,
                'selling_price' => 36000,
                'unit' => 'cup',
                'temperature_option' => 'both', // Panas / Dingin
                'stock' => 40,
                'min_stock' => 10,
                'rack_location' => 'Bar 1',
            ],
            [
                'category' => 'coffee',
                'name' => 'Espresso Single Origin',
                'sku' => 'COF-ESP-01',
                'description' => 'Ekstrak single shot biji arabika pilihan aroma floral & karamel',
                'purchase_price' => 7000,
                'selling_price' => 22000,
                'unit' => 'cup',
                'temperature_option' => 'hot_only', // Hanya Panas
                'stock' => 40,
                'min_stock' => 10,
                'rack_location' => 'Bar 1',
            ],

            // --- NON-COFFEE (Bukan Kopi) ---
            [
                'category' => 'non-coffee',
                'name' => 'Kyoto Matcha Latte',
                'sku' => 'NCF-MTC-01',
                'description' => 'Bubuk matcha murni Uji Kyoto dipadukan dengan fresh milk manis seimbang',
                'purchase_price' => 13000,
                'selling_price' => 34000,
                'unit' => 'cup',
                'temperature_option' => 'both', // Panas / Dingin
                'stock' => 35,
                'min_stock' => 8,
                'rack_location' => 'Bar 2',
            ],
            [
                'category' => 'non-coffee',
                'name' => 'Signature Belgian Chocolate',
                'sku' => 'NCF-CHC-01',
                'description' => 'Cokelat Belgia pekat creamy kaya cita rasa manis & gurih',
                'purchase_price' => 11000,
                'selling_price' => 32000,
                'unit' => 'cup',
                'temperature_option' => 'both', // Panas / Dingin
                'stock' => 40,
                'min_stock' => 10,
                'rack_location' => 'Bar 2',
            ],
            [
                'category' => 'non-coffee',
                'name' => 'Earl Grey Milk Tea',
                'sku' => 'NCF-EGM-01',
                'description' => 'Teh hitam bergamot aromatik dipadukan dengan fresh milk lembut',
                'purchase_price' => 9000,
                'selling_price' => 28000,
                'unit' => 'cup',
                'temperature_option' => 'both', // Panas / Dingin
                'stock' => 30,
                'min_stock' => 8,
                'rack_location' => 'Bar 2',
            ],
            [
                'category' => 'non-coffee',
                'name' => 'Lychee Iced Tea',
                'sku' => 'NCF-LIT-01',
                'description' => 'Teh jasmine dingin dengan sirup leci premium dan buah leci asli',
                'purchase_price' => 7000,
                'selling_price' => 24000,
                'unit' => 'cup',
                'temperature_option' => 'ice_only', // Hanya Dingin
                'stock' => 30,
                'min_stock' => 8,
                'rack_location' => 'Bar 2',
            ],

            // --- PASTRY & BAKERY ---
            [
                'category' => 'pastry',
                'name' => 'Butter Croissant',
                'sku' => 'PST-CRS-01',
                'description' => 'Pastry Prancis berlayer renyah di luar dan lembut beraroma butter',
                'purchase_price' => 10000,
                'selling_price' => 25000,
                'unit' => 'pcs',
                'temperature_option' => 'none',
                'stock' => 20,
                'min_stock' => 5,
                'rack_location' => 'Display Bakery',
            ],
            [
                'category' => 'pastry',
                'name' => 'Pain Au Chocolat',
                'sku' => 'PST-PAC-01',
                'description' => 'Roti croissant renyah dengan isian cokelat batang leleh berkualitas',
                'purchase_price' => 11000,
                'selling_price' => 28000,
                'unit' => 'pcs',
                'temperature_option' => 'none',
                'stock' => 15,
                'min_stock' => 5,
                'rack_location' => 'Display Bakery',
            ],
            [
                'category' => 'pastry',
                'name' => 'New York Cheesecake',
                'sku' => 'PST-CHK-01',
                'description' => 'Potongan kue keju lembut panggang dengan lapisan biskuit renyah',
                'purchase_price' => 15000,
                'selling_price' => 35000,
                'unit' => 'porsi',
                'temperature_option' => 'none',
                'stock' => 12,
                'min_stock' => 4,
                'rack_location' => 'Chiller Display',
            ],

            // --- MAIN COURSE & SNACKS ---
            [
                'category' => 'main-course',
                'name' => 'Truffle French Fries',
                'sku' => 'MNC-FRS-01',
                'description' => 'Kentang goreng renyah dengan minyak truffle aromatik & keju parmesan',
                'purchase_price' => 10000,
                'selling_price' => 28000,
                'unit' => 'porsi',
                'temperature_option' => 'none',
                'stock' => 25,
                'min_stock' => 6,
                'rack_location' => 'Kitchen',
            ],
        ];

        foreach ($productsData as $data) {
            $cat = $categories[$data['category']] ?? null;
            if (! $cat) {
                continue;
            }

            $product = Product::updateOrCreate(
                ['sku' => $data['sku']],
                [
                    'category_id' => $cat->id,
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'purchase_price' => $data['purchase_price'],
                    'selling_price' => $data['selling_price'],
                    'unit' => $data['unit'],
                    'temperature_option' => $data['temperature_option'],
                    'current_stock' => $data['stock'],
                    'min_stock' => $data['min_stock'],
                    'rack_location' => $data['rack_location'],
                    'is_active' => true,
                ]
            );

            // Create initial batch
            $batch = ProductBatch::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'batch_number' => 'BATCH-INIT-'.strtoupper(substr($data['sku'], 4, 3)),
                ],
                [
                    'initial_qty' => $data['stock'],
                    'current_qty' => $data['stock'],
                    'purchase_price' => $data['purchase_price'],
                    'received_at' => Carbon::now()->subDays(2),
                    'supplier' => 'Gudang Pusat Cafe',
                    'notes' => 'Stok awal pembukaan cafe',
                ]
            );

            // Record initial movement
            StockMovement::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'product_batch_id' => $batch->id,
                    'type' => 'IN',
                ],
                [
                    'user_id' => $admin->id,
                    'quantity' => $data['stock'],
                    'balance_after' => $data['stock'],
                    'reason' => 'initial_stock',
                    'notes' => "Stok awal menu {$product->name}",
                ]
            );
        }

        // 5. Sample Customers
        Customer::updateOrCreate(
            ['name' => 'Sarah Wijaya'],
            ['phone' => '081234567890', 'email' => 'sarah@gmail.com', 'notes' => 'Member Gold']
        );
        Customer::updateOrCreate(
            ['name' => 'Dimas Pratama'],
            ['phone' => '082198765432', 'email' => 'dimas@gmail.com', 'notes' => 'Pelanggan Reguler']
        );
    }
}
