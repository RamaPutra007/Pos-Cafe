<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StockMovement;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExcelReportService
{
    /**
     * Generate and stream a beautifully styled Excel report for POS Cafe.
     */
    public function export(Carbon $start, Carbon $end, string $periodLabel): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;

        // Brand colors (Theme: Artisan Coffee)
        $primaryBrown = '5A3726'; // Dark Coffee
        $secondaryBrown = '7A4B2F'; // Medium Coffee
        $accentCream = 'F7F2EB'; // Light Cream
        $softGreen = 'EAF7ED';
        $darkText = '24140E';

        // 1. SHEET 1: RINGKASAN & KPI
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Ringkasan Finansial');
        $sheet1->setShowGridLines(true);

        // Header Title
        $sheet1->setCellValue('B2', 'POS CAFE ARTISAN');
        $sheet1->getStyle('B2')->getFont()->setSize(18)->setBold(true)->getColor()->setRGB($primaryBrown);

        $sheet1->setCellValue('B3', 'Laporan Kinerja Penjualan & Finansial');
        $sheet1->getStyle('B3')->getFont()->setSize(12)->setItalic(true)->getColor()->setRGB($secondaryBrown);

        $sheet1->setCellValue('B4', 'Periode: '.$periodLabel);
        $sheet1->setCellValue('B5', 'Dicetak pada: '.Carbon::now()->format('d/m/Y H:i:s'));
        $sheet1->getStyle('B4:B5')->getFont()->setSize(10)->getColor()->setRGB('7A6353');

        // Fetch Data
        $orders = Order::where('status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->with(['items.product', 'customer', 'cashier', 'payment'])
            ->get();

        $totalRevenue = (float) $orders->sum('total_amount');
        $totalOrders = $orders->count();

        $totalCogs = (float) OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', [$start, $end]);
        })->selectRaw('SUM(cost_price * quantity) as cogs')->value('cogs') ?? 0;

        $grossProfit = max(0, $totalRevenue - $totalCogs);
        $totalItemsSold = (int) OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', [$start, $end]);
        })->sum('quantity');

        // KPI Box Grid
        $sheet1->setCellValue('B7', 'METRIK UTAMA');
        $sheet1->setCellValue('C7', 'NILAI');
        $sheet1->setCellValue('D7', 'KETERANGAN');
        $sheet1->getStyle('B7:D7')->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet1->getStyle('B7:D7')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($primaryBrown);

        $kpiData = [
            ['Total Omset Penjualan', $totalRevenue, 'Total nominal transaksi berstatus PAID'],
            ['Total Harga Pokok (HPP)', $totalCogs, 'Akumulasi biaya modal produk terjual'],
            ['Estimasi Laba Kotor', $grossProfit, 'Omset Penjualan dikurangi HPP'],
            ['Total Transaksi Pesanan', $totalOrders, 'Jumlah pesanan selesai diproses'],
            ['Total Produk/Cup Terjual', $totalItemsSold, 'Akumulasi porsi/cup menu terjual'],
        ];

        $row = 8;
        foreach ($kpiData as $kpi) {
            $sheet1->setCellValue('B'.$row, $kpi[0]);
            $sheet1->setCellValue('C'.$row, $kpi[1]);
            $sheet1->setCellValue('D'.$row, $kpi[2]);

            // Formatting
            if (is_numeric($kpi[1]) && in_array($kpi[0], ['Total Omset Penjualan', 'Total Harga Pokok (HPP)', 'Estimasi Laba Kotor'])) {
                $sheet1->getStyle('C'.$row)->getNumberFormat()->setFormatCode('"Rp "#,##0');
            } elseif ($kpi[0] === 'Total Transaksi Pesanan') {
                $sheet1->getStyle('C'.$row)->getNumberFormat()->setFormatCode('#,##0" pesanan"');
            } else {
                $sheet1->getStyle('C'.$row)->getNumberFormat()->setFormatCode('#,##0" item"');
            }

            $sheet1->getStyle('B'.$row.':D'.$row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($row % 2 === 0 ? 'FFFFFF' : $accentCream);
            $sheet1->getStyle('B'.$row)->getFont()->setBold(true);
            $sheet1->getStyle('C'.$row)->getFont()->setBold(true);
            $row++;
        }

        // Border for KPI Table
        $sheet1->getStyle('B7:D'.($row - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('D5C2B1');

        // Payment Breakdown Table
        $row += 2;
        $sheet1->setCellValue('B'.$row, 'METODE PEMBAYARAN');
        $sheet1->setCellValue('C'.$row, 'JUMLAH TRANSAKSI');
        $sheet1->setCellValue('D'.$row, 'TOTAL NOMINAL (RP)');
        $sheet1->setCellValue('E'.$row, 'KONTRIBUSI (%)');
        $sheet1->getStyle('B'.$row.':E'.$row)->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet1->getStyle('B'.$row.':E'.$row)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($secondaryBrown);

        $cashOrders = $orders->where('payment_method', 'cash');
        $qrisOrders = $orders->where('payment_method', 'qris');

        $cashRev = (float) $cashOrders->sum('total_amount');
        $qrisRev = (float) $qrisOrders->sum('total_amount');

        $pRowStart = $row + 1;
        $sheet1->setCellValue('B'.$pRowStart, 'Tunai (Cash)');
        $sheet1->setCellValue('C'.$pRowStart, $cashOrders->count());
        $sheet1->setCellValue('D'.$pRowStart, $cashRev);
        $sheet1->setCellValue('E'.$pRowStart, $totalRevenue > 0 ? ($cashRev / $totalRevenue) : 0);

        $sheet1->setCellValue('B'.($pRowStart + 1), 'QRIS Statis');
        $sheet1->setCellValue('C'.($pRowStart + 1), $qrisOrders->count());
        $sheet1->setCellValue('D'.($pRowStart + 1), $qrisRev);
        $sheet1->setCellValue('E'.($pRowStart + 1), $totalRevenue > 0 ? ($qrisRev / $totalRevenue) : 0);

        $sheet1->getStyle('D'.$pRowStart.':D'.($pRowStart + 1))->getNumberFormat()->setFormatCode('"Rp "#,##0');
        $sheet1->getStyle('E'.$pRowStart.':E'.($pRowStart + 1))->getNumberFormat()->setFormatCode('0.0%');
        $sheet1->getStyle('B'.$row.':E'.($pRowStart + 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('D5C2B1');

        // Autofit columns Sheet 1
        foreach (range('B', 'E') as $col) {
            $sheet1->getColumnDimension($col)->setAutoSize(true);
        }

        // 2. SHEET 2: RINCIAN PESANAN (ORDERS)
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Rincian Pesanan');
        $sheet2->setShowGridLines(true);

        $sheet2->setCellValue('A1', 'RINCIAN TRANSAKSI PESANAN POS CAFE');
        $sheet2->getStyle('A1')->getFont()->setSize(14)->setBold(true)->getColor()->setRGB($primaryBrown);
        $sheet2->setCellValue('A2', 'Periode: '.$periodLabel);

        $headers2 = ['No', 'No. Pesanan', 'Waktu Transaksi', 'Pelanggan', 'Kasir', 'Rincian Item', 'Subtotal', 'Diskon', 'PPN (10%)', 'Total Tagihan', 'Metode Bayar', 'Status'];
        $colIdx = 'A';
        foreach ($headers2 as $h) {
            $sheet2->setCellValue($colIdx.'4', $h);
            $colIdx++;
        }
        $lastCol2 = chr(ord('A') + count($headers2) - 1);
        $sheet2->getStyle("A4:{$lastCol2}4")->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet2->getStyle("A4:{$lastCol2}4")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($primaryBrown);

        $oRow = 5;
        $num = 1;
        foreach ($orders as $order) {
            $itemsSummary = $order->items->map(fn ($it) => "{$it->quantity}x {$it->product_name}")->implode(', ');

            $sheet2->setCellValue('A'.$oRow, $num);
            $sheet2->setCellValue('B'.$oRow, $order->order_number);
            $sheet2->setCellValue('C'.$oRow, $order->created_at->format('d/m/Y H:i'));
            $sheet2->setCellValue('D'.$oRow, $order->customer?->name ?? 'Pelanggan Umum');
            $sheet2->setCellValue('E'.$oRow, $order->cashier?->name ?? 'Kasir');
            $sheet2->setCellValue('F'.$oRow, $itemsSummary);
            $sheet2->setCellValue('G'.$oRow, (float) $order->subtotal);
            $sheet2->setCellValue('H'.$oRow, (float) $order->discount_amount);
            $sheet2->setCellValue('I'.$oRow, (float) $order->tax_amount);
            $sheet2->setCellValue('J'.$oRow, (float) $order->total_amount);
            $sheet2->setCellValue('K'.$oRow, strtoupper($order->payment_method));
            $sheet2->setCellValue('L'.$oRow, strtoupper($order->status));

            $sheet2->getStyle("G{$oRow}:J{$oRow}")->getNumberFormat()->setFormatCode('"Rp "#,##0');
            $sheet2->getStyle("A{$oRow}:{$lastCol2}{$oRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($num % 2 === 0 ? 'FFFFFF' : $accentCream);

            $oRow++;
            $num++;
        }

        // Totals Row Sheet 2
        if ($oRow > 5) {
            $sheet2->setCellValue('F'.$oRow, 'TOTAL KESELURUHAN');
            $sheet2->setCellValue('G'.$oRow, '=SUM(G5:G'.($oRow - 1).')');
            $sheet2->setCellValue('H'.$oRow, '=SUM(H5:H'.($oRow - 1).')');
            $sheet2->setCellValue('I'.$oRow, '=SUM(I5:I'.($oRow - 1).')');
            $sheet2->setCellValue('J'.$oRow, '=SUM(J5:J'.($oRow - 1).')');

            $sheet2->getStyle("F{$oRow}:J{$oRow}")->getFont()->setBold(true);
            $sheet2->getStyle("G{$oRow}:J{$oRow}")->getNumberFormat()->setFormatCode('"Rp "#,##0');
            $sheet2->getStyle("A{$oRow}:{$lastCol2}{$oRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('EADCCE');
        }

        $sheet2->getStyle("A4:{$lastCol2}".($oRow > 5 ? $oRow : 5))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('D5C2B1');

        foreach (range('A', $lastCol2) as $col) {
            $sheet2->getColumnDimension($col)->setAutoSize(true);
        }

        // 3. SHEET 3: PENJUALAN PRODUK (MENU TERLARIS)
        $sheet3 = $spreadsheet->createSheet();
        $sheet3->setTitle('Penjualan Menu');
        $sheet3->setShowGridLines(true);

        $sheet3->setCellValue('A1', 'PERFORMA PENJUALAN MENU & PRODUK');
        $sheet3->getStyle('A1')->getFont()->setSize(14)->setBold(true)->getColor()->setRGB($primaryBrown);

        $headers3 = ['Peringkat', 'Nama Menu', 'Kategori', 'Harga Modal (HPP)', 'Harga Jual', 'Margin / Unit', 'Total Terjual', 'Total Omset', 'Total Laba Kotor'];
        $colIdx = 'A';
        foreach ($headers3 as $h) {
            $sheet3->setCellValue($colIdx.'3', $h);
            $colIdx++;
        }
        $lastCol3 = chr(ord('A') + count($headers3) - 1);
        $sheet3->getStyle("A3:{$lastCol3}3")->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet3->getStyle("A3:{$lastCol3}3")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($secondaryBrown);

        $topItems = OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('status', 'paid')->whereBetween('created_at', [$start, $end]);
        })
            ->with('product.category')
            ->selectRaw('product_id, product_name, AVG(cost_price) as avg_cost, AVG(price) as avg_price, SUM(quantity) as qty, SUM(subtotal) as sales')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('qty')
            ->get();

        $pRow = 4;
        $rank = 1;
        foreach ($topItems as $item) {
            $cost = (float) $item->avg_cost;
            $price = (float) $item->avg_price;
            $margin = max(0, $price - $cost);
            $qty = (int) $item->qty;
            $sales = (float) $item->sales;
            $gross = $sales - ($cost * $qty);

            $sheet3->setCellValue('A'.$pRow, '#'.$rank);
            $sheet3->setCellValue('B'.$pRow, $item->product_name);
            $sheet3->setCellValue('C'.$pRow, $item->product?->category?->name ?? 'Menu');
            $sheet3->setCellValue('D'.$pRow, $cost);
            $sheet3->setCellValue('E'.$pRow, $price);
            $sheet3->setCellValue('F'.$pRow, $margin);
            $sheet3->setCellValue('G'.$pRow, $qty);
            $sheet3->setCellValue('H'.$pRow, $sales);
            $sheet3->setCellValue('I'.$pRow, $gross);

            $sheet3->getStyle("D{$pRow}:F{$pRow}")->getNumberFormat()->setFormatCode('"Rp "#,##0');
            $sheet3->getStyle("G{$pRow}")->getNumberFormat()->setFormatCode('#,##0" cup/pcs"');
            $sheet3->getStyle("H{$pRow}:I{$pRow}")->getNumberFormat()->setFormatCode('"Rp "#,##0');
            $sheet3->getStyle("A{$pRow}:{$lastCol3}{$pRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($rank % 2 === 0 ? 'FFFFFF' : $accentCream);

            $pRow++;
            $rank++;
        }

        $sheet3->getStyle("A3:{$lastCol3}".($pRow - 1))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('D5C2B1');

        foreach (range('A', $lastCol3) as $col) {
            $sheet3->getColumnDimension($col)->setAutoSize(true);
        }

        // 4. SHEET 4: LOG MUTASI STOK
        $sheet4 = $spreadsheet->createSheet();
        $sheet4->setTitle('Pergerakan Stok');
        $sheet4->setShowGridLines(true);

        $sheet4->setCellValue('A1', 'LOG RIWAYAT MUTASI & PERGERAKAN STOK');
        $sheet4->getStyle('A1')->getFont()->setSize(14)->setBold(true)->getColor()->setRGB($primaryBrown);

        $headers4 = ['No', 'Waktu Mutasi', 'Nama Produk', 'SKU', 'No. Batch', 'Tipe Mutasi', 'Jumlah', 'Sisa Saldo', 'Pencatat', 'Keterangan'];
        $colIdx = 'A';
        foreach ($headers4 as $h) {
            $sheet4->setCellValue($colIdx.'3', $h);
            $colIdx++;
        }
        $lastCol4 = chr(ord('A') + count($headers4) - 1);
        $sheet4->getStyle("A3:{$lastCol4}3")->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet4->getStyle("A3:{$lastCol4}3")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($primaryBrown);

        $movements = StockMovement::whereBetween('created_at', [$start, $end])
            ->with(['product', 'batch', 'user'])
            ->latest()
            ->get();

        $mRow = 4;
        $mNum = 1;
        foreach ($movements as $m) {
            $sheet4->setCellValue('A'.$mRow, $mNum);
            $sheet4->setCellValue('B'.$mRow, $m->created_at->format('d/m/Y H:i'));
            $sheet4->setCellValue('C'.$mRow, $m->product?->name ?? 'Item');
            $sheet4->setCellValue('D'.$mRow, $m->product?->sku ?? '-');
            $sheet4->setCellValue('E'.$mRow, $m->batch?->batch_number ?? '-');
            $sheet4->setCellValue('F'.$mRow, $m->type);
            $sheet4->setCellValue('G'.$mRow, ($m->type === 'IN' ? '+' : '-').$m->quantity.' '.($m->product?->unit ?? 'unit'));
            $sheet4->setCellValue('H'.$mRow, $m->balance_after.' '.($m->product?->unit ?? 'unit'));
            $sheet4->setCellValue('I'.$mRow, $m->user?->name ?? 'Sistem');
            $sheet4->setCellValue('J'.$mRow, $m->notes ?? '-');

            $sheet4->getStyle("A{$mRow}:{$lastCol4}{$mRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($mNum % 2 === 0 ? 'FFFFFF' : $accentCream);

            $mRow++;
            $mNum++;
        }

        $sheet4->getStyle("A3:{$lastCol4}".($mRow > 4 ? $mRow - 1 : 4))->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('D5C2B1');

        foreach (range('A', $lastCol4) as $col) {
            $sheet4->getColumnDimension($col)->setAutoSize(true);
        }

        // Set active to Sheet 1
        $spreadsheet->setActiveSheetIndex(0);

        // Stream output as .xlsx file
        $fileName = 'Laporan_POS_Cafe_'.Carbon::now()->format('Ymd_His').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
