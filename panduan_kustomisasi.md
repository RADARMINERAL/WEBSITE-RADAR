# 🎨 Panduan Kustomisasi Website Radar Mineral

> Semua pengaturan utama website ada di **2 file saja**. Tidak perlu menyentuh file lain.

---

## 📁 File Utama yang Perlu Diubah

| File | Isi |
|------|-----|
| [`src/data/mockData.ts`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/src/data/mockData.ts) | Logo, foto produk, nomor WA, alamat, produk, FAQ, kecamatan |
| [`index.html`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/index.html) | Judul tab browser, deskripsi SEO, favicon |

---

## 1️⃣ Ganti Logo Website dari Laptop

Logo muncul di: Navbar, Header Admin, Footer, Kartu Invoice, dan Tab Favicon Browser.

### Cara Ganti:
1. Siapkan file logo Anda di laptop (format `.png`, `.svg`, atau `.jpg`).
2. Masukkan / Copy file tersebut ke folder:
   ```text
   public/images/
   ```
3. Jika nama filenya `logo.png` atau `logo.svg`, website akan otomatis menampilkannya!
4. Jika menggunakan nama file lain, buka [`src/data/mockData.ts`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/src/data/mockData.ts) baris 3:
   ```typescript
   export const LOGO_URL = '/images/nama_file_logo_anda.png';
   ```

> **Tips format**: Gunakan PNG transparan atau SVG ukuran **sekitar 300×80px** agar tampil jernih.

---

## 2️⃣ Ganti Foto Produk dari Laptop

Foto produk disimpan langsung di folder:
```text
public/images/
```

### Foto Galon 19 Liter
1. Masukkan foto galon Anda ke folder `public/images/galon.png` (atau `.jpg` / `.svg`).
2. Buka [`src/data/mockData.ts`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/src/data/mockData.ts) baris 4:
   ```typescript
   export const GALLON_IMAGE = '/images/galon.png'; // sesuaikan dengan nama file Anda
   ```

### Foto Dus / Air Kemasan Cup 220ml
1. Masukkan foto dus Anda ke folder `public/images/dus.png` (atau `.jpg` / `.svg`).
2. Buka [`src/data/mockData.ts`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/src/data/mockData.ts) baris 5:
   ```typescript
   export const BOX_IMAGE = '/images/dus.png'; // sesuaikan dengan nama file Anda
   ```

> **Tips**: Foto produk idealnya **persegi (1:1)**, ukuran minimal **600×600px**, background putih/transparan.

---

## 3️⃣ Ganti Nomor WhatsApp & Kontak

**File:** [`src/data/mockData.ts`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/src/data/mockData.ts) → **baris 9–14**

```typescript
// Nomor WA tanpa tanda + dan spasi (kode negara 62)
export const WHATSAPP_NUMBER = '6285787356573';   // ← ganti ini

// Tampilan nomor di website (bisa dengan tanda -)
export const WHATSAPP_DISPLAY = '0857-8735-6573'; // ← ganti ini

// Nomor telepon yang tampil di halaman Kontak
export const PHONE_DISPLAY = '0857-8735-6573';    // ← ganti ini

// Email kontak
export const EMAIL_DISPLAY = 'koperasi.radar@gmail.com'; // ← ganti ini

// Link Google Maps lokasi (klik kanan di Google Maps → "Share" → salin link)
export const MAPS_URL = 'https://maps.app.goo.gl/VMVXVYkGq37MtXzH9'; // ← ganti ini

// Alamat lengkap yang tampil di website
export const ADDRESS_DISPLAY = 'Dapoko, Ulugalung, Kec. Eremerasa, Kabupaten Bantaeng, Sulawesi Selatan'; // ← ganti ini
```

---

## 4️⃣ Ubah Info Produk (Nama, Harga, Deskripsi, Fitur)

**File:** [`src/data/mockData.ts`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/src/data/mockData.ts) → **baris 16–55**

### Contoh: Produk Galon 19 Liter (baris 36–54)

```typescript
{
  id: 'galon-19l',
  name: 'Air Galon 19 Liter',          // ← Nama produk
  category: 'galon',
  badge: 'B2B Grosir • Min. 5 Galon',  // ← Label badge
  image: GALLON_IMAGE,                  // ← Foto (sudah diubah di Langkah 2)
  description: 'Deskripsi produk...',   // ← Deskripsi panjang
  capacity: '19 Liter per Galon',       // ← Kapasitas
  features: [
    'Kapasitas 19 Liter standar',        // ← Fitur 1
    'Minimal pemesanan (MOQ): 5 Galon', // ← Fitur 2 (ubah angka MOQ di sini)
    'Tutup segel ganda higienis',        // ← Fitur 3
    'Layanan tukar galon kosong',        // ← Fitur 4
  ],
  priceDescription: 'Rp18.000 / galon', // ← Teks harga yang tampil
  estimatedPrice: 18000,                 // ← Harga dalam angka (untuk kalkulasi total)
  popular: true,                         // ← true = tampil badge "Terlaris"
  minOrder: 5,                           // ← Minimum order (MOQ)
},
```

