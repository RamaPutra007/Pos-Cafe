PROJECT REQUIREMENTS DOCUMENT
POS CAFE
MVP — Point of Sale, Pembayaran, dan Inventory
## 1. Overview
POS Cafe adalah aplikasi web untuk membantu kasir dan pemilik cafe mencatat transaksi, mengelola menu, menerima pembayaran Tunai dan QRIS, serta memantau stok secara real-time. Sistem menggantikan pencatatan manual menggunakan buku atau kalkulator yang rawan salah hitung dan menyulitkan pemantauan stok.
## 2. Tujuan
- Mempercepat proses transaksi kasir.
- Mengurangi kesalahan perhitungan pembayaran.
- Menjaga stok tetap akurat melalui pembaruan otomatis.
- Menyediakan laporan penjualan dan pembayaran.
- Menyediakan sistem yang sederhana dan mudah dipelajari.
## 3. Target Pengguna
- Admin/Pemilik Cafe: mengelola menu, stok, kasir, dan laporan.
- Kasir: membuat pesanan, mengelola keranjang, dan memproses pembayaran.
## 4. Core Features
### 4.1 Login & Hak Akses
- Login menggunakan email dan password.
- Role Admin dan Kasir.
- Halaman dan fitur dibatasi sesuai role.
- Logout dan protected route.
### 4.2 Dashboard
- Total penjualan.
- Jumlah transaksi.
- Produk/menu terlaris.
- Pesanan terbaru.
- Low Stock Alert.
- Ringkasan pembayaran Tunai dan QRIS.
### 4.3 POS / Kasir
- Daftar menu berdasarkan kategori.
- Pencarian menu.
- Tambah produk ke keranjang.
- Ubah quantity dan hapus item.
- Pilih pelanggan.
- Hitung subtotal, diskon, pajak, dan total.
- Checkout dan tampilkan/cetak struk.
### 4.4 Pesanan
- Nomor order otomatis dan unik.
- Menyimpan produk, quantity, harga, kasir, dan waktu transaksi.
- Status: Pending, Paid, Cancelled.
- Melihat riwayat dan detail pesanan.
### 4.5 Pembayaran
- Mendukung Tunai dan QRIS.
- Tunai: input uang diterima dan hitung kembalian otomatis.
- Jika uang tunai kurang dari total, pembayaran ditolak.
- QRIS: tampilkan QRIS dan total pembayaran.
- Untuk MVP, QRIS menggunakan static QRIS dengan konfirmasi manual.
- Status pembayaran: Pending, Paid, Failed, Cancelled, Refunded.
### 4.6 Manajemen Menu & Kategori
- CRUD menu dan kategori.
- Menu memiliki nama, SKU, kategori, harga jual, harga modal, satuan, gambar, dan status.
- Menu dapat aktif/nonaktif.
- Menu nonaktif tidak muncul di POS.
- SKU harus unik.
### 4.7 Pelanggan
- CRUD pelanggan.
- Data: nama, nomor HP, dan email.
- Melihat riwayat transaksi pelanggan.
### 4.8 Inventory & Batch
- Menampilkan stok saat ini, minimum stok, satuan, dan lokasi/rak.
- Low Stock Alert jika stok <= minimum stok.
- Batch menyimpan nomor batch, jumlah, tanggal masuk, dan expired date.
- Batch terhubung dengan produk.
### 4.9 Stok Masuk
- Input produk, jumlah, nomor batch, tanggal masuk, supplier, harga beli, dan expired date.
- Stok otomatis bertambah.
- Membuat catatan Stock Movement tipe IN.
### 4.10 Stok Keluar
- Pilih produk dan batch.
- Input jumlah, alasan, dan keterangan.
- Stok otomatis berkurang.
- Stok tidak boleh negatif.
- Membuat Stock Movement tipe OUT.
### 4.11 Stock Movement
- Mencatat semua perubahan stok: IN, OUT, dan ADJUSTMENT.
- Mencatat produk, batch, jumlah, user, tanggal, dan keterangan.
### 4.12 Laporan
- Laporan penjualan.
- Laporan pembayaran Tunai dan QRIS.
- Laporan inventory dan Stock Movement.
- Filter hari ini, minggu ini, bulan ini, dan custom tanggal.
### 4.13 Struk
- Nomor transaksi, tanggal, kasir, item, quantity, harga, subtotal, diskon, pajak, dan total.
- Metode pembayaran.
- Untuk Tunai: uang diterima dan kembalian.
- Untuk QRIS: jumlah dibayar dan status pembayaran.
## 5. Alur Utama
Login → Dashboard/POS → Pilih Menu → Keranjang → Checkout → Pilih Tunai/QRIS → Pembayaran Berhasil → Order Paid → Stok Berkurang → Stock Movement Tercatat → Struk.
## 6. Business Rules
- Quantity harus lebih besar dari 0.
- Harga tidak boleh negatif.
- Stok tidak boleh negatif.
- Produk nonaktif tidak dapat dijual.
- Order yang Paid tidak boleh diedit sembarangan.
- Order Cancelled tidak mengurangi stok.
- Cash payment harus >= total.
- QRIS menggunakan nominal sesuai total order.
- QRIS tidak memiliki kembalian.
- Setiap perubahan stok wajib dicatat.
- Payment dan perubahan stok diproses secara transactional agar data konsisten.
## 7. Teknologi
- Frontend: React (Vite) + TypeScript.
- Backend: Laravel.
- Integration: Inertia.js.
- Styling: Tailwind CSS.
- Database: MySQL.
- Deployment: Railway.
## 8. UI/UX
- Modern, clean, minimalis, elegan, dan mudah dipelajari.
- Tema coffee shop dengan warna coklat dan cream.
- Desktop-first dan responsive.
- Gunakan sidebar, dashboard cards, table, modal, badge, form, dan toast notification.
- Typography: Geist Mono untuk Sans dan JetBrains Mono untuk Mono.
## 9. MVP
- Login dan role Admin/Kasir.
- Dashboard.
- POS dan Order.
- CRUD Menu dan Kategori.
- Pelanggan.
- Pembayaran Tunai dan QRIS.
- Inventory dan Batch.
- Stok Masuk dan Stok Keluar.
- Stock Movement.
- Low Stock Alert.
- Laporan.
- Struk transaksi.
## 10. Prioritas Pengembangan
- 1. Authentication dan layout.
- 2. Database, menu, dan kategori.
- 3. Inventory dan batch.
- 4. POS dan order.
- 5. Pembayaran Tunai dan QRIS.
- 6. Integrasi pembayaran dengan stok.
- 7. Dashboard dan laporan.
- 8. Testing, keamanan, dan deployment.
## 11. Acceptance Criteria Singkat
- Kasir dapat membuat transaksi sampai selesai.
- Pembayaran Tunai menghitung kembalian dengan benar.
- Pembayaran QRIS dapat dikonfirmasi dan mengubah status menjadi Paid.
- Pembayaran berhasil mengurangi stok secara otomatis.
- Setiap perubahan stok tercatat pada Stock Movement.
- Stok tidak dapat menjadi negatif.
- Produk low stock muncul di Dashboard.
- Laporan dapat difilter berdasarkan tanggal.
- Struk menampilkan informasi transaksi dan pembayaran.
## 12. Catatan Implementasi Inertia
- Gunakan satu Inertia application root.
- Jangan membuat React createRoot kedua untuk halaman Inertia.
- usePage() hanya digunakan di dalam Inertia context.
- Gunakan Link dan router dari @inertiajs/react.
- Pastikan seluruh page di-resolve melalui createInertiaApp().