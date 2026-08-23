import React, { useState, useEffect } from 'react';
import { PageTab, Product } from '../../types';
import { PRODUCTS, WHATSAPP_NUMBER } from '../../data/mockData';
import { fetchProducts } from '../../lib/supabase';
import { CheckCircle2, ShoppingCart, ArrowRight, ChevronRight, Check } from 'lucide-react';

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
        setProducts(data);
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
                Produk
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-[38px] sm:text-[48px] font-bold text-[#191c1e] font-sora mb-3 tracking-[-0.03em]">
              Produk Kami
            </h1>
            <p className="text-[17px] sm:text-[18px] text-[#414755] leading-relaxed">
              Air minum berkualitas dalam berbagai kemasan, siap antar ke rumah Anda.
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
              Semua Produk
            </button>
            <button
              onClick={() => setSelectedCategory('galon')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'galon'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-white text-[#414755] hover:bg-gray-100 border border-[#c1c6d7]/40'
              }`}
            >
              Galon 19L
            </button>
            <button
              onClick={() => setSelectedCategory('dus')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'dus'
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-white text-[#414755] hover:bg-gray-100 border border-[#c1c6d7]/40'
              }`}
            >
              Air Kemasan (Dus)
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
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[#191c1e] text-[13px] font-semibold shadow-xs font-sora">
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Container */}
              <div className="p-7 sm:p-8 flex-1 flex flex-col w-full justify-between">
                <div className="mb-6 w-full">
                  <h2 className="text-[24px] sm:text-[26px] font-bold text-[#191c1e] font-sora mb-3">
                    {product.name}
                  </h2>
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
                    <span className="text-[14px] text-[#414755] font-medium">Harga</span>
                    <span className="text-[14px] text-[#007AFF] font-bold">
                      {product.priceDescription}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenOrder(product.id)}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-[#007AFF] hover:bg-[#0062cc] text-white rounded-xl text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(0,122,255,0.25)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.35)] active:scale-98 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Pesan Produk Ini</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section: Belum yakin bagaimana cara memesan? */}
      <section className="w-full bg-[#f2f4f6] py-20 lg:py-24 mb-20 relative overflow-hidden border-y border-[#c1c6d7]/30">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="60" id="grid-pattern" patternUnits="userSpaceOnUse" width="60">
                <path className="text-[#c1c6d7]" d="M0 60V0H60" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect fill="url(#grid-pattern)" height="100%" width="100%" />
          </svg>
        </div>

        <div className="max-w-3xl mx-auto px-5 text-center relative z-10">
          <h3 className="text-[28px] sm:text-[36px] font-bold text-[#191c1e] font-sora mb-4 tracking-[-0.02em]">
            Belum yakin bagaimana cara memesan?
          </h3>
          <p className="text-[16px] sm:text-[18px] text-[#414755] mb-8 leading-relaxed max-w-2xl mx-auto">
            Pelajari proses pemesanan yang mudah dan cepat untuk mendapatkan air mineral berkualitas di depan pintu Anda.
          </p>
          <button
            onClick={() => {
              onNavigate('cara-pesan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#007AFF] hover:text-[#0058bc] rounded-xl text-[15px] font-bold hover:shadow-lg transition-all shadow-md active:scale-98 cursor-pointer border border-[#c1c6d7]/30"
          >
            <span>Lihat Cara Pesan</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
