import multer, { type Multer, type FileFilterCallback } from 'multer';
import type { Request } from 'express';

export type AllowedMimeType =
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png'
  | 'video/mp4'
  | 'video/webm';

export interface UploadOptions {
  mimeTypes?: AllowedMimeType[];
  maxBytes: number; // wajib diisi (mis. 10 * 1024 * 1024 untuk 10MB)
}

/**
 * Factory Multer uploader berbasis memoryStorage.
 */
export function upload({
  mimeTypes = [
    'application/msword',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'video/mp4',
    'video/webm',
  ],
  maxBytes,
}: UploadOptions): Multer {
  const storage = multer.memoryStorage();

  return multer({
    storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (mimeTypes.includes(file.mimetype as AllowedMimeType)) {
        cb(null, true);
      } else {
        const allowedExtensions = mimeTypes.map((mim) => mim.split('/')[1]).join(', ');
        cb(
          new Error(`Hanya file dengan ekstensi ${allowedExtensions} yang diperbolehkan.`)
        );
      }
    },
    limits: { fileSize: maxBytes },
  });
}

export default upload;
