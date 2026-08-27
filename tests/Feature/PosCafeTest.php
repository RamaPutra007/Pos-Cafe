<?php

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductBatch;
use App\Models\StockMovement;
use App\Models\User;

test('authenticated user can visit POS cashier terminal', function () {
    $user = User::factory()->create(['role' => 'cashier']);

    $response = $this->actingAs($user)->get(route('pos.index'));

    $response->assertOk();
});

test('cashier can checkout cash payment and deducts stock and records movement', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create([
        'name' => 'Coffee',
        'slug' => 'coffee-test-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Cortado Test',
        'sku' => 'TEST-CRT-'.rand(100, 999),
        'purchase_price' => 15000,
        'selling_price' => 38000,
        'unit' => 'cup',
        'current_stock' => 20,
        'min_stock' => 5,
        'is_active' => true,
    ]);

    ProductBatch::create([
        'product_id' => $product->id,
        'batch_number' => 'BATCH-TEST-1',
        'initial_qty' => 20,
        'current_qty' => 20,
        'purchase_price' => 15000,
        'received_at' => now(),
    ]);

    $customer = Customer::create([
        'name' => 'Sarah Test',
        'phone' => '0812345678',
    ]);

    $response = $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_id' => $customer->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
        'payment_method' => 'cash',
        'cash_received' => 100000, // total is 76.000, change is 24.000
        'discount_amount' => 0,
        'tax_amount' => 0,
        'notes' => 'Test Meja 1',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Check order created
    $this->assertDatabaseHas('orders', [
        'customer_id' => $customer->id,
        'total_amount' => 76000,
        'status' => 'paid',
        'payment_method' => 'cash',
    ]);

    // Check payment created with change
    $this->assertDatabaseHas('payments', [
        'payment_method' => 'cash',
        'amount_due' => 76000,
        'amount_paid' => 100000,
        'change_due' => 24000,
        'status' => 'paid',
    ]);

    // Check product stock decremented from 20 to 18
    expect($product->fresh()->current_stock)->toBe(18);

    // Check StockMovement created
    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => 'SALE',
        'quantity' => 2,
        'balance_after' => 18,
    ]);
});

test('cash checkout fails if cash received is less than total', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create([
        'name' => 'Coffee',
        'slug' => 'coffee-test-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Latte Test',
        'sku' => 'TEST-LAT-'.rand(100, 999),
        'purchase_price' => 15000,
        'selling_price' => 35000,
        'unit' => 'cup',
        'current_stock' => 10,
        'min_stock' => 5,
        'is_active' => true,
    ]);

    $response = $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_name' => 'Pelanggan Test',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
        'payment_method' => 'cash',
        'cash_received' => 20000, // Total is 35.000!
    ]);

    $response->assertSessionHasErrors('cash_received');
    expect($product->fresh()->current_stock)->toBe(10);
});

test('checkout fails if requested quantity exceeds current stock', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create([
        'name' => 'Coffee',
        'slug' => 'coffee-test-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Croissant Test',
        'sku' => 'TEST-CRS-'.rand(100, 999),
        'purchase_price' => 15000,
        'selling_price' => 30000,
        'unit' => 'pcs',
        'current_stock' => 3, // only 3 in stock
        'min_stock' => 2,
        'is_active' => true,
    ]);

    $response = $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_name' => 'Pelanggan Test',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 5], // Exceeds 3!
        ],
        'payment_method' => 'qris',
    ]);

    $response->assertSessionHasErrors('items');
    expect($product->fresh()->current_stock)->toBe(3);
});

test('admin can record incoming stock', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create([
        'name' => 'Beans',
        'slug' => 'beans-test-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Arabica Gayo',
        'sku' => 'TEST-GYO-'.rand(100, 999),
        'purchase_price' => 80000,
        'selling_price' => 120000,
        'unit' => 'kg',
        'current_stock' => 5,
        'min_stock' => 2,
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->post(route('inventory.stock-in'), [
        'product_id' => $product->id,
        'quantity' => 15,
        'batch_number' => 'BATCH-GYO-01',
        'purchase_price' => 80000,
        'received_at' => now()->toDateString(),
        'supplier' => 'Gayo Coffee Farmer',
        'notes' => 'Restok panen baru',
    ]);

    $response->assertSessionHasNoErrors();
    expect($product->fresh()->current_stock)->toBe(20);

    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => 'IN',
        'quantity' => 15,
        'balance_after' => 20,
    ]);
});

