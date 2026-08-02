'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, AdminRole } from '@/lib/admin-api';
import RequirePermission from '@/components/RequirePermission';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setRoles(await adminApi.getRoles());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(role: AdminRole) {
    if (!confirm(`¿Eliminar el rol "${role.name}"? Los usuarios que lo tengan asignado lo perderán.`)) return;
    try {
      await adminApi.deleteRole(role.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar el rol.');
    }
  }

  return (
    <RequirePermission permissions={['settings.access']}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Roles y Permisos</h1>
          <Link
            href="/admin/roles/nuevo"
            className="bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors"
          >
            + Nuevo rol
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          predeterminado
                        </span>
                      )}
                    </p>
                    {role.description && <p className="text-sm text-gray-400 mt-0.5">{role.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <span className="text-xs text-gray-400">{role.permissions.length} permisos</span>
                    <Link href={`/admin/roles/${role.id}`} className="text-brand-accent hover:underline text-sm">
                      Editar
                    </Link>
                    {!role.isSystem && (
                      <button onClick={() => handleDelete(role)} className="text-red-400 hover:text-red-600 text-sm">
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
