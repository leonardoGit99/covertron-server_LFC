import { PoolClient } from "pg";
import { NewProduct, Product, Products } from "../models/product.model"
import pool from "../utils/db";

export const insertProduct = async (body: NewProduct, client: PoolClient): Promise<Product> => {
  const { name, description, subCategoryId, price, discount, brand } = body;
  const result = await client.query(`
      INSERT INTO products (name, description, subcategory_id, price, discount, brand) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, subCategoryId, price, discount, brand])
  return result.rows[0];
}


export const fetchAllProducts = async (): Promise<Products> => {
  const result = await pool.query(`
      SELECT p.id, 
        p.name, 
        p.description, 
        p.discount, 
        p.brand,
        p.subcategory_id AS "subCategoryId",
        c.id AS "categoryId",
        p.state, 
        p.price,
        ARRAY_AGG(i.image_url) FILTER (WHERE i.image_url IS NOT NULL) AS "images"
      FROM products p
      LEFT JOIN product_images i ON p.id = i.product_id
      JOIN subcategories s ON s.id = p.subcategory_id
      JOIN categories c ON c.id = s.category_id
      GROUP BY 
        p.id, p.name, p.description, p.discount, p.brand,
        p.subcategory_id, p.state, p.price, c.id
      ORDER BY 
        p.name ASC
    `)

  return result.rows;
}