import PostForm from '@/components/admin/PostForm';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/api/auth/signin');

  await connectToDatabase();
  const { id } = await params;
  const post = await Post.findById(id);

  if (!post) {
    notFound();
  }

  // Convert to plain object for client component
  const postData = JSON.parse(JSON.stringify(post));

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Edit Post</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <PostForm initialData={postData} />
      </div>
    </div>
  );
}
