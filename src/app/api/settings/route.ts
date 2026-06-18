import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();
    
    // Find the first settings document and update it, or create if it doesn't exist
    const settings = await SiteSettings.findOneAndUpdate({}, body, {
      returnDocument: 'after',
      upsert: true,
      setDefaultsOnInsert: true
    });
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
