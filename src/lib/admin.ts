import { supabase } from './supabase';
import { OrderStatus } from '../types';

// ==============================================================================
// AUTH (STAFF / ADMIN)
// ==============================================================================

export async function signInAdmin(email: string, password: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase belum dikonfigurasi.' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return {};
}

export async function signOutAdmin(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getAdminUser(): Promise<{ id: string; email: string | null } | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

// Cek apakah user yang sedang login ada di tabel `admins`.
// Tabel `admins` cuma bisa dibaca oleh dirinya sendiri (RLS), dan cuma bisa diisi
// lewat SQL editor/dashboard Supabase oleh pemilik project - jadi sign up biasa
// TIDAK otomatis memberi akses kelola pesanan.
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (error) {
    console.error('Gagal memeriksa status admin:', error);
    return false;
  }
  return Boolean(data);
}

// ==============================================================================
// KELOLA PESANAN (butuh login admin - dibatasi RLS di sisi database)
// ==============================================================================

export interface AdminOrderItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  gallonExchange: boolean;
}

export interface AdminOrderRow {
  id: string;
  orderCode: string;
  storeName?: string; // Nama Toko / Minimarket / Usaha (B2B)
  customerName: string;
  phone: string;
  address: string;
  district: string;
  notes: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string;
  adminNotes?: string;
  amountPaid?: number;
  status: OrderStatus;
  total: number;
  timelineData?: {
    baruAt?: string;
    diprosesAt?: string;
    dikirimAt?: string;
    selesaiAt?: string;
    batalAt?: string;
    eta?: string;
  };
  etaText?: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

export async function fetchAllOrders(): Promise<AdminOrderRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(
      'Gagal memuat semua pesanan (pastikan akun ini sudah terdaftar di tabel "admins"):',
      error
    );
    throw error;
  }

  return (data || []).map((o: any) => ({
    id: o.id,
    orderCode: o.order_code,
    storeName: o.store_name || '',
    customerName: o.customer_name,
    phone: o.phone,
    address: o.address,
    district: o.district,
    notes: o.notes || '',
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status || 'Belum Dibayar',
    paymentReference: o.payment_reference || '',
    adminNotes: o.admin_notes || '',
    amountPaid: o.amount_paid || 0,
    status: o.status,
    total: o.total,
    timelineData: o.timeline_data || { baruAt: o.created_at },
    etaText: o.eta_text || '',
    createdAt: o.created_at,
    updatedAt: o.updated_at || o.created_at,
    items: (o.order_items || []).map((it: any) => ({
      productId: it.product_id,
      productName: it.product_name,
      quantity: it.quantity,
      unitPrice: it.unit_price,
      gallonExchange: it.gallon_exchange,
    })),
  }));
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  etaText?: string,
  currentTimeline?: Record<string, any>
): Promise<void> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');

  const nowIso = new Date().toISOString();
  const updatedTimeline = {
    ...(currentTimeline || {}),
  };

  if (status === 'diproses' && !updatedTimeline.diprosesAt) {
    updatedTimeline.diprosesAt = nowIso;
  } else if (status === 'dikirim') {
    updatedTimeline.dikirimAt = nowIso;
    if (etaText) updatedTimeline.eta = etaText;
  } else if (status === 'selesai') {
    updatedTimeline.selesaiAt = nowIso;
  } else if (status === 'batal') {
    updatedTimeline.batalAt = nowIso;
  }

  const updatePayload: Record<string, any> = {
    status,
    timeline_data: updatedTimeline,
  };

  if (etaText !== undefined) {
    updatePayload.eta_text = etaText;
  }

  const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderId);
  if (error) throw error;
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: string,
  paymentReference?: string,
  amountPaid?: number
): Promise<void> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  
  const updatePayload: Record<string, any> = { payment_status: paymentStatus };
  if (paymentReference !== undefined) updatePayload.payment_reference = paymentReference;
  if (amountPaid !== undefined) updatePayload.amount_paid = amountPaid;

  const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderId);
  if (error) throw error;
}

export async function updateAdminNotes(orderId: string, adminNotes: string): Promise<void> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const { error } = await supabase.from('orders').update({ admin_notes: adminNotes }).eq('id', orderId);
  if (error) throw error;
}

// Realtime: dashboard admin auto-refresh begitu ada pesanan baru masuk atau status
// berubah (dari device lain), tanpa perlu klik refresh manual.
export function subscribeToOrderChanges(onChange: () => void): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('admin-orders-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

