'use client';

import { useEffect, useState } from 'react';
import { adminApi, AdminOrder, ORDER_STATUSES } from '@/lib/admin-api';
import { formatRD } from '@/lib/format';
import RequirePermission from '@/components/RequirePermission';

const STATUS_LABELS: Record<string, string> = {
  recibido: 'Pedido recibido',
  preparando: 'Preparando',
  listo_para_retirar: 'Listo para retirar',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  recibido: 'bg-blue-50 text-blue-700',
  preparando: 'bg-amber-50 text-amber-700',
  listo_para_retirar: 'bg-purple-50 text-purple-700',
  en_camino: 'bg-indigo-50 text-indigo-700',
  entregado: 'bg-green-50 text-green-700',
  cancelado: 'bg-red-50 text-red-700',
};

const DELIVERY_LABELS: Record<string, string> = {
  retiro_local: 'Retiro en el local',
  envio_negocio: 'Envío al negocio',
  envio_domicilio: 'Envío a domicilio',
};

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.getOrders(filter || undefined);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleStatusChange(id: string, status: string) {
    await adminApi.updateOrderStatus(id, status);
    load();
  }

  return (
    <RequirePermission permissions={['orders.manage']}>
    <div>
      <h1 className="text-2xl font-semibold mb-6">Pedidos</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`text-xs px-3 py-1.5 rounded-full border ${!filter ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600'}`}
        >
          Todos
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border ${filter === s ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-600'}`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">No hay pedidos en este estado.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border border-gray-100 rounded-xl p-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              >
                <div>
                  <p className="font-medium">{o.customerName} <span className="text-gray-400 font-normal">· {o.customerPhone}</span></p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(o.createdAt).toLocaleString('es-DO')} · {DELIVERY_LABELS[o.deliveryType] || o.deliveryType}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatRD(o.totalInCents)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </div>
              </div>

              {expanded === o.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ul className="text-sm space-y-1 mb-4">
                    {o.items.map((item, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{item.quantity}x {item.productName}</span>
                        <span className="text-gray-500">{formatRD(item.subtotalInCents)}</span>
                      </li>
                    ))}
                  </ul>
                  {o.deliveryAddress && (
                    <p className="text-sm text-gray-500 mb-2">Dirección: {o.deliveryAddress}</p>
                  )}
                  {o.notes && <p className="text-sm text-gray-500 mb-3">Notas: {o.notes}</p>}

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Cambiar estado:</label>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </RequirePermission>
  );
}
