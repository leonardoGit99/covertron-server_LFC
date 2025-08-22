import { Request, Response, NextFunction } from "express"
import { createProductSchema, updateProductSchema } from "../schemas/product.schema"
import z, { success } from "zod";
import { countFilteredProducts, countProducts, deleteProductById, fetchAllProductsAdmin, fetchAvailableProducts, fetchOneProductById, fetchOneProductByIdAdmin, filterProducts, filterProductsAdmin, filterProductsByCategory, insertProduct, updateProductById, validateDuplicateProduct } from "../services/product.service";
import { deleteImageFromCloudinary, saveImageToCloudinary } from "../utils/cloudinary";
import { deleteImageByImageUrl, getAllImagesByProduct, insertProductImages } from "../services/image.service";
import pool from "../utils/db";
import { parseIdParam } from "../utils/parseIdParam";
import { calculateDiscountedPrice } from "../utils/discountedPrice";



export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect();
  try {
    // Validation body (data)
    const { success, data: validatedProduct, error } = createProductSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error ? z.treeifyError(error) : {}
      })
      return;
    }

    const duplicatedProductName = await validateDuplicateProduct(validatedProduct.name);

    if (duplicatedProductName) {
      res.status(400).json({
        success: false,
        message: 'Product name already exists'
      })
      return;
    }

    const discountedPrice = calculateDiscountedPrice(
      validatedProduct.originalPrice,
      Number(validatedProduct.discount)
    );


    // begin transaction
    await client.query('BEGIN');

    //Insert product in DB
    const productId = await insertProduct(validatedProduct, discountedPrice, client);
    if (!productId) {
      res.status(500).json({
        success: false,
        message: 'Creation of product failed'
      })
      return;
    }


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
        errors: cloudinaryError
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
    } catch (error) {
      // Rollback if we couldn't insert urls images into the db
      await client.query('ROLLBACK');

      // Error response
      res.status(500).json({
        success: false,
        message: 'Error saving image URLs to the database',
        errors: error
      });
      return;
    }

    // If all was good, we commit the transaction
    await client.query('COMMIT');

    // Result response
    res.status(201).json({
      success: true,
      message: 'Product created successfully'
    });

  } catch (error) {
    // Rollback in case happens any error
    await client.query('ROLLBACK');
    console.log(error)
    next(error)
  } finally {
    // Leave the client
    client.release();
  }
}


export const getAllProductsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let products;
    let totalProducts;
    const search = req.query.search?.toString().toLowerCase();
    const page = parseInt(req.query.page as string) || 1;     // página actual
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit; //  calcula el desplazamiento real
    const availableOnly = false;

    if (search) {
      products = await filterProductsAdmin(search, limit, offset);
      totalProducts = await countFilteredProducts(search, availableOnly);
    } else {
      products = await fetchAllProductsAdmin(limit, offset);
      totalProducts = await countProducts(availableOnly);
    }


    res.status(200).json({
      success: true,
      message: products.length === 0 ? 'No products found' : 'Products retrieved successfully',
      data: {
        total: totalProducts,
        products: products
      }
    })
  } catch (error) {
    console.log(error)
    next(error);
  }
}

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let products;
    let totalProducts;

    const search = req.query.search?.toString().toLowerCase();
    const categoryId = req.query.category ? parseInt(req.query.category as string) : null; // if exists category id
    const page = parseInt(req.query.page as string) || 1;     // página actual
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit; //  calcula el desplazamiento real
    const availableOnly = true;


    if (categoryId) {
      products = await filterProductsByCategory(categoryId, limit, offset);
      totalProducts = products.length
    }
    else if (search) {
      products = await filterProducts(search, limit, offset);
      totalProducts = await countFilteredProducts(search, availableOnly);
    } else {
      products = await fetchAvailableProducts(limit, offset);
      totalProducts = await countProducts(availableOnly);
    }


    res.status(200).json({
      success: true,
      message: products.length === 0 ? 'No products found' : 'Products retrieved successfully',
      data: {
        total: totalProducts,
        products: products
      }
    })
  } catch (error) {
    console.log(error)
    next(error);
  }
}



