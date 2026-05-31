import ProjectForm from '@/components/admin/ProjectForm';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/api/auth/signin');

  await connectToDatabase();
  const { id } = await params;
  const project = await Project.findById(id);

  if (!project) {
    notFound();
  }

  const projectData = JSON.parse(JSON.stringify(project));

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Edit Project</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <ProjectForm initialData={projectData} />
      </div>
    </div>
  );
}
