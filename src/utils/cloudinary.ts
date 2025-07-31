import stream from 'stream';
import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from './index';

// Tipado básico para el archivo que viene desde multer
interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export async function saveImageToCloudinary(
  file: MulterFile,
  productId: number | string
): Promise<string> {
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