import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AdminApp} from './components/admin/AdminApp';
import {ErrorBoundary} from './components/ErrorBoundary';
import './index.css';

// "/admin" (dan sub-path-nya) menampilkan dashboard staff, bukan situs publik.
// Pastikan hosting-nya (Cloudflare) mengarahkan path yang tidak ditemukan ke
// index.html (SPA fallback) supaya buka /admin langsung di browser tidak 404.
const isAdminRoute = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isAdminRoute ? <AdminApp /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);

