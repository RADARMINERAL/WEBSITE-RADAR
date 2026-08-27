import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, FaqItem, OrderRecord, OrderForm } from '../types';
import { PRODUCTS, FAQ_ITEMS } from '../data/mockData';

// Ambil credentials dari environment variables (Vite client-side)
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Sanitasi URL Supabase: buang akhiran /rest/v1 dan garis miring, DIULANG sampai bersih.
// (Sebelumnya cuma dibuang sekali, jadi kalau env var VITE_SUPABASE_URL ke-set dengan
// "/rest/v1" lebih dari sekali, sisa satu "/rest/v1" bikin request akhir jadi
// ".../rest/v1/rest/v1/orders" -> 404 -> checkout diam-diam gagal tersimpan.)
function sanitizeSupabaseUrl(url: string): string {
  let cleaned = url.trim();
  let previous: string;
  do {
    previous = cleaned;
    cleaned = cleaned.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  } while (cleaned !== previous);
  return cleaned;
}

const cleanSupabaseUrl = rawSupabaseUrl ? sanitizeSupabaseUrl(rawSupabaseUrl) : undefined;

if (rawSupabaseUrl && cleanSupabaseUrl && rawSupabaseUrl !== cleanSupabaseUrl) {
  // Ini nyala di console browser kalau env var-nya masih salah format -
  // sebaiknya diperbaiki langsung di pengaturan Cloudflare, bukan mengandalkan ini.
  console.warn(
    `[supabase] VITE_SUPABASE_URL salah format ("${rawSupabaseUrl}"). ` +
    `Otomatis dibersihkan jadi "${cleanSupabaseUrl}". Perbaiki env var-nya di Cloudflare agar tidak bergantung pada auto-fix ini.`
  );
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    cleanSupabaseUrl &&
    supabaseAnonKey &&
    cleanSupabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

// Inisialisasi Supabase Client (Lazy / Safe initialization)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(cleanSupabaseUrl!, supabaseAnonKey!)
  : null;

// ==============================================================================
// 1. DATA KATALOG PRODUK
// ==============================================================================

export async function fetchProducts(): Promise<Product[]> {
  if (!supabase) {
    return PRODUCTS;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Menggunakan fallback data produk lokal:', error?.message);
      return PRODUCTS;
    }

    // Mapping field snake_case dari Postgres ke camelCase TypeScript
    return data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      badge: item.badge || undefined,
      image: item.image_url || PRODUCTS.find((p) => p.id === item.id)?.image || '',
      description: item.description || '',
      capacity: item.capacity || '',
      features: Array.isArray(item.features) ? item.features : [],
      priceDescription: item.price_description || '',
      estimatedPrice: item.estimated_price || 0,
      popular: Boolean(item.popular),
    }));
  } catch (err) {
    console.error('Gagal mengambil data produk dari Supabase:', err);
    return PRODUCTS;
  }
}

// ==============================================================================
// 2. DATA FAQ (PUSAT BANTUAN)
// ==============================================================================

export async function fetchFaqs(): Promise<FaqItem[]> {
  if (!supabase) {
    return FAQ_ITEMS;
  }

  try {
    const { data, error } = await supabase
      .from('faq_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('Menggunakan fallback data FAQ lokal:', error?.message);
      return FAQ_ITEMS;
    }

    return data.map((item) => ({
      id: String(item.id),
      category: item.category,
      question: item.question,
      answer: item.answer,
    }));
  } catch (err) {
    console.error('Gagal mengambil data FAQ dari Supabase:', err);
    return FAQ_ITEMS;
  }
}

// ==============================================================================
// 3. PEMBUATAN PESANAN (CHECKOUT -> SUPABASE ORDERS + ORDER_ITEMS)
// ==============================================================================

export interface CreateOrderParams {
  form: OrderForm;
  total: number;
  exchangeGallon: boolean;
}