test('admin can export financial report to excel spreadsheet', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('reports.export-excel', [
        'period' => 'this_week',
    ]));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('cashier can checkout with manual custom customer name', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create([
        'name' => 'Manual Coffee',
        'slug' => 'manual-coffee-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Cold Brew Manual',
        'sku' => 'TEST-CBM-'.rand(100, 999),
        'purchase_price' => 10000,
        'selling_price' => 25000,
        'unit' => 'bottle',
        'current_stock' => 10,
        'min_stock' => 2,
        'is_active' => true,
    ]);

    $response = $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_name' => 'Dimas Meja 4',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
        'payment_method' => 'cash',
        'cash_received' => 50000,
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('customers', [
        'name' => 'Dimas Meja 4',
    ]);
    $this->assertDatabaseHas('orders', [
        'total_amount' => 25000,
        'status' => 'paid',
    ]);
});

test('cashier can checkout items with Hot and Ice temperature options', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create([
        'name' => 'Coffee & Tea',
        'slug' => 'coffee-tea-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Caramel Latte',
        'sku' => 'TEST-CRL-'.rand(100, 999),
        'purchase_price' => 12000,
        'selling_price' => 35000,
        'unit' => 'cup',
        'temperature_option' => 'both',
        'current_stock' => 20,
        'min_stock' => 5,
        'is_active' => true,
    ]);

    ProductBatch::create([
        'product_id' => $product->id,
        'batch_number' => 'BATCH-LATTE-1',
        'initial_qty' => 20,
        'current_qty' => 20,
        'purchase_price' => 12000,
        'received_at' => now(),
    ]);

    $response = $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_name' => 'Budi',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1, 'temperature' => 'hot'],
            ['product_id' => $product->id, 'quantity' => 1, 'temperature' => 'ice'],
        ],
        'payment_method' => 'cash',
        'cash_received' => 100000,
    ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('order_items', [
        'product_name' => 'Caramel Latte',
        'temperature' => 'hot',
        'quantity' => 1,
    ]);

    $this->assertDatabaseHas('order_items', [
        'product_name' => 'Caramel Latte',
        'temperature' => 'ice',
        'quantity' => 1,
    ]);

    expect($product->fresh()->current_stock)->toBe(18);
});

test('cancelling an order restores product stock and removes it from history', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create([
        'name' => 'Coffee',
        'slug' => 'coffee-cancel-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Espresso Doppio',
        'sku' => 'TEST-ESP-'.rand(100, 999),
        'purchase_price' => 8000,
        'selling_price' => 20000,
        'unit' => 'cup',
        'current_stock' => 10,
        'min_stock' => 2,
        'is_active' => true,
    ]);

    ProductBatch::create([
        'product_id' => $product->id,
        'batch_number' => 'BATCH-ESP-1',
        'initial_qty' => 10,
        'current_qty' => 10,
        'purchase_price' => 8000,
        'received_at' => now(),
    ]);

    // Create an order via checkout (stock becomes 8)
    $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_name' => 'Pak Ahmad',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
        'payment_method' => 'cash',
        'cash_received' => 50000,
    ]);

    expect($product->fresh()->current_stock)->toBe(8);

    $order = Order::latest('id')->first();
    expect($order)->not->toBeNull();

    // Cancel the order
    $cancelResponse = $this->actingAs($cashier)->post(route('orders.cancel', $order->id));
    $cancelResponse->assertRedirect(route('orders.index'));

    // Stock should be restored back to 10
    expect($product->fresh()->current_stock)->toBe(10);

    // Order should be deleted and gone from history
    $this->assertDatabaseMissing('orders', [
        'id' => $order->id,
    ]);
});

