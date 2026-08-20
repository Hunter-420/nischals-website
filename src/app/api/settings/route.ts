import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne({}).lean();
    if (!settings) return NextResponse.json({});
    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    // Use $set so array fields (primaryDomains, tags, etc.) are fully replaced
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: body },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true, new: true }
    ).lean();

    return NextResponse.json(settings);
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
