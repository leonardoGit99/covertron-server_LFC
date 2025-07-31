import { PoolClient } from "pg";
import { Product } from "../models/product.model"

export const insertProductImages = async (productId: number, imageUrl: string, client: PoolClient): Promise<Product> => {
  const result = await client.query(`
    INSERT INTO product_images (product_id, image_url)
    VALUES ($1, $2) 
    RETURNING 
    product_id AS "productId",
    image_url AS "imageUrl"
    `, [productId, imageUrl])

  return result.rows[0];
}