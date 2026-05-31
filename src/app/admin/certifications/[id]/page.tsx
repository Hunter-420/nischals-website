import CertificationForm from '@/components/admin/CertificationForm';
import connectToDatabase from '@/lib/db';
import Certification from '@/models/Certification';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function EditCertificationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/api/auth/signin');

  await connectToDatabase();
  const { id } = await params;
  const cert = await Certification.findById(id);

  if (!cert) {
    notFound();
  }

  const certData = JSON.parse(JSON.stringify(cert));

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Edit Certification</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <CertificationForm initialData={certData} />
      </div>
    </div>
  );
}
