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

export interface OrderRecord {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  notes?: string;
  paymentMethod: 'qris' | 'transfer' | 'cod';
  status: OrderStatus | string;
  total: number;
  createdAt: string;
  items: {
    product_name?: string;
    name?: string;
    quantity?: number;
    qty?: number;
    unit_price?: number;
    gallon_exchange?: boolean;
  }[];
}

export interface OrderForm {
  name: string;
  phone: string;
  address: string;
  district: string; // Kecamatan
  notes: string;
  paymentMethod: 'qris' | 'transfer' | 'cod';
  items: OrderItem[];
}

