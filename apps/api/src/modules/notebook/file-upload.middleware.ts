import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

/**
 * File Upload Middleware
 *
 * Configures Multer for handling file uploads in notebook entries.
 * Supports images (JPG, PNG, GIF), videos (MP4, MOV), and PDFs.
 * Maximum file size: 10MB per file.
 */

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'notebook');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure storage engine
 */
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp and random suffix
    const uniqueSuffix =
      Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

/**
 * File filter to validate file types
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed file extensions
  const allowedExtensions = /jpeg|jpg|png|gif|mp4|mov|pdf/;

  // Check extension
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );

  // Check MIME type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
  ];

  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPG, PNG, GIF, MP4, MOV, and PDF files are allowed.'
      )
    );
  }
};

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter,
});

/**
 * Middleware for single file upload
 */
export const uploadSingle = upload.single('file');

/**
 * Middleware for multiple file upload (max 5 files)
 */
export const uploadMultiple = upload.array('files', 5);

/**
 * Error handler for multer errors
 */
export const handleUploadError = (err: any, _req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'File size exceeds the maximum limit of 10MB',
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Too many files. Maximum 5 files allowed per upload',
      });
    }

    return res.status(400).json({
      error: 'Bad Request',
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: err.message || 'File upload failed',
    });
  }

  next();
};
