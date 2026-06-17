import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/api/auth/signin');
  }

  return (
    <div className="min-h-screen bg-white md:flex">
      <Sidebar />
      <main className="flex-1 min-w-0 relative" id="admin-main">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 admin-page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
