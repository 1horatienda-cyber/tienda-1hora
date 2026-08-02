import { create } from 'zustand';
import { adminApi, AuthMe } from '@/lib/admin-api';

interface AdminAuthState {
  user: AuthMe | null;
  loading: boolean;
  refresh: () => Promise<void>;
  hasPermission: (...permissions: string[]) => boolean;
  clear: () => void;
}

// Estado del usuario admin logueado (permisos incluidos). No se persiste: se recarga
// desde /auth/me cada vez que entra al panel, así siempre refleja permisos actuales.
export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  user: null,
  loading: true,

  refresh: async () => {
    set({ loading: true });
    try {
      const user = await adminApi.getMe();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  // true si el usuario tiene AL MENOS UNO de los permisos pedidos (o si no se pide ninguno)
  hasPermission: (...permissions: string[]) => {
    if (permissions.length === 0) return true;
    const userPermissions = get().user?.permissions ?? [];
    return permissions.some((p) => userPermissions.includes(p));
  },

  clear: () => set({ user: null, loading: false }),
}));
