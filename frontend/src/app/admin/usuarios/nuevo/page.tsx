import AdminUserForm from '@/components/AdminUserForm';
import RequirePermission from '@/components/RequirePermission';

export default function NuevoUsuarioPage() {
  return (
    <RequirePermission permissions={['users.create']}>
      <div>
        <h1 className="text-2xl font-semibold mb-6">Nuevo usuario</h1>
        <AdminUserForm />
      </div>
    </RequirePermission>
  );
}
