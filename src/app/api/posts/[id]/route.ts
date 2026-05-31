import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Post from '@/models/Post';
import { deleteBlobFromAzure } from '@/lib/azure-storage';

/** Extract all Azure blob image URLs from HTML content */
function extractImageUrls(html: string): string[] {
  const regex = /src="(https:\/\/[^"]+\.blob\.core\.windows\.net[^"]*)"/g;
  const urls: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;
    await connectToDatabase();

    // Garbage collect removed images from blob storage
    const existingPost = await Post.findById(id);
    if (existingPost && body.content) {
      const oldUrls = extractImageUrls(existingPost.content || '');
      const newUrls = extractImageUrls(body.content);
      const removed = oldUrls.filter(u => !newUrls.includes(u));
      await Promise.all(removed.map(url => deleteBlobFromAzure(url)));
    }
    
    const post = await Post.findByIdAndUpdate(id, body, { new: true });
    
    if (!post) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error(`PUT /api/posts/[id] error:`, error);
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
    
    const post = await Post.findById(id);
    if (!post) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Delete all images from blob storage before deleting post
    const imageUrls = extractImageUrls(post.content || '');
    await Promise.all(imageUrls.map((url: string) => deleteBlobFromAzure(url)));

    await Post.findByIdAndDelete(id);
    
    return new NextResponse('Deleted', { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/posts/[id] error:`, error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
