import React, { useState } from 'react';
import { WHATSAPP_NUMBER } from '../data/mockData';
import { MessageCircle, X, Send } from 'lucide-react';

interface FloatingWhatsAppProps {
  onDirectOrderClick: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onDirectOrderClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openWhatsAppWithMessage = (msg: string) => {
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick popup menu if opened */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-fadeIn overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold text-[14px] text-gray-800 font-sora">
                Customer Service Radar
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[13px] text-gray-600 my-3 leading-relaxed">
            Layanan CS Distribusi B2B & Armada Toko Radar Mineral Makassar:
          </p>

          <div className="space-y-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onDirectOrderClick();
              }}
              className="w-full text-left px-3 py-2 text-[13px] font-semibold bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 rounded-xl transition-colors flex items-center justify-between"
            >
              <span>Formulir Pesanan Grosir</span>
              <span>→</span>
            </button>

            <button
              onClick={() =>
                openWhatsAppWithMessage(
                  'Halo Admin Distributor Radar Mineral Makassar, saya ingin menanyakan jadwal pengantaran armada untuk pasokan toko kami. Terima kasih.'
                )
              }
              className="w-full text-left px-3 py-2 text-[13px] font-medium bg-green-50 text-green-700 hover:bg-green-100 rounded-xl transition-colors flex items-center justify-between"
            >
              <span>Jadwal Pengantaran Armada</span>
              <Send className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() =>
                openWhatsAppWithMessage(
                  'Halo Tim Kemitraan Radar Mineral, kami toko/grosir bahan campuran ingin mendaftar sebagai mitra pasokan rutin berkala. Mohon informasinya.'
                )
              }
              className="w-full text-left px-3 py-2 text-[13px] font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-between"
            >
              <span>Kemitraan Toko & Grosir</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat WhatsApp Admin Radar Mineral"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer relative"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-bold items-center justify-center">1</span>
        </span>
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
};
