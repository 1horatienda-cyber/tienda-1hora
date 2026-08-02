'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Product, Category } from '@/lib/types';

interface Props {
  product?: Product; // si viene, es edición; si no, es creación
}

export default function AdminProductForm({ product }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product ? (product.priceInCents / 100).toString() : '',
    sku: product?.sku || '',
    categoryId: product?.category?.id || '',
    isFeatured: product?.isFeatured || false,
    isNew: product?.isNew || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  async function handleAddCategory() {
    if (!newCategory.trim()) return;
    const created = await adminApi.createCategory(newCategory.trim());
    setCategories((prev) => [...prev, created]);
    setForm((f) => ({ ...f, categoryId: created.id }));
    setNewCategory('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        priceInCents: Math.round(parseFloat(form.price) * 100),
        sku: form.sku,
        categoryId: form.categoryId || undefined,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
      };
      if (product) {
        await adminApi.updateProduct(product.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      router.push('/admin/productos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`¿Desactivar "${product.name}"? Podrás reactivarlo después.`)) return;
    await adminApi.deleteProduct(product.id);
    router.push('/admin/productos');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Nombre</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Precio (RD$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Código (SKU)</label>
          <input
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Categoría</label>
        <div className="flex gap-2 mt-1">
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 mt-2">
          <input
            placeholder="Crear nueva categoría..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs"
          />
          <button type="button" onClick={handleAddCategory} className="text-xs text-brand-accent px-3 whitespace-nowrap">
            + Agregar
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          Producto destacado
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
          />
          Marcar como nuevo
        </label>
      </div>

      {!product && (
        <p className="text-xs text-gray-400">
          Después de crear el producto, sube su foto copiándola a{' '}
          <code className="bg-gray-100 px-1 rounded">frontend/public/products/{form.sku || 'CODIGO'}.jpg</code>{' '}
          (la subida de imágenes desde el panel llega en una próxima etapa).
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-brand-accent transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
        </button>
        {product && (
          <button type="button" onClick={handleDelete} className="text-sm text-red-500 hover:underline">
            Desactivar producto
          </button>
        )}
      </div>
    </form>
  );
}
