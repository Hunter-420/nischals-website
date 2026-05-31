import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();
    
    const post = await Post.create(body);
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
