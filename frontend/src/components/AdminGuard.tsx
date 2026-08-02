'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken } from '@/lib/admin-api';
import { useAdminAuthStore } from '@/store/admin-auth-store';

const PUBLIC_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

// Envuelve las páginas del panel admin: si no hay token, manda a /admin/login.
// Además carga el usuario actual (con sus permisos) desde /auth/me para que el
// resto del panel (sidebar, páginas) sepa qué puede mostrar y qué no.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const refresh = useAdminAuthStore((s) => s.refresh);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setChecked(true);
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    refresh().finally(() => setChecked(true));
  }, [pathname, router, refresh]);

  if (!checked) return null;
  return <>{children}</>;
}
