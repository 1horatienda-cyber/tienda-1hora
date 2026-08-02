'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { useAdminAuthStore } from '@/store/admin-auth-store';

export default function AdminPerfilPage() {
  const user = useAdminAuthStore((s) => s.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña nueva debe tener al menos 6 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await adminApi.changeMyPassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Mi perfil</h1>

      <div className="max-w-md border border-gray-100 rounded-2xl p-6 mb-6">
        <p className="text-sm text-gray-500">Nombre</p>
        <p className="font-medium mb-3">{user?.name}</p>
        <p className="text-sm text-gray-500">Correo</p>
        <p className="font-medium mb-3">{user?.email}</p>
        <p className="text-sm text-gray-500">Roles</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {user?.roles.map((r) => (
            <span key={r.id} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {r.name}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-md border border-gray-100 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Cambiar mi contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Contraseña nueva"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirmar contraseña nueva"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            required
            minLength={6}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-700">Contraseña actualizada correctamente.</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
