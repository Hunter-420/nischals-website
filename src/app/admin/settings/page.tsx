import SettingsForm from '@/components/admin/SettingsForm';
import connectToDatabase from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') redirect('/api/auth/signin');

  await connectToDatabase();
  const settings = await SiteSettings.findOne({});

  const settingsData = settings ? JSON.parse(JSON.stringify(settings)) : null;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Site Settings</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <SettingsForm initialData={settingsData} />
      </div>
    </div>
  );
}
