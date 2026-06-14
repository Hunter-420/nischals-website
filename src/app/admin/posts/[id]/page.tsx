import WriterStudio from '@/components/admin/WriterStudio';
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

  if (!post) notFound();

  const postData = JSON.parse(JSON.stringify(post));

  return <WriterStudio initialData={postData} />;
}
