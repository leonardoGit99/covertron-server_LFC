import { Request, Response, NextFunction } from "express"
import { productSchema } from "../schemas/product.schema"
import z from "zod";
import { insertProduct } from "../services/product.service";
import { saveImageToCloudinary } from "../utils/cloudinary";
import { insertProductImages } from "../services/image.service";
import pool from "../utils/db";
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect();
  try {
    // Validation body data
    const { success, data, error } = productSchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error ? z.treeifyError(error) : {}
      })
      return;
    }


    // begin transaction
    await client.query('BEGIN');

    //Insert product in DB
    const product = await insertProduct(data, client);
    if (!product) {
      res.status(500).json({
        success: false,
        message: 'Creation of product failed'
      })
    }


    const productId = product.id;
    const files = Array.isArray(req.files) ? req.files as Express.Multer.File[] : [];

    //Promise.all receives a "promises array" and the "Promise.all" is resolved when all the elements of this array are solved
    let images;
    try {
      images = await Promise.all(files.map((image) => saveImageToCloudinary(image, productId)));
    } catch (cloudinaryError) {
      await client.query('ROLLBACK');
      res.status(500).json({
        success: false,
        message: 'Error uploading images to Cloudinary',
        error: cloudinaryError
      });
      return;
    }

    if (images.length === 0) {
      await client.query('ROLLBACK');
      res.status(500).json({
        success: false,
        message: 'No images uploaded'
      });
      return;
    }


    try {
      for (const imageUrl of images) {
        await insertProductImages(productId, imageUrl, client);
      }
    } catch (insertError) {
      await client.query('ROLLBACK');
      res.status(500).json({
        success: false,
        message: 'Error saving image URLs to the database',
        error: insertError
      });
      return;
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error)
  } finally {
    client.release();
  }
}