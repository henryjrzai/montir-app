## Instruksi
buatkan untuk mengimplementasikan penilaian rating dan ulasan terhadap bengkel dan montir
penilaian dan ulasan dapat diberikan oleh pelanggan setelah layanan selesai dan sudah membayar


berikut kode backend api untuk membuat ulasan di Laravel 12:
```php
    /*
    * Pelanggan : memberikan ulasan dan rating untuk bengkel dan montir
    * Endpoint : POST https://montir.tempakodedevelopment.my.id/api/order-layanan/ulasan/{orderLayananId}
     */
    public function berikanUlasanDanRating(Request $request, $orderLayananId)
    {
        $validasi = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'ulasan' => 'nullable|string|max:1000',
            'rating_montir' => 'required|integer|min:1|max:5',
            'ulasan_montir' => 'nullable|string|max:1000',
        ]);

        $orderLayanan = OrderLayanan::find($orderLayananId);
        if (!$orderLayanan) {
            return response()->json([
                'status' => false,
                'message' => 'Order layanan tidak ditemukan'
            ], 404);
        }

        try {
            $ulasanRating = UlasanRating::updateOrCreate(
                ['order_layanan_id' => $orderLayananId],
                [
                    'pelanggan_id' => $request->user()->id,
                    'bengkel_id' => $orderLayanan->layananBengkel->bengkel_id,
                    'rating' => $validasi['rating'],
                    'ulasan' => $validasi['ulasan'] ?? null,
                ]
            );

            $ulasanRatingMontir = \App\Models\UlasanRatingMontir::updateOrCreate(
                ['order_layanan_id' => $orderLayananId],
                [
                    'pelanggan_id' => $request->user()->id,
                    'montir_id' => $orderLayanan->montir_id,
                    'rating' => $validasi['rating_montir'],
                    'ulasan' => $validasi['ulasan_montir'] ?? null,
                ]
            );

            return response()->json([
                'status' => true,
                'message' => 'Ulasan dan rating berhasil disimpan',
                'data' => [
                    'bengkel' => $ulasanRating,
                    'montir' => $ulasanRatingMontir
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
```