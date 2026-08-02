import AdminGuard from '@/components/AdminGuard';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 sm:p-8 max-w-6xl">{children}</div>
      </div>
    </AdminGuard>
  );
}
