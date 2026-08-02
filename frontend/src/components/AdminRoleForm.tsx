'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, AdminRole, PermissionCatalogItem } from '@/lib/admin-api';

export default function AdminRoleForm({ role }: { role?: AdminRole }) {
  const router = useRouter();
  const isEdit = !!role;

  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getPermissionsCatalog().then(setCatalog);
  }, []);

  function togglePermission(key: string) {
    setPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  }

  const groups = Array.from(new Set(catalog.map((p) => p.group)));

  function toggleGroup(group: string, allEnabled: boolean) {
    const groupKeys = catalog.filter((p) => p.group === group).map((p) => p.key);
    setPermissions((prev) =>
      allEnabled ? prev.filter((p) => !groupKeys.includes(p)) : Array.from(new Set([...prev, ...groupKeys])),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.updateRole(role!.id, { name, description: description || undefined, permissions });
      } else {
        await adminApi.createRole({ name, description: description || undefined, permissions });
      }
      router.push('/admin/roles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el rol.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700">Nombre del rol</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Descripción (opcional)</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Permisos</label>
        <div className="space-y-4">
          {groups.map((group) => {
            const groupItems = catalog.filter((p) => p.group === group);
            const allEnabled = groupItems.every((p) => permissions.includes(p.key));
            return (
              <div key={group} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold">{group}</p>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group, allEnabled)}
                    className="text-xs text-brand-accent hover:underline"
                  >
                    {allEnabled ? 'Desmarcar todo' : 'Marcar todo'}
                  </button>
                </div>
                <div className="space-y-2">
                  {groupItems.map((p) => {
                    const checked = permissions.includes(p.key);
                    return (
                      <label key={p.key} className="flex items-center justify-between text-sm py-1 cursor-pointer">
                        <span>{p.label}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={checked}
                          onClick={() => togglePermission(p.key)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            checked ? 'bg-brand' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              checked ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {catalog.length === 0 && <p className="text-gray-400 text-sm">Cargando permisos...</p>}
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
          onClick={() => router.push('/admin/roles')}
          className="border border-gray-200 px-6 py-2.5 rounded-full text-sm font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
