import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import LibraryItem from '@/models/LibraryItem';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();
    
    const item = await LibraryItem.create(body);
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('POST /api/library error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
