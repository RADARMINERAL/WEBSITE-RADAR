import React, { useState } from 'react';
import { Lock, Mail, Loader2, Droplets } from 'lucide-react';
import { signInAdmin } from '../../lib/admin';

interface AdminLoginProps {
  onLoggedIn: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signInAdmin(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(err === 'Invalid login credentials' ? 'Email atau kata sandi salah.' : err);
      return;
    }
    onLoggedIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-7 space-y-5"
      >
        <div className="flex flex-col items-center text-center gap-2 mb-2">
          <div className="w-12 h-12 rounded-full bg-[#007AFF]/10 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-[#007AFF]" />
          </div>
          <h1 className="font-bold text-lg font-sora text-[#191c1e]">Admin Radar Mineral</h1>
          <p className="text-xs text-gray-400">Masuk untuk mengelola pesanan pelanggan</p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="Email staff"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#007AFF] hover:bg-[#0062cc] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Masuk</span>
        </button>

        <p className="text-[11px] text-gray-400 text-center">
          Halaman ini khusus staff internal. Hubungi pemilik akun Supabase untuk dibuatkan akses.
        </p>
      </form>
    </div>
  );
};
