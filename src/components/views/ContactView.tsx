import React, { useState } from 'react';
import { PageTab } from '../../types';
import {
  ADDRESS_DISPLAY,
  PHONE_DISPLAY,
  EMAIL_DISPLAY,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
  MAPS_URL,
} from '../../data/mockData';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  ExternalLink,
  Navigation,
} from 'lucide-react';

interface ContactViewProps {
  onNavigate: (tab: PageTab) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Pemesanan Rutin Kantor/Keluarga');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waText = `*PESAN KONTAK WEBSITE - RADAR MINERAL MAKASSAR*\n\n` +
      `*Nama:* ${name}\n` +
      `*No. Kontak:* ${phone}\n` +
      `*Subjek:* ${subject}\n` +
      `*Pesan:* ${message}\n\n` +
      `Mohon direspons, terima kasih!`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');
    setSubmitted(true);
  };

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
          <span className="text-[#007AFF] font-semibold">Kontak</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-[38px] sm:text-[48px] font-bold text-[#191c1e] font-sora mb-3 tracking-[-0.03em]">
            Hubungi Kami
          </h1>
          <p className="text-[17px] sm:text-[18px] text-[#414755] leading-relaxed">
            Punya pertanyaan mengenai pesanan jumlah besar, kerjasama keagenan, atau pengantaran khusus di Makassar? Kami siap membantu.
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Contact Form */}
      <section className="max-w-[1280px] mx-auto px-5 md:px-12 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Info Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-[#c1c6d7]/30 shadow-xs space-y-8 flex flex-col justify-between">
            <div>
              <h2 className="text-[22px] font-bold text-[#191c1e] font-sora mb-6">
                Informasi Kantor & Depo
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sora">
                      Alamat Depo Utama
                    </h3>
                    <p className="text-sm text-gray-800 font-medium mt-1 leading-relaxed">
                      {ADDRESS_DISPLAY}
                    </p>
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF] hover:text-white rounded-lg text-xs font-semibold transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Petunjuk Arah Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sora">
                      WhatsApp Resmi
                    </h3>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-800 font-medium mt-1 hover:text-green-600 block transition-colors"
                    >
                      {WHATSAPP_DISPLAY}
                    </a>
                    <span className="text-[11px] text-green-600 font-semibold">Online & Respons Cepat</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sora">
                      Telepon / Kontak
                    </h3>
                    <a
                      href={`tel:${PHONE_DISPLAY.replace(/[^0-9]/g, '')}`}
                      className="text-sm text-gray-800 font-medium mt-1 hover:text-[#007AFF] block transition-colors"
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sora">
                      Email
                    </h3>
                    <a
                      href={`mailto:${EMAIL_DISPLAY}`}
                      className="text-sm text-gray-800 font-medium mt-1 hover:text-[#007AFF] block transition-colors"
                    >
                      {EMAIL_DISPLAY}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sora">
                      Jam Layanan Pesan Antar
                    </h3>
                    <p className="text-xs text-gray-700 mt-1">
                      <span className="font-semibold">Senin - Sabtu:</span> 07.30 - 17.30 WITA<br />
                      <span className="font-semibold">Minggu & Libur:</span> 08.00 - 15.00 WITA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl">
              <p className="text-xs text-gray-700 leading-relaxed">
                📍 Melayani pengiriman instan ke kawasan perumahan, perkantoran, instansi pemerintah, dan tempat usaha di penjuru Kota Makassar.
              </p>
            </div>
          </div>

          {/* Form Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#c1c6d7]/30 shadow-xs">
            <h2 className="text-[22px] font-bold text-[#191c1e] font-sora mb-2">
              Kirim Pesan / Pertanyaan
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Pesan Anda akan langsung dihubungkan ke admin layanan pelanggan kami via WhatsApp.
            </p>

            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h4 className="font-bold text-lg text-gray-900 font-sora">Pesan Terkirim!</h4>
                <p className="text-sm text-gray-600">
                  Terima kasih, tim admin Radar Mineral akan segera merespons pertanyaan Anda.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 bg-[#007AFF] text-white text-xs font-semibold rounded-xl"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Nama Anda *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Lengkap / Instansi"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      No. WhatsApp / Telepon *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812-XXXX-XXXX"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Keperluan / Subjek
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                  >
                    <option value="Pemesanan Rutin Kantor/Keluarga">Pemesanan Rutin Kantor / Rumah Tangga</option>
                    <option value="Pemesanan Acara / Event / Pesta">Pemesanan Khusus Acara / Seminar / Hajatan</option>
                    <option value="Kemitraan Toko / Agen Depo">Kerjasama Toko Kelontong / Keagenan</option>
                    <option value="Keluhan / Konfirmasi Pengantaran">Pertanyaan Pengantaran & Layanan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Pesan Detail *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pertanyaan, jumlah galon/dus yang dibutuhkan, atau lokasi alamat Anda di Makassar..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#007AFF] hover:bg-[#0062cc] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan Sekarang</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Location Preview Card */}
        <div className="mt-10 bg-white rounded-3xl p-6 sm:p-8 border border-[#c1c6d7]/30 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#007AFF] font-sora">
                Peta & Navigasi
              </span>
              <h3 className="text-[20px] font-bold text-[#191c1e] font-sora mt-1">
                Lokasi Depo Radar Mineral
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Kunjungi langsung depo kami atau dapatkan rute tercepat via aplikasi Google Maps.
              </p>
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>Buka di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="mt-6 rounded-2xl overflow-hidden border border-gray-200 bg-blue-50/40 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
              <MapPin className="w-7 h-7" />
            </div>
            <div className="max-w-md">
              <h4 className="font-bold text-gray-900 font-sora text-base">Radar Mineral</h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {ADDRESS_DISPLAY}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Tautan Resmi: {MAPS_URL}
              </p>
            </div>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-white border border-[#007AFF] text-[#007AFF] hover:bg-[#007AFF] hover:text-white font-semibold rounded-xl text-xs transition-all shadow-xs"
            >
              Lihat Rute ke Lokasi Sekarang →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
