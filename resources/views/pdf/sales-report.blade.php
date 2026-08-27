<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Penjualan - POS Cafe</title>
    <style>
        @page {
            margin: 1.2cm 1.5cm;
            size: a4 portrait;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #24140E;
            margin: 0;
            padding: 0;
        }

        /* Header Branding */
        .header-table {
            width: 100%;
            border-bottom: 2px solid #5A3726;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }

        .header-logo {
            font-size: 20pt;
            font-weight: bold;
            color: #5A3726;
            letter-spacing: 1px;
            margin: 0;
        }

        .header-sub {
            font-size: 9pt;
            color: #7A6353;
            margin: 2px 0 0 0;
        }

        .doc-title {
            text-align: right;
            vertical-align: bottom;
        }

        .doc-title h2 {
            font-size: 13pt;
            color: #5A3726;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .doc-title p {
            font-size: 8.5pt;
            color: #7A6353;
            margin: 3px 0 0 0;
        }

        /* Info meta strip */
        .meta-strip {
            background-color: #F7F2EB;
            border-left: 4px solid #5A3726;
            padding: 8px 12px;
            margin-bottom: 18px;
            font-size: 9pt;
        }

        .meta-strip table {
            width: 100%;
        }

        .meta-strip td {
            padding: 2px 4px;
        }

        /* Section Headings */
        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #5A3726;
            border-bottom: 1px solid #D5C2B1;
            padding-bottom: 4px;
            margin-top: 18px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Tables */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        table.data-table th {
            background-color: #5A3726;
            color: #FFFFFF;
            font-size: 8.5pt;
            font-weight: bold;
            text-align: left;
            padding: 6px 8px;
            border: 1px solid #5A3726;
        }

        table.data-table td {
            font-size: 8.5pt;
            padding: 5px 8px;
            border: 1px solid #EADCCE;
        }

        table.data-table tr.even {
            background-color: #FAF6F0;
        }

        table.data-table tr.total-row {
            background-color: #EFE5DA;
            font-weight: bold;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .text-bold {
            font-weight: bold;
        }

        .badge-cash {
            color: #6B4028;
            font-weight: bold;
        }

        .badge-qris {
            color: #2E7D32;
            font-weight: bold;
        }

        /* KPI Boxes */
        .kpi-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        .kpi-box {
            width: 25%;
            padding: 8px 10px;
            background-color: #FAF6F0;
            border: 1px solid #D5C2B1;
            vertical-align: top;
        }

        .kpi-box .label {
            font-size: 8pt;
            color: #7A6353;
            margin-bottom: 3px;
        }

        .kpi-box .val {
            font-size: 12pt;
            font-weight: bold;
            color: #24140E;
        }

        .kpi-box .val.profit {
            color: #2E7D32;
        }

        .kpi-box .sub {
            font-size: 7.5pt;
            color: #8C6B56;
            margin-top: 2px;
        }

        /* Footer & Signatures */
        .footer-table {
            width: 100%;
            margin-top: 30px;
            page-break-inside: avoid;
        }

        .signature-box {
            width: 45%;
            text-align: center;
            vertical-align: top;
        }

        .signature-space {
            height: 50px;
        }

        .footer-note {
            text-align: center;
            font-size: 8pt;
            color: #8C6B56;
            margin-top: 20px;
            border-top: 1px dashed #D5C2B1;
            padding-top: 8px;
        }
    </style>
</head>
<body>

    <!-- Header Table -->
    <table class="header-table">
        <tr>
            <td style="width: 55%; vertical-align: top;">
                <h1 class="header-logo">POS CAFE</h1>
                <p class="header-sub">Jl. Kopi Harum No. 7, Jakarta &bull; Telp: (021) 555-CAFE</p>
                <p class="header-sub">Email: finance@poscafeartisan.id &bull; IG: @poscafe.artisan</p>
            </td>
            <td class="doc-title" style="width: 45%;">
                <h2>Laporan Finansial & Penjualan</h2>
                <p><strong>Periode:</strong> {{ $periodLabel }}</p>
                <p><strong>Dicetak:</strong> {{ now()->format('d/m/Y H:i') }} WIB</p>
            </td>
        </tr>
    </table>

    <!-- Metadata Strip -->
    <div class="meta-strip">
        <table>
            <tr>
                <td style="width: 33%;"><strong>Status Laporan:</strong> Resmi (Verified)</td>
                <td style="width: 33%;"><strong>Total Pesanan:</strong> {{ $summary['total_orders'] }} Transaksi</td>
                <td style="width: 34%;"><strong>Total Produk Terjual:</strong> {{ $summary['total_items_sold'] }} Cup/Porsi</td>
            </tr>
        </table>
    </div>

    <!-- 1. Ringkasan Finansial (KPI Grid) -->
    <div class="section-title">1. Ringkasan Kinerja Keuangan</div>
    <table class="kpi-grid">
        <tr>
            <td class="kpi-box">
                <div class="label">TOTAL OMSET PENJUALAN</div>
                <div class="val">{{ $summary['total_revenue_formatted'] }}</div>
                <div class="sub">{{ $summary['total_orders'] }} Transaksi Berhasil</div>
            </td>
            <td class="kpi-box">
                <div class="label">ESTIMASI LABA KOTOR</div>
                <div class="val profit">{{ $summary['gross_profit_formatted'] }}</div>
                <div class="sub">Margin Setelah HPP</div>
            </td>
            <td class="kpi-box">
                <div class="label">TOTAL MODAL / HPP</div>
                <div class="val">{{ $summary['total_cogs_formatted'] }}</div>
                <div class="sub">Biaya Pokok Menu Terjual</div>
            </td>
            <td class="kpi-box">
                <div class="label">RATA-RATA / TRANSAKSI</div>
                <div class="val">{{ $summary['average_order_formatted'] ?? 'Rp 0' }}</div>
                <div class="sub">Nilai Belanja Rata-rata</div>
            </td>
        </tr>
    </table>

    <!-- 2. Rincian Metode Pembayaran -->
    <div class="section-title">2. Distribusi Metode Pembayaran</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Metode Pembayaran</th>
                <th class="text-center">Jumlah Transaksi</th>
                <th class="text-right">Nominal Omset (Rp)</th>
                <th class="text-right">Kontribusi (%)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><span class="badge-cash">💵 Tunai (Cash)</span></td>
                <td class="text-center text-bold">{{ $paymentBreakdown['cash']['count'] }}</td>
                <td class="text-right text-bold">{{ $paymentBreakdown['cash']['revenue_formatted'] }}</td>
                <td class="text-right">{{ $paymentBreakdown['cash']['percentage'] }}%</td>
            </tr>
            <tr class="even">
                <td><span class="badge-qris">📱 QRIS Statis</span></td>
                <td class="text-center text-bold">{{ $paymentBreakdown['qris']['count'] }}</td>
                <td class="text-right text-bold">{{ $paymentBreakdown['qris']['revenue_formatted'] }}</td>
                <td class="text-right">{{ $paymentBreakdown['qris']['percentage'] }}%</td>
            </tr>
            <tr class="total-row">
                <td>TOTAL KESELURUHAN</td>
                <td class="text-center">{{ $paymentBreakdown['cash']['count'] + $paymentBreakdown['qris']['count'] }}</td>
                <td class="text-right">{{ $summary['total_revenue_formatted'] }}</td>
                <td class="text-right">100%</td>
            </tr>
        </tbody>
    </table>

    <!-- 3. Menu Terlaris (Best Seller) -->
    <div class="section-title">3. Performa Menu & Produk Terlaris</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 8%;">Rank</th>
                <th style="width: 42%;">Nama Menu</th>
                <th class="text-center" style="width: 20%;">Porsi/Cup Terjual</th>
                <th class="text-right" style="width: 30%;">Total Kontribusi Omset</th>
            </tr>
        </thead>
        <tbody>
            @forelse($topProducts as $index => $prod)
                <tr class="{{ $index % 2 === 1 ? 'even' : '' }}">
                    <td class="text-center text-bold">#{{ $index + 1 }}</td>
                    <td class="text-bold">{{ $prod['product_name'] }}</td>
                    <td class="text-center text-bold">{{ $prod['total_qty'] }} cup</td>
                    <td class="text-right text-bold">{{ $prod['total_sales_formatted'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="text-center" style="color: #7A6353; padding: 12px;">Tidak ada transaksi penjualan pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- 4. Riwayat Transaksi Pesanan (Sampel/Daftar) -->
    @if(isset($orders) && count($orders) > 0)
    <div class="section-title">4. Rekap Transaksi Pesanan ({{ count($orders) }} Pesanan)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 18%;">No. Nota</th>
                <th style="width: 16%;">Waktu</th>
                <th style="width: 18%;">Pelanggan</th>
                <th style="width: 13%;">Kasir</th>
                <th style="width: 12%;">Metode</th>
                <th class="text-right" style="width: 18%;">Total (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders->take(25) as $idx => $ord)
                <tr class="{{ $idx % 2 === 1 ? 'even' : '' }}">
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td class="text-bold">{{ $ord->order_number }}</td>
                    <td>{{ $ord->created_at->format('d/m/y H:i') }}</td>
                    <td>{{ $ord->customer?->name ?? 'Walk-in' }}</td>
                    <td>{{ $ord->cashier?->name ?? 'Kasir' }}</td>
                    <td style="text-transform: uppercase;">{{ $ord->payment_method }}</td>
                    <td class="text-right text-bold">Rp {{ number_format($ord->total_amount, 0, ',', '.') }}</td>
                </tr>
            @endforeach
            @if(count($orders) > 25)
                <tr>
                    <td colspan="7" class="text-center" style="font-style: italic; color: #7A6353; background-color: #FAF6F0;">
                        ... Menampilkan 25 dari {{ count($orders) }} pesanan. Untuk rekap lengkap silakan unduh format Excel. ...
                    </td>
                </tr>
            @endif
            <tr class="total-row">
                <td colspan="6" class="text-bold">TOTAL TRANSAKSI PERIODE INI</td>
                <td class="text-right text-bold">{{ $summary['total_revenue_formatted'] }}</td>
            </tr>
        </tbody>
    </table>
    @endif

    <!-- 5. Signatures / Pengesahan -->
    <table class="footer-table">
        <tr>
            <td class="signature-box">
                <p>Disiapkan Oleh:</p>
                <div class="signature-space"></div>
                <p style="font-weight: bold; text-decoration: underline;">( Kasir / Staff On Duty )</p>
                <p style="font-size: 8pt; color: #7A6353;">POS Cafe Artisan</p>
            </td>
            <td style="width: 10%;"></td>
            <td class="signature-box">
                <p>Disetujui & Diverifikasi:</p>
                <div class="signature-space"></div>
                <p style="font-weight: bold; text-decoration: underline;">( Manager / Outlet Owner )</p>
                <p style="font-size: 8pt; color: #7A6353;">POS Cafe Artisan Management</p>
            </td>
        </tr>
    </table>

    <div class="footer-note">
        Dokumen ini dihasilkan secara otomatis oleh Sistem POS Cafe Artisan pada {{ now()->format('d F Y, H:i:s') }} WIB.
    </div>

</body>
</html>
