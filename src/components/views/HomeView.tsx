import React from 'react';
import { PageTab } from '../../types';
import {
  GALLON_IMAGE,
  BOX_IMAGE,
  WHATSAPP_NUMBER,
} from '../../data/mockData';
import {
  ShoppingCart,
  ShieldCheck,
  Award,
  Truck,
  Tag,
  Sparkles,
  MessageSquare,
  Droplets,
  ArrowRight,
  Building2,
  Box,
  Store,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: PageTab) => void;
  onOpenOrder: (productId?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenOrder }) => {
  const handleWhatsAppDirect = (productTitle: string) => {
    const msg = `Halo Distributor Radar Mineral Makassar, saya pemilik toko/usaha ingin memesan pasokan grosir *${productTitle}*. Mohon info pengiriman armada. Terima kasih.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="w-full flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[600px] lg:min-h-[680px] bg-gradient-to-r from-white via-white/95 to-blue-50/50 flex items-center overflow-hidden pt-12 pb-16 lg:py-20 border-b border-[#c1c6d7]/20">
        {/* Background Image overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 pointer-events-none opacity-25 lg:opacity-85 mix-blend-multiply flex items-center justify-end overflow-hidden">
          <div className="relative w-full h-full">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiIjJC08yhMhzI51Ew6bID79AuWytQhm_vLcpbVjCo8QU1fjkF3c84hf76sjh6vDqNC5_YdPS5n5o-W9E18zMxPkDe_GroDMHlN9D4E9gySVfQuFhYJc8JPaVBtQGtrpL6Qasmwzh6-2zePs-wZyil67Lh8VBLJ8mG1lf7L8HJpDW-SbH0euLaa4ByfJlHKJulyxsWepOvWhEHvqPM5hNQjVg5AwZEK69AaSjmGr4BE2K_kCS-1OUi"
              alt="Water bottle splash"
              className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[720px] max-w-none object-cover opacity-80 filter brightness-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 lg:via-transparent to-transparent" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-[1280px] mx-auto px-5 md:px-12 relative z-10 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-[13px] font-bold mb-6 border border-[#007AFF]/20 font-sora">
              <Store className="w-4 h-4" />
              <span>Distributor Pasokan Grosir B2B Makassar</span>
            </div>

            <h1 className="text-[38px] sm:text-[48px] lg:text-[54px] font-extrabold text-[#191c1e] leading-[1.15] tracking-[-0.03em] font-sora mb-6">
              Pasokan Air Minum Grosir untuk Toko, Minimarket & Grosir
            </h1>

            <p className="text-[17px] sm:text-[19px] text-[#414755] font-normal leading-relaxed mb-8 max-w-xl">
              Distribusi pasokan air mineral resmi ke Toko Bahan Campuran, Minimarket (Alfamart/Indomaret), dan Toko Grosir. Pengantaran armada berjadwal langsung ke toko Anda.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenOrder('dus-220ml')}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-xl font-semibold text-[15px] transition-all shadow-[0_4px_14px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.4)] active:scale-98 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Order Pasokan Grosir</span>
              </button>

              <button
                onClick={() => onNavigate('produk')}
                className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-[#007AFF] border border-[#c1c6d7]/50 rounded-xl font-semibold text-[15px] transition-all shadow-xs hover:border-[#007AFF]/50 cursor-pointer"
              >
                <span>Lihat Katalog Produk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST BADGES ROW */}
      <section className="w-full bg-white border-b border-[#c1c6d7]/30 py-6">
        <div className="max-w-[1280px] mx-auto px-5 md:px-12 flex flex-wrap items-center justify-around gap-6 text-[#414755]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-[13px] tracking-wider uppercase text-[#191c1e] font-sora">
              STANDAR RESMI SNI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
              <Award className="w-5 h-5" />
            </div>
            <span className="font-bold text-[13px] tracking-wider uppercase text-[#191c1e] font-sora">
              TERDAFTAR BPOM RI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#007AFF]/10 flex items-center justify-center text-[#007AFF]">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-[13px] tracking-wider uppercase text-[#191c1e] font-sora">
              MITRA RESMI B2B MAKASSAR
            </span>
          </div>
        </div>
      </section>

      {/* 3. MENGAPA MEMILIH KAMI? */}
      <section className="w-full py-20 lg:py-28 bg-[#f7f9fb]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-[32px] sm:text-[40px] font-bold text-[#191c1e] font-sora mb-3 tracking-[-0.02em]">
              Keunggulan Layanan Distributor Radar
            </h2>
            <p className="text-[16px] text-[#414755]">
              Solusi pasokan air mineral yang stabil, terpercaya, dan menguntungkan untuk toko Anda.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-7 rounded-2xl border border-[#c1c6d7]/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,122,255,0.08)] hover:border-[#007AFF]/30 transition-all duration-300 flex flex-col group">
              <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-[19px] font-bold text-[#191c1e] font-sora mb-3">
                Armada Pengantar Rutin
              </h3>
              <p className="text-[14px] text-[#414755] leading-relaxed">
                Armada distribusi internal siap antar ke toko secara terjadwal tanpa takut kehabisan stok.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-7 rounded-2xl border border-[#c1c6d7]/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,122,255,0.08)] hover:border-[#007AFF]/30 transition-all duration-300 flex flex-col group">
              <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-[19px] font-bold text-[#191c1e] font-sora mb-3">
                Harga Grosir Kompetitif
              </h3>
              <p className="text-[14px] text-[#414755] leading-relaxed">
                Margin keuntungan usaha yang menarik bagi pemilik toko bahan campuran dan minimarket.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-7 rounded-2xl border border-[#c1c6d7]/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,122,255,0.08)] hover:border-[#007AFF]/30 transition-all duration-300 flex flex-col group">
              <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-[19px] font-bold text-[#191c1e] font-sora mb-3">
                Kualitas Higienis SNI
              </h3>
              <p className="text-[14px] text-[#414755] leading-relaxed">
                Produk air murni higienis dengan izin edar resmi BPOM yang diminati konsumen toko.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-7 rounded-2xl border border-[#c1c6d7]/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,122,255,0.08)] hover:border-[#007AFF]/30 transition-all duration-300 flex flex-col group">
              <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-[19px] font-bold text-[#191c1e] font-sora mb-3">
                Pelacakan Transparan
              </h3>
              <p className="text-[14px] text-[#414755] leading-relaxed">
                Pantau progres persiapan dan status armada kurir secara real-time langsung di website.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUK UNGGULAN B2B (2 SKU) */}
      <section className="w-full py-20 lg:py-28 bg-white relative">
        <div className="hidden xl:block absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] font-bold tracking-[0.3em] text-[#007AFF] uppercase font-sora opacity-80 pointer-events-none select-none">
          B2B WHOLESALE
        </div>

        <div className="max-w-[1280px] mx-auto px-5 md:px-12">
          <div className="mb-14">
            <h2 className="text-[32px] sm:text-[40px] font-bold text-[#191c1e] font-sora mb-2 tracking-[-0.02em]">
              Katalog Produk Pasokan Grosir
            </h2>
            <p className="text-[16px] text-[#414755]">
              Dua varian produk utama yang paling banyak dicari konsumen di toko kelontong & minimarket.
            </p>
          </div>

          {/* 2 Featured Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: Air Kemasan Dus 220ml (48 cup) */}
            <div className="bg-[#f7f9fb] border border-[#c1c6d7]/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="h-[280px] sm:h-[340px] w-full relative bg-gray-100 overflow-hidden">
                <img
                  src={BOX_IMAGE}
                  alt="Air Dus 220ml Radar Mineral"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-5 left-5">
                  <span className="px-3.5 py-1 bg-[#007AFF] text-white text-[12px] font-bold rounded-lg shadow-sm font-sora tracking-wide">
                    TERLARIS TOKO
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/90 backdrop-blur-xs text-white text-xs font-bold shadow-md">
                    <Box className="w-3.5 h-3.5" />
                    MOQ: Min 10 Dus
                  </span>
                </div>
              </div>

              <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[24px] font-bold text-[#191c1e] font-sora mb-3">
                    Air Dus 220ml (Isi 48 Cup)
                  </h3>
                  <p className="text-[15px] text-[#414755] leading-relaxed mb-6">
                    Karton isi 48 gelas siap minum 220ml. Sangat laris untuk penjualan harian di toko bahan campuran, minimarket, warung makan, dan acara hajatan warga.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenOrder('dus-220ml')}
                    className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#007AFF] hover:bg-[#0062cc] text-white font-semibold rounded-xl text-[15px] shadow-[0_4px_14px_rgba(0,122,255,0.25)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.35)] transition-all cursor-pointer active:scale-98"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Order Pasokan (Min. 10 Dus)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Galon 19L */}
            <div className="bg-[#f7f9fb] border border-[#c1c6d7]/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="h-[280px] sm:h-[340px] w-full relative bg-gray-100 overflow-hidden">
                <img
                  src={GALLON_IMAGE}
                  alt="Galon 19L Radar Mineral"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-5 left-5">
                  <span className="px-3.5 py-1 bg-[#007AFF] text-white text-[12px] font-bold rounded-lg shadow-sm font-sora tracking-wide">
                    PASOKAN RUTIN
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/90 backdrop-blur-xs text-white text-xs font-bold shadow-md">
                    <Box className="w-3.5 h-3.5" />
                    MOQ: Min 5 Galon
                  </span>
                </div>
              </div>

              <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[24px] font-bold text-[#191c1e] font-sora mb-3">
                    Air Galon 19 Liter
                  </h3>
                  <p className="text-[15px] text-[#414755] leading-relaxed mb-6">
                    Pasokan isi ulang galon 19L higienis berstandar depot steril. Cocok untuk stok jualan kembali di toko kelontong atau kebutuhan operasional badan usaha.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenOrder('galon-19l')}
                    className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#007AFF] hover:bg-[#0062cc] text-white font-semibold rounded-xl text-[15px] shadow-[0_4px_14px_rgba(0,122,255,0.25)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.35)] transition-all cursor-pointer active:scale-98"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Order Pasokan (Min. 5 Galon)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DELIVERY AREA & COVERAGE MAKASSAR BANNER */}
      <section className="w-full py-16 bg-[#007AFF] text-white">
        <div className="max-w-[1280px] mx-auto px-5 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <h3 className="text-[28px] sm:text-[34px] font-bold font-sora">
              Armada Distribusi Toko Seluruh Makassar
            </h3>
            <p className="text-white/90 text-[16px] leading-relaxed">
              Armada kurir internal kami siap mengantarkan pasokan galon dan dus ke Panakkukang, Rappocini, Tamalanrea, Biringkanaya, Ujung Pandang, dan seluruh kecamatan lainnya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onOpenOrder('dus-220ml')}
              className="px-8 py-4 bg-white text-[#007AFF] font-bold rounded-xl text-[15px] hover:bg-gray-100 transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              Order Grosir Sekarang
            </button>
            <button
              onClick={() => onNavigate('cara-pesan')}
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-[15px] transition-colors border border-white/30 cursor-pointer"
            >
              Lihat Alur Toko
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

