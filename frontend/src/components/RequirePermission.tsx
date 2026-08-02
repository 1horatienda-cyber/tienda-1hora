'use client';

import { useAdminAuthStore } from '@/store/admin-auth-store';

// Protege el contenido de una página del panel: si el usuario no tiene ninguno
// de los permisos pedidos, muestra un aviso en vez del contenido. El backend
// igual rechaza cualquier request de por sí — esto es la capa visual.
export default function RequirePermission({
  permissions,
  children,
}: {
  permissions: string[];
  children: React.ReactNode;
}) {
  const loading = useAdminAuthStore((s) => s.loading);
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);

  if (loading) return null;
  if (!hasPermission(...permissions)) {
    return (
      <div className="border border-gray-100 rounded-2xl p-8 text-center">
        <p className="text-gray-500">No tienes permiso para ver esta sección.</p>
      </div>
    );
  }
  return <>{children}</>;
}
