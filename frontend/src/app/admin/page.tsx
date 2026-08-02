'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, InventoryRow, AdminOrder } from '@/lib/admin-api';
import { formatRD } from '@/lib/format';
import { useAdminAuthStore } from '@/store/admin-auth-store';

export default function AdminHomePage() {
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([]);
  const [mostSold, setMostSold] = useState<{ productName: string; totalSold: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const canViewOrders = hasPermission('orders.manage');
  const canViewInventory = hasPermission('inventory.manage');
  const canViewProducts = hasPermission('products.create', 'products.edit', 'products.delete');

  useEffect(() => {
    async function load() {
      try {
        const [inventory, orders, stats] = await Promise.all([
          canViewInventory ? adminApi.getInventory() : Promise.resolve([]),
          canViewOrders ? adminApi.getOrders('recibido') : Promise.resolve([]),
          canViewOrders ? adminApi.mostSold() : Promise.resolve([]),
        ]);
        setLowStockCount(inventory.filter((i: InventoryRow) => i.quantityAvailable <= i.lowStockThreshold).length);
        setPendingOrders(orders.slice(0, 5));
        setMostSold(stats);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [canViewInventory, canViewOrders]);

  if (loading) return <p className="text-gray-400">Cargando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Resumen</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {canViewOrders && (
          <Link href="/admin/pedidos" className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500">Pedidos por atender</p>
            <p className="text-3xl font-semibold mt-1">{pendingOrders.length}</p>
          </Link>
        )}
        {canViewInventory && (
          <Link href="/admin/inventario" className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500">Productos con poco stock</p>
            <p className="text-3xl font-semibold mt-1">{lowStockCount}</p>
          </Link>
        )}
        {canViewProducts && (
          <Link href="/admin/productos" className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500">Gestionar catálogo</p>
            <p className="text-sm text-brand-accent mt-1 font-medium">Ver productos →</p>
          </Link>
        )}
      </div>

      {(canViewOrders || canViewProducts) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {canViewOrders && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Últimos pedidos recibidos</h2>
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-gray-400">No hay pedidos pendientes.</p>
              ) : (
                <ul className="space-y-2">
                  {pendingOrders.map((o) => (
                    <li key={o.id} className="border border-gray-100 rounded-lg p-3 text-sm flex justify-between">
                      <span>{o.customerName}</span>
                      <span className="font-medium">{formatRD(o.totalInCents)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {canViewOrders && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Productos más vendidos</h2>
              {mostSold.length === 0 ? (
                <p className="text-sm text-gray-400">Todavía no hay ventas registradas.</p>
              ) : (
                <ul className="space-y-2">
                  {mostSold.map((m, i) => (
                    <li key={i} className="border border-gray-100 rounded-lg p-3 text-sm flex justify-between">
                      <span>{m.productName}</span>
                      <span className="font-medium">{m.totalSold} unidades</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
