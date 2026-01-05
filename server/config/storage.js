import { put, del, list } from '@vercel/blob';

export const uploadToBlob = async (file, folder = 'uploads') => {
  try {
    const filename = `${folder}/${Date.now()}-${file.originalname}`;
    const blob = await put(filename, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    return blob.url;
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error('Failed to upload file');
  }
};

export const deleteFromBlob = async (url) => {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
  } catch (error) {
    console.error('Blob delete error:', error);
    throw new Error('Failed to delete file');
  }
};

export const listBlobs = async (prefix) => {
  try {
    const { blobs } = await list({
      prefix,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    return blobs;
  } catch (error) {
    console.error('Blob list error:', error);
    throw new Error('Failed to list files');
  }
};
