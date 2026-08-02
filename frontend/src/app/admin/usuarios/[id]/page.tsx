'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminApi, AdminUser } from '@/lib/admin-api';
import AdminUserForm from '@/components/AdminUserForm';
import RequirePermission from '@/components/RequirePermission';

export default function EditarUsuarioPage() {
  const params = useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getUser(params.id as string)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-gray-400">Cargando...</p>;
  if (!user) return <p className="text-gray-400">Usuario no encontrado.</p>;

  return (
    <RequirePermission permissions={['users.edit']}>
      <div>
        <h1 className="text-2xl font-semibold mb-6">Editar usuario</h1>
        <AdminUserForm user={user} />
      </div>
    </RequirePermission>
  );
}
