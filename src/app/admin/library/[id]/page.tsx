import LibraryForm from '@/components/admin/LibraryForm';
import connectToDatabase from '@/lib/db';
import LibraryItem from '@/models/LibraryItem';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function EditLibraryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/api/auth/signin');

  await connectToDatabase();
  const { id } = await params;
  const item = await LibraryItem.findById(id);

  if (!item) {
    notFound();
  }

  const itemData = JSON.parse(JSON.stringify(item));

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Edit Library Item</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <LibraryForm initialData={itemData} />
      </div>
    </div>
  );
}