test('order automatically deducts product stock and creates stock movement entries', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create([
        'name' => 'Pastry',
        'slug' => 'pastry-auto-stock-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Almond Croissant',
        'sku' => 'TEST-ALM-'.rand(100, 999),
        'purchase_price' => 15000,
        'selling_price' => 32000,
        'unit' => 'pcs',
        'current_stock' => 15,
        'min_stock' => 3,
        'is_active' => true,
    ]);

    $batch = ProductBatch::create([
        'product_id' => $product->id,
        'batch_number' => 'BATCH-ALM-01',
        'initial_qty' => 15,
        'current_qty' => 15,
        'purchase_price' => 15000,
        'received_at' => now(),
    ]);

    // Perform checkout of 4 croissants
    $response = $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_name' => 'Rina',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 4],
        ],
        'payment_method' => 'cash',
        'cash_received' => 150000,
    ]);

    $response->assertSessionHasNoErrors();

    // Verify stock is automatically reduced from 15 to 11
    expect($product->fresh()->current_stock)->toBe(11);
    expect($batch->fresh()->current_qty)->toBe(11);

    // Verify stock movement was recorded
    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => 'SALE',
        'quantity' => 4,
        'balance_after' => 11,
        'reason' => 'sale',
    ]);
});

test('order number generation remains unique and sequential even after order cancellation', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create([
        'name' => 'Coffee',
        'slug' => 'coffee-seq-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Americano',
        'sku' => 'TEST-AME-'.rand(100, 999),
        'purchase_price' => 5000,
        'selling_price' => 18000,
        'unit' => 'cup',
        'current_stock' => 50,
        'min_stock' => 5,
        'is_active' => true,
    ]);

    // Order 1
    $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_name' => 'Budi',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'payment_method' => 'cash',
        'cash_received' => 20000,
    ]);
    $order1 = Order::latest('id')->first();

    // Order 2
    $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_name' => 'Siti',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'payment_method' => 'cash',
        'cash_received' => 20000,
    ]);
    $order2 = Order::latest('id')->first();

    // Cancel Order 1
    $this->actingAs($cashier)->post(route('orders.cancel', $order1->id));

    // Order 3 (Should NOT collide with Order 2's number)
    $response = $this->actingAs($cashier)->post(route('pos.checkout'), [
        'customer_name' => 'Doni',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'payment_method' => 'cash',
        'cash_received' => 20000,
    ]);

    $response->assertSessionHasNoErrors();
    $order3 = Order::latest('id')->first();

    expect($order3->id)->not->toBe($order2->id);
    expect($order3->order_number)->not->toBe($order2->order_number);
});

test('pos checkout requires customer name', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);
    $category = Category::create([
        'name' => 'Tea',
        'slug' => 'tea-req-'.rand(100, 999),
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Earl Grey',
        'sku' => 'TEST-EG-'.rand(100, 999),
        'purchase_price' => 5000,
        'selling_price' => 18000,
        'unit' => 'cup',
        'current_stock' => 10,
        'min_stock' => 2,
        'is_active' => true,
    ]);

    // Checkout without customer_name
    $response = $this->actingAs($cashier)->post(route('pos.checkout'), [
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'payment_method' => 'cash',
        'cash_received' => 20000,
    ]);

    $response->assertSessionHasErrors('customer_name');
});

test('live notifications endpoint returns real-time orders and low stock alerts', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = Category::create([
        'name' => 'Beans',
        'slug' => 'beans-notif-'.rand(100, 999),
        'is_active' => true,
    ]);

    // Create a product with low stock
    Product::create([
        'category_id' => $category->id,
        'name' => 'Robusta Lampung',
        'sku' => 'TEST-ROB-'.rand(100, 999),
        'purchase_price' => 50000,
        'selling_price' => 90000,
        'unit' => 'kg',
        'current_stock' => 1, // <= min_stock
        'min_stock' => 3,
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->get(route('notifications.live'));
    $response->assertOk();
    $response->assertJsonStructure([
        'status',
        'count',
        'notifications',
        'summary' => [
            'out_of_stock_count',
            'low_stock_count',
            'recent_orders_count',
            'online_cashiers',
        ],
    ]);
});

test('reports page displays financial metrics and supports excel and pdf exports', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    // 1. Index page
    $response = $this->actingAs($admin)->get(route('reports.index', ['period' => 'this_month']));
    $response->assertOk();

    // 2. Export Excel
    $excelResponse = $this->actingAs($admin)->get(route('reports.export-excel', ['period' => 'this_month']));
    $excelResponse->assertOk();
    expect($excelResponse->headers->get('content-type'))->toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // 3. Export PDF
    $pdfResponse = $this->actingAs($admin)->get(route('reports.export-pdf', ['period' => 'this_month']));
    $pdfResponse->assertOk();
    expect($pdfResponse->headers->get('content-type'))->toContain('application/pdf');
});
