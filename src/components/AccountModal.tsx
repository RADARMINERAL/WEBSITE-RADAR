import React, { useState, useEffect } from 'react';
import { User, Package, Clock, MapPin, X, RefreshCw, Phone, Search, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/mockData';
import { getMyOrders, getOrderStatusBadge } from '../lib/supabase';
import { OrderRecord } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickReorder: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onQuickReorder,
}) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [phone, setPhone] = useState<string>('');
  const [orderCode, setOrderCode] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const loadOrders = async (phoneToQuery?: string, codeToQuery?: string) => {
    setIsLoading(true);
    try {
      const targetPhone = phoneToQuery !== undefined ? phoneToQuery : phone;
      const targetCode = codeToQuery !== undefined ? codeToQuery : orderCode;
      const data = await getMyOrders(targetPhone, targetCode);
      setOrders(data);
      setHasSearched(true);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const savedPhone = localStorage.getItem('radar_customer_phone') || '';
      const savedName = localStorage.getItem('radar_customer_name') || '';
      const savedCode = localStorage.getItem('radar_last_order_code') || '';
      setPhone(savedPhone);
      setCustomerName(savedName);
      setOrderCode(savedCode);

      // Auto-muat riwayat hanya kalau browser ini sendiri yang menyimpan kode pesanan
      // terakhir (pelanggan asli) — bukan cuma nomor HP, supaya tidak asal buka riwayat.
      if (savedPhone && savedCode) {
        loadOrders(savedPhone, savedCode);
      }
    }
  }, [isOpen]);

  // Auto-refresh status pesanan tiap 20 detik selagi modal terbuka & sudah ada hasil
  // pencarian, supaya pelanggan lihat perubahan status tanpa klik "Perbarui Data" manual.
  // Ini polling, bukan realtime push - RLS sengaja TIDAK mengizinkan baca publik ke
  // tabel orders (supaya pesanan orang lain tidak bisa dibaca sembarangan), jadi
  // update di sini tetap lewat RPC get_my_orders yang sudah diverifikasi phone+kode.
  useEffect(() => {
    if (!isOpen || !hasSearched || !phone || !orderCode) return;
    const interval = setInterval(() => {
      loadOrders(phone, orderCode);
    }, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasSearched, phone, orderCode]);

  if (!isOpen) return null;

  const handleSearchPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      localStorage.setItem('radar_customer_phone', phone.trim());
    }
    loadOrders(phone, orderCode);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#007AFF] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-sora">Pelanggan Radar Mineral</h3>
              <p className="text-xs text-white/80">Lacak Status Pesanan & Riwayat Transaksi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto text-[#191c1e] flex-1">
          {/* Member Card */}
          <div className="bg-gradient-to-r from-[#0058bc] to-[#007AFF] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                {customerName ? `Pelanggan: ${customerName}` : 'Member Radar Mineral'}
              </span>
              <h4 className="text-base font-bold mt-1.5 font-sora">Layanan Antar Aktif</h4>
              <p className="text-xs text-white/80">Pengantaran cepat bergaransi ke seluruh kecamatan</p>
            </div>
            <button
              onClick={() => {
                onClose();
                onQuickReorder();
              }}
              className="px-4 py-2.5 bg-white text-[#007AFF] text-xs font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-all cursor-pointer shrink-0"
            >
              Pesan Lagi
            </button>
          </div>

          {/* Search by WhatsApp Number + Order Code Form */}
          <form onSubmit={handleSearchPhone} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
            <label className="block text-xs font-bold text-gray-700 font-sora">
              Cari Riwayat Pesanan (Nomor WhatsApp + Kode Pesanan)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                />
              </div>
              <div className="relative flex-1">
                <Package className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kode Pesanan (RDR-xxxxxx)"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Cari</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Kode Pesanan ada di konfirmasi setelah Anda memesan — ini melindungi riwayat pesanan Anda supaya tidak bisa dibuka orang lain yang cuma tahu nomor HP Anda.
            </p>
          </form>

          {/* Order history Header & Refresh */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-800 font-sora flex items-center gap-2">
                <Package className="w-4 h-4 text-[#007AFF]" />
                <span>Riwayat Pesanan</span>
                <span className="text-xs font-normal text-gray-500">({orders.length})</span>
              </h4>
              <button
                onClick={() => loadOrders(phone, orderCode)}
                disabled={isLoading}
                className="text-xs text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Perbarui Data</span>
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-gray-400 flex flex-col items-center">
                <Loader2 className="w-7 h-7 animate-spin text-[#007AFF] mb-2" />
                <p className="text-xs">Memuat data pesanan...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 p-6">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">Belum ada riwayat pesanan.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Masukkan nomor WhatsApp dan Kode Pesanan yang Anda gunakan saat memesan untuk melihat riwayat pengantaran.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {orders.map((order, idx) => {
                  const badge = getOrderStatusBadge(order.status);
                  return (
                    <div
                      key={order.id || idx}
                      className="p-4 border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors bg-white shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs mb-2.5">
                        <span className="font-bold text-gray-900 font-mono text-sm">
                          {order.orderCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {order.paymentStatus && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {order.paymentStatus}
                            </span>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-400 mb-2 flex items-center justify-between">
                        <span>Waktu Pesan: {formatDate(order.createdAt)}</span>
                        <span className="uppercase text-[10px] text-gray-500 font-medium">
                          Bayar: {order.paymentMethod || 'QRIS'}
                        </span>
                      </div>

                      <div className="space-y-1.5 mb-3 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                        {order.items?.map((item: any, i: number) => (
                          <div key={i} className="text-xs text-gray-700 flex justify-between">
                            <span className="truncate pr-2">
                              • {item.product_name || item.name || 'Produk Air Mineral'}
                            </span>
                            <span className="font-semibold text-gray-900 shrink-0">
                              {item.quantity || item.qty || 1}x
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="flex items-center gap-1 text-gray-500 truncate max-w-[260px]">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{order.address}</span>
                        </span>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <span className="font-bold text-[#007AFF] text-sm font-sora">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              maximumFractionDigits: 0,
                            }).format(order.total || 0)}
                          </span>
                          <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Halo%20Admin%20Radar%20Mineral,%20saya%20ingin%20cek%20status%20pesanan%20dengan%20Kode:%20${order.orderCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-50 text-[#007AFF] hover:bg-[#007AFF] hover:text-white rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-medium"
                            title="Tanya Admin di WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Tanya CS</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick CS Support */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#007AFF]" />
              <span className="text-gray-700">Butuh bantuan pengantaran cepat?</span>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Halo%20Admin%20Radar%20Mineral,%20saya%20butuh%20bantuan%20pengantaran`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#007AFF] font-bold hover:underline"
            >
              Hubungi CS →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

