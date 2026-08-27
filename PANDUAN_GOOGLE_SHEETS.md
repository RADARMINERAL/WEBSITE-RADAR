# Panduan Lengkap: Integrasi Pesanan Radar Mineral ke Google Sheets

File ini menjelaskan cara menghubungkan formulir pemesanan website **Radar Mineral** ke **Google Spreadsheet** secara otomatis, gratis, dan real-time.

---

## 📋 Langkah 1: Buat Google Spreadsheet Baru

1. Buka browser dan kunjungi [Google Sheets](https://sheets.new).
2. Beri nama spreadsheet Anda, misalnya: `Database Pesanan - Radar Mineral`.
3. Pada **Sheet1 / Lembar 1**, isi header kolom pada **Baris 1 (A1 s/d K1)** sebagai berikut:

| Kolom | Nama Header | Keterangan |
| :--- | :--- | :--- |
| **A1** | **Waktu Pemesanan** | Tanggal & jam WITA (Contoh: `2026-08-28 14:30:00`) |
| **B1** | **Kode Pesanan** | Nomor unik pesanan (Contoh: `RDR-849201`) |
| **C1** | **Nama Pelanggan** | Nama lengkap pemesan |
| **D1** | **No. WhatsApp** | Nomor kontak pemesan (Format `08xxx`) |
| **E1** | **Kecamatan** | Area kecamatan di Makassar |
| **F1** | **Alamat Pengiriman** | Alamat lengkap dan patokan rumah/kantor |
| **G1** | **Rincian Produk** | Daftar produk yang dipesan (Contoh: `2x Galon 19 Liter (Tukar Galon)`) |
| **H1** | **Total Harga (Rp)** | Total nominal yang harus dibayar |
| **I1** | **Metode Bayar** | QRIS / TRANSFER / COD |
| **J1** | **Status Pembayaran** | `Belum Dibayar` / `Bayar di Tempat (COD)` / `Sudah Dibayar` |
| **K1** | **Catatan Pesanan** | Catatan khusus dari pembeli |

---

## ⚙️ Langkah 2: Pasang Google Apps Script

1. Di Google Sheets Anda, klik menu bar atas: **Ekstensi (Extensions)** > **Apps Script**.
2. Hapus seluruh isi kode bawaan (`myFunction`), lalu **copy-paste seluruh isi file [google-apps-script.js](file:///Users/fajrinfaturrahman/Downloads/RADAR%20MINERAL/google-apps-script.js)** yang sudah disediakan di folder proyek ini.
3. Klik ikon **Simpan (Save / 💾)** di bagian atas editor Apps Script.

---

## 🚀 Langkah 3: Deploy (Terapkan) sebagai Web App

1. Klik tombol **Deploy (Terapkan)** berwarna biru di pojok kanan atas > pilih **New deployment (Penerapan baru)**.
2. Klik ikon gerigi ⚙️ di samping *Select type* > pilih **Web app (Aplikasi Web)**.
3. Konfigurasikan opsi berikut:
   * **Description**: `Radar Mineral Order Endpoint`
   * **Execute as (Jalankan sebagai)**: `Me / Saya (email@gmail.com)`
   * **Who has access (Siapa yang memiliki akses)**: `Anyone (Siapa saja)` *(Sangat penting agar website dapat mengirim data tanpa perlu login akun Google)*.
4. Klik tombol **Deploy (Terapkan)**.
5. Jika muncul jendela otorisasi (*Authorization required*):
   * Klik **Authorize access**.
   * Pilih akun Google Anda.
   * Klik **Advanced (Lanjutan)** di bagian kiri bawah > klik **Go to Untitled project (unsafe) / Buka proyek (tidak aman)**.
   * Klik **Allow (Izinkan)**.
6. Salin URL yang dihasilkan di bagian **Web app URL** (berformat: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔑 Langkah 4: Masukkan URL ke File `.env` Website

1. Buka file `.env` di folder utama website Anda (atau buat baru jika belum ada).
2. Tambahkan baris berikut:

```env
VITE_GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/AKfycb.../exec"
```
*(Ganti URL di atas dengan Web App URL yang Anda salin dari Langkah 3)*.

3. Jalankan/restart website Anda (`npm run dev`).

---

## 💡 Tips Tambahan untuk Admin (Fitur Dropdown Status Pembayaran)

Agar Google Sheet Anda rapi dan mudah digunakan oleh tim operasional:

1. Blok seluruh kolom **J (Status Pembayaran)** mulai dari baris `J2` ke bawah.
2. Klik menu **Data** > **Validasi Data (Data validation)** > **Add rule (Tambah aturan)**.
3. Pilih kriteria: **Dropdown (Menu drop-down)**.
4. Masukkan opsi status:
   * 🔴 `Belum Dibayar`
   * 🟡 `Menunggu Konfirmasi Transfer`
   * 🟢 `Sudah Dibayar / Lunas`
   * 🔵 `Bayar di Tempat (COD)`
5. Klik **Done (Selesai)**. Sekarang admin bisa mengubah status pembayaran hanya dengan 1 klik saat kurir mengonfirmasi penerimaan uang atau scan QRIS!
