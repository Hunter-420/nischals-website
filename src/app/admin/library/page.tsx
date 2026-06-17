import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import LibraryItem from '@/models/LibraryItem';
import { Plus, Edit } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/api/auth/signin');

  await connectToDatabase();
  const items = await LibraryItem.find({}).sort({ createdAt: -1 });

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Library</h1>
        <Link
          href="/admin/library/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          New Item
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-[640px] w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Title & Author</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item._id.toString()}>
                <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.author}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap sm:px-6">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'reading' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/library/${item._id}`} className="text-indigo-600 hover:text-indigo-900">
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-500 sm:px-6">
                  No library items found. Add your first book or podcast!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
