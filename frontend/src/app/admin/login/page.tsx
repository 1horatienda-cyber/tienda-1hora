'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi, setToken } from '@/lib/admin-api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await adminApi.login(email, password);
      setToken(accessToken);
      router.push('/admin');
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border border-gray-100 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-1">Panel Administrativo</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Ingresa con tu cuenta de administrador</p>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-brand text-white py-3 rounded-full font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="text-sm text-center mt-4">
          <Link href="/admin/forgot-password" className="text-brand-accent hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </form>
    </div>
  );
}
