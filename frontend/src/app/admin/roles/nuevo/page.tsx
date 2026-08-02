import AdminRoleForm from '@/components/AdminRoleForm';
import RequirePermission from '@/components/RequirePermission';

export default function NuevoRolPage() {
  return (
    <RequirePermission permissions={['settings.access']}>
      <div>
        <h1 className="text-2xl font-semibold mb-6">Nuevo rol</h1>
        <AdminRoleForm />
      </div>
    </RequirePermission>
  );
}
