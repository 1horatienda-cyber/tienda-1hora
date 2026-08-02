'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Package,
  ClipboardList,
  Boxes,
  MessageCircle,
  Users,
  ShieldCheck,
  Phone,
  Image,
  UserCircle,
  LogOut,
} from 'lucide-react';
import { clearToken, adminApi } from '@/lib/admin-api';
import { useAdminAuthStore } from '@/store/admin-auth-store';

const LINKS = [
  { href: '/admin', label: 'Resumen', icon: LayoutGrid, permissions: [] as string[] },
  { href: '/admin/productos', label: 'Productos', icon: Package, permissions: ['products.create', 'products.edit', 'products.delete'] },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList, permissions: ['orders.manage'] },
  { href: '/admin/inventario', label: 'Inventario', icon: Boxes, permissions: ['inventory.manage'] },
  { href: '/admin/mensajes', label: 'Mensajes', icon: MessageCircle, permissions: ['chat.respond'] },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: Phone, permissions: ['whatsapp.manage', 'whatsapp.respond'] },
  { href: '/admin/banners', label: 'Banners', icon: Image, permissions: ['banners.manage'] },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, permissions: ['users.create', 'users.edit', 'users.delete'] },
  { href: '/admin/roles', label: 'Roles y Permisos', icon: ShieldCheck, permissions: ['settings.access'] },
];

const PUBLIC_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];
const UNREAD_POLL_MS = 8000;

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const clearAuth = useAdminAuthStore((s) => s.clear);
  const canRespondChat = hasPermission('chat.respond');

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname) || !canRespondChat) return;
    async function loadUnread() {
      try {
        const conversations = await adminApi.getChatConversations();
        setUnreadCount(conversations.reduce((sum, c) => sum + c.unreadCount, 0));
      } catch {
        // se reintenta en el próximo ciclo
      }
    }
    loadUnread();
    const interval = setInterval(loadUnread, UNREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [pathname, canRespondChat]);

  if (PUBLIC_PATHS.includes(pathname)) return null;

  function handleLogout() {
    clearToken();
    clearAuth();
    router.push('/admin/login');
  }

  const visibleLinks = LINKS.filter((link) => hasPermission(...link.permissions));

  return (
    <aside className="w-56 shrink-0 border-r border-gray-100 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <nav className="space-y-1">
        {visibleLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {href === '/admin/mensajes' && unreadCount > 0 && (
                <span className="text-[10px] bg-brand-accent text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1">
        <Link
          href="/admin/perfil"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === '/admin/perfil' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <UserCircle size={18} />
          Mi perfil
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
