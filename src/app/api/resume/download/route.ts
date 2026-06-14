import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { BlobServiceClient } from '@azure/storage-blob';

/**
 * GET /api/resume/download
 * Downloads the resume PDF via Azure SDK (same approach as /api/media)
 * so it always works regardless of how the URL is stored in settings.
 */
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne().lean() as any;

    if (!settings?.resumeUrl) {
      return new NextResponse('No resume available', { status: 404 });
    }

    let blobUrl = settings.resumeUrl;

    // If it is stored as a proxy URL like /api/media?url=https://... or http://localhost:3000/api/media?url=...
    // extract the real blob URL from it
    if (blobUrl.includes('/api/media')) {
      try {
        const parsed = new URL(blobUrl, 'http://localhost:3000');
        const extracted = parsed.searchParams.get('url');
        if (extracted) blobUrl = extracted;
      } catch {
        // keep blobUrl as-is
      }
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'portfolio-nischal';

    // If we have Azure credentials and it looks like an Azure blob URL, use the SDK
    if (connectionString && blobUrl.includes('blob.core.windows.net')) {
      try {
        const url = new URL(blobUrl);
        // pathname is /containerName/blobName
        const pathParts = url.pathname.split('/').filter(Boolean);
        const blobName = pathParts.slice(1).join('/'); // everything after containerName

        if (blobName) {
          const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
          const containerClient = blobServiceClient.getContainerClient(containerName);
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);

          const downloadResponse = await blockBlobClient.download(0);
          if (downloadResponse.readableStreamBody) {
            return new NextResponse(downloadResponse.readableStreamBody as any, {
              status: 200,
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"',
                'Cache-Control': 'no-cache',
              },
            });
          }
        }
      } catch (sdkErr) {
        console.error('Azure SDK download failed, falling back to direct fetch:', sdkErr);
      }
    }

    // Fallback: direct HTTP fetch (works for public blobs or non-Azure URLs)
    const pdfRes = await fetch(blobUrl);
    if (!pdfRes.ok) {
      console.error(`Failed to fetch resume from ${blobUrl}: ${pdfRes.status} ${pdfRes.statusText}`);
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
