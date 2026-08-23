import React from 'react';
import { PageTab } from '../../types';
import { LOGO_URL, GALLON_IMAGE } from '../../data/mockData';
import { ShieldCheck, Award, Droplets, HeartHandshake, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (tab: PageTab) => void;
  onOpenOrder: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, onOpenOrder }) => {
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
          <span className="text-[#007AFF] font-semibold">Tentang Kami</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-[38px] sm:text-[48px] font-bold text-[#191c1e] font-sora mb-3 tracking-[-0.03em]">
            Tentang Radar Mineral
          </h1>
          <p className="text-[17px] sm:text-[18px] text-[#414755] leading-relaxed">
            Menghadirkan hidrasi sehat, segar, dan murni untuk jutaan keluarga dan institusi di Kota Makassar sejak bertahun-tahun.
          </p>
        </div>
      </section>

      {/* Story & Vision Section */}
      <section className="max-w-[1280px] mx-auto px-5 md:px-12 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-[#c1c6d7]/30 shadow-xs">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold">
              <Droplets className="w-3.5 h-3.5" />
              <span>Kemurnian Tanpa Kompromi</span>
            </div>
            <h2 className="text-[28px] sm:text-[34px] font-bold text-[#191c1e] font-sora leading-snug">
              Dedikasi untuk Kualitas Air Minum Terbaik di Sulawesi Selatan
            </h2>
            <p className="text-[#414755] text-[15px] leading-relaxed">
              Radar Mineral didirikan dengan misi sederhana namun mendasar: menyediakan air minum murni yang higienis, aman, dan mudah diakses oleh seluruh lapisan masyarakat di Kota Makassar.
            </p>
            <p className="text-[#414755] text-[15px] leading-relaxed">
              Melalui sistem filtrasi multi-tahap modern, sterilisasi ozon (O3) bersuhu tinggi, serta penyinaran sinar Ultra Violet (UV), kami memastikan setiap tetes air yang sampai ke rumah Anda memenuhi standar ketat Kementerian Kesehatan RI dan SNI.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <span className="text-3xl font-extrabold text-[#007AFF] font-sora">100%</span>
                <p className="text-xs text-gray-500 mt-0.5">Lolos Uji Laboratorium Rutin</p>
              </div>
              <div>
                <span className="text-3xl font-extrabold text-[#007AFF] font-sora">19 Liter</span>
                <p className="text-xs text-gray-500 mt-0.5">Kapasitas Standar Galon Higienis</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <img
              src={GALLON_IMAGE}
              alt="Pabrik dan Galon Radar Mineral"
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Standar Produksi</span>
                <h4 className="text-lg font-bold font-sora">Higienitas Galon Tertutup Rapat</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Excellence */}
      <section className="w-full bg-[#f2f4f6] py-20 border-y border-[#c1c6d7]/30">
        <div className="max-w-[1280px] mx-auto px-5 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h3 className="text-[28px] sm:text-[34px] font-bold text-[#191c1e] font-sora mb-2">
              4 Standar Utama Kami
            </h3>
            <p className="text-[#414755] text-[15px]">
              Fondasi yang menjaga kepercayaan pelanggan Radar Mineral setiap hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <ShieldCheck className="w-8 h-8 text-[#007AFF] mb-4" />
              <h4 className="font-bold text-base text-gray-900 font-sora mb-2">Sertifikasi Lengkap</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Terdaftar di BPOM RI, bersertifikat SNI 01-3553-2006, dan memiliki sertifikasi Halal MUI.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <Sparkles className="w-8 h-8 text-[#007AFF] mb-4" />
              <h4 className="font-bold text-base text-gray-900 font-sora mb-2">Pencucian 7 Tahap</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Galon melewati desinfeksi luar dalam, pembilasan tekanan tinggi, dan sterilisasi ozon.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <Award className="w-8 h-8 text-[#007AFF] mb-4" />
              <h4 className="font-bold text-base text-gray-900 font-sora mb-2">Mineral Alami Seimbang</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Kandungan mineral esensial terjaga untuk mendukung metabolisme dan kesegaran tubuh.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <HeartHandshake className="w-8 h-8 text-[#007AFF] mb-4" />
              <h4 className="font-bold text-base text-gray-900 font-sora mb-2">Pelayanan Ramah</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tim pengantaran sopan, tepat waktu, dan siap membantu hingga galon terpasang di dispenser.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
