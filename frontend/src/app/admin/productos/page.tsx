'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import { Product } from '@/lib/types';
import { formatRD } from '@/lib/format';
import RequirePermission from '@/components/RequirePermission';
import { useAdminAuthStore } from '@/store/admin-auth-store';

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const canDelete = useAdminAuthStore((s) => s.hasPermission('products.delete'));

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleActive(p: Product) {
    await adminApi.updateProduct(p.id, { isActive: !p.isActive });
    load();
  }

  async function handleDelete(p: Product) {
    if (!confirm(`¿Eliminar "${p.name}" definitivamente? Esta acción no se puede deshacer.`)) return;
    try {
      await adminApi.deleteProduct(p.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar el producto.');
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <RequirePermission permissions={['products.create', 'products.edit', 'products.delete']}>
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-brand text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <input
        placeholder="Buscar por nombre o código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-200 rounded-full px-4 py-2 text-sm mb-6"
      />

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4">Producto</th>
                <th className="py-2 pr-4">Código</th>
                <th className="py-2 pr-4">Precio</th>
                <th className="py-2 pr-4">Stock</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 pr-4 flex items-center gap-3">
                    {p.images?.[0]?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    {p.name}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{p.sku}</td>
                  <td className="py-3 pr-4">{formatRD(p.priceInCents)}</td>
                  <td className="py-3 pr-4">{p.inventory?.quantityAvailable ?? 0}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right space-x-3 whitespace-nowrap">
                    <Link href={`/admin/productos/${p.id}`} className="text-brand-accent hover:underline">
                      Editar
                    </Link>
                    <button onClick={() => handleToggleActive(p)} className="text-gray-400 hover:text-gray-700">
                      {p.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    {canDelete && (
                      <button onClick={() => handleDelete(p)} className="text-red-400 hover:text-red-600">
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-gray-400 mt-6">No se encontraron productos.</p>}
        </div>
      )}
    </div>
    </RequirePermission>
  );
}
