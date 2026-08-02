'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminRole, AdminUser } from '@/lib/admin-api';

export default function AdminUserForm({ user }: { user?: AdminUser }) {
  const router = useRouter();
  const isEdit = !!user;

  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [password, setPassword] = useState('');
  const [roleIds, setRoleIds] = useState<string[]>(user?.roles.map((r) => r.id) ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getRoles().then(setRoles);
  }, []);

  function toggleRole(roleId: string) {
    setRoleIds((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (roleIds.length === 0) {
      setError('Selecciona al menos un rol.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.updateUser(user!.id, { name, email, phone: phone || undefined, roleIds });
      } else {
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setSaving(false);
          return;
        }
        await adminApi.createUser({ name, email, password, phone: phone || undefined, roleIds });
      }
      router.push('/admin/usuarios');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el usuario.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
          required
        />
      </div>

      {!isEdit && (
        <div>
          <label className="text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            required
            minLength={6}
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700">Teléfono (opcional)</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Roles</label>
        <div className="space-y-2 border border-gray-200 rounded-lg p-3">
          {roles.map((role) => (
            <label key={role.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={roleIds.includes(role.id)}
                onChange={() => toggleRole(role.id)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">{role.name}</span>
                {role.description && <span className="text-gray-400"> — {role.description}</span>}
              </span>
            </label>
          ))}
          {roles.length === 0 && <p className="text-gray-400 text-sm">Cargando roles...</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/usuarios')}
          className="border border-gray-200 px-6 py-2.5 rounded-full text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
