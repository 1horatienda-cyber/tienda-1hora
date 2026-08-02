'use client';

import { useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-gray-100 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-1">Recuperar contraseña</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Ingresa tu correo y te enviamos instrucciones para elegir una nueva contraseña.
        </p>

        {sent ? (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3 text-center">
            Si el correo existe en el sistema, te enviamos instrucciones para recuperar tu contraseña.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3 rounded-full font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-6">
          <Link href="/admin/login" className="text-brand-accent hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
