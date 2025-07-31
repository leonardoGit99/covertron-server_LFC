import { PoolClient } from "pg";
import { NewProduct, Product } from "../models/product.model"

export const insertProduct = async (body: NewProduct, client: PoolClient): Promise<Product> => {
  const { name, description, subCategoryId, price, discount, brand } = body;
  const result = await client.query(`
      INSERT INTO products (name, description, subcategory_id, price, discount, brand) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, subCategoryId, price, discount, brand])
  return result.rows[0];
}