import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, FaqItem, OrderRecord, OrderForm } from '../types';
import { PRODUCTS, FAQ_ITEMS } from '../data/mockData';

// Ambil credentials dari environment variables (Vite client-side)
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

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
      minOrder: item.id === 'dus-220ml' ? 10 : 5,
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

    return data.map ((item) => ({
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
): Promise<{ orderCode: string; orderId: string; total: number; success: boolean; savedToDatabase: boolean; error?: string }> {
  const { form, total, exchangeGallon } = params;

  // Penegakan MOQ B2B sisi data layer
  let hasValidMOQ = false;
  for (const item of form.items) {
    if (item.productId === 'dus-220ml' && item.quantity >= 10) {
      hasValidMOQ = true;
    }
    if (item.productId === 'galon-19l' && item.quantity >= 5) {
      hasValidMOQ = true;
    }
  }

  if (!hasValidMOQ) {
    return {
      orderId: '',
      orderCode: '',
      total: 0,
      success: false,
      savedToDatabase: false,
      error: 'Pesanan tidak memenuhi syarat Minimum Order Quantity (MOQ): Minimal 10 Dus untuk Cup 220ml atau Minimal 5 Galon.',
    };
  }

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

  const nowIso = new Date().toISOString();
  const orderId = generateUUID();
  const orderCode = 'RDR-' + Math.floor(100000 + Math.random() * 900000);
  let savedToDatabase = false;

  const initialTimeline = {
    baruAt: nowIso,
  };

  // Simpan data toko & nomor telepon ke localStorage agar riwayat pesanan mudah dicek kembali
  if (form.phone) {
    localStorage.setItem('radar_customer_phone', form.phone.trim());
    localStorage.setItem('radar_customer_name', form.name.trim());
    if (form.storeName) localStorage.setItem('radar_customer_store', form.storeName.trim());
    localStorage.setItem('radar_customer_address', form.address.trim());
    localStorage.setItem('radar_customer_district', form.district);
  }

  if (supabase) {
    try {
      // 1. Insert ke tabel orders langsung dengan ID, Kode Pesanan, dan B2B Data
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_code: orderCode,
          store_name: form.storeName?.trim() || null,
          customer_name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          district: form.district,
          notes: form.notes?.trim() || null,
          payment_method: form.paymentMethod,
          payment_status: form.paymentStatus || 'Belum Dibayar',
          payment_reference: form.paymentReference?.trim() || null,
          timeline_data: initialTimeline,
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
    storeName: form.storeName,
    customerName: form.name,
    phone: form.phone,
    address: form.address,
    district: form.district,
    notes: form.notes,
    paymentMethod: form.paymentMethod,
    paymentStatus: form.paymentStatus || 'Belum Dibayar',
    paymentReference: form.paymentReference,
    status: 'baru',
    total: total,
    createdAt: nowIso,
    timeline: initialTimeline,
    items: form.items.map((item) => ({
      product_id: item.productId,
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

  // Simpan kode pesanan TERAKHIR yang benar-benar valid di database
  if (form.phone && savedToDatabase) {
    localStorage.setItem('radar_last_order_code', orderCode);
  }

  return {
    orderId,
    orderCode,
    total,
    success: true,
    savedToDatabase,
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
          storeName: row.store_name || row.storeName || '',
          customerName: row.customer_name || row.customerName || '',
          phone: row.phone || '',
          address: row.address || '',
          district: row.district || '',
          notes: row.notes || '',
          paymentMethod: row.payment_method || row.paymentMethod || 'qris',
          paymentStatus: row.payment_status || row.paymentStatus || 'Belum Dibayar',
          paymentReference: row.payment_reference || row.paymentReference || '',
          status: row.status || 'baru',
          total: row.total || 0,
          timeline: row.timeline_data || row.timeline || { baruAt: row.created_at },
          etaText: row.eta_text || row.etaText || '',
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
        storeName: item.storeName || item.store_name || '',
        customerName: item.customerName || item.name || 'Pelanggan Toko',
        phone: item.phone || '',
        address: item.address || '',
        district: item.district || '',
        notes: item.notes || '',
        paymentMethod: item.paymentMethod || item.payment_method || 'qris',
        paymentStatus: item.paymentStatus || item.payment_status || 'Belum Dibayar',
        paymentReference: item.paymentReference || item.payment_reference || '',
        status: item.status || 'baru',
        total: item.total || 0,
        timeline: item.timeline || { baruAt: item.createdAt || item.date },
        createdAt: item.createdAt || item.date || new Date().toISOString(),
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
