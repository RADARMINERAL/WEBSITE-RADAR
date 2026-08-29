import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LogOut,
  RefreshCw,
  Search,
  Loader2,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Truck,
  Hourglass,
  XCircle,
  Droplets,
} from 'lucide-react';
import {
  fetchAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  subscribeToOrderChanges,
  signOutAdmin,
  AdminOrderRow,
} from '../../lib/admin';
import { OrderStatus } from '../../types';

const STATUS_TABS: { value: OrderStatus | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'baru', label: 'Baru' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'dikirim', label: 'Dikirim' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'batal', label: 'Batal' },
];

// Urutan alur normal pesanan (di luar pembatalan)
const STATUS_FLOW: OrderStatus[] = ['baru', 'diproses', 'dikirim', 'selesai'];

const STATUS_META: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  baru: { label: 'Baru', bg: 'bg-blue-100', text: 'text-blue-800', icon: <Hourglass className="w-3.5 h-3.5" /> },
  diproses: {
    label: 'Diproses',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    icon: <Package className="w-3.5 h-3.5" />,
  },
  dikirim: {
    label: 'Dikirim',
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  selesai: {
    label: 'Selesai',
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  batal: { label: 'Batal', bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-3.5 h-3.5" /> },
};

interface AdminDashboardProps {
  adminEmail: string | null;
  onLoggedOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminEmail, onLoggedOut }) => {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'semua'>('semua');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (err) {
      setError('Gagal memuat pesanan. Pastikan akun ini sudah ditambahkan ke tabel "admins".');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh saat ada pesanan baru / status berubah dari perangkat lain
    const unsubscribe = subscribeToOrderChanges(() => load());
    return unsubscribe;
  }, [load]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab !== 'semua' && o.status !== activeTab) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        o.orderCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q)
      );
    });
  }, [orders, activeTab, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { semua: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [orders]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      alert('Gagal mengubah status. Coba lagi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTogglePayment = async (order: AdminOrderRow) => {
    const next = order.paymentStatus === 'Sudah Dibayar' ? 'Belum Dibayar' : 'Sudah Dibayar';
    setUpdatingId(order.id);
    try {
      await updatePaymentStatus(order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, paymentStatus: next } : o)));
    } catch (err) {
      alert('Gagal mengubah status pembayaran. Coba lagi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
      n || 0
    );

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-[#007AFF]" />
            </div>
            <div>
              <h1 className="font-bold text-sm font-sora leading-tight">Kelola Pesanan</h1>
              <p className="text-[11px] text-gray-400 leading-tight">{adminEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2 text-gray-500 hover:text-[#007AFF] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Muat ulang"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={async () => {
                await signOutAdmin();
                onLoggedOut();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, nomor HP, atau kode pesanan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                activeTab === tab.value
                  ? 'bg-[#007AFF] text-white border-[#007AFF]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label} ({counts[tab.value] || 0})
            </button>
          ))}
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
        )}

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-[#007AFF]" />
            <p className="text-xs">Memuat pesanan...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">Tidak ada pesanan di kategori ini.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map((order) => {
              const meta = STATUS_META[order.status] || STATUS_META.baru;
              const isUpdating = updatingId === order.id;
              const nextIdx = STATUS_FLOW.indexOf(order.status as OrderStatus);
              const nextStatus =
                nextIdx >= 0 && nextIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[nextIdx + 1] : null;
              const isFinal = order.status === 'batal' || order.status === 'selesai';

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-bold text-sm">{order.orderCode}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${meta.bg} ${meta.text}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                      <button
                        onClick={() => handleTogglePayment(order)}
                        disabled={isUpdating}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors cursor-pointer disabled:opacity-50 ${
                          order.paymentStatus === 'Sudah Dibayar'
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                        title="Klik untuk ubah status pembayaran"
                      >
                        {order.paymentStatus || 'Belum Dibayar'}
                      </button>
                    </div>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600 mb-3">
                    <span className="font-semibold text-gray-900">{order.customerName}</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {order.phone}
                    </span>
                    <span className="flex items-center gap-1 sm:col-span-2">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      {order.address} ({order.district})
                    </span>
                    {order.notes && (
                      <span className="sm:col-span-2 text-gray-500 italic">Catatan: {order.notes}</span>
                    )}
                  </div>

                  <div className="bg-gray-50/70 rounded-xl border border-gray-100 p-2.5 mb-3 space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-xs text-gray-700 flex justify-between">
                        <span>• {item.productName}</span>
                        <span className="font-semibold">{item.quantity}x</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    <span className="font-bold text-[#007AFF] font-sora">{formatCurrency(order.total)}</span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}

                      {!isFinal && nextStatus && (
                        <button
                          onClick={() => handleStatusChange(order.id, nextStatus)}
                          disabled={isUpdating}
                          className="px-3 py-1.5 bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Tandai {STATUS_META[nextStatus].label} →
                        </button>
                      )}
                      {!isFinal && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'batal')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 disabled:opacity-50 text-gray-500 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          Batalkan
                        </button>
                      )}
                      {isFinal && (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={isUpdating}
                          className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] cursor-pointer bg-white"
                        >
                          {[...STATUS_FLOW, 'batal' as OrderStatus].map((s) => (
                            <option key={s} value={s}>
                              {STATUS_META[s].label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
