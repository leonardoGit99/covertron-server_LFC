import { PoolClient } from "pg";
import { NewProduct, PatchProduct, Product, Products } from "../models/product.model"
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
        ARRAY_AGG(i.image_url) FILTER (WHERE i.image_url IS NOT NULL) AS "images",
        c.name AS "categoryName",
        s.name AS "subCategoryName"
      FROM products p
      LEFT JOIN product_images i ON p.id = i.product_id
      JOIN subcategories s ON s.id = p.subcategory_id
      JOIN categories c ON c.id = s.category_id
      GROUP BY 
        p.id, p.name, p.description, p.discount, p.brand,
        p.subcategory_id, p.state, p.price, c.id, c.name, s.name
      ORDER BY 
        p.name ASC
    `)

  return result.rows;
}


export const fetchOneProductById = async (productId: number): Promise<Omit<Product, 'categoryName' | 'subCategoryName'>> => {
  const result = await pool.query(`
    SELECT 
      p.id,
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
    WHERE p.id = $1
    GROUP BY 
        p.id, p.name, p.description, p.discount, p.brand,
        p.subcategory_id, p.state, p.price, c.id
    `, [productId])

  return result.rows[0];
}

export const patchProductById = async (productId: number, body: PatchProduct, client: PoolClient): Promise<Product> => {
  const { name, description, subCategoryId, price, discount, brand, state } = body;
  const result = await client.query(`
    UPDATE products
    SET name = $1, 
    description = $2, 
    subcategory_id = $3, 
    price = $4, 
    discount = $5, 
    brand = $6,
    state = $7
    WHERE id=$8
    RETURNING name,
    description,
    subcategory_id as "subCategoryId",
    price,
    discount,
    brand,
    state
    `, [name, description, subCategoryId, price, discount, brand, state, productId]);
  return result.rows[0];
}

export const deleteProductById = async (productId: number, client: PoolClient): Promise<boolean> => {
  const result = await client.query(`
    DELETE 
    FROM products
    WHERE id = $1
    `, [productId])

  console.log(result)
  return result.rowCount !== null && result.rowCount > 0;
}


