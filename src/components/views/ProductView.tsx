import React, { useState, useEffect } from 'react';
import { PageTab, Product } from '../../types';
import { PRODUCTS } from '../../data/mockData';
import { fetchProducts } from '../../lib/supabase';
import { CheckCircle2, ShoppingCart, ArrowRight, Building2, ShieldCheck, Box } from 'lucide-react';

interface ProductViewProps {
  onNavigate: (tab: PageTab) => void;
  onOpenOrder: (productId?: string) => void;
}

export const ProductView: React.FC<ProductViewProps> = ({ onNavigate, onOpenOrder }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'galon' | 'dus'>('all');

  useEffect(() => {
    fetchProducts().then((data) => {
      if (data && data.length > 0) {
        // Filter only the 2 B2B SKUs
        const b2bOnly = data.filter((p) => p.id === 'dus-220ml' || p.id === 'galon-19l');
        setProducts(b2bOnly);
      }
    });
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="w-full bg-[#f7f9fb] min-h-screen">
      {/* Breadcrumb & Header Title */}
      <div className="w-full bg-[#f7f9fb] pt-12 lg:pt-16 pb-12">
        <div className="max-w-[1280px] mx-auto px-5 md:px-12">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-[13px] font-medium text-[#414755]">
              <li>
                <button
                  onClick={() => onNavigate('beranda')}
                  className="hover:text-[#007AFF] transition-colors cursor-pointer"
                >
                  Beranda
                </button>
              </li>
              <li aria-hidden="true" className="text-[#c1c6d7] select-none">
                /
              </li>
              <li aria-current="page" className="text-[#007AFF] font-semibold">
                Katalog Produk B2B
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#007AFF] text-xs font-bold font-sora mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>Khusus Pasokan Bisnis & Toko Grosir (B2B)</span>
            </div>
            <h1 className="text-[38px] sm:text-[48px] font-bold text-[#191c1e] font-sora mb-3 tracking-[-0.03em]">
              Katalog Produk Pasokan Grosir
            </h1>
            <p className="text-[17px] sm:text-[18px] text-[#414755] leading-relaxed">
              Pasokan resmi distributor air minum higienis untuk Toko Bahan Campuran, Minimarket (Alfamart/Indomaret), dan Toko Grosir di seluruh Makassar.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-white text-[#414755] hover:bg-gray-100 border border-[#c1c6d7]/40'
              }`}
            >
              Semua Produk ({products.length})
            </button>
            <button
              onClick={() => setSelectedCategory('dus')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'dus'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-white text-[#414755] hover:bg-gray-100 border border-[#c1c6d7]/40'
              }`}
            >
              Air Kemasan Dus (Min 10 Dus)
            </button>
            <button
              onClick={() => setSelectedCategory('galon')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'galon'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-white text-[#414755] hover:bg-gray-100 border border-[#c1c6d7]/40'
              }`}
            >
              Galon 19L (Min 5 Galon)
            </button>
          </div>
        </div>
      </div>

      {/* Product Cards Section */}
      <section className="max-w-[1280px] mx-auto px-5 md:px-12 mb-24 relative w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col w-full group border border-[#c1c6d7]/30"
            >
              {/* Image Container */}
              <div className="h-[320px] sm:h-[360px] w-full relative bg-gray-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                {product.badge && (
                  <div className="absolute top-6 left-6">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[#191c1e] text-[13px] font-bold shadow-xs font-sora">
                      {product.badge}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/90 backdrop-blur-xs text-white text-xs font-bold shadow-md">
                    <Box className="w-3.5 h-3.5" />
                    MOQ: {product.minOrder} {product.category === 'dus' ? 'Dus' : 'Galon'}
                  </span>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-7 sm:p-8 flex-1 flex flex-col w-full justify-between">
                <div className="mb-6 w-full">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h2 className="text-[24px] sm:text-[26px] font-bold text-[#191c1e] font-sora">
                      {product.name}
                    </h2>
                  </div>
                  <p className="text-[15px] text-[#414755] leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="flex flex-col gap-3.5 w-full">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#007AFF] shrink-0 mt-0.5" />
                        <span className="text-[15px] text-[#191c1e] font-medium">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & Order Action */}
                <div className="mt-auto w-full pt-6 border-t border-[#c1c6d7]/30">
                  <div className="flex justify-between items-center w-full mb-6">
                    <span className="text-[14px] text-[#414755] font-medium">Harga Grosir Mitra</span>
                    <span className="text-[15px] text-[#007AFF] font-bold">
                      {product.priceDescription}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenOrder(product.id)}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-xl text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(0,122,255,0.25)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.35)] active:scale-98 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Order Grosir Produk Ini</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section: Alur Pemesanan B2B */}
      <section className="w-full bg-[#f2f4f6] py-20 lg:py-24 mb-20 relative overflow-hidden border-y border-[#c1c6d7]/30">
        <div className="max-w-3xl mx-auto px-5 text-center relative z-10">
          <h3 className="text-[28px] sm:text-[36px] font-bold text-[#191c1e] font-sora mb-4 tracking-[-0.02em]">
            Ingin Jadwalkan Pasokan Rutin ke Toko Anda?
          </h3>
          <p className="text-[16px] sm:text-[18px] text-[#414755] mb-8 leading-relaxed max-w-2xl mx-auto">
            Kami siap mengirimkan pasokan armada terjadwal ke Toko Bahan Campuran, Minimarket, atau Toko Kelontong Anda dengan harga distributor resmi.
          </p>
          <button
            onClick={() => {
              onNavigate('cara-pesan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#007AFF] hover:text-[#0058bc] rounded-xl text-[15px] font-bold hover:shadow-lg transition-all shadow-md active:scale-98 cursor-pointer border border-[#c1c6d7]/30"
          >
            <span>Lihat Alur Pemesanan Toko</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

