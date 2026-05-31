import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Exploring from '@/models/Exploring';

/**
 * GET /api/exploring/tags
 * Returns a flat array of all exploring item titles to be used as suggested tags
 * when creating/editing posts.
 */
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Exploring.find().sort({ order: 1 }).lean();

    const tags: string[] = [];
    for (const cat of categories as any[]) {
      for (const item of cat.items || []) {
        if (item.title) {
          tags.push(item.title.toLowerCase());
        }
      }
    }

    // Deduplicate
    const unique = Array.from(new Set(tags));

    return NextResponse.json(unique);
  } catch (error) {
    console.error('GET /api/exploring/tags error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
