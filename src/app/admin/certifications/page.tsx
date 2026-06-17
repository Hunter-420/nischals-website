import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import Certification from '@/models/Certification';
import { Plus, Edit } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DeleteAction from '@/components/admin/DeleteAction';

export default async function AdminCertificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/api/auth/signin');

  await connectToDatabase();
  const certs = await Certification.find({}).sort({ date: -1 });

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Certifications</h1>
        <Link
          href="/admin/certifications/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          New Certification
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-[640px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Issuer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {certs.map((cert) => (
              <tr key={cert._id.toString()}>
                <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                  <div className="text-sm font-medium text-gray-900">{cert.title}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 sm:px-6">
                  {cert.issuer}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 sm:px-6">
                  {new Date(cert.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/certifications/${cert._id}`} className="text-indigo-600 hover:text-indigo-900">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteAction id={cert._id.toString()} endpoint="/api/certifications" itemName="certification" />
                  </div>
                </td>
              </tr>
            ))}
            {certs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-500 sm:px-6">
                  No certifications found. Add your first credential!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
