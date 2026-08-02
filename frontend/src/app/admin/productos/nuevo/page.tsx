import AdminProductForm from '@/components/AdminProductForm';
import RequirePermission from '@/components/RequirePermission';

export default function NuevoProductoPage() {
  return (
    <RequirePermission permissions={['products.create']}>
      <div>
        <h1 className="text-2xl font-semibold mb-6">Nuevo producto</h1>
        <AdminProductForm />
      </div>
    </RequirePermission>
  );
}
