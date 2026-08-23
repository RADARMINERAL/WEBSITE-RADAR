import React, { useState } from 'react';
import { PageTab } from '../types';
import { LOGO_URL } from '../data/mockData';
import { User, Menu, X, ShoppingCart } from 'lucide-react';

interface HeaderProps {
  currentTab: PageTab;
  onNavigate: (tab: PageTab) => void;
  onOpenOrder: () => void;
  onOpenAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenOrder,
  onOpenAccount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; tab: PageTab }[] = [
    { label: 'Beranda', tab: 'beranda' },
    { label: 'Produk', tab: 'produk' },
    { label: 'Cara Pesan', tab: 'cara-pesan' },
    { label: 'Tentang Kami', tab: 'tentang-kami' },
    { label: 'FAQ', tab: 'faq' },
    { label: 'Kontak', tab: 'kontak' },
  ];

  const handleNavClick = (tab: PageTab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header border-b border-[#c1c6d7]/30 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1280px] mx-auto h-20 md:h-24 px-5 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('beranda')}
          className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
        >
          <img
            src={LOGO_URL}
            alt="Radar Mineral Logo"
            className="h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => {
            const isActive = currentTab === link.tab;
            return (
              <button
                key={link.tab}
                onClick={() => handleNavClick(link.tab)}
                className={`text-[15px] font-medium transition-all relative py-1 cursor-pointer ${
                  isActive
                    ? 'text-[#007AFF] font-bold'
                    : 'text-[#414755] hover:text-[#191c1e]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007AFF] rounded-full animate-fadeIn" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onOpenOrder}
            className="hidden sm:inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-xl text-[14px] font-semibold transition-all shadow-[0_4px_14px_rgba(0,122,255,0.25)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.35)] active:scale-98 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Pesan Sekarang</span>
          </button>

          <button
            onClick={onOpenAccount}
            title="Profil & Status Pesanan"
            aria-label="Profil Akun"
            className="w-10 h-10 rounded-full bg-[#007AFF] hover:bg-[#0062cc] flex items-center justify-center text-white shadow-sm transition-all hover:scale-105 cursor-pointer"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#414755] hover:text-[#191c1e] focus:outline-none rounded-lg cursor-pointer"
            aria-label="Menu Navigasi"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-[#c1c6d7]/40 px-6 py-5 shadow-xl animate-fadeIn">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = currentTab === link.tab;
              return (
                <button
                  key={link.tab}
                  onClick={() => handleNavClick(link.tab)}
                  className={`text-left py-2.5 px-3 rounded-lg text-[16px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#007AFF]/10 text-[#007AFF] font-bold'
                      : 'text-[#414755] hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <div className="pt-2 border-t border-gray-100 mt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenOrder();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#007AFF] text-white font-semibold rounded-xl shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Pesan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
