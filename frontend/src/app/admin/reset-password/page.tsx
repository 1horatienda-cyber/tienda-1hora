'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await adminApi.resetPasswordWithToken(email, token, password);
      setDone(true);
      setTimeout(() => router.push('/admin/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'El enlace no es válido o ya expiró.');
    } finally {
      setLoading(false);
    }
  }

  if (!email || !token) {
    return (
      <p className="text-sm text-red-500 text-center">
        Este enlace no es válido.{' '}
        <Link href="/admin/forgot-password" className="text-brand-accent hover:underline">
          Solicita uno nuevo
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3 text-center">
        Contraseña actualizada. Redirigiendo a iniciar sesión...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        required
        minLength={6}
      />
      <input
        type="password"
        placeholder="Confirmar nueva contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        required
        minLength={6}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-white py-3 rounded-full font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-gray-100 rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-1">Elegir nueva contraseña</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Este enlace es válido por 1 hora.</p>
        <Suspense fallback={<p className="text-sm text-gray-400 text-center">Cargando...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
