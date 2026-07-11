/**
 * Upload Middleware
 *
 * Configures multer for receipt image uploads.
 * Uses memory storage (buffer) since files are forwarded to S3.
 *
 * Constraints:
 * - Max file size: 5 MB
 * - Allowed formats: jpg, jpeg, png, webp
 * - Single file upload on the 'receipt' field
 */

const multer = require('multer');

// Allowed MIME types for receipt images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

// 5 MB in bytes
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * File filter — rejects files that are not images or not in the allowed formats.
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file format: ${file.mimetype}. Allowed formats: JPG, JPEG, PNG, WEBP.`
      ),
      false
    );
  }
};

// Configure multer with memory storage for S3 forwarding
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

/**
 * Middleware for single receipt image upload.
 * Expects the file in the 'receipt' form field.
 *
 * Wraps multer's error handling to return JSON error responses
 * instead of default HTML error pages.
 */
const uploadReceipt = (req, res, next) => {
  const singleUpload = upload.single('receipt');

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (file size, field name, etc.)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    }

    if (err) {
      // Custom file filter errors
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    next();
  });
};

module.exports = { uploadReceipt };
