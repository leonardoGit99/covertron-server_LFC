import { config } from 'dotenv';
config();


export const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


export const db = {
  urldatabase: process.env.DATABASE_URL!,
};

export const JWT_SECRET = process.env.JWT_SECRET!;