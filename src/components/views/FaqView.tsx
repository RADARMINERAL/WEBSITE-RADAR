import React, { useState, useEffect } from 'react';
import { PageTab, FaqItem } from '../../types';
import { FAQ_ITEMS, WHATSAPP_NUMBER } from '../../data/mockData';
import { fetchFaqs } from '../../lib/supabase';
import { Search, ChevronDown, ChevronRight, MessageCircle, HelpCircle, SearchX } from 'lucide-react';

interface FaqViewProps {
  onNavigate: (tab: PageTab) => void;
}

export const FaqView: React.FC<FaqViewProps> = ({ onNavigate }) => {
  const [faqs, setFaqs] = useState<FaqItem[]>(FAQ_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<string[]>(['faq-1']); // First one open by default

  useEffect(() => {
    fetchFaqs().then((data) => {
      if (data && data.length > 0) {
        setFaqs(data);
      }
    });
  }, []);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories = [
    { id: 'semua', label: 'Semua' },
    { id: 'pemesanan', label: 'Pemesanan' },
    { id: 'pengiriman', label: 'Pengiriman' },
    { id: 'pembayaran', label: 'Pembayaran' },
    { id: 'produk', label: 'Produk' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'semua' || faq.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });


  return (
    <div className="w-full bg-[#f7f9fb] min-h-screen relative overflow-hidden">
      {/* Decorative subtle background glows */}
      <div className="absolute top-0 left-0 w-full h-[450px] bg-gradient-to-b from-[#eceef0]/60 to-transparent -z-10" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#007AFF]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Hero Header & Breadcrumb */}
      <section className="w-full max-w-[1280px] mx-auto px-5 md:px-12 pt-12 lg:pt-16 pb-12 flex flex-col items-center text-center">
        <nav className="flex items-center gap-2 mb-6 text-[13px] font-medium text-[#414755]">
          <button
            onClick={() => onNavigate('beranda')}
            className="hover:text-[#007AFF] transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#c1c6d7]" />
          <span className="text-[#007AFF] font-semibold">FAQ</span>
        </nav>

        <h1 className="text-[38px] sm:text-[52px] font-extrabold text-[#0058bc] font-sora mb-4 tracking-[-0.03em] max-w-3xl">
          Pusat Bantuan
        </h1>
        <p className="text-[17px] sm:text-[18px] text-[#414755] max-w-2xl leading-relaxed">
          Temukan jawaban untuk pertanyaan seputar pemesanan, pengiriman, dan produk Radar Mineral di bawah ini.
        </p>
      </section>

      {/* Search Bar & Category Filter */}
      <section className="w-full max-w-3xl mx-auto px-5 mb-12 relative z-10">
        {/* Search Bar */}
        <div className="relative w-full mb-6 shadow-sm rounded-2xl bg-white border border-[#c1c6d7]/40 hover:border-[#007AFF]/40 focus-within:border-[#007AFF] transition-colors">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#717786] w-6 h-6" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pertanyaan..."
            className="w-full h-15 pl-14 pr-5 rounded-2xl bg-transparent text-[16px] text-[#191c1e] focus:outline-none placeholder:text-[#717786]/70"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-500 rounded-md hover:bg-gray-200"
            >
              Reset
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-[#eceef0] hover:bg-[#e0e3e5] text-[#414755]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section className="w-full max-w-3xl mx-auto px-5 mb-24 min-h-[350px]">
        {filteredFaqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#c1c6d7]/30 rounded-2xl p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-[20px] font-bold text-[#191c1e] font-sora mb-2">
              Pertanyaan tidak ditemukan
            </h3>
            <p className="text-[15px] text-[#414755] max-w-md mb-6">
              Coba gunakan kata kunci lain atau langsung hubungi admin WhatsApp kami untuk bertanya.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('semua');
              }}
              className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-semibold hover:bg-[#0062cc]"
            >
              Tampilkan Semua FAQ
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="bg-white border border-[#c1c6d7]/40 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#007AFF]/40 shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none group cursor-pointer"
                  >
                    <h3
                      className={`text-[17px] sm:text-[19px] font-semibold pr-4 transition-colors font-sora ${
                        isOpen ? 'text-[#007AFF]' : 'text-[#191c1e] group-hover:text-[#007AFF]'
                      }`}
                    >
                      {faq.question}
                    </h3>
                    <div
                      className={`shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#007AFF]' : 'text-[#414755] group-hover:text-[#007AFF]'
                      }`}
                    >
                      <ChevronDown className="w-6 h-6" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 animate-fadeIn">
                      <p className="text-[15px] text-[#414755] leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Fallback Blue CTA Banner: Masih punya pertanyaan? */}
      <section className="w-full max-w-[1280px] mx-auto px-5 md:px-12 pb-24">
        <div className="relative w-full bg-[#0070eb] rounded-[2rem] overflow-hidden p-8 sm:p-12 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          {/* Decorative blur inside */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl text-center md:text-left space-y-3">
            <h2 className="text-[26px] sm:text-[34px] font-bold text-white font-sora">
              Masih punya pertanyaan?
            </h2>
            <p className="text-[16px] text-white/90 leading-relaxed">
              Tim kami siap membantu Anda. Jangan ragu untuk menghubungi admin Radar Mineral untuk informasi lebih lanjut mengenai layanan kami.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Halo%20Admin%20Radar%20Mineral,%20saya%20ingin%20bertanya%20seputar%20layanan%20dan%20produk.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-7 py-4 bg-[#0058bc] hover:bg-[#004799] text-white font-semibold rounded-xl text-[15px] shadow-md transition-all hover:-translate-y-0.5 active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Hubungi Admin via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
