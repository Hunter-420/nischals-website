import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();
    
    const project = await Project.create(body);
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
