import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Now from '@/models/Now';

/** GET: fetch the single Now document (public) */
export async function GET() {
  try {
    await connectToDatabase();
    const now = await Now.findOne().sort({ updatedAt: -1 });
    return NextResponse.json(now || { content: '', sections: [], previous: [], addons: [] });
  } catch (error) {
    console.error('GET /api/now error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

/** POST: create or update the Now document (admin only) */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    // We only keep one Now document – upsert
    const existing = await Now.findOne();
    let doc;
    if (existing) {
      doc = await Now.findByIdAndUpdate(
        existing._id,
        {
          content: body.content ?? existing.content,
          sections: body.sections ?? existing.sections,
          previous: body.previous ?? existing.previous,
          addons: body.addons ?? existing.addons,
        },
        { returnDocument: 'after' }
      );
    } else {
      doc = await Now.create({
        content: body.content || '',
        sections: body.sections || [],
        previous: body.previous || [],
        addons: body.addons || [],
      });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('POST /api/now error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
