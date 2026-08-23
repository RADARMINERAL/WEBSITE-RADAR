import React, { useState } from 'react';
import { PageTab } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { OrderModal } from './components/OrderModal';
import { AccountModal } from './components/AccountModal';
import { HomeView } from './components/views/HomeView';
import { ProductView } from './components/views/ProductView';
import { HowToOrderView } from './components/views/HowToOrderView';
import { AboutView } from './components/views/AboutView';
import { FaqView } from './components/views/FaqView';
import { ContactView } from './components/views/ContactView';

export function App() {
  const [currentTab, setCurrentTab] = useState<PageTab>('beranda');
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>('galon-19l');
  const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);

  const handleOpenOrder = (productId?: string) => {
    setSelectedProductId(productId || 'galon-19l');
    setOrderModalOpen(true);
  };

  const handleOpenPrivacy = () => {
    setLegalModal({
      title: 'Kebijakan Privasi',
      content:
        'Radar Mineral Makassar berkomitmen melindungi privasi data setiap pelanggan. Data nama, nomor kontak WhatsApp, dan alamat pengiriman hanya digunakan untuk keperluan konfirmasi pesanan, koordinasi kurir pengantaran, dan peningkatan kualitas layanan hidrasi kami. Data Anda tidak pernah dialihkan atau diperjualbelikan kepada pihak ketiga.',
    });
  };

  const handleOpenTerms = () => {
    setLegalModal({
      title: 'Syarat & Ketentuan Layanan',
      content:
        '1. Pengantaran reguler berlaku di seluruh kecamatan kota Makassar.\n2. Minimal pemesanan layanan antar adalah 2 galon (19L) atau 2 dus kemasan botol/cup.\n3. Pelanggan baru tanpa galon kosong dikenakan biaya deposit galon sebesar Rp40.000 yang bersifat refundable saat berhenti berlangganan.\n4. Pembayaran dapat dilakukan via Scan QRIS saat kurir tiba, Transfer Bank, atau Tunai (COD).',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] text-[#191c1e] selection:bg-[#007AFF] selection:text-white font-inter">
      {/* Fixed Navigation Header */}
      <Header
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenOrder={() => handleOpenOrder()}
        onOpenAccount={() => setAccountModalOpen(true)}
      />

      {/* Main View Container with Top Header Offset */}
      <main className="flex-1 pt-20 md:pt-24 flex flex-col">
        {currentTab === 'beranda' && (
          <HomeView
            onNavigate={setCurrentTab}
            onOpenOrder={handleOpenOrder}
          />
        )}

        {currentTab === 'produk' && (
          <ProductView
            onNavigate={setCurrentTab}
            onOpenOrder={handleOpenOrder}
          />
        )}

        {currentTab === 'cara-pesan' && (
          <HowToOrderView
            onNavigate={setCurrentTab}
            onOpenOrder={() => handleOpenOrder()}
          />
        )}

        {currentTab === 'tentang-kami' && (
          <AboutView
            onNavigate={setCurrentTab}
            onOpenOrder={() => handleOpenOrder()}
          />
        )}

        {currentTab === 'faq' && (
          <FaqView
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'kontak' && (
          <ContactView
            onNavigate={setCurrentTab}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={setCurrentTab}
        onOpenPrivacy={handleOpenPrivacy}
        onOpenTerms={handleOpenTerms}
      />

      {/* Floating WhatsApp Action */}
      <FloatingWhatsApp
        onDirectOrderClick={() => handleOpenOrder()}
      />

      {/* Order Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        initialProductId={selectedProductId}
      />

      {/* Account / Order History Modal */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onQuickReorder={() => handleOpenOrder()}
      />

      {/* Simple Legal Modal (Privacy & Terms) */}
      {legalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-gray-900 font-sora">{legalModal.title}</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {legalModal.content}
            </p>
            <div className="pt-2 text-right">
              <button
                onClick={() => setLegalModal(null)}
                className="px-5 py-2 bg-[#007AFF] text-white text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
