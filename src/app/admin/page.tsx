import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';
import Project from '@/models/Project';
import LibraryItem from '@/models/LibraryItem';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  await connectToDatabase();
  const [postCount, projectCount, libraryCount] = await Promise.all([
    Post.countDocuments(),
    Project.countDocuments(),
    LibraryItem.countDocuments(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        Welcome back, {session?.user?.name || 'Admin'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Posts</h2>
          <p className="text-3xl font-semibold text-gray-900">{postCount}</p>
        </div>
        
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Projects</h2>
          <p className="text-3xl font-semibold text-gray-900">{projectCount}</p>
        </div>

        <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Library Items</h2>
          <p className="text-3xl font-semibold text-gray-900">{libraryCount}</p>
        </div>
      </div>
    </div>
  );
}
