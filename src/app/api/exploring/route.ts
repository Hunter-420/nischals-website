import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Exploring from '@/models/Exploring';

export async function GET() {
  try {
    await connectToDatabase();
    const exploring = await Exploring.find().sort({ order: 1 });
    return NextResponse.json(exploring);
  } catch (error) {
    console.error('GET /api/exploring error:', error);
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
    
    // The request should be an array of exploring categories to replace the existing ones
    if (!Array.isArray(body)) {
      return new NextResponse('Expected an array of categories', { status: 400 });
    }

    // Delete all existing and insert new ones to maintain exact state and order
    await Exploring.deleteMany({});
    
    const categories = body.map((cat, index) => ({
      ...cat,
      order: index, // Ensure order matches array position
      items: cat.items.map((item: any) => ({
        title: item.title,
        completed: item.completed
      }))
    }));

    const inserted = await Exploring.insertMany(categories);
    return NextResponse.json(inserted);
  } catch (error) {
    console.error('POST /api/exploring error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
