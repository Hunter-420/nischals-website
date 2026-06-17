import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import Now from '@/models/Now';
import Project from '@/models/Project';
import Exploring from '@/models/Exploring';
import NowForm from '@/components/admin/NowForm';

export default async function AdminNowPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/admin/login');
  }

  await connectToDatabase();
  const nowDoc = await Now.findOne().sort({ updatedAt: -1 }).lean() as any;
  const content = nowDoc?.content || '';
  const sections = nowDoc?.sections ? JSON.parse(JSON.stringify(nowDoc.sections)) : [];
  const previous = nowDoc?.previous ? JSON.parse(JSON.stringify(nowDoc.previous)) : [];
  const addons = nowDoc?.addons ? JSON.parse(JSON.stringify(nowDoc.addons)) : [];

  const projects = await Project.find({}).select('title slug').lean() as any[];
  const exploring = await Exploring.find({}).lean() as any[];

  const availableLinks = [
    ...projects.map(p => ({ title: p.title, url: `/projects/${p.slug}`, group: 'Projects' })),
    ...exploring.flatMap(cat => cat.items.map((item: any) => ({
      title: item.title,
      url: `/exploring/tag/${encodeURIComponent(item.title.toLowerCase().replace(/\s+/g, '-'))}`,
      group: 'Exploring'
    })))
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Now Section</h1>
        <p className="mt-2 text-gray-600">
          Update what you&apos;re currently working on. Add sections for exploring, building, reading, podcasts, etc.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <NowForm 
          initialContent={content} 
          initialSections={sections} 
          initialPrevious={previous}
          initialAddons={addons}
          availableLinks={availableLinks} 
        />
      </div>
    </div>
  );
}
