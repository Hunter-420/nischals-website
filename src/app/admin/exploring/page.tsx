import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import Exploring from '@/models/Exploring';
import ExploringForm from '@/components/admin/ExploringForm';

export default async function AdminExploringPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const exploringData = await Exploring.find().sort({ order: 1 }).lean();

  // Map data to match form expectations
  const initialData = (exploringData as any[]).map((doc: any) => ({
    category: doc.category,
    items: doc.items.map((item: any) => ({
      title: item.title,
      completed: item.completed,
    }))
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">What I&apos;m Exploring</h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Manage the areas you are actively exploring. Each item automatically becomes a tag you can
          use when writing posts. Clicking an item on the public page will show all posts tagged
          with that topic.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-6">
        <ExploringForm initialData={initialData} />
      </div>
    </div>
  );
}
