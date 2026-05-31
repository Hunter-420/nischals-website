import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Project from '@/models/Project';
import { deleteBlobFromAzure } from '@/lib/azure-storage';

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
    const existingProject = await Project.findById(id);
    if (existingProject && body.content) {
      const oldUrls = extractImageUrls(existingProject.content || '');
      const newUrls = extractImageUrls(body.content);
      const removed = oldUrls.filter((u: string) => !newUrls.includes(u));
      await Promise.all(removed.map((url: string) => deleteBlobFromAzure(url)));
    }
    
    const project = await Project.findByIdAndUpdate(id, body, { new: true });
    
    if (!project) {
      return new NextResponse('Not found', { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error(`PUT /api/projects/[id] error:`, error);
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
    
    const project = await Project.findById(id);
    if (!project) {
      return new NextResponse('Not found', { status: 404 });
    }

    // Delete all embedded images from blob storage
    const imageUrls = extractImageUrls(project.content || '');
    await Promise.all(imageUrls.map((url: string) => deleteBlobFromAzure(url)));

    await Project.findByIdAndDelete(id);
    
    return new NextResponse('Deleted', { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/projects/[id] error:`, error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
