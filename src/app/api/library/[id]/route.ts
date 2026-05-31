import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import LibraryItem from '@/models/LibraryItem';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;
    await connectToDatabase();
    
    const item = await LibraryItem.findByIdAndUpdate(id, body, { new: true });
    
    if (!item) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error(`PUT /api/library/[id] error:`, error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    
    const item = await LibraryItem.findByIdAndDelete(id);
    
    if (!item) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    return new NextResponse('Deleted', { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/library/[id] error:`, error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
