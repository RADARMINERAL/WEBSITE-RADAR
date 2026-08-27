import React, { useState, useEffect } from 'react';
import { Product, OrderForm } from '../types';
import { MAKASSAR_DISTRICTS, WHATSAPP_NUMBER } from '../data/mockData';
import { createOrder, fetchProducts } from '../lib/supabase';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle,
  Send,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  CreditCard,
  QrCode,
  Banknote,
  Database,
} from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string;
  onOrderSuccess?: (orderDetails: any) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  initialProductId,
  onOrderSuccess,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [exchangeGallon, setExchangeGallon] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Panakkukang');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer' | 'cod'>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedToDatabase, setSavedToDatabase] = useState(true);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string>('');
  const [lastOrderTotal, setLastOrderTotal] = useState<number>(0);
  const [lastPaymentStatus, setLastPaymentStatus] = useState<string>('Belum Dibayar');

  useEffect(() => {
    if (isOpen) {
      setOrderSent(false);
      setIsSubmitting(false);
      setCopiedCode(false);
      setSavedToDatabase(true);

      // Load prefill customer details if returning customer
      const savedName = localStorage.getItem('radar_customer_name') || '';
      const savedPhone = localStorage.getItem('radar_customer_phone') || '';
      const savedAddress = localStorage.getItem('radar_customer_address') || '';
      const savedDistrict = localStorage.getItem('radar_customer_district') || 'Panakkukang';

      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedAddress) setAddress(savedAddress);
      if (savedDistrict) setDistrict(savedDistrict);

      // Load products dynamically
      fetchProducts().then((loadedProducts) => {
        setProducts(loadedProducts);
        const initial: Record<string, number> = {};
        loadedProducts.forEach((p) => {
          initial[p.id] = p.id === (initialProductId || 'galon-19l') ? 2 : 0;
        });
        setQuantities(initial);
      });
    }
  }, [isOpen, initialProductId]);

  if (!isOpen) return null;

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const selectedItems = products.filter((p) => (quantities[p.id] || 0) > 0);
  const totalItemsCount = (Object.values(quantities) as number[]).reduce((a, b) => a + b, 0);

  const calculateEstimatedTotal = () => {
    let sum = 0;
    selectedItems.forEach((p) => {
      const count = quantities[p.id] || 0;
      sum += (p.estimatedPrice || 0) * count;
    });
    // If gallon selected and no exchange, add deposit
    const gallonCount = quantities['galon-19l'] || 0;
    if (gallonCount > 0 && !exchangeGallon) {
      sum += gallonCount * 40000;
    }
    return sum;
  };

  const handleSendToWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalItemsCount === 0) {
      alert('Pilih minimal 1 item produk untuk memesan.');
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Mohon lengkapi Nama, No. WhatsApp, dan Alamat Pengiriman Anda.');
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAmount = calculateEstimatedTotal();
      setLastOrderTotal(totalAmount);

      // Tentukan status pembayaran awal sesuai metode bayar yang dipilih
      let paymentStatusText = 'Belum Dibayar (QRIS)';
      if (paymentMethod === 'cod') {
        paymentStatusText = 'Bayar di Tempat (COD)';
      } else if (paymentMethod === 'transfer') {
        paymentStatusText = 'Belum Dibayar (Transfer Bank)';
      }
      setLastPaymentStatus(paymentStatusText);

      const orderFormPayload: OrderForm = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        district,
        notes: notes.trim(),
        paymentMethod,
        paymentStatus: paymentStatusText,
        items: selectedItems.map((p) => ({
          productId: p.id,
          productName: p.name,
          quantity: quantities[p.id] || 0,
          unitPrice: p.estimatedPrice || 0,
          gallonExchange: p.id === 'galon-19l' ? exchangeGallon : true,
        })),
      };

      // 1. Simpan ke Supabase Database / Local Record
      const result = await createOrder({
        form: orderFormPayload,
        total: totalAmount,
        exchangeGallon,
      });

      const orderCode = result.orderCode;
      setCreatedOrderCode(orderCode);
      setSavedToDatabase(result.savedToDatabase);

      // 2. Susun pesan resmi WhatsApp dengan Kode Pesanan & Status Pembayaran
      const itemsSummaryWhatsApp = selectedItems
        .map((p) => {
          const qty = quantities[p.id];
          const exchangeNote =
            p.id === 'galon-19l'
              ? ` (Tukar Galon: ${exchangeGallon ? 'Ya' : 'Beli Baru/Deposit Rp40.000'})`
              : '';
          return `• ${qty}x ${p.name}${exchangeNote}`;
        })
        .join('\n');

      const paymentLabel =
        paymentMethod === 'qris'
          ? 'QRIS (Scan saat kurir tiba)'
          : paymentMethod === 'transfer'
          ? 'Transfer Bank (BCA / Mandiri / BRI)'
          : 'Tunai / COD (Bayar saat air sampai)';

      const totalFormatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(totalAmount);

      const message =
        `*PESANAN AIR MINUM - RADAR MINERAL MAKASSAR*\n` +
        `*Kode Pesanan:* ${orderCode}\n\n` +
        `*Nama Pemesan:* ${name.trim()}\n` +
        `*No. WhatsApp:* ${phone.trim()}\n` +
        `*Alamat:* ${address.trim()}\n` +
        `*Kecamatan:* ${district}, Makassar\n\n` +
        `*Rincian Pesanan:*\n${itemsSummaryWhatsApp}\n\n` +
        `*Estimasi Total:* ${totalFormatted}\n` +
        `*Metode Bayar:* ${paymentLabel}\n` +
        `*Status Bayar:* ${paymentStatusText}\n` +
        (notes ? `*Catatan:* ${notes.trim()}\n\n` : '\n') +
        `Data pesanan telah dicatat oleh sistem. Mohon diproses untuk pengantaran. Terima kasih!`;

      const encoded = encodeURIComponent(message);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
      setLastWhatsAppUrl(waUrl);

      // Buka WhatsApp di tab baru
      window.open(waUrl, '_blank');

      if (onOrderSuccess) {
        onOrderSuccess({
          orderCode,
          name,
          phone,
          total: totalAmount,
          paymentMethod,
          paymentStatus: paymentStatusText,
        });
      }

      setOrderSent(true);
    } catch (err) {
      console.error('Gagal memproses pesanan:', err);
      alert('Terjadi kendala saat memproses pesanan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (createdOrderCode) {
      navigator.clipboard.writeText(createdOrderCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#007AFF] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-sora">Formulir Pesan Cepat</h3>
              <p className="text-xs text-white/80">Layanan pesan antar higienis ke pintu rumah Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {orderSent ? (
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto overflow-y-auto max-h-[80vh]">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-gray-900 font-sora">
                Pesanan Berhasil Dicatat!
              </h4>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database className="w-3.5 h-3.5" />
                  {savedToDatabase ? 'Tersimpan di Database Supabase' : 'Tersimpan di Sistem'}
                </span>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    paymentMethod === 'cod'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : paymentMethod === 'qris'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}
                >
                  Status Bayar: {lastPaymentStatus}
                </span>
              </div>

              {/* Order Code Box */}
              <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl mt-2">
                <span className="text-xs text-gray-500 font-medium">Kode Pesanan:</span>
                <span className="font-mono font-bold text-sm text-[#007AFF]">
                  {createdOrderCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                  title="Salin Kode Pesanan"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Payment Instructions Card */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-left text-xs text-gray-700 space-y-2 max-w-lg mx-auto mt-3">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  {paymentMethod === 'qris' && <QrCode className="w-4 h-4 text-[#007AFF]" />}
                  {paymentMethod === 'transfer' && <CreditCard className="w-4 h-4 text-[#007AFF]" />}
                  {paymentMethod === 'cod' && <Banknote className="w-4 h-4 text-amber-600" />}
                  <span>Petunjuk Pembayaran ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(lastOrderTotal)})</span>
                </div>

                {paymentMethod === 'qris' && (
                  <p className="leading-relaxed text-gray-600">
                    Kurir kami akan membawa <b>QRIS Dinamis</b> saat mengantar air ke {district}. Anda cukup scan menggunakan GoPay, OVO, ShopeePay, BCA, atau m-Banking apa saja.
                  </p>
                )}

                {paymentMethod === 'transfer' && (
                  <div className="space-y-1 text-gray-600">
                    <p>Silakan lakukan transfer ke rekening resmi Radar Mineral:</p>
                    <p className="font-semibold text-gray-900 font-mono bg-white p-2 rounded border border-blue-200">
                      BCA: 789-012-3456 (a.n. Koperasi Radar Mineral)
                    </p>
                    <p className="text-[11px] text-gray-500">Kirimkan bukti transfer via chat WhatsApp kurir/admin.</p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <p className="leading-relaxed text-gray-600">
                    Siapkan uang pas sebesar <b>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(lastOrderTotal)}</b> untuk diserahkan ke kurir saat galon tiba di alamat Anda.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              {lastWhatsAppUrl && (
                <a
                  href={lastWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Chat WhatsApp Lagi
                </a>
              )}
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-7 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
              >
                Tutup Selesai
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendToWhatsApp} className="p-6 overflow-y-auto space-y-6 flex-1 text-[#191c1e]">
            {/* Step 1: Product Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-800 font-sora flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Pilih Produk & Jumlah
                </label>
                <span className="text-xs text-[#007AFF] font-medium">Min. order 2 galon/dus</span>
              </div>

              <div className="space-y-3">
                {products.map((p) => {
                  const qty = quantities[p.id] || 0;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        qty > 0 ? 'border-[#007AFF] bg-[#007AFF]/5 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">{p.name}</h4>
                            {p.badge && (
                              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-[#007AFF] rounded-full font-medium">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{p.capacity} • {p.priceDescription}</p>
                        </div>
                      </div>

                      {/* Quantity buttons */}
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, -1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-bold text-sm text-gray-900">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-8 h-8 rounded-lg bg-[#007AFF] hover:bg-[#0062cc] text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Gallon Exchange Toggle */}
              {(quantities['galon-19l'] || 0) > 0 && (
                <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#007AFF] shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-700 flex-1">
                    <p className="font-semibold text-gray-900 mb-1">Status Galon 19L:</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="exchange"
                          checked={exchangeGallon}
                          onChange={() => setExchangeGallon(true)}
                          className="text-[#007AFF] focus:ring-[#007AFF]"
                        />
                        <span>Tukar galon kosong (Gratis)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="exchange"
                          checked={!exchangeGallon}
                          onChange={() => setExchangeGallon(false)}
                          className="text-[#007AFF] focus:ring-[#007AFF]"
                        />
                        <span>Pelanggan Baru (Deposit Rp40.000/galon)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Customer & Delivery Info */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <label className="text-sm font-bold text-gray-800 font-sora flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[11px] flex items-center justify-center font-bold">2</span>
                Informasi Pengiriman (Area Makassar)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Rina / Pak Dodi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF] focus:border-[#007AFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">No. WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF] focus:border-[#007AFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kecamatan (Makassar) *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                  >
                    {MAKASSAR_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap & Patokan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jl. Perintis Kemerdekaan KM 9 No. 45 (Dekat Indomaret)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF] focus:border-[#007AFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Taruh di teras, minta diantar jam 14.00 WITA"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF] focus:border-[#007AFF]"
                />
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className="text-sm font-bold text-gray-800 font-sora flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[11px] flex items-center justify-center font-bold">3</span>
                Pilihan Pembayaran
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <label
                  className={`p-3 border rounded-xl flex flex-col items-center text-center cursor-pointer transition-all ${
                    paymentMethod === 'qris'
                      ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] font-bold shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="qris"
                    checked={paymentMethod === 'qris'}
                    onChange={() => setPaymentMethod('qris')}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold font-sora">QRIS Instant</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Scan saat kurir tiba</span>
                </label>

                <label
                  className={`p-3 border rounded-xl flex flex-col items-center text-center cursor-pointer transition-all ${
                    paymentMethod === 'transfer'
                      ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] font-bold shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={() => setPaymentMethod('transfer')}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold font-sora">Transfer Bank</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">BCA / Mandiri / BRI</span>
                </label>

                <label
                  className={`p-3 border rounded-xl flex flex-col items-center text-center cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] font-bold shadow-xs'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold font-sora">Tunai / COD</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">Bayar di tempat</span>
                </label>
              </div>
            </div>

            {/* Footer Summary & Submit */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500">Estimasi Total ({totalItemsCount} item):</p>
                <p className="text-xl font-bold text-[#007AFF] font-sora">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(calculateEstimatedTotal())}
                </p>
              </div>

              <button
                type="submit"
                disabled={totalItemsCount === 0 || isSubmitting}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Pesanan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Pesanan ke WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

