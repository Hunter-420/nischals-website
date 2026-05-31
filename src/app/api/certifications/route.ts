import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Certification from '@/models/Certification';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();
    
    const cert = await Certification.create(body);
    
    return NextResponse.json(cert);
  } catch (error) {
    console.error('POST /api/certifications error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
