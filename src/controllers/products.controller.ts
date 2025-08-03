import { Request, Response, NextFunction } from "express"
import { productSchema } from "../schemas/product.schema"
import z, { success } from "zod";
import { fetchAllProducts, fetchOneProductById, insertProduct } from "../services/product.service";
import { saveImageToCloudinary } from "../utils/cloudinary";
import { insertProductImages } from "../services/image.service";
import pool from "../utils/db";
import { parseIdParam } from "../utils/parseIdParam";
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
      return;
    }


    const productId = product.id; // Extract product id from result of insercion this product on db

    const files = Array.isArray(req.files) ? req.files as Express.Multer.File[] : []; // Type for req.files 


    //Promise.all receives a "promises array" and the "Promise.all" is resolved when all the elements of this array are solved
    let images;
    try {
      //  Saving images on cloudinary
      images = await Promise.all(files.map((image) => saveImageToCloudinary(image, productId)));
    } catch (cloudinaryError) {
      // Rollback if we couldn't save image to cloudinary
      await client.query('ROLLBACK');

      // Error Response
      res.status(500).json({
        success: false,
        message: 'Error uploading images to Cloudinary',
        error: cloudinaryError
      });
      return;
    }

    //  If we don't have images that were uploaded to cloudinary, rollback
    if (images.length === 0) {
      await client.query('ROLLBACK');
      res.status(500).json({
        success: false,
        message: 'No images uploaded'
      });
      return;
    }

    // If images were uploaded successfully, images will have the url of images
    try {
      for (const imageUrl of images) {
        // Insert this images ulrs into the db
        await insertProductImages(productId, imageUrl, client);
      }
    } catch (insertError) {
      // Rollback if we couldn't insert urls images into the db
      await client.query('ROLLBACK');

      // Error response
      res.status(500).json({
        success: false,
        message: 'Error saving image URLs to the database',
        error: insertError
      });
      return;
    }

    // If all was good, we commited the transaction
    await client.query('COMMIT');

    // Result response
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    // Rollback in case happens any error
    await client.query('ROLLBACK');
    next(error)
  } finally {
    // Leave the client
    client.release();
  }
}


export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await fetchAllProducts();

    const normalizedProducts = products.map(product => ({
      ...product,
      images: product.images ?? []  // reemplaza null por []
    }));


    res.status(200).json({
      success: true,
      message: normalizedProducts.length === 0 ? 'No products found' : 'Products retrieved successfully',
      data: {
        total: normalizedProducts.length,
        products: normalizedProducts
      }
    })
  } catch (error) {
    next(error);
  }
}

export const getOneProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = parseIdParam(req, res);
    if (productId === null) return;

    const product = await fetchOneProductById(productId);

    const normalizedProduct = {
      ...product,
      images: product.images ?? []  // reemplaza null por []
    };
    if (!product) {
      res.status(500).json({
        success: false,
        message: 'Creation of product failed'
      })
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product found',
      data: normalizedProduct
    });

  } catch (error) {
    next(error);
  }
}


