<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'batch_number',
        'initial_qty',
        'current_qty',
        'purchase_price',
        'received_at',
        'expired_at',
        'supplier',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'initial_qty' => 'integer',
            'current_qty' => 'integer',
            'purchase_price' => 'decimal:2',
            'received_at' => 'date',
            'expired_at' => 'date',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
