'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminApi, AdminRole } from '@/lib/admin-api';
import AdminRoleForm from '@/components/AdminRoleForm';
import RequirePermission from '@/components/RequirePermission';

export default function EditarRolPage() {
  const params = useParams();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getRole(params.id as string)
      .then(setRole)
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-gray-400">Cargando...</p>;
  if (!role) return <p className="text-gray-400">Rol no encontrado.</p>;

  return (
    <RequirePermission permissions={['settings.access']}>
      <div>
        <h1 className="text-2xl font-semibold mb-6">Editar rol</h1>
        <AdminRoleForm role={role} />
      </div>
    </RequirePermission>
  );
}
