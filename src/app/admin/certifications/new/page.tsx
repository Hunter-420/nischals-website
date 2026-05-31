import CertificationForm from '@/components/admin/CertificationForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewCertificationPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/api/auth/signin');

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Add Certification</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <CertificationForm />
      </div>
    </div>
  );
}
