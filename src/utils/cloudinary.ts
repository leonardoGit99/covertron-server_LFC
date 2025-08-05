import stream from 'stream';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { cloudinary } from './index';

// Tipado básico para el archivo que viene desde multer
interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}


const extractPublicId = (publicUrl: string): string => {
  const url = new URL(publicUrl);
  const parts = url.pathname.split('/');

  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) {
    throw new Error('Invalid Cloudinary URL: missing "upload" segment.');
  }

  // Captura el path después de "upload", eliminando la versión
  const relevantParts = parts.slice(uploadIndex + 1);
  
  // Si el primer elemento es versión (ej: v12345678), lo quitamos
  if (/^v\d+$/.test(relevantParts[0])) {
    relevantParts.shift();
  }

  // Reconstruimos el publicId y quitamos la extensión
  const fullPath = relevantParts.join('/');
  const withoutExtension = fullPath.replace(/\.[^/.]+$/, '');

  return withoutExtension;
};

export const saveImageToCloudinary = (
  file: MulterFile,
  productId: number | string
): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: `product_${productId}_${file.originalname.split('.')[0]}`,
          folder: 'products',
        },
        (error: any, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            console.error(error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export async function deleteImageFromCloudinary(publicUrl: string) {
  try {
    const publicId = extractPublicId(publicUrl);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error:any , result:any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error("Error deleting from Cloudinary", error);
    throw error;
  }
}