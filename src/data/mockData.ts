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
    id: 'galon-19l',
    name: 'Galon 19 Liter',
    category: 'galon',
    badge: 'Best Seller',
    image: GALLON_IMAGE,
    description: 'Air mineral murni dalam kemasan galon standar, ideal untuk konsumsi keluarga harian.',
    capacity: '19 Liter',
    features: [
      'Kapasitas 19 Liter',
      'Tutup standar kedap udara',
      'Proses higienis terjamin',
      'Sterilisasi multi-tahap ozon & UV',
    ],
    priceDescription: 'Hubungi Admin untuk Harga',
    estimatedPrice: 18000,
    popular: true,
  },
  {
    id: 'dus-600ml',
    name: 'Air Dus (600ml)',
    category: 'dus',
    badge: 'Populer',
    image: BOX_IMAGE,
    description: 'Praktis dan mudah dibawa, pilihan tepat untuk acara, rapat, atau bepergian.',
    capacity: '600ml (24 Botol)',
    features: [
      'Isi 24 botol per dus',
      'Ukuran praktis 600ml',
      'Cocok untuk berbagai acara & kantor',
      'Botol ramah lingkungan & food-grade',
    ],
    priceDescription: 'Hubungi Admin untuk Harga',
    estimatedPrice: 48000,
    popular: true,
  },
  {
    id: 'dus-220ml',
    name: 'Air Kemasan Cup (220ml)',
    category: 'dus',
    badge: 'Ekonomis',
    image: BOX_IMAGE,
    description: 'Kemasan gelas/cup higienis dengan sedotan terpisah, sangat praktis untuk jamuan tamu dan hajatan.',
    capacity: '220ml (48 Cup)',
    features: [
      'Isi 48 cup per dus',
      'Segel higienis anti-bocor',
      'Termasuk sedotan higienis',
      'Cocok untuk konsumsi massal & pesta',
    ],
    priceDescription: 'Hubungi Admin untuk Harga',
    estimatedPrice: 32000,
  },
  {
    id: 'dus-330ml',
    name: 'Air Botol Mini (330ml)',
    category: 'dus',
    badge: 'Elegan',
    image: BOX_IMAGE,
    description: 'Ukuran mini premium yang elegan untuk meeting room direksi, seminar hotel, dan restoran.',
    capacity: '330ml (24 Botol)',
    features: [
      'Isi 24 botol per dus',
      'Desain botol ringkas & elegan',
      'Pas untuk sajian tamu VIP',
      'Standar kemasan premium',
    ],
    priceDescription: 'Hubungi Admin untuk Harga',
    estimatedPrice: 42000,
  },
  {
    id: 'dus-1500ml',
    name: 'Air Botol Jumbo (1500ml)',
    category: 'dus',
    badge: 'Keluarga',
    image: BOX_IMAGE,
    description: 'Botol ukuran besar untuk kebutuhan hidrasi maksimal saat piknik, perjalanan jauh, atau olahraga.',
    capacity: '1500ml (12 Botol)',
    features: [
      'Isi 12 botol per dus',
      'Kapasitas besar 1.5 Liter',
      'Pilihan ekonomis untuk bepergian',
      'Tutup segel ganda ekstra aman',
    ],
    priceDescription: 'Hubungi Admin untuk Harga',
    estimatedPrice: 52000,
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'pengiriman',
    question: 'Apakah Radar Mineral melayani pengiriman ke seluruh area Makassar?',
    answer: 'Ya, kami melayani pengiriman ke sebagian besar wilayah di Kota Makassar (Panakkukang, Rappocini, Tamalanrea, Biringkanaya, Ujung Pandang, Makassar, Mamajang, Mariso, Wajo, Bontoala, Tallo, Manggala, Tamalate). Untuk memastikan apakah alamat spesifik Anda terjangkau layanan antar gratis, silakan hubungi admin kami melalui WhatsApp.'
  },
  {
    id: 'faq-2',
    category: 'pemesanan',
    question: 'Berapa minimal pemesanan untuk layanan antar?',
    answer: 'Untuk menikmati layanan pesan antar langsung ke rumah Anda, minimal pemesanan adalah 2 galon (19L) atau 2 dus per titik pengiriman di area reguler Makassar.'
  },
  {
    id: 'faq-3',
    category: 'produk',
    question: 'Apakah ada biaya deposit untuk pelanggan baru?',
    answer: 'Bagi pelanggan baru yang belum memiliki galon kosong untuk ditukar, akan dikenakan biaya deposit sebesar Rp 40.000 per Galon 19L. Uang deposit ini dapat dikembalikan penuh jika Anda mengembalikan galon dalam kondisi baik saat berhenti berlangganan.'
  },
  {
    id: 'faq-4',
    category: 'pengiriman',
    question: 'Berapa lama waktu pengiriman setelah memesan?',
    answer: 'Pesanan yang dikonfirmasi sebelum jam 15:00 WITA akan dikirimkan pada hari yang sama. Untuk pesanan setelah jam tersebut, pengiriman akan dijadwalkan pada keesokan harinya (H+1) mulai pukul 08:00 WITA.'
  },
  {
    id: 'faq-5',
    category: 'pembayaran',
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer: 'Kami mendukung transaksi non-tunai demi kenyamanan Anda. Pembayaran dapat dilakukan via scan QRIS saat kurir tiba atau melalui Transfer Bank. Pembayaran tunai (COD) juga masih kami layani jika Anda menghendaki.'
  },
  {
    id: 'faq-6',
    category: 'pemesanan',
    question: 'Apakah melayani pesanan langganan rutin untuk kantor atau instansi?',
    answer: 'Tentu saja! Kami memiliki program langganan korporat & kantor dengan jadwal pengantaran terjadwal otomatis (misalnya setiap Senin & Kamis), faktur pajak resmi, dan harga khusus volume tinggi.'
  },
  {
    id: 'faq-7',
    category: 'produk',
    question: 'Bagaimana standar sterilisasi galon dan air di Radar Mineral?',
    answer: 'Setiap galon melewati 7 tahap pencucian dan sterilisasi bersuhu tinggi, pembilasan dengan air murni, ozonisasi, dan penyinaran sinar Ultra Violet (UV) sebelum pengisian otomatis tanpa kontak tangan manusia.'
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
