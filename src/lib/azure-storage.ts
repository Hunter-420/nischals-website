import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';

if (!AZURE_STORAGE_CONNECTION_STRING) {
  console.warn('AZURE_STORAGE_CONNECTION_STRING is not defined. Uploads will fail.');
}

export async function uploadImageToAzure(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('Azure Storage connection string is missing');
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  // Ensure container exists without trying to set public access
  // (if public access is disabled at the account level, this avoids throwing an error)
  await containerClient.createIfNotExists();

  const extension = originalName.split('.').pop();
  const blobName = `${uuidv4()}.${extension}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType }
  });

  // Return a proxy URL to bypass public access restrictions
  return `/api/media?url=${encodeURIComponent(blockBlobClient.url)}`;
}

export async function deleteBlobFromAzure(blobUrl: string): Promise<void> {
  if (!AZURE_STORAGE_CONNECTION_STRING) {
    console.warn('Azure Storage connection string missing. Skipping delete.');
    return;
  }

  try {
    let targetUrl = blobUrl;
    
    // Unwrap the proxy URL if it exists
    if (blobUrl.startsWith('/api/media')) {
      const urlObj = new URL(blobUrl, 'http://localhost');
      targetUrl = urlObj.searchParams.get('url') || blobUrl;
    }

    // Extract blob name from URL
    // Format: https://<account>.blob.core.windows.net/<container>/<blobName>
    const url = new URL(targetUrl);
    const pathParts = url.pathname.split('/');
    // pathParts is usually ['', container, blobName]
    const blobName = pathParts.slice(2).join('/');
    
    if (!blobName) {
      console.warn('Could not extract blob name from URL:', targetUrl);
      return;
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.deleteIfExists();
  } catch (error) {
    console.error('Error deleting blob from Azure:', error);
  }
}
