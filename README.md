## wms Frontend | Oviek Shagya Ghinulur


## Requirements
- Backend: https://github.com/oviekshgya/wms-backend
- Node.js >= 18


## Running 

```bash
$ npm install
$ npm run dev
```


## Soal

	1. WMS -> solusi untuk membantu mengetahui produk low stok:

	Tambahkan atribut min_stock per item. Buat scheduler (php artisan schedule:run) yang setiap hari memeriksa items dengan stok <= min_stock. Hasil dikirim via email/Slack atau ditampilkan di dashboard sebagai daftar low stock. Tampilkan juga lead time dan supplier rekomendasi. Untuk prioritas, urutkan berdasarkan turnover rate (how fast item keluar).

	2. Cara membuat automasi penetapan minimum stok yang baik:

	Gunakan metode berbasis historis dan lead time:
	Reorder Point = (Avg Daily Demand * Lead Time) + Safety Stock.
	Hitung Avg Daily Demand dari data transaksi (misal 90 hari terakhir). Estimasi lead time dari supplier. Safety stock dihitung menggunakan deviasi permintaan selama lead time dikali faktor z (service level). Untuk implementasi cepat, sediakan opsi rule-based: (min_stock = max( fixed_min, ceil(avg_weekly_demand * lead_time * factor) )). Update perhitungan setiap bulan.

	3. Bagaimana sistem memprediksi kebutuhan pengeluaran bulanan per produk

	Gunakan time-series forecasting (Prophet, SARIMA, atau Eksponensial Smoothing) pada data historis keluaran per produk untuk memprediksi quantity bulanan. Kalikan prediksi quantity dengan harga rata-rata per unit (dari purchase history) -> estimasi pengeluaran. Untuk implementasi MVP, gunakan moving average 3–6 bulan dikalikan faktor musiman. Simpan confidence interval untuk mengukur risiko stokout atau overstock.
