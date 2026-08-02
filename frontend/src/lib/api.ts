import { Product, Category, CreateOrderPayload, ChatMessage, Banner } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || 'Error al conectar con el servidor');
  }
  return res.json();
}

export const api = {
  getProducts: (params?: { category?: string; search?: string; featured?: boolean; isNew?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.featured) qs.set('featured', 'true');
    if (params?.isNew) qs.set('new', 'true');
    const query = qs.toString();
    return request<Product[]>(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (slug: string) => request<Product>(`/products/${slug}`),
  getCategories: () => request<Category[]>('/categories'),
  getBanners: () => request<Banner[]>('/banners'),
  createOrder: (payload: CreateOrderPayload) =>
    request<{ id: string }>('/orders', { method: 'POST', body: JSON.stringify(payload) }),

  createChatConversation: (customerName?: string) =>
    request<{ id: string; customerToken: string }>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ customerName }),
    }),
  sendChatMessage: (conversationId: string, customerToken: string, content: string) =>
    request<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ customerToken, content }),
    }),
  getChatMessages: (conversationId: string, customerToken: string) =>
    request<ChatMessage[]>(
      `/chat/conversations/${conversationId}/messages?customerToken=${encodeURIComponent(customerToken)}`,
    ),
};
