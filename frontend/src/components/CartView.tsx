'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { formatRD } from '@/lib/format';
import { api } from '@/lib/api';
import { DeliveryType } from '@/lib/types';

const DELIVERY_LABELS: Record<DeliveryType, string> = {
  retiro_local: 'Retirar en el local',
  envio_negocio: 'Enviar a mi negocio',
  envio_domicilio: 'Enviar a mi domicilio',
};

// Número de WhatsApp de la tienda (en producción vendrá de /store-config)
const STORE_WHATSAPP = '18298253309';

export default function CartView() {
  const { items, updateQuantity, removeItem, totalInCents, unitPrice, clear } = useCartStore();

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryType: 'retiro_local' as DeliveryType,
    deliveryAddress: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-6">Tu carrito está vacío.</p>
        <Link href="/catalogo" className="inline-block bg-brand text-white px-6 py-3 rounded-full hover:bg-brand-accent transition-colors">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  function buildWhatsAppMessage(orderId?: string) {
    const lines = [
      '¡Hola! Quiero confirmar mi pedido' + (orderId ? ` #${orderId.slice(0, 8)}` : '') + ':',
      '',
      ...items.map((i) => `• ${i.quantity}x ${i.name} — ${formatRD(unitPrice(i) * i.quantity)}`),
      '',
      `Total: ${formatRD(totalInCents())}`,
      `Entrega: ${DELIVERY_LABELS[form.deliveryType]}`,
    ];
    if (form.deliveryType !== 'retiro_local' && form.deliveryAddress) {
      lines.push(`Dirección: ${form.deliveryAddress}`);
    }
    lines.push(`Nombre: ${form.customerName}`, `Teléfono: ${form.customerPhone}`);
    if (form.notes) lines.push(`Notas: ${form.notes}`);
    return encodeURIComponent(lines.join('\n'));
  }

  async function handleCheckout() {
    setError(null);
    if (!form.customerName || !form.customerPhone) {
      setError('Completa tu nombre y teléfono para continuar.');
      return;
    }
    if (form.deliveryType !== 'retiro_local' && !form.deliveryAddress) {
      setError('Indica la dirección de entrega.');
      return;
    }

    setLoading(true);
    try {
      const order = await api.createOrder({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerWhatsapp: form.customerPhone,
        deliveryType: form.deliveryType,
        deliveryAddress: form.deliveryAddress || undefined,
        notes: form.notes || undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      const message = buildWhatsAppMessage(order.id);
      clear();
      window.open(`https://wa.me/${STORE_WHATSAPP}?text=${message}`, '_blank');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Lista de productos */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 border border-gray-100 rounded-xl p-4">
            <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-brand-accent">
                {formatRD(unitPrice(item))} c/u
                {item.quantity < item.wholesaleMinQty && (
                  <span className="text-gray-400 font-normal">
                    {' '}
                    · compra {item.wholesaleMinQty}+ y paga {formatRD(item.priceInCents)} c/u
                  </span>
                )}
              </p>
              <p className="text-sm font-medium mt-0.5">{formatRD(unitPrice(item) * item.quantity)}</p>
            </div>
            <div className="flex items-center border border-gray-200 rounded-full">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8">−</button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8">+</button>
            </div>
            <button onClick={() => removeItem(item.productId)} className="text-xs text-gray-400 hover:text-red-500">
              Quitar
            </button>
          </div>
        ))}
      </div>

      {/* Resumen + formulario de entrega */}
      <div className="border border-gray-100 rounded-2xl p-6 h-fit sticky top-24">
        <div className="flex justify-between text-lg font-semibold mb-6">
          <span>Total</span>
          <span>{formatRD(totalInCents())}</span>
        </div>

        <div className="space-y-3">
          <input
            placeholder="Nombre completo"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            placeholder="Teléfono / WhatsApp"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />

          <div className="space-y-2">
            {(Object.keys(DELIVERY_LABELS) as DeliveryType[]).map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="deliveryType"
                  checked={form.deliveryType === type}
                  onChange={() => setForm({ ...form, deliveryType: type })}
                />
                {DELIVERY_LABELS[type]}
              </label>
            ))}
          </div>

          {form.deliveryType !== 'retiro_local' && (
            <textarea
              placeholder="Dirección de entrega"
              value={form.deliveryAddress}
              onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          )}

          <textarea
            placeholder="Notas (opcional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={2}
          />
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full mt-6 bg-green-600 text-white py-3 rounded-full font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando pedido...' : 'Confirmar por WhatsApp'}
        </button>
      </div>
    </div>
  );
}