export async function createOrder(
  params: CreateOrderParams
): Promise<{ orderCode: string; orderId: string; total: number; success: boolean; savedToDatabase: boolean }> {
  const { form, total, exchangeGallon } = params;

  // Helper UUID generator yang kompatibel dengan semua browser modern
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const orderId = generateUUID();
  const orderCode = 'RDR-' + Math.floor(100000 + Math.random() * 900000);
  let savedToDatabase = false;

  // Simpan nomor telepon ke localStorage agar riwayat pesanan mudah dicek kembali
  if (form.phone) {
    localStorage.setItem('radar_customer_phone', form.phone.trim());
    localStorage.setItem('radar_customer_name', form.name.trim());
    localStorage.setItem('radar_customer_address', form.address.trim());
    localStorage.setItem('radar_customer_district', form.district);
  }

  if (supabase) {
    try {
      // 1. Insert ke tabel orders langsung dengan ID dan Kode Pesanan
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_code: orderCode,
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          district: form.district,
          notes: form.notes?.trim() || null,
          payment_method: form.paymentMethod,
          payment_status: form.paymentStatus || 'Belum Dibayar',
          status: 'baru',
          total: total,
        });

      if (orderError) {
        console.error('Error insert order to Supabase:', orderError);
      } else {
        // 2. Insert ke tabel order_items
        const orderItemsPayload = form.items.map((item) => ({
          order_id: orderId,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice || 0,
          gallon_exchange: item.productId === 'galon-19l' ? exchangeGallon : true,
        }));

        if (orderItemsPayload.length > 0) {
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsPayload);

          if (itemsError) {
            console.error('Error insert order items to Supabase:', itemsError);
          } else {
            savedToDatabase = true;
          }
        } else {
          savedToDatabase = true;
        }
      }
    } catch (err) {
      console.error('Exception creating order on Supabase:', err);
    }
  }

  // Backup data pesanan ke localStorage browser pengguna
  const localRecord: OrderRecord = {
    id: orderId,
    orderCode: orderCode,
    customerName: form.name,
    phone: form.phone,
    address: form.address,
    district: form.district,
    notes: form.notes,
    paymentMethod: form.paymentMethod,
    paymentStatus: form.paymentStatus || 'Belum Dibayar',
    status: 'baru',
    total: total,
    createdAt: new Date().toISOString(),
    items: form.items.map((item) => ({
      product_name: item.productName,
      name: item.productName,
      quantity: item.quantity,
      qty: item.quantity,
      unit_price: item.unitPrice || 0,
      gallon_exchange: item.productId === 'galon-19l' ? exchangeGallon : true,
    })),
  };

  try {
    const existing = JSON.parse(localStorage.getItem('radar_orders') || '[]');
    localStorage.setItem('radar_orders', JSON.stringify([localRecord, ...existing]));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // Simpan kode pesanan TERAKHIR yang benar-benar valid di database, supaya AccountModal
  // bisa auto-isi phone + kode saat pelanggan yang sama kembali dari browser yang sama
  if (form.phone && savedToDatabase) {
    localStorage.setItem('radar_last_order_code', orderCode);
  }

  return {
    orderId,
    orderCode,
    total,
    success: true, // proses checkout selesai: order minimal tersimpan di perangkat ini
    savedToDatabase, // true HANYA kalau order benar-benar tersimpan ke Supabase
  };
}

// ==============================================================================
// 4. RIWAYAT PESANAN (AMBIL DARI SUPABASE RPC / LOCALSTORAGE)
// ==============================================================================

export async function getMyOrders(phone?: string, orderCode?: string): Promise<OrderRecord[]> {
  const targetPhone = phone?.trim() || localStorage.getItem('radar_customer_phone')?.trim() || '';
  const targetOrderCode =
    orderCode?.trim() || localStorage.getItem('radar_last_order_code')?.trim() || '';

  if (supabase && targetPhone && targetOrderCode) {
    try {
      const { data, error } = await supabase.rpc('get_my_orders', {
        p_phone: targetPhone,
        p_order_code: targetOrderCode,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          orderCode: row.order_code || row.orderCode || 'RDR-000000',
          customerName: row.customer_name || row.customerName || '',
          phone: row.phone || '',
          address: row.address || '',
          district: row.district || '',
          notes: row.notes || '',
          paymentMethod: row.payment_method || row.paymentMethod || 'qris',
          paymentStatus: row.payment_status || row.paymentStatus || 'Belum Dibayar',
          status: row.status || 'baru',
          total: row.total || 0,
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
          items: Array.isArray(row.items) ? row.items : [],
        }));
      }
    } catch (err) {
      console.warn('Error fetching orders via Supabase RPC:', err);
    }
  }

  // Fallback ke localStorage jika Supabase RPC belum dibuat, kode pesanan belum diisi, atau data belum sync
  try {
    const local = localStorage.getItem('radar_orders');
    if (local) {
      const parsed: any[] = JSON.parse(local);
      return parsed.map((item) => ({
        id: item.id || item.orderCode || 'RDR-LOCAL',
        orderCode: item.orderCode || item.id || 'RDR-LOCAL',
        customerName: item.name || item.customerName || 'Pelanggan',
        phone: item.phone || '',
        address: item.address || '',
        district: item.district || '',
        notes: item.notes || '',
        paymentMethod: item.paymentMethod || 'qris',
        paymentStatus: item.paymentStatus || 'Belum Dibayar',
        status: item.status || 'baru',
        total: item.total || 0,
        createdAt: item.date || item.createdAt || new Date().toISOString(),
        items: Array.isArray(item.items) ? item.items : [],
      }));
    }
  } catch (e) {
    console.error('Error reading localStorage orders:', e);
  }

  return [];
}

// ==============================================================================
// 5. HELPER FORMAT STATUS PESANAN
// ==============================================================================

export function getOrderStatusBadge(status: string): { label: string; bg: string; text: string } {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'baru':
      return { label: 'Pesanan Diterima', bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'diproses':
      return { label: 'Sedang Disiapkan', bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'dikirim':
      return { label: 'Sedang Diantar Kurir', bg: 'bg-indigo-100', text: 'text-indigo-800' };
    case 'selesai':
      return { label: 'Selesai / Terkirim', bg: 'bg-green-100', text: 'text-green-800' };
    case 'batal':
      return { label: 'Dibatalkan', bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { label: status || 'Baru', bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}
