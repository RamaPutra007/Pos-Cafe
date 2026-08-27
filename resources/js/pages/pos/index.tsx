import { router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Banknote,
    Check,
    Coffee,
    Flame,
    Minus,
    Plus,
    Printer,
    QrCode,
    Receipt,
    RefreshCw,
    Search,
    ShoppingBag,
    Snowflake,
    Trash2,
    User as UserIcon,
    X,
} from 'lucide-react';
import { useState } from 'react';
import PosLayout from '@/layouts/pos-layout';
import type { Auth } from '@/types';

interface ProductItem {
    id: number;
    category_id: number;
    category_name: string;
    name: string;
    sku: string;
    description: string | null;
    selling_price: number;
    selling_price_formatted: string;
    purchase_price: number;
    unit: string;
    temperature_option: 'none' | 'both' | 'hot_only' | 'ice_only';
    image: string | null;
    current_stock: number;
    min_stock: number;
    is_out_of_stock: boolean;
    is_low_stock: boolean;
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    products_count: number;
}

interface CustomerItem {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
}

interface CartItem {
    id: string; // `${product.id}_${temperature || 'none'}`
    product: ProductItem;
    quantity: number;
    temperature: 'hot' | 'ice' | null;
}

interface LastOrderReceipt {
    id: number;
    order_number: string;
    customer_name: string;
    cashier_name: string;
    created_at_formatted: string;
    items: Array<{
        name: string;
        temperature?: string | null;
        qty: number;
        price: number;
        subtotal: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    payment_method: string;
    amount_paid: number;
    change_due: number;
    reference_number: string | null;
}

interface PosIndexProps {
    categories: CategoryItem[];
    products: ProductItem[];
    customers: CustomerItem[];
}

export default function PosIndex({
    categories,
    products,
    customers,
}: PosIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>(
        'all',
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState<string>('');
    const [customerError, setCustomerError] = useState<boolean>(false);
    const [orderNotes, setOrderNotes] = useState('');
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [applyTax, setApplyTax] = useState<boolean>(false);

    // Temperature Quick Modal State for products with 'both'
    const [tempModalProduct, setTempModalProduct] =
        useState<ProductItem | null>(null);

    // Checkout Modal State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');
    const [cashReceivedInput, setCashReceivedInput] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Receipt Modal State
    const [receiptOrder, setReceiptOrder] = useState<LastOrderReceipt | null>(
        null,
    );

    // Filter products
    const filteredProducts = products.filter((p) => {
        const matchesCat =
            selectedCategory === 'all' || p.category_id === selectedCategory;
        const matchesSearch =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCat && matchesSearch;
    });

    // Cart calculations
    const subtotal = cart.reduce(
        (acc, item) => acc + item.product.selling_price * item.quantity,
        0,
    );
    const taxAmount = applyTax ? Math.round(subtotal * 0.1) : 0;
    const finalTotal = Math.max(0, subtotal - discountAmount + taxAmount);

    const cashReceivedNum = parseFloat(cashReceivedInput) || 0;
    const changeDue = Math.max(0, cashReceivedNum - finalTotal);
    const isCashValid =
        paymentMethod === 'cash' ? cashReceivedNum >= finalTotal : true;

    // Add to Cart handler
    const handleProductClick = (product: ProductItem) => {
        if (product.is_out_of_stock) {
            return;
        }

        if (product.temperature_option === 'both') {
            setTempModalProduct(product);
        } else if (product.temperature_option === 'hot_only') {
            addToCart(product, 'hot');
        } else if (product.temperature_option === 'ice_only') {
            addToCart(product, 'ice');
        } else {
            addToCart(product, null);
        }
    };

    const addToCart = (product: ProductItem, temp: 'hot' | 'ice' | null) => {
        if (product.is_out_of_stock) {
            return;
        }

        const cartItemId = `${product.id}_${temp || 'none'}`;

        setCart((prev) => {
            // Count total qty of this product in cart (across temperatures) against stock
            const totalCurrentQty = prev
                .filter((item) => item.product.id === product.id)
                .reduce((sum, item) => sum + item.quantity, 0);

            if (totalCurrentQty >= product.current_stock) {
                alert(
                    `Stok maksimal untuk ${product.name} adalah ${product.current_stock}`,
                );

                return prev;
            }

            const existingIndex = prev.findIndex(
                (item) => item.id === cartItemId,
            );

            if (existingIndex > -1) {
                return prev.map((item, idx) =>
                    idx === existingIndex
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            return [
                ...prev,
                {
                    id: cartItemId,
                    product,
                    quantity: 1,
                    temperature: temp,
                },
            ];
        });
    };

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart((prev) => {
            const targetItem = prev.find((i) => i.id === cartItemId);

            if (!targetItem) {
                return prev;
            }

            if (delta > 0) {
                const totalCurrentQty = prev
                    .filter((item) => item.product.id === targetItem.product.id)
                    .reduce((sum, item) => sum + item.quantity, 0);

                if (totalCurrentQty >= targetItem.product.current_stock) {
                    alert(
                        `Stok maksimal untuk ${targetItem.product.name} adalah ${targetItem.product.current_stock}`,
                    );

                    return prev;
                }
            }

            return prev
                .map((item) => {
                    if (item.id === cartItemId) {
                        const newQty = item.quantity + delta;

                        return newQty > 0
                            ? { ...item, quantity: newQty }
                            : null;
                    }

                    return item;
                })
                .filter(Boolean) as CartItem[];
        });
    };

    const toggleItemTemperature = (cartItemId: string) => {
        setCart((prev) => {
            const item = prev.find((i) => i.id === cartItemId);

            if (!item || item.product.temperature_option !== 'both') {
                return prev;
            }

            const newTemp: 'hot' | 'ice' =
                item.temperature === 'hot' ? 'ice' : 'hot';
            const newCartItemId = `${item.product.id}_${newTemp}`;

            // Check if an item with newTemp already exists
            const existingWithNewTemp = prev.find(
                (i) => i.id === newCartItemId,
            );

            if (existingWithNewTemp) {
                return prev
                    .filter((i) => i.id !== cartItemId)
                    .map((i) =>
                        i.id === newCartItemId
                            ? { ...i, quantity: i.quantity + item.quantity }
                            : i,
                    );
            }

            return prev.map((i) =>
                i.id === cartItemId
                    ? { ...i, id: newCartItemId, temperature: newTemp }
                    : i,
            );
        });
    };

    const removeFromCart = (cartItemId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    };

    const clearCart = () => {
        setCart([]);
        setOrderNotes('');
        setDiscountAmount(0);
        setCustomerName('');
        setCustomerError(false);
    };

    // Open Checkout
    const handleOpenCheckout = () => {
        if (cart.length === 0) {
            return;
        }

        if (!customerName.trim()) {
            setCustomerError(true);
            const inputEl = document.getElementById('pos-customer-name-input');
            inputEl?.focus();

            return;
        }

        setCustomerError(false);
        setCashReceivedInput(finalTotal.toString());
        setIsCheckoutOpen(true);
    };

    // Quick Cash buttons
    const setQuickCash = (amount: number) => {
        setCashReceivedInput(amount.toString());
    };

    // Number format helper
    const numberFormat = (num: number) =>
        new Intl.NumberFormat('id-ID').format(num);

    // Submit Checkout
    const handleConfirmPayment = () => {
        if (cart.length === 0 || isProcessing) {
            return;
        }

        if (!customerName.trim()) {
            setCustomerError(true);
            setIsCheckoutOpen(false);
            const inputEl = document.getElementById('pos-customer-name-input');
            inputEl?.focus();

            return;
        }

        if (paymentMethod === 'cash' && cashReceivedNum < finalTotal) {
            alert('Uang yang diterima kurang dari total tagihan!');

            return;
        }

        setIsProcessing(true);

        router.post(
            '/pos/checkout',
            {
                customer_name: customerName.trim(),
                items: cart.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    temperature: item.temperature,
                })),
                payment_method: paymentMethod,
                cash_received:
                    paymentMethod === 'cash' ? cashReceivedNum : finalTotal,
                discount_amount: discountAmount,
                tax_amount: taxAmount,
                notes: orderNotes,
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setIsProcessing(false);
                    setIsCheckoutOpen(false);

                    const flash = (page.props as any).flash;

                    if (flash?.last_order) {
                        setReceiptOrder(flash.last_order);
                    } else {
                        setReceiptOrder({
                            id: Date.now(),
                            order_number: `ORD-${Date.now().toString().slice(-4)}`,
                            customer_name:
                                customerName.trim() || 'Pelanggan Umum',
                            cashier_name: auth?.user?.name || 'Kasir',
                            created_at_formatted: new Date().toLocaleString(
                                'id-ID',
                            ),
                            items: cart.map((i) => ({
                                name:
                                    i.product.name +
                                    (i.temperature
                                        ? ` [${i.temperature === 'hot' ? 'PANAS' : 'DINGIN'}]`
                                        : ''),
                                temperature: i.temperature,
                                qty: i.quantity,
                                price: i.product.selling_price,
                                subtotal: i.product.selling_price * i.quantity,
                            })),
                            subtotal,
                            discount: discountAmount,
                            tax: taxAmount,
                            total: finalTotal,
                            payment_method: paymentMethod.toUpperCase(),
                            amount_paid:
                                paymentMethod === 'cash'
                                    ? cashReceivedNum
                                    : finalTotal,
                            change_due: changeDue,
                            reference_number: `POS-${Date.now()}`,
                        });
                    }

                    clearCart();
                },
                onError: (errors) => {
                    setIsProcessing(false);
                    const errorMsg =
                        Object.values(errors)[0] || 'Gagal memproses pesanan.';
                    alert(errorMsg);
                },
            },
        );
    };

    return (
        <PosLayout
            title="Meja Kasir - POS Cafe Artisan"
            headerTitle="Meja Kasir & Pemesanan"
            headerSubtitle="Pilih menu pesanan, atur varian panas/dingin, dan proses pembayaran kasir"
            activeNav="pos"
        >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                {/* ================= LEFT SECTION (8 COLS): PRODUCT CATALOG ================= */}
                <div className="space-y-5 xl:col-span-8">
                    {/* Search & Category Pills */}
                    <div className="flex flex-col gap-3 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8C6B56]" />
                            <input
                                type="text"
                                placeholder="Cari nama kopi, makanan, atau SKU..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-2xl border border-[#E2D4C6] bg-[#F7F2EB] py-2.5 pr-4 pl-10 text-xs font-medium text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white focus:outline-none"
                            />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className={`shrink-0 cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                    selectedCategory === 'all'
                                        ? 'bg-[#6B4028] text-white shadow-xs'
                                        : 'border border-[#E2D4C6] bg-[#F7F2EB] text-[#6B574B] hover:bg-[#EFE8DF]'
                                }`}
                            >
                                Semua Menu
                            </motion.button>
                            {categories.map((cat) => (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`shrink-0 cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                        selectedCategory === cat.id
                                            ? 'bg-[#6B4028] text-white shadow-xs'
                                            : 'border border-[#E2D4C6] bg-[#F7F2EB] text-[#6B574B] hover:bg-[#EFE8DF]'
                                    }`}
                                >
                                    {cat.name}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid with Framer Motion */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {filteredProducts.map((product) => {
                            const cartCount = cart
                                .filter(
                                    (item) => item.product.id === product.id,
                                )
                                .reduce((sum, item) => sum + item.quantity, 0);

                            return (
                                <motion.div
                                    whileHover={{ y: -4, scale: 1.01 }}
                                    transition={{ duration: 0.15 }}
                                    key={product.id}
                                    className={`group relative flex flex-col justify-between rounded-3xl border p-4 text-left shadow-xs transition duration-200 ${
                                        product.is_out_of_stock
                                            ? 'cursor-not-allowed border-[#E5D6C7] bg-[#F7F2EB]/50 opacity-60'
                                            : 'border-[#E5D6C7] bg-[#FFFDF9] hover:border-[#6B4028] hover:shadow-md'
                                    }`}
                                >
                                    <div
                                        onClick={() =>
                                            handleProductClick(product)
                                        }
                                        className={
                                            product.is_out_of_stock
                                                ? ''
                                                : 'cursor-pointer'
                                        }
                                    >
                                        {/* Product Tag & Stock Status */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold tracking-wider text-[#8C6B56] uppercase">
                                                {product.category_name}
                                            </span>
                                            {product.is_out_of_stock ? (
                                                <span className="rounded-md bg-[#FDE8E8] px-2 py-0.5 text-[9px] font-extrabold text-[#C53030]">
                                                    HABIS
                                                </span>
                                            ) : product.is_low_stock ? (
                                                <span className="rounded-md bg-[#FDF3E5] px-2 py-0.5 text-[9px] font-extrabold text-[#C07718]">
                                                    Sisa {product.current_stock}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-semibold text-[#2E7D32]">
                                                    Stok {product.current_stock}
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Name */}
                                        <h4 className="mt-2 font-serif text-base font-bold text-[#24140E] transition group-hover:text-[#6B4028]">
                                            {product.name}
                                        </h4>
                                        <p className="mt-1 line-clamp-2 text-[11px] text-[#7A6353]">
                                            {product.description ||
                                                `SKU: ${product.sku}`}
                                        </p>

                                        {/* Temperature Badge */}
                                        {product.temperature_option ===
                                            'both' && (
                                            <div className="mt-2 flex items-center gap-1">
                                                <span className="inline-flex items-center gap-0.5 rounded-full border border-[#E8D7C8] bg-[#FAF3EC] px-2 py-0.5 text-[9px] font-extrabold text-[#8C4A27]">
                                                    <span>☕ Panas</span>
                                                    <span className="text-[#A47E65]">
                                                        /
                                                    </span>
                                                    <span>🧊 Dingin</span>
                                                </span>
                                            </div>
                                        )}
                                        {product.temperature_option ===
                                            'hot_only' && (
                                            <div className="mt-2 flex items-center gap-1">
                                                <span className="inline-flex items-center gap-0.5 rounded-full border border-[#FCD8CC] bg-[#FFF2ED] px-2 py-0.5 text-[9px] font-extrabold text-[#C84A23]">
                                                    <Flame className="h-2.5 w-2.5" />
                                                    <span>Panas</span>
                                                </span>
                                            </div>
                                        )}
                                        {product.temperature_option ===
                                            'ice_only' && (
                                            <div className="mt-2 flex items-center gap-1">
                                                <span className="inline-flex items-center gap-0.5 rounded-full border border-[#CDEBF8] bg-[#EBF7FC] px-2 py-0.5 text-[9px] font-extrabold text-[#1F7EAA]">
                                                    <Snowflake className="h-2.5 w-2.5" />
                                                    <span>Dingin</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price & Action Section */}
                                    <div className="mt-4 flex items-center justify-between border-t border-[#F0E4D8] pt-2.5">
                                        <span className="font-bold text-[#6B4028]">
                                            {product.selling_price_formatted}
                                        </span>

                                        {/* Quick Add Actions */}
                                        {product.temperature_option ===
                                            'both' &&
                                        !product.is_out_of_stock ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    title="Tambah Panas (Hot)"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(
                                                            product,
                                                            'hot',
                                                        );
                                                    }}
                                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border border-[#FCD8CC] bg-[#FFF2ED] text-[#C84A23] transition hover:bg-[#C84A23] hover:text-white"
                                                >
                                                    <span className="text-xs">
                                                        ☕
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Tambah Dingin (Ice)"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(
                                                            product,
                                                            'ice',
                                                        );
                                                    }}
                                                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border border-[#CDEBF8] bg-[#EBF7FC] text-[#1F7EAA] transition hover:bg-[#1F7EAA] hover:text-white"
                                                >
                                                    <span className="text-xs">
                                                        🧊
                                                    </span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled={
                                                    product.is_out_of_stock
                                                }
                                                onClick={() =>
                                                    handleProductClick(product)
                                                }
                                                className="cursor-pointer"
                                            >
                                                {cartCount > 0 ? (
                                                    <motion.span
                                                        initial={{ scale: 0.8 }}
                                                        animate={{ scale: 1 }}
                                                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#6B4028] text-xs font-bold text-white shadow-xs"
                                                    >
                                                        {cartCount}
                                                    </motion.span>
                                                ) : (
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#EFE5DA] text-[#6B4028] transition group-hover:bg-[#6B4028] group-hover:text-white">
                                                        <Plus className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* ================= RIGHT SECTION (4 COLS): CART & CHECKOUT ================= */}
                <div className="xl:col-span-4">
                    <div className="sticky top-24 rounded-3xl border border-[#E5D6C7] bg-[#FFFDF9] p-5 shadow-sm">
                        {/* Cart Header */}
                        <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-[#6B4028]" />
                                <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                    Keranjang Pesanan
                                </h3>
                            </div>
                            {cart.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearCart}
                                    className="cursor-pointer text-xs font-semibold text-[#A24D3D] hover:underline"
                                >
                                    Kosongkan
                                </button>
                            )}
                        </div>

                        {/* Customer Manual Input / Freeform with Autocomplete Datalist */}
                        <div className="mt-3.5">
                            <div className="mb-1 flex items-center justify-between">
                                <label className="block text-[11px] font-bold text-[#7A6353] uppercase">
                                    Nama Pelanggan <span className="text-[#C53030]">* (Wajib)</span>
                                </label>
                                {customerName && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomerName('');
                                            setCustomerError(false);
                                        }}
                                        className="cursor-pointer text-[10px] font-semibold text-[#8C6B56] hover:text-[#24140E]"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <UserIcon
                                    className={`absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 transition ${
                                        customerError
                                            ? 'text-[#C53030]'
                                            : 'text-[#8C6B56]'
                                    }`}
                                />
                                <input
                                    id="pos-customer-name-input"
                                    type="text"
                                    list="customer-datalist"
                                    placeholder="Wajib isi nama pelanggan (cth: Sarah / Meja 4)..."
                                    value={customerName}
                                    onChange={(e) => {
                                        setCustomerName(e.target.value);

                                        if (e.target.value.trim()) {
                                            setCustomerError(false);
                                        }
                                    }}
                                    className={`w-full rounded-2xl border py-2 pr-8 pl-9 text-xs font-medium transition focus:outline-none ${
                                        customerError
                                            ? 'border-[#E53E3E] bg-[#FFF5F5] text-[#C53030] placeholder-[#E53E3E]/70 focus:border-[#C53030] focus:ring-1 focus:ring-[#C53030]'
                                            : 'border-[#E2D4C6] bg-[#F7F2EB] text-[#24140E] placeholder-[#9E8372] focus:border-[#6B4028] focus:bg-white'
                                    }`}
                                />
                                {customerName && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomerName('');
                                            setCustomerError(false);
                                        }}
                                        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#8C6B56] hover:text-[#24140E]"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                                <datalist id="customer-datalist">
                                    <option value="Pelanggan Umum" />
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.phone
                                                ? `${c.name} (${c.phone})`
                                                : c.name}
                                        </option>
                                    ))}
                                </datalist>
                            </div>
                            {customerError && (
                                <p className="mt-1.5 text-[11px] font-bold text-[#C53030]">
                                    ⚠️ Nama pelanggan wajib diisi sebelum checkout!
                                </p>
                            )}
                        </div>

                        {/* Cart Items List with AnimatePresence */}
                        <div className="mt-4 max-h-72 space-y-2.5 overflow-y-auto pr-1">
                            <AnimatePresence initial={false}>
                                {cart.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-10 text-center text-xs text-[#8C6B56]"
                                    >
                                        <Coffee className="mx-auto mb-2 h-8 w-8 text-[#C5B4A5]" />
                                        <p className="font-semibold">
                                            Keranjang masih kosong
                                        </p>
                                        <p className="text-[11px]">
                                            Pilih menu kopi atau makanan untuk
                                            menambahkan.
                                        </p>
                                    </motion.div>
                                ) : (
                                    cart.map((item) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.15 }}
                                            key={item.id}
                                            className="flex flex-col gap-2 rounded-2xl border border-[#F0E4D8] bg-[#FDFBF7] p-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <h5 className="truncate text-xs font-bold text-[#24140E]">
                                                            {item.product.name}
                                                        </h5>

                                                        {/* Temperature Pill in Cart */}
                                                        {item.temperature ===
                                                            'hot' && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleItemTemperature(
                                                                        item.id,
                                                                    )
                                                                }
                                                                title={
                                                                    item.product
                                                                        .temperature_option ===
                                                                    'both'
                                                                        ? 'Klik untuk ganti ke Dingin'
                                                                        : 'Suhu Panas'
                                                                }
                                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition ${
                                                                    item.product
                                                                        .temperature_option ===
                                                                    'both'
                                                                        ? 'cursor-pointer border border-[#FCD8CC] bg-[#FFF2ED] text-[#C84A23] hover:bg-[#FCD8CC]'
                                                                        : 'border border-[#FCD8CC] bg-[#FFF2ED] text-[#C84A23]'
                                                                }`}
                                                            >
                                                                <Flame className="h-2.5 w-2.5" />
                                                                <span>
                                                                    Panas
                                                                </span>
                                                                {item.product
                                                                    .temperature_option ===
                                                                    'both' && (
                                                                    <span className="text-[9px] text-[#A47E65]">
                                                                        ⇄
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )}

                                                        {item.temperature ===
                                                            'ice' && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleItemTemperature(
                                                                        item.id,
                                                                    )
                                                                }
                                                                title={
                                                                    item.product
                                                                        .temperature_option ===
                                                                    'both'
                                                                        ? 'Klik untuk ganti ke Panas'
                                                                        : 'Suhu Dingin'
                                                                }
                                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition ${
                                                                    item.product
                                                                        .temperature_option ===
                                                                    'both'
                                                                        ? 'cursor-pointer border border-[#CDEBF8] bg-[#EBF7FC] text-[#1F7EAA] hover:bg-[#CDEBF8]'
                                                                        : 'border border-[#CDEBF8] bg-[#EBF7FC] text-[#1F7EAA]'
                                                                }`}
                                                            >
                                                                <Snowflake className="h-2.5 w-2.5" />
                                                                <span>
                                                                    Dingin
                                                                </span>
                                                                {item.product
                                                                    .temperature_option ===
                                                                    'both' && (
                                                                    <span className="text-[9px] text-[#A47E65]">
                                                                        ⇄
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>

                                                    <p className="mt-0.5 text-[11px] font-semibold text-[#7A6353]">
                                                        Rp{' '}
                                                        {numberFormat(
                                                            item.product
                                                                .selling_price *
                                                                item.quantity,
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Quantity Stepper */}
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                -1,
                                                            )
                                                        }
                                                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#D5C2B1] bg-white text-[#24140E] transition hover:bg-[#F5EFEB]"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-5 text-center text-xs font-bold text-[#24140E]">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                1,
                                                            )
                                                        }
                                                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#D5C2B1] bg-white text-[#24140E] transition hover:bg-[#F5EFEB]"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFromCart(
                                                                item.id,
                                                            )
                                                        }
                                                        className="ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-[#A24D3D] transition hover:bg-[#FBEBE8]"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Order Notes & Calculation Breakdown */}
                        {cart.length > 0 && (
                            <div className="mt-4 space-y-3 border-t border-[#EADCCE] pt-3 text-xs">
                                {/* Order Notes Input */}
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Catatan pesanan (Meja 4, Less Sugar, dll)..."
                                        value={orderNotes}
                                        onChange={(e) =>
                                            setOrderNotes(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#E2D4C6] bg-[#F7F2EB] px-3 py-1.5 text-xs text-[#24140E] placeholder-[#9E8372] transition focus:border-[#6B4028] focus:bg-white focus:outline-none"
                                    />
                                </div>

                                {/* Calculation Breakdown */}
                                <div className="space-y-1.5 text-xs text-[#6B574B]">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-[#24140E]">
                                            Rp {numberFormat(subtotal)}
                                        </span>
                                    </div>

                                    {/* Diskon */}
                                    <div className="flex items-center justify-between">
                                        <span>Diskon (Rp)</span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={discountAmount || ''}
                                            onChange={(e) =>
                                                setDiscountAmount(
                                                    Math.max(
                                                        0,
                                                        parseFloat(
                                                            e.target.value,
                                                        ) || 0,
                                                    ),
                                                )
                                            }
                                            placeholder="0"
                                            className="w-24 rounded-lg border border-[#E2D4C6] bg-[#F7F2EB] px-2 py-0.5 text-right text-xs font-semibold text-[#24140E] focus:outline-none"
                                        />
                                    </div>

                                    {/* Pajak Toggle (10%) */}
                                    <div className="flex items-center justify-between">
                                        <label className="flex cursor-pointer items-center gap-1.5">
                                            <input
                                                type="checkbox"
                                                checked={applyTax}
                                                onChange={(e) =>
                                                    setApplyTax(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="rounded border-[#D5C2B1] text-[#6B4028] focus:ring-[#6B4028]"
                                            />
                                            <span>PPN (10%)</span>
                                        </label>
                                        <span className="font-semibold text-[#24140E]">
                                            Rp {numberFormat(taxAmount)}
                                        </span>
                                    </div>

                                    {/* Total Bill */}
                                    <div className="flex items-center justify-between border-t border-[#EADCCE] pt-2 text-sm font-bold text-[#24140E]">
                                        <span>Total Tagihan</span>
                                        <span className="font-serif text-lg text-[#6B4028]">
                                            Rp {numberFormat(finalTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Checkout Button with motion */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    type="button"
                                    onClick={handleOpenCheckout}
                                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#6B4028] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#57331F]"
                                >
                                    <Receipt className="h-4 w-4" />
                                    <span>
                                        Proses Pembayaran (Rp{' '}
                                        {numberFormat(finalTotal)})
                                    </span>
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ================= MODAL: PILIH SUHU (HOT / ICE) ================= */}
            <AnimatePresence>
                {tempModalProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 15 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-sm rounded-3xl border border-[#E2D4C6] bg-[#FFFDF9] p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-[#24140E]">
                                        Pilih Suhu Minuman
                                    </h3>
                                    <p className="text-xs text-[#8C6B56]">
                                        {tempModalProduct.name} (
                                        {
                                            tempModalProduct.selling_price_formatted
                                        }
                                        )
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setTempModalProduct(null)}
                                    className="cursor-pointer text-[#8C6B56] hover:text-[#24140E]"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3.5">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => {
                                        addToCart(tempModalProduct, 'hot');
                                        setTempModalProduct(null);
                                    }}
                                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#FCD8CC] bg-[#FFF2ED] p-4 text-center transition hover:border-[#C84A23] hover:shadow-md"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C84A23] text-white shadow-xs">
                                        <Flame className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-serif text-sm font-bold text-[#C84A23]">
                                            ☕ Panas (Hot)
                                        </h4>
                                        <p className="text-[10px] text-[#A45E45]">
                                            Steamed / Seduh Hangat
                                        </p>
                                    </div>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => {
                                        addToCart(tempModalProduct, 'ice');
                                        setTempModalProduct(null);
                                    }}
                                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#CDEBF8] bg-[#EBF7FC] p-4 text-center transition hover:border-[#1F7EAA] hover:shadow-md"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F7EAA] text-white shadow-xs">
                                        <Snowflake className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-serif text-sm font-bold text-[#1F7EAA]">
                                            🧊 Dingin (Ice)
                                        </h4>
                                        <p className="text-[10px] text-[#3D7C9A]">
                                            Es Segar / On the Rocks
                                        </p>
                                    </div>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ================= MODAL 1: CHECKOUT / PEMBAYARAN ================= */}
            <AnimatePresence>
                {isCheckoutOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-md rounded-3xl border border-[#E2D4C6] bg-[#FFFDF9] p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-[#EADCCE] pb-3">
                                <h3 className="font-serif text-xl font-bold text-[#24140E]">
                                    Pembayaran Pesanan
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsCheckoutOpen(false)}
                                    className="cursor-pointer text-[#8C6B56] hover:text-[#24140E]"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Customer & Total Amount Banner */}
                            <div className="mt-4 rounded-2xl bg-[#F7F2EB] p-4 text-center">
                                <p className="text-xs font-semibold text-[#8C6B56]">
                                    Pelanggan:{' '}
                                    <strong className="text-[#24140E]">
                                        {customerName.trim() ||
                                            'Pelanggan Umum'}
                                    </strong>
                                </p>
                                <p className="mt-2 text-xs font-medium text-[#7A6353]">
                                    Total Tagihan
                                </p>
                                <h2 className="mt-0.5 font-serif text-3xl font-bold text-[#6B4028]">
                                    Rp {numberFormat(finalTotal)}
                                </h2>
                            </div>

                            {/* Payment Method Tabs */}
                            <div className="mt-5 grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition ${
                                        paymentMethod === 'cash'
                                            ? 'bg-[#6B4028] text-white shadow-xs'
                                            : 'border border-[#D5C2B1] bg-[#F7F2EB] text-[#6B574B]'
                                    }`}
                                >
                                    <Banknote className="h-4 w-4" />
                                    <span>Tunai (Cash)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('qris')}
                                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition ${
                                        paymentMethod === 'qris'
                                            ? 'bg-[#6B4028] text-white shadow-xs'
                                            : 'border border-[#D5C2B1] bg-[#F7F2EB] text-[#6B574B]'
                                    }`}
                                >
                                    <QrCode className="h-4 w-4" />
                                    <span>QRIS Statis</span>
                                </button>
                            </div>

                            {/* Cash Payment Section */}
                            {paymentMethod === 'cash' ? (
                                <div className="mt-5 space-y-3.5">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-[#24140E]">
                                            Uang Diterima (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={cashReceivedInput}
                                            onChange={(e) =>
                                                setCashReceivedInput(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-2xl border border-[#D5C2B1] bg-white px-4 py-2.5 text-base font-bold text-[#24140E] transition focus:border-[#6B4028] focus:outline-none"
                                        />
                                    </div>

                                    {/* Quick Cash Chips */}
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuickCash(finalTotal)
                                            }
                                            className="cursor-pointer rounded-xl border border-[#D5C2B1] bg-[#F7F2EB] px-2.5 py-1 text-xs font-bold text-[#6B4028] hover:bg-[#EAE0D4]"
                                        >
                                            Uang Pas
                                        </button>
                                        {[
                                            20000, 50000, 100000, 150000,
                                            200000,
                                        ].map((amt) => (
                                            <button
                                                key={amt}
                                                type="button"
                                                onClick={() =>
                                                    setQuickCash(amt)
                                                }
                                                className="cursor-pointer rounded-xl border border-[#D5C2B1] bg-[#F7F2EB] px-2.5 py-1 text-xs font-bold text-[#6B574B] hover:bg-[#EAE0D4]"
                                            >
                                                {amt / 1000}k
                                            </button>
                                        ))}
                                    </div>

                                    {/* Kembalian */}
                                    <div className="flex items-center justify-between rounded-2xl border border-[#E5D6C7] bg-[#FFFDF9] p-3 text-xs">
                                        <span className="font-bold text-[#7A6353]">
                                            Kembalian:
                                        </span>
                                        <span
                                            className={`text-base font-bold ${
                                                cashReceivedNum >= finalTotal
                                                    ? 'text-[#2E7D32]'
                                                    : 'text-[#C53030]'
                                            }`}
                                        >
                                            {cashReceivedNum >= finalTotal
                                                ? `Rp ${numberFormat(changeDue)}`
                                                : 'Uang Kurang!'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                /* QRIS Payment Section */
                                <div className="mt-5 space-y-3 text-center">
                                    <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#6B4028] bg-white p-3 shadow-inner">
                                        <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-[#24140E] p-2 text-white">
                                            <QrCode className="h-24 w-24 text-[#FAF3EB]" />
                                        </div>
                                        <span className="mt-1 text-[10px] font-bold tracking-wider text-[#7A6353]">
                                            QRIS POS CAFE
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#7A6353]">
                                        Pindai QRIS di atas melalui GoPay, OVO,
                                        Dana, BCA, atau Livin sebesar{' '}
                                        <strong className="text-[#6B4028]">
                                            Rp {numberFormat(finalTotal)}
                                        </strong>
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="mt-6">
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="button"
                                    disabled={!isCashValid || isProcessing}
                                    onClick={handleConfirmPayment}
                                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white shadow-md transition ${
                                        !isCashValid || isProcessing
                                            ? 'cursor-not-allowed bg-gray-400'
                                            : 'bg-[#6B4028] hover:bg-[#57331F]'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    <span>
                                        {isProcessing
                                            ? 'Memproses...'
                                            : paymentMethod === 'cash'
                                              ? 'Selesaikan & Cetak Struk'
                                              : 'Konfirmasi QRIS Berhasil'}
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ================= MODAL 2: STRUK TRANSAKSI (RECEIPT) ================= */}
            <AnimatePresence>
                {receiptOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-sm rounded-3xl border border-[#E2D4C6] bg-white p-6 shadow-2xl"
                        >
                            {/* Thermal Receipt Visual */}
                            <div
                                id="receipt-print-area"
                                className="thermal-receipt bg-white p-2 font-mono text-xs text-[#1A1A1A]"
                            >
                                <div className="pb-2 text-center">
                                    <h3 className="font-sans text-base font-black tracking-wider text-black uppercase">
                                        ☕ POS CAFE ARTISAN
                                    </h3>
                                    <p className="text-[10px] text-gray-700">
                                        Jl. Kopi Harum No. 7, Jakarta
                                    </p>
                                    <p className="text-[10px] text-gray-700">
                                        Telp: (021) 555-CAFE • 0812-3456-7890
                                    </p>
                                    <p className="mt-1 font-mono text-[10px] tracking-widest text-gray-400">
                                        - - - - - - - - - - - - - - - - - - - - - - - -
                                    </p>
                                </div>

                                <div className="space-y-0.5 text-[11px]">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">No. Nota:</span>
                                        <span className="font-bold text-black">
                                            {receiptOrder.order_number}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Waktu:</span>
                                        <span>{receiptOrder.created_at_formatted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Kasir:</span>
                                        <span>{receiptOrder.cashier_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pelanggan:</span>
                                        <span className="font-semibold text-black">
                                            {receiptOrder.customer_name}
                                        </span>
                                    </div>
                                </div>

                                <p className="my-1 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                    - - - - - - - - - - - - - - - - - - - - - - - -
                                </p>

                                <div className="space-y-1.5 text-[11px]">
                                    {receiptOrder.items.map((it, idx) => (
                                        <div key={idx} className="flex items-start justify-between">
                                            <div className="min-w-0 pr-2">
                                                <p className="font-bold leading-tight text-black">
                                                    {it.name}
                                                </p>
                                                <p className="text-[10px] text-gray-600">
                                                    {it.qty} x Rp {numberFormat(it.price)}
                                                </p>
                                            </div>
                                            <span className="font-bold whitespace-nowrap text-black">
                                                Rp {numberFormat(it.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <p className="my-1 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                    - - - - - - - - - - - - - - - - - - - - - - - -
                                </p>

                                <div className="space-y-1 text-[11px]">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span>Rp {numberFormat(receiptOrder.subtotal)}</span>
                                    </div>
                                    {receiptOrder.discount > 0 && (
                                        <div className="flex justify-between font-medium text-red-600">
                                            <span>Diskon:</span>
                                            <span>-Rp {numberFormat(receiptOrder.discount)}</span>
                                        </div>
                                    )}
                                    {receiptOrder.tax > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">PPN (10%):</span>
                                            <span>Rp {numberFormat(receiptOrder.tax)}</span>
                                        </div>
                                    )}
                                    <p className="my-0.5 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                        ========================================
                                    </p>
                                    <div className="flex justify-between text-xs font-black text-black">
                                        <span>TOTAL AKHIR:</span>
                                        <span>Rp {numberFormat(receiptOrder.total)}</span>
                                    </div>
                                    <p className="my-0.5 text-center font-mono text-[10px] tracking-widest text-gray-400">
                                        ========================================
                                    </p>
                                    <div className="flex justify-between text-[10px] text-gray-700">
                                        <span>Bayar ({receiptOrder.payment_method}):</span>
                                        <span className="font-bold">Rp {numberFormat(receiptOrder.amount_paid)}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-700">
                                        <span>Kembalian:</span>
                                        <span className="font-bold">Rp {numberFormat(receiptOrder.change_due)}</span>
                                    </div>
                                </div>

                                <div className="mt-3 space-y-0.5 border-t border-dashed border-gray-300 pt-2 text-center text-[10px] text-gray-600">
                                    <p className="font-bold text-black">Terima Kasih Atas Kunjungan Anda!</p>
                                    <p>WiFi: CafeArtisan_Guest / Pass: nikmatkopi</p>
                                    <p className="text-[9px] text-gray-500">Instagram: @poscafe.artisan</p>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="no-print mt-5 flex items-center justify-between border-t border-[#EADCCE] pt-3">
                                <button
                                    type="button"
                                    onClick={() => setReceiptOrder(null)}
                                    className="cursor-pointer rounded-2xl border border-[#D5C2B1] bg-[#F7F2EB] px-4 py-2 text-xs font-bold text-[#24140E] hover:bg-[#EAE0D4]"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[#6B4028] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#57331F]"
                                >
                                    <Printer className="h-4 w-4" />
                                    <span>Cetak Struk</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PosLayout>
    );
}
