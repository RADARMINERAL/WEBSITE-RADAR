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
  DollarSign,
  Download,
  FileText,
  MessageSquare,
  AlertTriangle,
  Building2,
  Calendar,
  CreditCard,
  Printer,
  X,
  Edit3,
} from 'lucide-react';
import {
  fetchAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateAdminNotes,
  subscribeToOrderChanges,
  signOutAdmin,
  AdminOrderRow,
} from '../../lib/admin';
import { OrderStatus } from '../../types';
import { ADDRESS_DISPLAY, PHONE_DISPLAY, EMAIL_DISPLAY, LOGO_URL } from '../../data/mockData';

const STATUS_TABS: { value: OrderStatus | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'baru', label: 'Baru' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'dikirim', label: 'Dikirim' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'batal', label: 'Batal' },
];

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

type PaymentFilter = 'semua' | 'belum_lunas' | 'lunas' | 'dp';
type DateRangeFilter = 'semua' | 'hari_ini' | 'bulan_ini' | '7_hari';

interface AdminDashboardProps {
  adminEmail: string | null;
  onLoggedOut: () => void;
}

const formatWhatsAppNumber = (phoneStr: string) => {
  let digits = (phoneStr || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (digits.startsWith('8')) {
    digits = '62' + digits;
  }
  return digits;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminEmail, onLoggedOut }) => {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'semua'>('semua');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('semua');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('semua');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  // Modal State for Invoice
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrderRow | null>(null);

  // Modal State for Delivery ETA when marking 'dikirim'
  const [etaPromptOrder, setEtaPromptOrder] = useState<AdminOrderRow | null>(null);
  const [selectedEta, setSelectedEta] = useState<string>('±30 Menit');
  const [customEta, setCustomEta] = useState<string>('');

  // Modal State for Internal Admin Notes
  const [notesOrder, setNotesOrder] = useState<AdminOrderRow | null>(null);
  const [adminNotesText, setAdminNotesText] = useState<string>('');

  // Payment status edit modal
  const [paymentEditOrder, setPaymentEditOrder] = useState<AdminOrderRow | null>(null);
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>('Belum Dibayar');
  const [editPaymentRef, setEditPaymentRef] = useState<string>('');
  const [editAmountPaid, setEditAmountPaid] = useState<number>(0);

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
    const unsubscribe = subscribeToOrderChanges(() => load());
    return unsubscribe;
  }, [load]);

  // Deteksi Pesanan Fiktif: Hitung jumlah pembatalan per nomor HP
  const cancelCountsByPhone = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status === 'batal' && o.phone) {
        const cleanPhone = formatWhatsAppNumber(o.phone);
        counts[cleanPhone] = (counts[cleanPhone] || 0) + 1;
      }
    });
    return counts;
  }, [orders]);

  // Filter dan Sortir data pesanan
  const filtered = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    const result = orders.filter((o) => {
      // 1. Filter Status Pengiriman
      if (activeTab !== 'semua' && o.status !== activeTab) return false;

      // 2. Filter Status Pembayaran
      if (paymentFilter === 'belum_lunas') {
        const isPaid = o.paymentStatus === 'Sudah Dibayar';
        if (isPaid) return false;
      } else if (paymentFilter === 'lunas') {
        if (o.paymentStatus !== 'Sudah Dibayar') return false;
      } else if (paymentFilter === 'dp') {
        if (o.paymentStatus !== 'DP (Sebagian)') return false;
      }

      // 3. Filter Rentang Tanggal
      const orderTime = new Date(o.createdAt).getTime();
      if (dateRangeFilter === 'hari_ini' && orderTime < todayStart) return false;
      if (dateRangeFilter === 'bulan_ini' && orderTime < monthStart) return false;
      if (dateRangeFilter === '7_hari' && orderTime < sevenDaysAgo) return false;

      // 4. Search Query (Nama Toko, Customer, No HP, Kode Pesanan, Catatan)
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        o.orderCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.storeName && o.storeName.toLowerCase().includes(q)) ||
        o.phone.toLowerCase().includes(q) ||
        (o.district && o.district.toLowerCase().includes(q))
      );
    });

    // Requirement 1.3: Urutkan "Belum Dibayar" berdasarkan tanggal pesanan terlama dulu (prioritas penagihan)
    if (paymentFilter === 'belum_lunas') {
      return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    // Default: Urutkan dari pesanan terbaru
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeTab, paymentFilter, dateRangeFilter, query]);

  // Statistik Ringkasan Finansial (KPI Dashboard)
  const summaryStats = useMemo(() => {
    let totalRevenue = 0;
    let totalPaidRevenue = 0;
    let totalUnpaidRevenue = 0;
    let totalPaidCount = 0;
    let totalUnpaidCount = 0;
    let totalDusCount = 0;
    let totalGalonCount = 0;

    orders.forEach((o) => {
      if (o.status !== 'batal') {
        totalRevenue += o.total || 0;
        if (o.paymentStatus === 'Sudah Dibayar') {
          totalPaidRevenue += o.total || 0;
          totalPaidCount++;
        } else {
          totalUnpaidRevenue += o.total || 0;
          totalUnpaidCount++;
        }

        (o.items || []).forEach((item) => {
          const pName = (item.productName || '').toLowerCase();
          if (pName.includes('dus') || pName.includes('cup') || pName.includes('220')) {
            totalDusCount += item.quantity || 0;
          } else if (pName.includes('galon')) {
            totalGalonCount += item.quantity || 0;
          }
        });
      }
    });

    return {
      totalRevenue,
      totalPaidRevenue,
      totalUnpaidRevenue,
      totalPaidCount,
      totalUnpaidCount,
      totalDusCount,
      totalGalonCount,
    };
  }, [orders]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { semua: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [orders]);

  const handleStatusChange = async (order: AdminOrderRow, status: OrderStatus, eta?: string) => {
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, status, eta, order.timelineData);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
              ...o,
              status,
              etaText: eta || o.etaText,
              timelineData: {
                ...(o.timelineData || {}),
                ...(status === 'diproses' ? { diprosesAt: new Date().toISOString() } : {}),
                ...(status === 'dikirim' ? { dikirimAt: new Date().toISOString(), eta } : {}),
                ...(status === 'selesai' ? { selesaiAt: new Date().toISOString() } : {}),
                ...(status === 'batal' ? { batalAt: new Date().toISOString() } : {}),
              },
            }
            : o
        )
      );
    } catch (err) {
      alert('Gagal mengubah status. Coba lagi.');
    } finally {
      setUpdatingId(null);
      setEtaPromptOrder(null);
    }
  };

  const handleSavePaymentDetails = async () => {
    if (!paymentEditOrder) return;
    setUpdatingId(paymentEditOrder.id);
    try {
      await updatePaymentStatus(
        paymentEditOrder.id,
        editPaymentStatus,
        editPaymentRef,
        editAmountPaid
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === paymentEditOrder.id
            ? {
              ...o,
              paymentStatus: editPaymentStatus,
              paymentReference: editPaymentRef,
              amountPaid: editAmountPaid,
            }
            : o
        )
      );
      setPaymentEditOrder(null);
    } catch (err) {
      alert('Gagal memperbarui status pembayaran.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!notesOrder) return;
    setUpdatingId(notesOrder.id);
    try {
      await updateAdminNotes(notesOrder.id, adminNotesText);
      setOrders((prev) =>
        prev.map((o) => (o.id === notesOrder.id ? { ...o, adminNotes: adminNotesText } : o))
      );
      setNotesOrder(null);
    } catch (err) {
      alert('Gagal menyimpan catatan admin.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatWhatsAppNumber = (phoneStr: string) => {
    let digits = (phoneStr || '').replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.slice(1);
    } else if (digits.startsWith('8')) {
      digits = '62' + digits;
    }
    return digits;
  };

  // Follow-up Tagihan WhatsApp ke Toko / PIC (Requirement 1)
  const handleWhatsAppBilling = (order: AdminOrderRow) => {
    const waPhone = formatWhatsAppNumber(order.phone);
    const storeLabel = order.storeName ? `*${order.storeName}* (${order.customerName})` : `*${order.customerName}*`;
    const totalFormatted = formatCurrency(order.total);
    const itemsList = order.items.map((it) => `  • ${it.quantity}x ${it.productName}`).join('\n');

    const message =
      `📦 *RADAR MINERAL MAKASSAR — INVOICE & TAGIHAN PASOKAN*\n` +
      `══════════════════════════════\n` +
      `Kepada Yth. ${storeLabel}\n` +
      `📋 *Kode Pesanan:* \`${order.orderCode}\`\n` +
      `📅 *Tanggal Pesan:* ${formatDate(order.createdAt)}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛒 *RINCIAN PASOKAN:*\n` +
      `${itemsList}\n\n` +
      `💰 *TOTAL TAGIHAN:* *${totalFormatted}*\n` +
      `💳 *Status Pembayaran:* *${order.paymentStatus || 'Belum Dibayar'}*\n` +
      `🏷️ *Metode Pembayaran:* *${order.paymentMethod.toUpperCase()}*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🏦 *REKENING RESMI PEMBAYARAN:*\n` +
      `• Bank: *BCA (Bank Central Asia)*\n` +
      `• No. Rekening: *789-012-3456*\n` +
      `• Atas Nama: *Koperasi Radar Mineral*\n\n` +
      `📌 *Konfirmasi Pembayaran:*\n` +
      `Mohon kirimkan foto/tangkapan layar bukti transfer ke chat ini untuk pencatatan di sistem admin.\n\n` +
      `══════════════════════════════\n` +
      `_Layanan Pasokan Air Minum Higienis B2B Makassar_\n` +
      `_Terima kasih atas kerja sama dan kepercayaannya!_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');
  };

  // Update Pengiriman Armada & ETA via WhatsApp
  const handleWhatsAppShippingUpdate = (order: AdminOrderRow) => {
    const waPhone = formatWhatsAppNumber(order.phone);
    const storeLabel = order.storeName ? `*${order.storeName}* (${order.customerName})` : `*${order.customerName}*`;
    const itemsList = order.items.map((it) => `  • ${it.quantity}x ${it.productName}`).join('\n');
    const etaInfo = order.etaText ? `\n⏱️ *Estimasi Tiba (ETA):* *${order.etaText}*` : '';

    const message =
      `*RADAR MINERAL — UPDATE PENGIRIMAN ARMADA*\n` +
      `══════════════════════════════\n` +
      `Halo ${storeLabel},\n\n` +
      `Kabar baik! Pasokan air mineral pesanan Anda saat ini:\n` +
      `*Status:* *${STATUS_META[order.status]?.label || order.status.toUpperCase()}* 🚛` +
      `${etaInfo}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Kode Pesanan:* \`${order.orderCode}\`\n` +
      `*Alamat Tujuan:* ${order.address} (${order.district})\n\n` +
      `*Rincian Muatan:*\n` +
      `${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Supir armada kami sedang dalam perjalanan menuju lokasi toko Anda. Mohon pastikan area penerimaan telah siap.\n\n` +
      `══════════════════════════════\n` +
      `_Layanan Distribusi Armada Radar Mineral Makassar_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');
  };

  // Chat Langsung WhatsApp dengan Toko / PIC
  const handleDirectWhatsAppChat = (order: AdminOrderRow) => {
    const waPhone = formatWhatsAppNumber(order.phone);
    const storeLabel = order.storeName ? `*${order.storeName}*` : `*${order.customerName}*`;
    const message =
      `Halo ${storeLabel}, kami dari Admin Distributor Radar Mineral Makassar terkait pesanan \`${order.orderCode}\`...`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');
  };

  // Requirement 5.5 & 5.6: Generate & Unduh Laporan Excel / CSV
  const handleExportExcel = () => {
    if (filtered.length === 0) {
      alert('Tidak ada data pesanan yang sesuai dengan filter untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'Tanggal Pesan',
      'Kode Pesanan',
      'Nama Toko',
      'PIC / Pemesan',
      'No. WhatsApp',
      'Kecamatan',
      'Alamat Lengkap',
      'Rincian Item',
      'Total Nilai (Rp)',
      'Status Pengiriman',
      'Status Pembayaran',
      'Metode Pembayaran',
      'No. Referensi Transfer',
      'Catatan Toko',
      'Catatan Internal Admin',
    ];

    const rows = filtered.map((o, idx) => {
      const itemsStr = o.items
        .map((it) => `${it.quantity}x ${it.productName}`)
        .join('; ');

      return [
        idx + 1,
        formatDate(o.createdAt),
        o.orderCode,
        `"${(o.storeName || '-').replace(/"/g, '""')}"`,
        `"${(o.customerName || '-').replace(/"/g, '""')}"`,
        `'${o.phone}`,
        `"${(o.district || '').replace(/"/g, '""')}"`,
        `"${(o.address || '').replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.total,
        o.status.toUpperCase(),
        `"${(o.paymentStatus || 'Belum Dibayar').replace(/"/g, '""')}"`,
        o.paymentMethod.toUpperCase(),
        `"${(o.paymentReference || '-').replace(/"/g, '""')}"`,
        `"${(o.notes || '-').replace(/"/g, '""')}"`,
        `"${(o.adminNotes || '-').replace(/"/g, '""')}"`,
      ];
    });

    // Baris Total Ringkasan di akhir
    const totalNilaiPeriod = filtered.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalLunasPeriod = filtered
      .filter((o) => o.paymentStatus === 'Sudah Dibayar')
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalPiutangPeriod = totalNilaiPeriod - totalLunasPeriod;

    const summaryRow = [
      'TOTAL KESELURUHAN',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      `Total Pesanan: ${filtered.length}`,
      totalNilaiPeriod,
      `Lunas: Rp ${totalLunasPeriod.toLocaleString('id-ID')}`,
      `Piutang: Rp ${totalPiutangPeriod.toLocaleString('id-ID')}`,
      '',
      '',
      '',
      '',
    ];

    const csvContent =
      '\uFEFF' + // UTF-8 BOM untuk Microsoft Excel agar karakter & aksen tidak rusak
      [headers.join(','), ...rows.map((r) => r.join(',')), summaryRow.join(',')].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const todayStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Pesanan_Radar_Mineral_${dateRangeFilter}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-[#007AFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base font-sora leading-tight text-gray-900">
                  Dashboard B2B Radar Mineral
                </h1>
                <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-[#007AFF] font-bold rounded-full">
                  Admin Pusat
                </span>
              </div>
              <p className="text-xs text-gray-400">{adminEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Unduh rekap data pesanan dalam format Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Laporan Excel</span>
            </button>

            <button
              onClick={load}
              className="p-2 text-gray-500 hover:text-[#007AFF] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              title="Muat ulang data pesanan"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={async () => {
                await signOutAdmin();
                onLoggedOut();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Financial & Operations Summary Cards (Requirement 1 & PRD Specs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Omzet */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sora">
                Total Transaksi
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1 font-sora">
                {formatCurrency(summaryStats.totalRevenue)}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{orders.length} total pesanan masuk</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#007AFF] flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Piutang (Belum Lunas) - P0 PRIORITY */}
          <div
            onClick={() => setPaymentFilter('belum_lunas')}
            className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${paymentFilter === 'belum_lunas'
                ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20'
                : 'border-gray-200 hover:border-red-300'
              }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider font-sora">
                  Total Piutang (Belum Lunas)
                </p>
              </div>
              <h3 className="text-xl font-bold text-red-600 mt-1 font-sora">
                {formatCurrency(summaryStats.totalUnpaidRevenue)}
              </h3>
              <p className="text-[11px] text-red-500 font-semibold mt-0.5">
                {summaryStats.totalUnpaidCount} pesanan perlu ditagih
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Total Lunas */}
          <div
            onClick={() => setPaymentFilter('lunas')}
            className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${paymentFilter === 'lunas'
                ? 'border-green-500 ring-2 ring-green-100 bg-green-50/20'
                : 'border-gray-200 hover:border-green-300'
              }`}
          >
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider font-sora">
                Pembayaran Lunas
              </p>
              <h3 className="text-xl font-bold text-green-700 mt-1 font-sora">
                {formatCurrency(summaryStats.totalPaidRevenue)}
              </h3>
              <p className="text-[11px] text-green-600 font-medium mt-0.5">
                {summaryStats.totalPaidCount} pesanan selesai bayar
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Volume Terjual (Dus 220ml & Galon 19L) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sora">
                Volume Pasokan Terjual
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-bold text-gray-900 font-sora">
                  {summaryStats.totalDusCount} Dus
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-base font-bold text-gray-900 font-sora">
                  {summaryStats.totalGalonCount} Galon
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">2 SKU Aktif B2B</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter Toolbar & Search */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          {/* Row 1: Search & Date Range */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama toko, PIC, nomor HP, kecamatan, atau kode pesanan..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
              />
            </div>

            {/* Date Range Dropdown */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as DateRangeFilter)}
                className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
              >
                <option value="semua">Semua Periode</option>
                <option value="hari_ini">Hari Ini</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="7_hari">7 Hari Terakhir</option>
              </select>
            </div>

            {/* Mobile Export Button */}
            <button
              onClick={handleExportExcel}
              className="sm:hidden flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>
          </div>

          {/* Row 2: Status Pengiriman Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-400 font-semibold self-center mr-1 shrink-0">Status:</span>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${activeTab === tab.value
                    ? 'bg-[#007AFF] text-white border-[#007AFF]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
              >
                {tab.label} ({counts[tab.value] || 0})
              </button>
            ))}
          </div>

          {/* Row 3: Payment Status Filter Tabs (Requirement 1.1) */}
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-400 font-semibold mr-1">Pembayaran:</span>
            <button
              onClick={() => setPaymentFilter('semua')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${paymentFilter === 'semua'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Semua
            </button>
            <button
              onClick={() => setPaymentFilter('belum_lunas')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${paymentFilter === 'belum_lunas'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400" />
              🔴 Belum Dibayar ({summaryStats.totalUnpaidCount})
            </button>
            <button
              onClick={() => setPaymentFilter('lunas')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${paymentFilter === 'lunas'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-400" />
              🟢 Lunas ({summaryStats.totalPaidCount})
            </button>
            <button
              onClick={() => setPaymentFilter('dp')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${paymentFilter === 'dp'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
            >
              🟡 DP (Sebagian)
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
        )}

        {/* Orders Listing */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-[#007AFF]" />
            <p className="text-xs">Memuat pesanan B2B...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">Tidak ada pesanan di kategori atau filter ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const meta = STATUS_META[order.status] || STATUS_META.baru;
              const isUpdating = updatingId === order.id;
              const nextIdx = STATUS_FLOW.indexOf(order.status as OrderStatus);
              const nextStatus =
                nextIdx >= 0 && nextIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[nextIdx + 1] : null;
              const isFinal = order.status === 'batal' || order.status === 'selesai';
              const waPhone = formatWhatsAppNumber(order.phone);
              const cancelCount = cancelCountsByPhone[waPhone] || 0;

              const isUnpaid = order.paymentStatus !== 'Sudah Dibayar';

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${isUnpaid && order.status === 'selesai'
                      ? 'border-red-300 bg-red-50/10'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {/* Top Bar Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-gray-900">{order.orderCode}</span>

                      {/* Store Name Badge */}
                      {order.storeName ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-[#007AFF] border border-blue-200">
                          <Building2 className="w-3 h-3" />
                          {order.storeName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                          Toko Mandiri
                        </span>
                      )}

                      {/* Order Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${meta.bg} ${meta.text}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>

                      {/* ETA Display if Delivering */}
                      {order.etaText && order.status === 'dikirim' && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                          ETA: {order.etaText}
                        </span>
                      )}

                      {/* Anti-Fiktif Warning Badge (Requirement 3) */}
                      {cancelCount > 0 && order.status !== 'batal' && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300"
                          title="Nomor HP / Toko ini pernah memiliki riwayat pembatalan pesanan"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          Pernah Batal {cancelCount}x
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info & Store Details */}
                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600 mb-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[10px]">PIC / Penanggung Jawab:</span>
                      <span className="font-semibold text-gray-900 text-sm">{order.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Kontak WhatsApp:</span>
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#007AFF] hover:underline inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {order.phone}
                      </a>
                    </div>
                    <div className="sm:col-span-2 pt-1">
                      <span className="text-gray-400 block text-[10px]">Alamat Pengiriman Toko:</span>
                      <span className="flex items-center gap-1 text-gray-800">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {order.address} ({order.district})
                      </span>
                    </div>

                    {order.notes && (
                      <div className="sm:col-span-2 text-gray-500 italic text-[11px]">
                        Catatan Toko: {order.notes}
                      </div>
                    )}

                    {order.adminNotes && (
                      <div className="sm:col-span-2 bg-amber-50 text-amber-900 px-2 py-1 rounded border border-amber-200 text-[11px] font-medium flex items-center justify-between">
                        <span>📌 Catatan Internal: {order.adminNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Ordered Items List */}
                  <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3 space-y-1.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-xs text-gray-800 flex justify-between items-center">
                        <span className="font-medium">• {item.productName}</span>
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                          {item.quantity} {item.productName.toLowerCase().includes('dus') ? 'Dus' : 'Galon'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action Bar: Payment Management & Status Progression */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Total IDR */}
                      <div>
                        <span className="text-[10px] text-gray-400 block">Total Tagihan:</span>
                        <span className="font-bold text-base text-[#007AFF] font-sora">
                          {formatCurrency(order.total)}
                        </span>
                      </div>

                      {/* Payment Status Pill with Quick Edit Button */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
                        <button
                          onClick={() => {
                            setPaymentEditOrder(order);
                            setEditPaymentStatus(order.paymentStatus || 'Belum Dibayar');
                            setEditPaymentRef(order.paymentReference || '');
                            setEditAmountPaid(order.amountPaid || 0);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${order.paymentStatus === 'Sudah Dibayar'
                              ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                              : order.paymentStatus === 'DP (Sebagian)'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                            }`}
                          title="Klik untuk ubah status pembayaran / tambah no ref transfer"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>{order.paymentStatus || 'Belum Dibayar'}</span>
                          <Edit3 className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      </div>
                    </div>

                    {/* Right action buttons: WhatsApp CTAs, Invoice, Admin Notes, Status Advance */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-[#007AFF]" />}

                      {/* WhatsApp Billing Reminder CTA */}
                      {isUnpaid && order.status !== 'batal' && (
                        <button
                          onClick={() => handleWhatsAppBilling(order)}
                          className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title="Kirim pesan tagihan resmi & instruksi transfer ke WhatsApp pemilik toko"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          <span>Tagih WA</span>
                        </button>
                      )}

                      {/* WhatsApp Shipping Update CTA */}
                      {(order.status === 'diproses' || order.status === 'dikirim') && (
                        <button
                          onClick={() => handleWhatsAppShippingUpdate(order)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          title="Kirim pesan update pengiriman armada & estimasi tiba ke WhatsApp toko"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Info Kirim WA</span>
                        </button>
                      )}

                      {/* Invoice Button (Requirement 5) */}
                      <button
                        onClick={() => setInvoiceOrder(order)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Tampilkan invoice resmi siap cetak / simpan PDF"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      {/* Admin Internal Notes Button */}
                      <button
                        onClick={() => {
                          setNotesOrder(order);
                          setAdminNotesText(order.adminNotes || '');
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl cursor-pointer"
                        title="Tambah / edit catatan internal admin"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Progression Step Button */}
                      {!isFinal && nextStatus && (
                        <button
                          onClick={() => {
                            if (nextStatus === 'dikirim') {
                              setEtaPromptOrder(order);
                            } else {
                              handleStatusChange(order, nextStatus);
                            }
                          }}
                          disabled={isUpdating}
                          className="px-3.5 py-1.5 bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs active:scale-95"
                        >
                          Tandai {STATUS_META[nextStatus].label} →
                        </button>
                      )}

                      {!isFinal && (
                        <button
                          onClick={() => handleStatusChange(order, 'batal')}
                          disabled={isUpdating}
                          className="px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 disabled:opacity-50 text-gray-500 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Batalkan
                        </button>
                      )}

                      {isFinal && (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                          disabled={isUpdating}
                          className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs cursor-pointer bg-white"
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

      {/* ========================================================================= */}
      {/* MODAL 1: INVOICE SEDERHANA SIAP CETAK (Requirement 5)                      */}
      {/* ========================================================================= */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between print:hidden">
              <span className="font-bold text-sm font-sora">Dokumen Invoice Resmi</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="p-1 hover:bg-white/20 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-[#191c1e] text-xs">
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b border-gray-200 pb-6">
                <div>
                  <img src={LOGO_URL} alt="Radar Mineral" className="h-12 w-auto object-contain mb-2" />
                  <h2 className="font-bold text-base text-gray-900 font-sora">RADAR MINERAL MAKASSAR</h2>
                  <p className="text-gray-500 leading-relaxed text-[11px]">
                    Distributor & Depot Pasokan Air Minum Higienis<br />
                    {ADDRESS_DISPLAY}<br />
                    Kontak: {PHONE_DISPLAY} • Email: {EMAIL_DISPLAY}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#007AFF]">INVOICE PENJUALAN</span>
                  <p className="text-base font-bold font-mono text-gray-900 mt-1">{invoiceOrder.orderCode}</p>
                  <p className="text-gray-500 text-[11px]">Tanggal: {formatDate(invoiceOrder.createdAt)}</p>
                  <span
                    className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${invoiceOrder.paymentStatus === 'Sudah Dibayar'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                  >
                    STATUS: {invoiceOrder.paymentStatus || 'BELUM LUNAS'}
                  </span>
                </div>
              </div>

              {/* Customer / Store Details */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Tagihan Ditujukan Kepada:</span>
                  <p className="font-bold text-sm text-gray-900">{invoiceOrder.storeName || invoiceOrder.customerName}</p>
                  <p className="text-gray-700">PIC: {invoiceOrder.customerName}</p>
                  <p className="text-gray-600">No. WhatsApp: {invoiceOrder.phone}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Alamat Pengiriman Toko:</span>
                  <p className="text-gray-800">{invoiceOrder.address}</p>
                  <p className="text-gray-600">Kecamatan {invoiceOrder.district}, Makassar</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500 text-[11px]">
                    <th className="py-2.5 font-bold">No</th>
                    <th className="py-2.5 font-bold">Deskripsi Produk</th>
                    <th className="py-2.5 font-bold text-center">Jumlah</th>
                    <th className="py-2.5 font-bold text-right">Harga Satuan</th>
                    <th className="py-2.5 font-bold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {invoiceOrder.items.map((it, i) => {
                    const subtotal = (it.quantity || 1) * (it.unitPrice || 0);
                    return (
                      <tr key={i}>
                        <td className="py-2.5 text-gray-500">{i + 1}</td>
                        <td className="py-2.5 font-semibold text-gray-900">{it.productName}</td>
                        <td className="py-2.5 text-center font-bold">{it.quantity}</td>
                        <td className="py-2.5 text-right text-gray-600">{formatCurrency(it.unitPrice || 0)}</td>
                        <td className="py-2.5 text-right font-bold text-gray-900">{formatCurrency(subtotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={4} className="py-3 font-bold text-right text-sm">TOTAL TAGIHAN:</td>
                    <td className="py-3 text-right font-bold text-base text-[#007AFF] font-sora">
                      {formatCurrency(invoiceOrder.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Payment Details Note */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs space-y-1">
                <span className="font-bold text-blue-900 block">Informasi Pembayaran:</span>
                <p className="text-gray-700">Metode Bayar: <b>{invoiceOrder.paymentMethod.toUpperCase()}</b></p>
                <p className="text-gray-700 font-mono bg-white p-2 rounded border border-blue-200 inline-block">
                  Transfer Bank BCA: <b>789-012-3456</b> (a.n. Koperasi Radar Mineral)
                </p>
                {invoiceOrder.paymentReference && (
                  <p className="text-gray-600 text-[11px]">No. Ref: {invoiceOrder.paymentReference}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ETA SELECTION DIALOG KETIKA STATUS BERUBAH KE 'DIKIRIM'           */}
      {/* ========================================================================= */}
      {etaPromptOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#007AFF]" />
                <h3 className="font-bold text-sm font-sora text-gray-900">Kirim Armada & Set Estimasi Tiba (ETA)</h3>
              </div>
              <button onClick={() => setEtaPromptOrder(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Toko <b>{etaPromptOrder.storeName || etaPromptOrder.customerName}</b> di {etaPromptOrder.district}. Pilih estimasi waktu tiba armada kurir untuk ditampilkan di pelacakan pelanggan:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {['±30 Menit', '±1 Jam', '±2 Jam'].map((eta) => (
                <button
                  key={eta}
                  type="button"
                  onClick={() => {
                    setSelectedEta(eta);
                    setCustomEta('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${selectedEta === eta && !customEta
                      ? 'bg-[#007AFF] text-white border-[#007AFF]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  {eta}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Atau masukkan custom ETA:</label>
              <input
                type="text"
                placeholder="Contoh: Jam 14.30 WITA / 45 Menit"
                value={customEta}
                onChange={(e) => setCustomEta(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setEtaPromptOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleStatusChange(etaPromptOrder, 'dikirim', customEta.trim() || selectedEta)}
                className="px-5 py-2 bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Konfirmasi Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PAYMENT STATUS & REFERENCE EDITOR (Requirement 1.4 & 1.5)        */}
      {/* ========================================================================= */}
      {paymentEditOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#007AFF]" />
                <h3 className="font-bold text-sm font-sora text-gray-900">Kelola Status Pembayaran</h3>
              </div>
              <button onClick={() => setPaymentEditOrder(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p>Pesanan: <b>{paymentEditOrder.orderCode}</b> ({paymentEditOrder.storeName || paymentEditOrder.customerName})</p>
              <p>Total Tagihan: <b className="text-[#007AFF]">{formatCurrency(paymentEditOrder.total)}</b></p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status Bayar:</label>
                <select
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                >
                  <option value="Belum Dibayar">🔴 Belum Dibayar</option>
                  <option value="Sudah Dibayar">🟢 Sudah Dibayar / Lunas</option>
                  <option value="DP (Sebagian)">🟡 DP (Sebagian)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">No. Referensi Transfer / Catatan Bayar:</label>
                <input
                  type="text"
                  placeholder="Misal: Ref BCA 892019 / Transfer a.n Toko Rezeki"
                  value={editPaymentRef}
                  onChange={(e) => setEditPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                />
              </div>

              {editPaymentStatus === 'DP (Sebagian)' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nominal DP yang Diterima (Rp):</label>
                  <input
                    type="number"
                    value={editAmountPaid}
                    onChange={(e) => setEditAmountPaid(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setPaymentEditOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSavePaymentDetails}
                className="px-5 py-2 bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Simpan Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADMIN INTERNAL NOTES (Requirement 3.2)                           */}
      {/* ========================================================================= */}
      {notesOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#007AFF]" />
                <h3 className="font-bold text-sm font-sora text-gray-900">Catatan Internal Admin</h3>
              </div>
              <button onClick={() => setNotesOrder(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Catatan khusus untuk toko <b>{notesOrder.storeName || notesOrder.customerName}</b> (hanya bisa dilihat oleh admin):
            </p>

            <textarea
              rows={3}
              placeholder="Contoh: Toko langganan rutin tiap Kamis, pembayaran lancar, PIC ramah..."
              value={adminNotesText}
              onChange={(e) => setAdminNotesText(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
            />

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setNotesOrder(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAdminNotes}
                className="px-5 py-2 bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

