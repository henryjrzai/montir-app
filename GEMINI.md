## Instruksi
buatkan saya implementasi pembayaran menggunakan Midtrans di framework Laravel 12. 

berikut kode pembayaran menggunakan Midtrans di Laravel 12:
```php
<?php

namespace App\Http\Controllers;

use App\Models\ItemService;
use App\Models\OrderLayanan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Midtrans\Snap;
use Midtrans\Config;
use Midtrans\Notification;

class PembayaranController extends Controller
{
    /**
     * Mengatur konfigurasi Midtrans saat controller diinisiasi.
     * Route::post('/payment/create', [PembayaranController::class, 'createTransaction'])->middleware('auth:sanctum');
     */
    public function __construct()
    {
        // Set konfigurasi Midtrans
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Membuat transaksi pembayaran Midtrans.
     * Endpoint ini akan dipanggil oleh React Native.
     */
    public function createTransaction(Request $request)
    {
        // Validasi request, pastikan order_id ada
        $request->validate([
            'kode_order' => 'required|exists:order_layanan,kode_order',
        ]);

        // mengambil data order berdasarkan kode_order
        $order = OrderLayanan::with('pelanggan')->where('kode_order', $request->kode_order)->first();

        // melakukan pemeriksaaan apakah order milik user yang sedang login
        if ($order->pelanggan_id !== Auth::id()) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // jika order memiliki snap token dan statusnya pending makan akan mengembalikan token yang sudah ada
        if ($order->snap_token && $order->payment_status == 'pending') {
            return response()->json([
                'status' => true,
                'message' => 'Token sudah ada, gunakan token ini.',
                'data' => [
                    'snap_token' => $order->snap_token,
                    'message' => 'Token sudah ada, gunakan token ini.'
                ]
            ]);
        }

        // menghitung total pembayaran
        $totalHargaItem = ItemService::where('kode_order', $order->kode_order)->sum('harga') ?: 0;
        $grossAmount = $order->harga_layanan + $totalHargaItem;

        // menyiapkan parameter untuk Midtrans
        $params = [
            'transaction_details' => [
                'order_id' => $order->kode_order,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $order->pelanggan->nama,
                'email' => $order->pelanggan->email,
                'phone' => $order->pelanggan->no_telp,
                'address' => $order->pelanggan->alamat,
            ],
        ];

        try {
            // mengambil snap token dari Midtrans
            $snapToken = Snap::getSnapToken($params);

            // menyimpan snap token dan mengubah status pembayaran di database
            $order->snap_token = $snapToken;
            $order->status_pembayaran = 'pending';
            $order->save();

            // mengembalikan response dengan snap token
            return response()->json([
                'status' => true,
                'message' => 'Token berhasil dibuat.',
                'data' => [
                    'snap_token' => $snapToken,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menangani notifikasi (webhook) dari Midtrans.
     * Endpoint ini akan dipanggil oleh SERVER MIDTRANS.
     * Route::post('/payment/notification', [PembayaranController::class, 'notificationHandler']);
     */
    public function notificationHandler(Request $request)
    {
        try {
            // membuat instance Notification dari Midtrans
            $notif = new Notification();

            // mengambil order id dari notifikasi
            $order = OrderLayanan::where('kode_order', $notif->order_id)->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // melakukan pengecekan status transaksi dan memperbarui status pembayaran di database
            if ($notif->transaction_status == 'settlement') {
                $order->status_pembayaran = 'paid';
                $order->save();
            } elseif ($notif->transaction_status == 'expire') {
                $order->status_pembayaran = 'expired';
                $order->save();
            } elseif ($notif->transaction_status == 'cancel' || $notif->transaction_status == 'deny' || $notif->transaction_status == 'failure') {
                // Jika status 'cancel', 'deny', atau 'failure', pembayaran gagal
                $order->status_pembayaran = 'failed';
                $order->save();
            }

            // mengirimkan response sukses ke Midtrans
            return response()->json(['message' => 'Notifikasi berhasil diproses'], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
```