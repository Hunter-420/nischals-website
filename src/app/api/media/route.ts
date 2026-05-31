import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const blobUrl = searchParams.get('url');

    if (!blobUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';

    if (!connectionString) {
      return new NextResponse('Storage connection string missing', { status: 500 });
    }

    // Extract the blob name from the original Azure URL
    const url = new URL(blobUrl);
    const pathParts = url.pathname.split('/');
    // format is typically /containerName/blobName
    const blobName = pathParts.slice(2).join('/'); 

    if (!blobName) {
      return new NextResponse('Invalid blob URL format', { status: 400 });
    }

    // Use Azure SDK to fetch the private blob securely
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const downloadResponse = await blockBlobClient.download(0);
    
    if (!downloadResponse.readableStreamBody) {
      return new NextResponse('Stream not found', { status: 500 });
    }

    const headers = new Headers();
    if (downloadResponse.contentType) headers.set('Content-Type', downloadResponse.contentType);
    
    // Cache heavily since blobs have unique uuid names
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(downloadResponse.readableStreamBody as any, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('GET /api/media error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
