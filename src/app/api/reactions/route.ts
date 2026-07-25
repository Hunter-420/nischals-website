import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';
import Project from '@/models/Project';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');

    if (!type || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    const Model = type === 'post' ? Post : Project;
    const result = await Model.findOne({ slug }).select('likes views').lean() as any;

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ likes: result.likes || 0, views: result.views || 0 });
  } catch (error) {
    console.error('Reaction fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { type, slug, action } = await req.json();
    
    if (!type || !slug || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    const Model = type === 'post' ? Post : Project;
    const updateField = action === 'view' ? { views: 1 } : { likes: 1 };

    const result = await Model.findOneAndUpdate(
      { slug },
      { $inc: updateField },
      { new: true, select: 'likes views' }
    ).lean() as any;

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ likes: result.likes, views: result.views });
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
