'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, AdminUser, AdminRole } from '@/lib/admin-api';
import RequirePermission from '@/components/RequirePermission';
import { useAdminAuthStore } from '@/store/admin-auth-store';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const currentUserId = useAdminAuthStore((s) => s.user?.id);

  async function load() {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        adminApi.getUsers({ search: search || undefined, roleId: roleFilter || undefined }),
        adminApi.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250); // debounce de la búsqueda
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  async function handleToggleActive(user: AdminUser) {
    try {
      await adminApi.setUserActive(user.id, !user.isActive);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo actualizar el usuario.');
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await adminApi.deleteUser(user.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar el usuario.');
    }
  }

  async function handleResetPassword(user: AdminUser) {
    const newPassword = prompt(`Nueva contraseña para ${user.name} (mínimo 6 caracteres):`);
    if (!newPassword) return;
    try {
      await adminApi.resetUserPassword(user.id, newPassword);
      alert('Contraseña actualizada.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo restablecer la contraseña.');
    }
  }

  return (
    <RequirePermission permissions={['users.create', 'users.edit', 'users.delete']}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Usuarios</h1>
          <Link
            href="/admin/usuarios/nuevo"
            className="bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors"
          >
            + Nuevo usuario
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-full px-4 py-2 text-sm w-full max-w-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-full px-4 py-2 text-sm"
          >
            <option value="">Todos los roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Correo</th>
                  <th className="py-2 pr-4">Roles</th>
                  <th className="py-2 pr-4">Último acceso</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pr-4">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span key={r.id} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('es-DO') : 'Nunca'}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right space-x-3 whitespace-nowrap">
                      <Link href={`/admin/usuarios/${u.id}`} className="text-brand-accent hover:underline">
                        Editar
                      </Link>
                      <button onClick={() => handleResetPassword(u)} className="text-gray-400 hover:text-gray-700">
                        Restablecer clave
                      </button>
                      <button onClick={() => handleToggleActive(u)} className="text-gray-400 hover:text-gray-700">
                        {u.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      {u.id !== currentUserId && u.role !== 'admin' && (
                        <button onClick={() => handleDelete(u)} className="text-red-400 hover:text-red-600">
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-gray-400 mt-6">No se encontraron usuarios.</p>}
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
