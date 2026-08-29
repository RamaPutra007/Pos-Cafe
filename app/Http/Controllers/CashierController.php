<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class CashierController extends Controller
{
    public function index(): Response
    {
        $cashiers = User::where('role', 'cashier')
            ->withCount('orders')
            ->latest()
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                    'orders_count' => $u->orders_count,
                    'created_at' => $u->created_at->format('d/m/Y'),
                ];
            });

        return Inertia::render('cashiers/index', [
            'cashiers' => $cashiers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'cashier',
            'email_verified_at' => now(),
        ]);

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Akun kasir '{$validated['name']}' berhasil dibuat!",
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:6',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Akun kasir '{$user->name}' berhasil diperbarui!",
            ],
        ]);
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->role === 'admin') {
            return back()->with([
                'toast' => [
                    'type' => 'error',
                    'message' => 'Akun admin tidak dapat dihapus.',
                ],
            ]);
        }

        $name = $user->name;
        $user->delete();

        return back()->with([
            'toast' => [
                'type' => 'success',
                'message' => "Akun kasir '{$name}' telah dihapus.",
            ],
        ]);
    }
}
