import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImageToAzure } from '@/lib/azure-storage';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const url = await uploadImageToAzure(buffer, file.name, file.type);
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
