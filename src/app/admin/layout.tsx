
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import AdminNav from '@/components/AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
        <div className="flex min-h-screen bg-gray-50">
            <AdminNav />
            <main className="flex-grow p-6">
                {children}
            </main>
        </div>
    </AdminAuthProvider>
  );
}
