import React from 'react';
import { PageTab } from '../types';
import { LOGO_URL, ADDRESS_DISPLAY, PHONE_DISPLAY, EMAIL_DISPLAY, MAPS_URL } from '../data/mockData';
import { Globe, Mail, Smartphone, MapPin, Phone, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: PageTab) => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy, onOpenTerms }) => {
  const handleNav = (tab: PageTab) => {
    onNavigate(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#f2f4f6] pt-16 md:pt-24 pb-10 border-t border-[#c1c6d7]/30">
      <div className="max-w-[1280px] mx-auto px-5 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          {/* Brand Col */}
          <div className="space-y-5">
            <img
              src={LOGO_URL}
              alt="Radar Mineral Logo"
              className="h-12 w-auto object-contain"
            />
            <p className="text-[#414755] text-[15px] leading-relaxed">
              Menghadirkan kesegaran mineral murni dengan standar kualitas premium untuk kesehatan keluarga Anda di Makassar.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#web"
                title="Website Resmi"
                className="w-10 h-10 rounded-full bg-white border border-[#c1c6d7]/40 flex items-center justify-center text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-all shadow-sm"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${EMAIL_DISPLAY}`}
                title="Kirim Email"
                className="w-10 h-10 rounded-full bg-white border border-[#c1c6d7]/40 flex items-center justify-center text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-all shadow-sm"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={`tel:${PHONE_DISPLAY.replace(/[^0-9]/g, '')}`}
                title="Hubungi Telepon"
                className="w-10 h-10 rounded-full bg-white border border-[#c1c6d7]/40 flex items-center justify-center text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-all shadow-sm"
              >
                <Smartphone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 lg:pl-4">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#191c1e] font-sora">
              Tautan Cepat
            </h4>
            <nav className="flex flex-col space-y-3 text-[15px]">
              <button
                onClick={() => handleNav('beranda')}
                className="text-left text-[#414755] hover:text-[#007AFF] transition-colors cursor-pointer"
              >
                Beranda
              </button>
              <button
                onClick={() => handleNav('produk')}
                className="text-left text-[#414755] hover:text-[#007AFF] transition-colors cursor-pointer"
              >
                Produk
              </button>
              <button
                onClick={() => handleNav('cara-pesan')}
                className="text-left text-[#414755] hover:text-[#007AFF] transition-colors cursor-pointer"
              >
                Cara Pesan
              </button>
              <button
                onClick={() => handleNav('tentang-kami')}
                className="text-left text-[#414755] hover:text-[#007AFF] transition-colors cursor-pointer"
              >
                Tentang Kami
              </button>
              <button
                onClick={() => handleNav('faq')}
                className="text-left text-[#414755] hover:text-[#007AFF] transition-colors cursor-pointer"
              >
                FAQ & Bantuan
              </button>
            </nav>
          </div>

          {/* Contact Col */}
          <div className="space-y-4">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#191c1e] font-sora">
              Kontak Kami
            </h4>
            <div className="flex flex-col space-y-3.5 text-[14px] text-[#414755]">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group hover:text-[#007AFF] transition-colors"
                title="Buka Lokasi di Google Maps"
              >
                <MapPin className="w-5 h-5 text-[#007AFF] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="leading-relaxed underline decoration-dotted decoration-gray-400 group-hover:decoration-[#007AFF]">
                  {ADDRESS_DISPLAY}
                </span>
              </a>
              <a
                href={`tel:${PHONE_DISPLAY.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-3 hover:text-[#007AFF] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#007AFF] shrink-0" />
                <span>{PHONE_DISPLAY}</span>
              </a>
              <a
                href={`mailto:${EMAIL_DISPLAY}`}
                className="flex items-center gap-3 hover:text-[#007AFF] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#007AFF] shrink-0" />
                <span>{EMAIL_DISPLAY}</span>
              </a>
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#191c1e] font-sora">
              Sertifikasi
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 bg-white border border-[#c1c6d7]/40 rounded-xl flex flex-col items-center justify-center p-2 shadow-xs hover:border-[#007AFF]/40 transition-colors">
                <span className="text-[#0058bc] font-bold text-[12px] tracking-wider font-sora">
                  SNI CERT
                </span>
                <span className="text-[10px] text-[#717786]">01-3553-2006</span>
              </div>
              <div className="h-14 bg-white border border-[#c1c6d7]/40 rounded-xl flex flex-col items-center justify-center p-2 shadow-xs hover:border-[#007AFF]/40 transition-colors">
                <span className="text-[#0058bc] font-bold text-[12px] tracking-wider font-sora">
                  BPOM RI
                </span>
                <span className="text-[10px] text-[#717786]">MD 265228001</span>
              </div>
              <div className="h-14 bg-white border border-[#c1c6d7]/40 rounded-xl flex flex-col items-center justify-center p-2 shadow-xs hover:border-[#007AFF]/40 transition-colors">
                <span className="text-[#0058bc] font-bold text-[12px] tracking-wider font-sora">
                  HALAL ID
                </span>
                <span className="text-[10px] text-[#717786]">ID001100002</span>
              </div>
              <div className="h-14 bg-white border border-[#c1c6d7]/40 rounded-xl flex flex-col items-center justify-center p-2 shadow-xs hover:border-[#007AFF]/40 transition-colors">
                <span className="text-[#0058bc] font-bold text-[12px] tracking-wider font-sora">
                  KUALITAS
                </span>
                <span className="text-[10px] text-[#717786]">Lab Terakreditasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-[#c1c6d7]/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[13px] text-[#717786]">
          <p>© 2024 Radar Mineral. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-[#007AFF] transition-colors cursor-pointer"
            >
              Kebijakan Privasi
            </button>
            <button
              onClick={onOpenTerms}
              className="hover:text-[#007AFF] transition-colors cursor-pointer"
            >
              Syarat & Ketentuan
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
