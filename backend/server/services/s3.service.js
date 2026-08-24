/**
 * AWS S3 Upload Service
 *
 * Handles uploading receipt images to an S3 bucket.
 * Files are organized under receipts/{userId}/{timestamp}-{filename}
 * for easy management and per-user isolation.
 */

const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

// Initialize S3 client from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

/**
 * Upload a receipt image buffer to S3.
 *
 * @param {Buffer} fileBuffer - The image file buffer from multer
 * @param {string} originalName - Original filename for extension detection
 * @param {string} userId - The authenticated user's ID for namespacing
 * @returns {string} The public URL of the uploaded image
 * @throws {Error} On S3 upload failure
 */
const uploadReceiptImage = async (fileBuffer, originalName, userId) => {
  try {
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${path.basename(originalName, ext)}${ext}`;
    const key = `receipts/${userId}/${safeFileName}`;

    // Determine content type from extension
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Construct the public URL
    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return imageUrl;
  } catch (error) {
    console.error('S3 upload error:', error.message);
    throw new Error(`Failed to upload receipt image to storage: ${error.message}`);
  }
};

/**
 * Download a receipt image from S3 and return the raw Buffer.
 *
 * Used by BullMQ workers that only receive the S3 URL (not the
 * original multer buffer). The image is re-downloaded so it can be
 * base64-encoded for the Vision Language Model, which cannot access
 * private S3 objects directly.
 *
 * @param {string} imageUrl - The full S3 URL returned by uploadReceiptImage
 * @returns {{ buffer: Buffer, contentType: string }}
 * @throws {Error} On S3 download failure
 */
const downloadReceiptImage = async (imageUrl) => {
  try {
    // Extract the S3 key from the URL
    // URL format: https://{bucket}.s3.{region}.amazonaws.com/{key}
    const url = new URL(imageUrl);
    const key = decodeURIComponent(url.pathname.slice(1)); // remove leading '/'

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Convert the readable stream to a Buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return {
      buffer,
      contentType: response.ContentType || 'image/jpeg',
    };
  } catch (error) {
    console.error('S3 download error:', error.message);
    throw new Error(`Failed to download receipt image from storage: ${error.message}`);
  }
};

module.exports = { uploadReceiptImage, downloadReceiptImage };