export const getOneProductAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = parseIdParam(req, res);
    if (productId === null) return;

    const product = await fetchOneProductByIdAdmin(productId);


    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      })
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product found',
      data: product
    });

  } catch (error) {
    console.log(error);
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

    console.log(product);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      })
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product found',
      data: product
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
}

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect();
  try {
    // Id validation
    const productId = parseIdParam(req, res);
    if (productId === null) return;

    // Body (data) validation
    const { success, data: validatedProduct, error } = updateProductSchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error ? z.treeifyError(error) : {}
      })
      return;
    }


    // Fetch Current Product on DB
    const currentProduct = await fetchOneProductByIdAdmin(productId);



    // Normalizing images due to append reasons, (if only has one img, its string, is not an array. Therefore its an error, prop images always has to be an array)
    const normalizedDeletedImages = Array.isArray(validatedProduct.deletedImages)
      ? validatedProduct.deletedImages
      : validatedProduct.deletedImages
        ? [validatedProduct.deletedImages]
        : [];


    /* // Images to delete validation
    const sameImages = normalizedDeletedImages.length !== normalizedCurrentProduct.images.length && normalizedDeletedImages.every((deletedImage) => normalizedCurrentProduct.images.includes(deletedImage)); */

    const hasImagesToDelete = normalizedDeletedImages.length > 0

    // Type for req.files 
    const files: Express.Multer.File[] = Array.isArray(req.files) ? req.files : [];


    // Changes in product detection
    const hasChanges =
      validatedProduct.name !== currentProduct.name ||
      validatedProduct.description !== currentProduct.description ||
      validatedProduct.subCategoryId.toString() !== currentProduct.subCategoryId.toString() ||
      Number(validatedProduct.originalPrice).toFixed(2) !== Number(currentProduct.originalPrice).toFixed(2) ||
      Number(validatedProduct.discount) !== Number(currentProduct.discount) ||
      validatedProduct.brand !== currentProduct.brand ||
      hasImagesToDelete ||
      validatedProduct.state !== currentProduct.state ||
      files.length > 0;


    // Response if it doesn't have changes
    if (!hasChanges) {
      res.status(200).json({
        success: true,
        message: "No changes detected",
        data: validatedProduct
      })
      return;
    }

    // Begin transaction
    await client.query('BEGIN');

    // Update product on DB
    const updatedProduct = await updateProductById(productId, validatedProduct, client)

    // Response if update of product failed
    if (!updatedProduct) {
      res.status(500).json({
        success: false,
        message: 'Update of product failed'
      })
      return;
    }

    // Delete images from cloudinary and from DB only if the current image urls are not equal to deleted images array from frontend
    try {
      if (hasImagesToDelete) {
        for (const imageUrl of normalizedDeletedImages) {
          await deleteImageFromCloudinary(imageUrl);
          await deleteImageByImageUrl(imageUrl, client);
        }
      }
    } catch (error) {
      await client.query('ROLLBACK');

      // Error response
      res.status(500).json({
        success: false,
        message: 'Error deleting image URLs to the database',
        errors: error
      });
      return;
    }


    // Add new images if we have at least one new image of type File
    if (files.length > 0) {
      let newImages;
      try {
        // Promise.all receives a "promises array" and the "Promise.all" is resolved when all the elements of this array are solved
        newImages = await Promise.all(files.map((newImage) => saveImageToCloudinary(newImage, productId))); //  Saving images on cloudinary
      } catch (cloudinaryError) {
        // Rollback if we couldn't save image to cloudinary
        await client.query('ROLLBACK');

        // Error Response
        res.status(500).json({
          success: false,
          message: 'Error uploading images to Cloudinary',
          errors: cloudinaryError
        });
        return;
      }

      //  If we don't have images that were uploaded to cloudinary, rollback
      if (newImages.length === 0) {
        await client.query('ROLLBACK');
        res.status(500).json({
          success: false,
          message: 'No images uploaded'
        });
        return;
      }

      // If images were uploaded successfully, images will have the url of images
      try {
        for (const imageUrl of newImages) {
          // Insert this images ulrs into the db
          await insertProductImages(productId, imageUrl, client);
        }
      } catch (insertError) {
        console.log(insertError);
        // Rollback if we couldn't insert urls images into the db
        await client.query('ROLLBACK');

        // Error response
        res.status(500).json({
          success: false,
          message: 'Error saving image URLs to the database',
          errors: insertError
        });
        return;
      }
    }


    // If all was good, we commit the transaction
    await client.query('COMMIT');

    // Result response
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.log(error);
    // Rollback in case happens any error
    await client.query('ROLLBACK');
    next(error)
  } finally {
    client.release();
  }
}



export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect();
  try {
    // Id Validation
    const productId = parseIdParam(req, res);
    if (productId === null) return;

    // Getting images array that are asociated to one product 
    const currentProductImages = await getAllImagesByProduct(productId);

    console.log(currentProductImages);
    // Start transaction
    await client.query('BEGIN');

    // Delete imgs that are asociated to one product
    try {
      if (Array.isArray(currentProductImages) && currentProductImages.length > 0) {
        await Promise.all(currentProductImages.map(url => deleteImageFromCloudinary(url)));
      }
    } catch (error) {
      console.log(error)
      await client.query('ROLLBACK');
      // Error response
      res.status(500).json({
        success: false,
        message: 'Error deleting image URLs from cloudinary',
        errors: error
      });
      return;
    }

    // Delete product from db
    const productDeleted = await deleteProductById(productId, client);

    if (!productDeleted) {
      await client.query('ROLLBACK');

      // Error response
      res.status(404).json({
        success: false,
        message: 'Product not found',
      })
      return;
    }

    await client.query('COMMIT');
    // Response
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }

}

