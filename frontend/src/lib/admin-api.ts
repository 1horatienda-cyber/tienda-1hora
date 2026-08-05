import { Product, Category, ChatMessage, Banner } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'tienda-admin-token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/admin/login';
    throw new Error('Sesión expirada');
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || 'Error al conectar con el servidor');
  }
  return res.json();
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  deliveryType: string;
  deliveryAddress?: string;
  status: string;
  totalInCents: number;
  notes?: string;
  createdAt: string;
  items: { productName: string; quantity: number; unitPriceInCents: number; subtotalInCents: number }[];
}

export interface InventoryRow {
  id: string;
  productId: string;
  quantityAvailable: number;
  lowStockThreshold: number;
  product: { id: string; name: string; sku: string };
}

export interface AdminChatConversation {
  id: string;
  customerName?: string;
  customerPhone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string | null;
  unreadCount: number;
}

export interface AuthMe {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: { id: string; name: string }[];
  permissions: string[];
}

export interface PermissionCatalogItem {
  key: string;
  label: string;
  group: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: AdminRole[];
}

export type WhatsAppNumberStatus = 'conectado' | 'desconectado' | 'pendiente' | 'error';

export interface AdminWhatsAppNumber {
  id: string;
  phoneNumber: string;
  label?: string;
  isPrimary: boolean;
  isActive: boolean;
  status: WhatsAppNumberStatus;
  operators: { id: string; name: string; email: string }[];
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUSES = [
  'recibido',
  'preparando',
  'listo_para_retirar',
  'en_camino',
  'entregado',
  'cancelado',
] as const;

export const adminApi = {
  login: (email: string, password: string) =>
    request<{
      accessToken: string;
      user: { id: string; name: string; email: string; role: string; permissions: string[] };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProducts: () => request<Product[]>('/products/admin/all'),
  getCategories: () => request<Category[]>('/categories'),
  createProduct: (data: Record<string, unknown>) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    request<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<Product>(`/products/${id}`, { method: 'DELETE' }),
  createCategory: (name: string) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify({ name }) }),

  getOrders: (status?: string) => request<AdminOrder[]>(`/orders${status ? `?status=${status}` : ''}`),
  updateOrderStatus: (id: string, status: string) =>
    request<AdminOrder>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  mostSold: () => request<{ productName: string; totalSold: string }[]>('/orders/stats/most-sold'),

  getInventory: () => request<InventoryRow[]>('/inventory'),
  registerMovement: (data: { productId: string; type: string; quantity: number; reason?: string }) =>
    request('/inventory/movements', { method: 'POST', body: JSON.stringify(data) }),

  getChatConversations: () => request<AdminChatConversation[]>('/chat/admin/conversations'),
  getChatMessages: (conversationId: string) =>
    request<ChatMessage[]>(`/chat/admin/conversations/${conversationId}/messages`),
  sendChatMessage: (conversationId: string, content: string) =>
    request<ChatMessage>(`/chat/admin/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getMe: () => request<AuthMe>('/auth/me'),
  changeMyPassword: (currentPassword: string, newPassword: string) =>
    request('/auth/change-password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) }),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPasswordWithToken: (email: string, token: string, newPassword: string) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, token, newPassword }) }),

  // --- Usuarios ---
  getUsers: (params?: { search?: string; roleId?: string; isActive?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.roleId) qs.set('roleId', params.roleId);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    const query = qs.toString();
    return request<AdminUser[]>(`/users${query ? `?${query}` : ''}`);
  },
  getUser: (id: string) => request<AdminUser>(`/users/${id}`),
  getAssignableUsers: () => request<{ id: string; name: string; email: string }[]>('/users/assignable'),
  createUser: (data: { name: string; email: string; password: string; phone?: string; roleIds: string[] }) =>
    request<AdminUser>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (
    id: string,
    data: Partial<{ name: string; email: string; phone: string; isActive: boolean; roleIds: string[] }>,
  ) => request<AdminUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  setUserActive: (id: string, isActive: boolean) =>
    request<AdminUser>(`/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  resetUserPassword: (id: string, newPassword: string) =>
    request(`/users/${id}/reset-password`, { method: 'PATCH', body: JSON.stringify({ newPassword }) }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),

  // --- Roles y permisos ---
  getPermissionsCatalog: () => request<PermissionCatalogItem[]>('/roles/permissions-catalog'),
  getRoles: () => request<AdminRole[]>('/roles'),
  getRole: (id: string) => request<AdminRole>(`/roles/${id}`),
  createRole: (data: { name: string; description?: string; permissions: string[] }) =>
    request<AdminRole>('/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: Partial<{ name: string; description: string; permissions: string[] }>) =>
    request<AdminRole>(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRole: (id: string) => request(`/roles/${id}`, { method: 'DELETE' }),

  // --- WhatsApp ---
  getWhatsappNumbers: () => request<AdminWhatsAppNumber[]>('/whatsapp-numbers'),
  createWhatsappNumber: (data: { phoneNumber: string; label?: string; isPrimary?: boolean; operatorIds?: string[] }) =>
    request<AdminWhatsAppNumber>('/whatsapp-numbers', { method: 'POST', body: JSON.stringify(data) }),
  updateWhatsappNumber: (
    id: string,
    data: Partial<{
      phoneNumber: string;
      label: string;
      isPrimary: boolean;
      isActive: boolean;
      status: WhatsAppNumberStatus;
      operatorIds: string[];
    }>,
  ) => request<AdminWhatsAppNumber>(`/whatsapp-numbers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteWhatsappNumber: (id: string) => request(`/whatsapp-numbers/${id}`, { method: 'DELETE' }),

  // --- Banners ---
  getBannersAdmin: () => request<Banner[]>('/banners/admin'),
  createBanner: (data: { imageUrl: string; imageUrlMobile?: string; href?: string; order?: number }) =>
    request<Banner>('/banners', { method: 'POST', body: JSON.stringify(data) }),
  updateBanner: (
    id: string,
    data: Partial<{ imageUrl: string; imageUrlMobile: string; href: string; isActive: boolean; order: number }>,
  ) => request<Banner>(`/banners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBanner: (id: string) => request(`/banners/${id}`, { method: 'DELETE' }),
};
