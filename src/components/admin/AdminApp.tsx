import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getAdminUser, isCurrentUserAdmin, signOutAdmin } from '../../lib/admin';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

type AuthState = 'checking' | 'signed-out' | 'not-admin' | 'signed-in';

export const AdminApp: React.FC = () => {
  const [state, setState] = useState<AuthState>('checking');
  const [email, setEmail] = useState<string | null>(null);

  const check = async () => {
    setState('checking');
    const user = await getAdminUser();
    if (!user) {
      setState('signed-out');
      return;
    }
    const admin = await isCurrentUserAdmin();
    if (!admin) {
      setState('not-admin');
      return;
    }
    setEmail(user.email);
    setState('signed-in');
  };

  useEffect(() => {
    check();
    if (!supabase) return;
    // Ikuti perubahan sesi (login/logout dari tab lain, token refresh, dsb.)
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-6 text-center">
        <p className="text-sm text-gray-500 max-w-sm">
          Supabase belum dikonfigurasi (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum di-set di environment
          variables Cloudflare), jadi halaman admin belum bisa dipakai.
        </p>
      </div>
    );
  }

  if (state === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <Loader2 className="w-6 h-6 animate-spin text-[#007AFF]" />
      </div>
    );
  }

  if (state === 'signed-out') {
    return <AdminLogin onLoggedIn={check} />;
  }

  if (state === 'not-admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-6 text-center">
        <div className="max-w-sm space-y-3">
          <p className="text-sm text-gray-700 font-medium">Akun ini belum diberi akses admin.</p>
          <p className="text-xs text-gray-400">
            Minta pemilik akun Supabase menambahkan user ini ke tabel{' '}
            <code className="bg-gray-100 px-1 py-0.5 rounded">admins</code>.
          </p>
          <button
            onClick={async () => {
              await signOutAdmin();
              check();
            }}
            className="text-xs text-[#007AFF] hover:underline"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard adminEmail={email} onLoggedOut={check} />;
};
