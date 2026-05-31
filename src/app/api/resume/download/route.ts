import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

/**
 * GET /api/resume/download
 * Proxies the resume PDF from Azure Blob Storage with Content-Disposition: attachment
 * so the browser triggers a file download instead of opening it.
 */
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne().lean() as any;

    if (!settings?.resumeUrl) {
      return new NextResponse('No resume available', { status: 404 });
    }

    let targetUrl = settings.resumeUrl;
    if (targetUrl.startsWith('/api/media')) {
      const urlObj = new URL(targetUrl, 'http://localhost');
      const extractedUrl = urlObj.searchParams.get('url');
      if (extractedUrl) targetUrl = extractedUrl;
    }

    const pdfRes = await fetch(targetUrl);
    if (!pdfRes.ok) {
      return new NextResponse('Failed to fetch resume', { status: 502 });
    }

    const buffer = await pdfRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('GET /api/resume/download error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