---

## 5️⃣ Ubah FAQ (Pusat Bantuan)

**File:** [`src/data/mockData.ts`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/src/data/mockData.ts) → **baris 57–100**

```typescript
{
  id: 'faq-1',
  category: 'pemesanan',    // Kategori: 'pemesanan' | 'pengiriman' | 'pembayaran' | 'produk'
  question: 'Pertanyaan yang sering ditanyakan?',  // ← Ganti pertanyaan
  answer: 'Jawaban lengkap di sini.'               // ← Ganti jawaban
},
```

> Untuk **menambah FAQ baru**, copy satu blok `{ id: ... }` dan tambahkan di bawahnya. Pastikan `id` unik (misal: `'faq-8'`).

---

## 6️⃣ Ubah Daftar Kecamatan

Kecamatan muncul di dropdown form pemesanan pelanggan.

**File:** [`src/data/mockData.ts`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/src/data/mockData.ts) → **baris 102–116**

```typescript
export const MAKASSAR_DISTRICTS = [
  'Panakkukang',
  'Rappocini',
  'Tamalanrea',
  // ← tambah atau hapus kecamatan sesuai area layanan Anda
  'Bantaeng',
  'Bulukumba',
];
```

---

## 7️⃣ Ubah Judul & Deskripsi di Tab Browser (SEO)

**File:** [`index.html`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/index.html) → **baris 6–7**

```html
<!-- Judul yang tampil di tab browser & hasil Google Search -->
<title>Radar Mineral - Air Minum Murni & Terpercaya Makassar</title>

<!-- Deskripsi yang tampil di hasil Google Search -->
<meta name="description" content="Layanan pesan antar galon 19L dan air minum kemasan..." />
```

---

## 8️⃣ Ganti Favicon (ikon kecil di tab browser)

**File:** [`index.html`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/index.html) → **baris 11**

```html
<!-- Menggunakan logo lokal: -->
<link rel="icon" type="image/svg+xml" href="/images/logo.svg" />
<!-- Atau jika Anda punya favicon.ico / favicon.png di folder public: -->
<link rel="icon" type="image/png" href="/images/logo.png" />
```

> Simpan file gambar di folder `/public/images/` project ini. Ukuran ideal: **32×32px** atau **64×64px**.

---

## 9️⃣ Ubah URL Laporan Google Sheet (Admin Dashboard)

**File:** [`src/components/admin/AdminDashboard.tsx`](file:///Users/fajrinfaturrahman/Documents/RADAR%20MINERAL/src/components/admin/AdminDashboard.tsx) → **baris 42**

```typescript
// Ganti dengan URL Google Sheet laporan pesanan Anda:
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/ID_SHEET_ANDA/edit';
```

---

## 🔄 Setelah Mengubah File

Setiap kali selesai mengedit, jalankan di terminal:

```bash
# Preview perubahan secara lokal:
npm run dev

# Upload ke server (Cloudflare Pages / Netlify):
git add -A
git commit -m "kustomisasi: update logo, foto produk, kontak"
git push origin main
```

---

## 📋 Ringkasan Lokasi Semua Kustomisasi

| Yang Ingin Diubah | File | Baris |
|-------------------|------|-------|
| 🖼️ Logo website | `mockData.ts` | 3 |
| 🪣 Foto galon 19L | `mockData.ts` | 5 |
| 📦 Foto dus/cup 220ml | `mockData.ts` | 7 |
| 📱 Nomor WhatsApp | `mockData.ts` | 9–10 |
| 📞 Nomor telepon | `mockData.ts` | 11 |
| 📧 Email kontak | `mockData.ts` | 12 |
| 📍 Link Google Maps | `mockData.ts` | 13 |
| 🏠 Alamat lengkap | `mockData.ts` | 14 |
| 🛒 Info produk & harga | `mockData.ts` | 16–55 |
| ❓ FAQ Pusat Bantuan | `mockData.ts` | 57–100 |
| 🗺️ Daftar kecamatan | `mockData.ts` | 102–116 |
| 🔖 Judul tab browser | `index.html` | 6 |
| 📝 Deskripsi SEO | `index.html` | 7 |
| 🔴 Favicon (ikon tab) | `index.html` | 11 |
| 📊 URL Google Sheet | `AdminDashboard.tsx` | 42 |
