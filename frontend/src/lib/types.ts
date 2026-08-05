export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  // Precio "al por mayor" (desde wholesaleMinQty unidades)
  priceInCents: number;
  wholesaleMinQty: number;
  // Precio "al detalle" (1-2 unidades)
  retailPriceInCents: number | null;
  // Precio y cantidad de la subcaja/caja completa (si el producto la tiene)
  boxQuantity: number | null;
  boxPriceInCents: number | null;
  sku: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive?: boolean;
  category?: Category;
  images: ProductImage[];
  inventory?: { quantityAvailable: number };
  related?: Product[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  imageUrlMobile: string | null;
  href: string;
  isActive: boolean;
  order: number;
}

export type DeliveryType = 'retiro_local' | 'envio_negocio' | 'envio_domicilio';

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'cliente' | 'admin';
  content: string;
  read: boolean;
  createdAt: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
}
