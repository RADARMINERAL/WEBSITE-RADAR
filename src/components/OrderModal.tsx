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
  Building2,
  AlertTriangle,
  Info,
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
  const [storeName, setStoreName] = useState('');
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
  const [moqError, setMoqError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setOrderSent(false);
      setIsSubmitting(false);
      setCopiedCode(false);
      setSavedToDatabase(true);
      setMoqError('');

      // Load prefill customer details if returning customer
      const savedStore = localStorage.getItem('radar_customer_store') || '';
      const savedName = localStorage.getItem('radar_customer_name') || '';
      const savedPhone = localStorage.getItem('radar_customer_phone') || '';
      const savedAddress = localStorage.getItem('radar_customer_address') || '';
      const savedDistrict = localStorage.getItem('radar_customer_district') || 'Panakkukang';

      if (savedStore) setStoreName(savedStore);
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
      if (savedAddress) setAddress(savedAddress);
      if (savedDistrict) setDistrict(savedDistrict);

      // Load 2 B2B products dynamically
      fetchProducts().then((loadedProducts) => {
        // Filter only the 2 B2B SKUs
        const b2bOnly = loadedProducts.filter(
          (p) => p.id === 'dus-220ml' || p.id === 'galon-19l'
        );
        setProducts(b2bOnly);

        const initial: Record<string, number> = {};
        b2bOnly.forEach((p) => {
          if (p.id === (initialProductId || 'dus-220ml')) {
            initial[p.id] = p.id === 'dus-220ml' ? 10 : 5;
          } else {
            initial[p.id] = 0;
          }
        });
        setQuantities(initial);
      });
    }
  }, [isOpen, initialProductId]);

  if (!isOpen) return null;

  const updateQuantityWithMoq = (id: string, delta: number) => {
    setMoqError('');
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const moq = id === 'dus-220ml' ? 10 : 5;

      if (current === 0 && delta > 0) {
        // First selection jumps directly to MOQ
        return { ...prev, [id]: moq };
      }

      const next = current + delta;
      if (next <= 0) {
        return { ...prev, [id]: 0 };
      }
      if (next < moq && delta < 0) {
        // Dropping below MOQ resets to 0 (unselected)
        return { ...prev, [id]: 0 };
      }
      return { ...prev, [id]: next };
    });
  };

  const handleManualQuantityChange = (id: string, valStr: string) => {
    setMoqError('');
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val <= 0) {
      setQuantities((prev) => ({ ...prev, [id]: 0 }));
      return;
    }
    setQuantities((prev) => ({ ...prev, [id]: val }));
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

  const validateMoq = (): boolean => {
    const dusQty = quantities['dus-220ml'] || 0;
    const galonQty = quantities['galon-19l'] || 0;

    if (dusQty === 0 && galonQty === 0) {
      setMoqError('Silakan pilih minimal satu produk (Air Dus 220ml atau Galon 19L).');
      return false;
    }

    if (dusQty > 0 && dusQty < 10) {
      setMoqError('Minimal pemesanan Air Dus 220ml (48 cup) adalah 10 Dus.');
      return false;
    }

    if (galonQty > 0 && galonQty < 5) {
      setMoqError('Minimal pemesanan Air Galon 19L adalah 5 Galon.');
      return false;
    }

    setMoqError('');
    return true;
  };

  const handleSendToWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateMoq()) {
      return;
    }

    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Mohon lengkapi Nama Toko/PIC, No. WhatsApp, dan Alamat Pengiriman Toko.');
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAmount = calculateEstimatedTotal();
      setLastOrderTotal(totalAmount);

      // Tentukan status pembayaran awal
      let paymentStatusText = 'Belum Dibayar (QRIS)';
      if (paymentMethod === 'cod') {
        paymentStatusText = 'Bayar di Tempat (COD)';
      } else if (paymentMethod === 'transfer') {
        paymentStatusText = 'Belum Dibayar (Transfer Bank)';
      }
      setLastPaymentStatus(paymentStatusText);

      const orderFormPayload: OrderForm = {
        storeName: storeName.trim() || undefined,
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

      if (!result.success) {
        setMoqError(result.error || 'Pesanan gagal divalidasi.');
        setIsSubmitting(false);
        return;
      }

      const orderCode = result.orderCode;
      setCreatedOrderCode(orderCode);
      setSavedToDatabase(result.savedToDatabase);

      // 2. Susun pesan resmi WhatsApp B2B
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
          ? 'QRIS (Scan saat kurir tiba di toko)'
          : paymentMethod === 'transfer'
          ? 'Transfer Bank (BCA / Mandiri / BRI)'
          : 'Tunai / COD (Bayar saat pasokan tiba)';

      const totalFormatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(totalAmount);

      const message =
        `*FORMULIR PEMESANAN PASOKAN GROSIR — RADAR MINERAL*\n\n` +
        `Yth. Tim Distribusi Radar Mineral Makassar,\n\n` +
        `Berikut rincian pesanan pasokan air mineral untuk toko/usaha kami:\n\n` +
        `• Kode Pesanan: *${orderCode}*\n` +
        (storeName.trim() ? `• Nama Toko / Usaha: *${storeName.trim()}*\n` : '') +
        `• Penanggung Jawab (PIC): ${name.trim()}\n` +
        `• No. WhatsApp: ${phone.trim()}\n` +
        `• Alamat Pengiriman: ${address.trim()}, Kec. ${district}, Makassar\n\n` +
        `*Rincian Pasokan:*\n` +
        `${itemsSummaryWhatsApp}\n\n` +
        `• Total Pembayaran: *${totalFormatted}*\n` +
        `• Metode Pembayaran: ${paymentLabel}\n` +
        `• Status Pembayaran: ${paymentStatusText}\n` +
        (notes.trim() ? `• Catatan Khusus: ${notes.trim()}\n` : '') +
        `\n` +
        `Pesanan ini telah dicatat pada sistem Radar Mineral. Mohon konfirmasi jadwal dan rute pengantaran armada. Terima kasih.`;

      const encoded = encodeURIComponent(message);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
      setLastWhatsAppUrl(waUrl);

      // Buka WhatsApp di tab baru
      window.open(waUrl, '_blank');

      if (onOrderSuccess) {
        onOrderSuccess({
          orderCode,
          storeName: storeName.trim(),
          name,
          phone,
          total: totalAmount,
          paymentMethod,
          paymentStatus: paymentStatusText,
        });
      }

      setOrderSent(true);
    } catch (err) {
      console.error('Gagal memproses pesanan B2B:', err);
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
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-sora">Formulir Pesanan Grosir (B2B)</h3>
              <p className="text-xs text-white/80">Khusus Toko Bahan Campuran, Minimarket & Toko Grosir</p>
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
                Pesanan Grosir Berhasil Dicatat!
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
                    Kurir armada kami membawa <b>QRIS Dinamis</b> saat tiba di toko Anda di {district}. Anda dapat melakukan scan dengan GoPay, OVO, ShopeePay, BCA, atau m-Banking apa saja.
                  </p>
                )}

                {paymentMethod === 'transfer' && (
                  <div className="space-y-1 text-gray-600">
                    <p>Silakan lakukan transfer ke rekening resmi distributor Radar Mineral:</p>
                    <p className="font-semibold text-gray-900 font-mono bg-white p-2 rounded border border-blue-200">
                      BCA: 789-012-3456 (a.n. Koperasi Radar Mineral)
                    </p>
                    <p className="text-[11px] text-gray-500">Kirimkan bukti transfer via chat WhatsApp admin untuk konfirmasi langsung.</p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <p className="leading-relaxed text-gray-600">
                    Siapkan pembayaran tunai sebesar <b>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(lastOrderTotal)}</b> saat armada tiba membongkar pasokan di toko Anda.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {lastWhatsAppUrl && (
                <a
                  href={lastWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(37,211,102,0.3)] active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Chat WhatsApp</span>
                </a>
              )}
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-7 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendToWhatsApp} className="p-6 overflow-y-auto space-y-6 flex-1 text-[#191c1e]">
            {/* MOQ Banner Notice */}
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ketentuan Pemesanan B2B Grosir:</p>
                <p className="text-blue-800 text-[11px] mt-0.5">
                  • <b>Air Dus 220ml (48 cup)</b>: Minimal pengambilan <b>10 Dus</b><br />
                  • <b>Air Galon 19L</b>: Minimal pengambilan <b>5 Galon</b>
                </p>
              </div>
            </div>

            {/* Error banner if MOQ violated */}
            {moqError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{moqError}</span>
              </div>
            )}

            {/* Step 1: Product Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-800 font-sora flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Pilih Produk & Jumlah Grosir
                </label>
                <span className="text-xs text-[#007AFF] font-medium">B2B Distributor</span>
              </div>

              <div className="space-y-3">
                {products.map((p) => {
                  const qty = quantities[p.id] || 0;
                  const moq = p.id === 'dus-220ml' ? 10 : 5;
                  const stepUnit = p.id === 'dus-220ml' ? 10 : 5;

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        qty > 0 ? 'border-[#007AFF] bg-[#007AFF]/5 shadow-xs' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-13 h-13 rounded-lg object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">{p.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-[#007AFF] rounded-full font-bold">
                              MOQ: Min {moq} {p.category === 'dus' ? 'Dus' : 'Galon'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{p.capacity} • {p.priceDescription}</p>
                        </div>
                      </div>

                      {/* Quantity buttons */}
                      <div className="flex items-center justify-end gap-1.5 shrink-0">
                        {/* Quick -Step */}
                        {qty >= moq + stepUnit && (
                          <button
                            type="button"
                            onClick={() => updateQuantityWithMoq(p.id, -stepUnit)}
                            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                            title={`Kurangi ${stepUnit}`}
                          >
                            -{stepUnit}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => updateQuantityWithMoq(p.id, -1)}
                          disabled={qty === 0}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={qty}
                          onChange={(e) => handleManualQuantityChange(p.id, e.target.value)}
                          className="w-12 text-center font-bold text-sm text-gray-900 bg-white border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantityWithMoq(p.id, 1)}
                          className="w-8 h-8 rounded-lg bg-[#007AFF] hover:bg-[#0062cc] text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        {/* Quick +Step */}
                        <button
                          type="button"
                          onClick={() => updateQuantityWithMoq(p.id, stepUnit)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#007AFF] cursor-pointer"
                          title={`Tambah ${stepUnit}`}
                        >
                          +{stepUnit}
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
                    <p className="font-semibold text-gray-900 mb-1">Status Galon 19L Toko:</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="exchange"
                          checked={exchangeGallon}
                          onChange={() => setExchangeGallon(true)}
                          className="text-[#007AFF] focus:ring-[#007AFF]"
                        />
                        <span>Tukar galon kosong toko (Hanya isi ulang)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="exchange"
                          checked={!exchangeGallon}
                          onChange={() => setExchangeGallon(false)}
                          className="text-[#007AFF] focus:ring-[#007AFF]"
                        />
                        <span>Buka stok baru / Beli Galon (+Rp40.000/galon)</span>
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
                Informasi Toko & Pengiriman (Area Makassar)
              </label>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Toko / Minimarket / Usaha *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Toko Campuran Berkah / Alfamart Cab. Pettarani / Toko Sembako Jaya"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF] focus:border-[#007AFF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Penanggung Jawab / PIC *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Herman / Ibu Fatma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF] focus:border-[#007AFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">No. WhatsApp Toko/PIC *</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap Toko & Patokan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jl. Perintis Kemerdekaan KM 9 No. 45 (Depan SPBU)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF] focus:border-[#007AFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catatan / Jam Operasional Toko (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Toko buka jam 08.00, minta kirim siang"
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
                  <span className="text-[10px] text-gray-500 mt-0.5">Bayar saat tiba</span>
                </label>
              </div>
            </div>

            {/* Footer Summary & Submit */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Estimasi Total ({totalItemsCount} item):</p>
                <p className="text-2xl font-extrabold text-[#007AFF] font-sora">
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
                className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-[0_4px_14px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)] flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mencatat Pesanan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 fill-current" />
                    <span>Kirim Pesanan Grosir via WhatsApp</span>
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


