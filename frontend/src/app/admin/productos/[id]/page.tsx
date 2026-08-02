'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import { Product } from '@/lib/types';
import AdminProductForm from '@/components/AdminProductForm';
import RequirePermission from '@/components/RequirePermission';

export default function EditarProductoPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getProducts().then((all) => {
      const found = all.find((p) => p.id === params.id);
      setProduct(found || null);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <p className="text-gray-400">Cargando...</p>;
  if (!product) return <p className="text-gray-400">Producto no encontrado.</p>;

  return (
    <RequirePermission permissions={['products.edit']}>
      <div>
        <h1 className="text-2xl font-semibold mb-6">Editar producto</h1>
        <AdminProductForm product={product} />
      </div>
    </RequirePermission>
  );
}
