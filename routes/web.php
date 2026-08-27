<?php

use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

// Direct password reset flow without external email dependency
Route::get('forgot-password', [PasswordResetController::class, 'create'])->name('password.request');
Route::post('forgot-password', [PasswordResetController::class, 'store'])->name('password.email');

Route::middleware(['auth', 'verified'])->group(function () {
    // 0. Live Notifications
    Route::get('notifications/live', [NotificationController::class, 'live'])->name('notifications.live');

    // 1. Dashboard
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // 2. POS Terminal
    Route::get('pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');

    // 3. Orders Management
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

    // 4. Menu & Category Management
    Route::get('menus', [MenuController::class, 'index'])->name('menus.index');
    Route::post('menus', [MenuController::class, 'storeProduct'])->name('menus.store');
    Route::put('menus/{product}', [MenuController::class, 'updateProduct'])->name('menus.update');
    Route::post('menus/{product}/toggle', [MenuController::class, 'toggleProductStatus'])->name('menus.toggle');
    Route::delete('menus/{product}', [MenuController::class, 'destroyProduct'])->name('menus.destroy');
    Route::post('categories', [MenuController::class, 'storeCategory'])->name('categories.store');
    Route::delete('categories/{category}', [MenuController::class, 'destroyCategory'])->name('categories.destroy');

    // 5. Inventory & Stock Movements
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('inventory/stock-in', [InventoryController::class, 'stockIn'])->name('inventory.stock-in');
    Route::post('inventory/stock-out', [InventoryController::class, 'stockOut'])->name('inventory.stock-out');
    Route::get('inventory/movements', [InventoryController::class, 'movements'])->name('inventory.movements');

    // 6. Customers Management
    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // 7. Reports
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');
    Route::get('reports/export-pdf', [ReportController::class, 'exportPdf'])->name('reports.export-pdf');

    // 8. Cashier / Staff Management
    Route::get('cashiers', [CashierController::class, 'index'])->name('cashiers.index');
    Route::post('cashiers', [CashierController::class, 'store'])->name('cashiers.store');
    Route::put('cashiers/{user}', [CashierController::class, 'update'])->name('cashiers.update');
    Route::delete('cashiers/{user}', [CashierController::class, 'destroy'])->name('cashiers.destroy');
});

require __DIR__.'/settings.php';
