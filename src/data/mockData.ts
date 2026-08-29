import { Product, FaqItem } from '../types';

export const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1Vq73aB9Q_-XdEv5q-YRv8lM0a7Xp8m0bOjElUW-h5Wpsk6nxRMKGL7P85X1aY5uNuwcwp0ZOex49fJsPeppprArKRhIFdwry5weVFo6cjd3y3gFASyHGvcr4PHHikOdlLIBoi73IR1okx4KA0-nacbS0iEhe8eJvPdReIPk8q0Ktt-JcRFYcEi7ZTeUfw-Ph0TQ0HFpLPpF48iogVZ4vylhaXD1R4q9cCLa1ZiO2kPXRYd__Xo-OFJUE8';

export const GALLON_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA34OJreaZvE10wieVICb1bNayLOes9DyRyRUVrnzTL8aHRSgSSY01JQr49eh_Hp1a7mZcXRVXXtt0EBj_sOrvyS309M3O1yXOx5tKFHTZVbYP85HBrsCKm3NKhaYGZ57WmDyJGv5-0QhAV9y23i0r0OThd4cGCzH6F5vWfHGn_OOLF51e-x7_5VGS-TyQjZ5mIwKhncwWYftzWMslkW6c-meKvi8iniM-YGF1hNqREfgVSG0LegqNH';

export const BOX_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiIjJC08yhMhzI51Ew6bID79AuWytQhm_vLcpbVjCo8QU1fjkF3c84hf76sjh6vDqNC5_YdPS5n5o-W9E18zMxPkDe_GroDMHlN9D4E9gySVfQuFhYJc8JPaVBtQGtrpL6Qasmwzh6-2zePs-wZyil67Lh8VBLJ8mG1lf7L8HJpDW-SbH0euLaa4ByfJlHKJulyxsWepOvWhEHvqPM5hNQjVg5AwZEK69AaSjmGr4BE2K_kCS-1OUi';

export const WHATSAPP_NUMBER = '6285787356573';
export const WHATSAPP_DISPLAY = '0857-8735-6573';
export const PHONE_DISPLAY = '0857-8735-6573';
export const EMAIL_DISPLAY = 'koperasi.radar@gmail.com';
export const MAPS_URL = 'https://maps.app.goo.gl/VMVXVYkGq37MtXzH9';
export const ADDRESS_DISPLAY = 'Dapoko, Ulugalung, Kec. Eremerasa, Kabupaten Bantaeng, Sulawesi Selatan';

export const PRODUCTS: Product[] = [
  {
    id: 'dus-220ml',
    name: 'Air Kemasan Cup (220ml)',
    category: 'dus',
    badge: 'B2B Grosir • Min. 10 Dus',
    image: BOX_IMAGE,
    description: 'Air mineral kemasan cup 220ml isi 48 cup per dus. Pilihan utama untuk toko bahan campuran, minimarket (Alfamart/Indomaret), dan toko grosir.',
    capacity: '220ml (48 Cup per Dus)',
    features: [
      'Isi 48 cup per dus (Kardus tebal)',
      'Minimal pemesanan (MOQ): 10 Dus',
      'Segel higienis anti-bocor & sedotan higienis',
      'Cocok untuk stok dagangan toko & minimarket',
    ],
    priceDescription: 'Hubungi Admin untuk Harga Grosir',
    estimatedPrice: 30000,
    popular: true,
    minOrder: 10,
  },
  {
    id: 'galon-19l',
    name: 'Air Galon 19 Liter',
    category: 'galon',
    badge: 'B2B Grosir • Min. 5 Galon',
    image: GALLON_IMAGE,
    description: 'Air mineral murni dalam kemasan galon 19L higienis. Pasokan rutin untuk toko kelontong, minimarket, pangkalan galon, dan usaha.',
    capacity: '19 Liter per Galon',
    features: [
      'Kapasitas 19 Liter standar',
      'Minimal pemesanan (MOQ): 5 Galon',
      'Tutup segel ganda higienis anti-bocor',
      'Layanan tukar galon kosong / beli galon baru',
    ],
    priceDescription: 'Hubungi Admin untuk Harga Grosir',
    estimatedPrice: 18000,
    popular: true,
    minOrder: 5,
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'pemesanan',
    question: 'Berapa batas minimal pemesanan (MOQ) untuk toko / pelanggan B2B?',
    answer: 'Sebagai penyedia air minum khusus B2B grosir, batas minimal pemesanan kami adalah: Minimal 10 Dus untuk Air Kemasan Cup 220ml (isi 48 cup) dan Minimal 5 Galon untuk Air Galon 19 Liter.'
  },
  {
    id: 'faq-2',
    category: 'pemesanan',
    question: 'Siapa saja pelanggan yang dilayani oleh Radar Mineral?',
    answer: 'Kami fokus melayani segmen B2B seperti toko bahan campuran, rantai minimarket (Alfamart, Indomaret), toko grosir sembako, warung kelontong, pangkalan air, serta kebutuhan operasional instansi dan usaha di Makassar.'
  },
  {
    id: 'faq-3',
    category: 'pengiriman',
    question: 'Apakah Radar Mineral melayani pengiriman langsung ke toko di seluruh Makassar?',
    answer: 'Ya, armada kurir internal kami siap mengantarkan pasokan air langsung ke lokasi toko Anda di seluruh kecamatan Kota Makassar (Panakkukang, Rappocini, Tamalanrea, Biringkanaya, Ujung Pandang, dan sekitarnya).'
  },
  {
    id: 'faq-4',
    category: 'pembayaran',
    question: 'Metode pembayaran apa saja yang tersedia untuk pesanan grosir?',
    answer: 'Kami menerima pembayaran via Scan QRIS saat kurir tiba di toko, Transfer Bank resmi (BCA, Mandiri, BRI), serta Tunai/COD saat barang diterima. Untuk pelanggan baru yang belum terverifikasi, diberlakukan pembayaran di muka atau DP.'
  },
  {
    id: 'faq-5',
    category: 'pembayaran',
    question: 'Apakah admin menyediakan nota / invoice untuk pembukuan toko?',
    answer: 'Tentu. Setiap pesanan dapat dicetak menjadi dokumen invoice resmi sederhana yang memuat rincian produk, kuantitas, harga, dan total belanja untuk memudahkan pencatatan pembukuan toko Anda.'
  },
  {
    id: 'faq-6',
    category: 'produk',
    question: 'Bagaimana ketentuan penukaran galon 19L untuk toko mitra baru?',
    answer: 'Untuk toko yang sudah memiliki galon kosong layak pakai, sistemnya adalah tukar galon kosong murni (hanya membayar isi ulang). Bagi toko yang baru membuka stok galon dan belum memiliki galon kosong, dikenakan biaya deposit/pembelian galon baru.'
  },
  {
    id: 'faq-7',
    category: 'pengiriman',
    question: 'Berapa lama estimasi waktu pengantaran armada ke toko?',
    answer: 'Pesanan yang masuk akan dijadwalkan oleh armada kami. Saat status pesanan berubah menjadi "Dikirim", admin akan menyertakan estimasi waktu tiba (ETA) yang dapat Anda pantau langsung dari menu pelacakan status pesanan.'
  }
];

export const MAKASSAR_DISTRICTS = [
  'Panakkukang',
  'Rappocini',
  'Tamalanrea',
  'Biringkanaya',
  'Ujung Pandang',
  'Makassar',
  'Mamajang',
  'Mariso',
  'Wajo',
  'Bontoala',
  'Tallo',
  'Manggala',
  'Tamalate'
];

