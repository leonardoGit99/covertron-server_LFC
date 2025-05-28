"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// import { v2 as cloudinary } from 'cloudinary';
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });
// export const db = {
//   urldatabase: process.env.DATABASE_URL!,
// };
// export { cloudinary };
exports.db = {
    urldatabase: process.env.DATABASE_URL,
};
