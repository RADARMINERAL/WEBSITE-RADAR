export type PageTab = 'beranda' | 'produk' | 'cara-pesan' | 'tentang-kami' | 'faq' | 'kontak';

export interface Product {
  id: string;
  name: string;
  category: 'galon' | 'dus';
  badge?: string;
  image: string;
  description: string;
  capacity: string;
  features: string[];
  priceDescription: string;
  estimatedPrice?: number;
  popular?: boolean;
  minOrder?: number; // Minimum Order Quantity (B2B MOQ)
}

export interface FaqItem {
  id: string;
  category: 'pemesanan' | 'pengiriman' | 'pembayaran' | 'produk';
  question: string;
  answer: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
  gallonExchange: boolean; // whether they have empty gallon to exchange
}

export type OrderStatus = 'baru' | 'diproses' | 'dikirim' | 'selesai' | 'batal';

export interface OrderTimeline {
  baruAt?: string;
  diprosesAt?: string;
  dikirimAt?: string;
  selesaiAt?: string;
  batalAt?: string;
  eta?: string;
}

export interface OrderRecord {
  id: string;
  orderCode: string;
  storeName?: string; // Nama Toko / Minimarket / Usaha (B2B)
  customerName: string; // PIC / Nama Pemesan
  phone: string;
  address: string;
  district: string;
  notes?: string;
  paymentMethod: 'qris' | 'transfer' | 'cod';
  paymentStatus?: string; // 'Belum Dibayar' | 'Sudah Dibayar' | 'DP (Sebagian)'
  paymentReference?: string; // No. Ref / Catatan transfer
  adminNotes?: string; // Catatan internal admin
  amountPaid?: number; // Jumlah yang sudah dibayar jika DP
  status: OrderStatus | string;
  total: number;
  createdAt: string;
  updatedAt?: string;
  timeline?: OrderTimeline;
  etaText?: string; // Estimasi waktu tiba dari admin
  items: {
    product_id?: string;
    product_name?: string;
    name?: string;
    quantity?: number;
    qty?: number;
    unit_price?: number;
    gallon_exchange?: boolean;
  }[];
}

export interface OrderForm {
  storeName?: string; // Nama Toko / Usaha (B2B)
  name: string; // PIC / Penanggung Jawab
  phone: string;
  address: string;
  district: string; // Kecamatan
  notes: string;
  paymentMethod: 'qris' | 'transfer' | 'cod';
  paymentStatus?: string;
  paymentReference?: string;
  items: OrderItem[];
}


