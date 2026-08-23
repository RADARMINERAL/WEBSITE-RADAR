import React, { useState } from 'react';
import { PageTab } from '../../types';
import { MAKASSAR_DISTRICTS, WHATSAPP_NUMBER } from '../../data/mockData';
import { ShoppingBag, MessageSquare, Truck, CreditCard, ChevronRight, CheckCircle2, MapPin, Search } from 'lucide-react';

interface HowToOrderViewProps {
  onNavigate: (tab: PageTab) => void;
  onOpenOrder: () => void;
}

export const HowToOrderView: React.FC<HowToOrderViewProps> = ({ onNavigate, onOpenOrder }) => {
  const [searchDistrict, setSearchDistrict] = useState('');

  const steps = [
    {
      num: '01',
      title: 'Pilih Produk Air Mineral',
      desc: 'Pilih varian Galon 19L untuk kebutuhan rumah/kantor atau Air Dus (botol 600ml/330ml/cup 220ml) untuk acara dan bepergian.',
      icon: ShoppingBag,
    },
    {
      num: '02',
      title: 'Kirim Pesanan via WhatsApp',
      desc: 'Gunakan formulir online di website kami atau kirim pesan singkat ke WhatsApp admin dengan mencantumkan alamat di Makassar.',
      icon: MessageSquare,
    },
    {
      num: '03',
      title: 'Konfirmasi & Pengantaran',
      desc: 'Admin kami segera merespons dan kurir sigap mengantarkan air mineral langsung sampai ke teras atau dispenser Anda.',
      icon: Truck,
    },
    {
      num: '04',
      title: 'Pembayaran Fleksibel',
      desc: 'Bayar dengan praktis saat air tiba menggunakan Scan QRIS, transfer bank (BCA/Mandiri/BRI), atau pembayaran tunai (COD).',
      icon: CreditCard,
    },
  ];

  const matchedDistricts = MAKASSAR_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(searchDistrict.toLowerCase().trim())
  );

  return (
    <div className="w-full bg-[#f7f9fb] min-h-screen">
      {/* Header & Breadcrumb */}
      <section className="w-full max-w-[1280px] mx-auto px-5 md:px-12 pt-12 lg:pt-16 pb-12">
        <nav className="flex items-center gap-2 mb-6 text-[13px] font-medium text-[#414755]">
          <button
            onClick={() => onNavigate('beranda')}
            className="hover:text-[#007AFF] transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#c1c6d7]" />
          <span className="text-[#007AFF] font-semibold">Cara Pesan</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-[38px] sm:text-[48px] font-bold text-[#191c1e] font-sora mb-3 tracking-[-0.03em]">
            Cara Pemesanan
          </h1>
          <p className="text-[17px] sm:text-[18px] text-[#414755] leading-relaxed">
            Proses 4 langkah mudah untuk mendapatkan pasokan air minum segar Radar Mineral langsung di depan pintu rumah Anda di Makassar.
          </p>
        </div>
      </section>

      {/* Step Cards Grid */}
      <section className="max-w-[1280px] mx-auto px-5 md:px-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-[#c1c6d7]/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold text-[#007AFF]/20 font-sora group-hover:text-[#007AFF] transition-colors">
                      {step.num}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-[18px] font-bold text-[#191c1e] font-sora mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-[#414755] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center text-xs text-[#007AFF] font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Proses Cepat & Terverifikasi</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenOrder}
            className="px-8 py-4 bg-[#007AFF] hover:bg-[#0062cc] text-white font-bold rounded-xl text-[16px] shadow-lg shadow-[#007AFF]/25 transition-all hover:scale-102 cursor-pointer"
          >
            Mulai Pesan Sekarang
          </button>
        </div>
      </section>

      {/* Delivery Coverage Checker */}
      <section className="w-full bg-white border-y border-[#c1c6d7]/30 py-16">
        <div className="max-w-[1280px] mx-auto px-5 md:px-12">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Cakupan Pengantaran Resmi</span>
            </div>
            <h2 className="text-[28px] sm:text-[34px] font-bold text-[#191c1e] font-sora mb-3">
              Cek Area Pengantaran di Makassar
            </h2>
            <p className="text-[#414755] text-[15px]">
              Ketik kecamatan tempat tinggal Anda untuk memastikan ketersediaan armada kurir.
            </p>

            {/* District Search */}
            <div className="relative mt-6 max-w-md mx-auto">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kecamatan (contoh: Panakkukang, Tamalanrea)..."
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {matchedDistricts.map((district, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#f7f9fb] border border-gray-200 rounded-xl flex items-center gap-2 text-xs font-medium text-gray-800"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="truncate">Kec. {district}</span>
              </div>
            ))}
          </div>

          {matchedDistricts.length === 0 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Kecamatan tidak ditemukan dalam daftar utama. Jangan khawatir, hubungi admin WhatsApp untuk verifikasi rute khusus.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
