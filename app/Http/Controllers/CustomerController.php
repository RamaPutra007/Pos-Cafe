<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display list of customers with their order history summaries.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $query = Customer::withCount('orders')
            ->withSum('orders', 'total_amount')
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->paginate(15)->withQueryString()->through(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone ?? '-',
                'email' => $c->email ?? '-',
                'notes' => $c->notes ?? '-',
                'orders_count' => $c->orders_count,
                'total_spent' => (float) ($c->orders_sum_total_amount ?? 0),
                'total_spent_formatted' => 'Rp '.number_format($c->orders_sum_total_amount ?? 0, 0, ',', '.'),
                'created_at' => $c->created_at->format('d/m/Y'),
            ];
        });

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store new customer.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        Customer::create($validated);

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Pelanggan '{$validated['name']}' berhasil ditambahkan!",
            ],
        ]);
    }

    /**
     * Update customer.
     */
    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $customer->update($validated);

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Data pelanggan '{$customer->name}' berhasil diperbarui!",
            ],
        ]);
    }

    /**
     * Delete customer.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $name = $customer->name;
        $customer->delete();

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Pelanggan '{$name}' telah dihapus.",
            ],
        ]);
    }
}
