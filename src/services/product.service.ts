import { PoolClient } from "pg";
import { NewProduct, PatchProduct, Product, Products } from "../models/product.model"
import pool from "../utils/db";
import { parseToFormmatedDate } from "../utils/parseToFormattedDate";
import { calculateDiscountedPrice } from "../utils/discountedPrice";

export const insertProduct = async (body: NewProduct, client: PoolClient): Promise<Product> => {
  const { name, description, subCategoryId, originalPrice, discount, brand } = body;
  const result = await client.query(`
      INSERT INTO products (name, description, subcategory_id, price, discount, brand) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, subCategoryId, originalPrice, discount, brand])
  return result.rows[0];
}

export const countProducts = async (availableOnly: boolean): Promise<number> => {
  let whereClause = '';

  if (availableOnly) {
    whereClause = (`WHERE state = 'available'`);
  }


  const query = (`
    SELECT COUNT(*) AS "totalProducts"
    FROM products
    ${whereClause}
    `)

  const result = await pool.query(query);
  return parseInt(result.rows[0].totalProducts, 10);
}


export const fetchAllProducts = async (limit: number, offset: number, availableOnly: boolean): Promise<Products> => {
  const params = [limit, offset];
  let whereClause = '';
  if (availableOnly) {
    whereClause = `WHERE p.state = 'available'`
  }

  const query = `
      SELECT p.id, 
        p.name, 
        p.description, 
        p.discount, 
        p.brand,
        p.subcategory_id AS "subCategoryId",
        c.id AS "categoryId",
        p.state, 
        p.price AS "originalPrice",
        ARRAY_AGG(i.image_url) FILTER (WHERE i.image_url IS NOT NULL) AS "images",
        c.name AS "categoryName",
        s.name AS "subCategoryName"
      FROM products p
      LEFT JOIN product_images i ON p.id = i.product_id
      JOIN subcategories s ON s.id = p.subcategory_id
      JOIN categories c ON c.id = s.category_id
      ${whereClause}
      GROUP BY 
        p.id, p.name, p.description, p.discount, p.brand,
        p.subcategory_id, p.state, p.price, c.id, c.name, s.name
      ORDER BY 
        p.created_at DESC
      LIMIT $1
      OFFSET $2
    `;


  const result = await pool.query(query, params);

  const products = result.rows;
  const normalizedProducts = products.map(product => ({
    ...product,
    images: product.images ?? [],  // reemplaza null por []
    discountedPrice: calculateDiscountedPrice(product.originalPrice, product.discount)
  }));

  return normalizedProducts;
}

export const countFilteredProducts = async (search: string = '', availableOnly: boolean): Promise<number> => {
  const searchTerm = `%${search}%`;
  let query;
  const params = [searchTerm];
  const conditions = [];

  if (availableOnly) {
    conditions.push(`state = 'available'`);
  }

  conditions.push(`(LOWER(name) LIKE $1 OR LOWER(description) LIKE $1)`);

  const whereClause = `WHERE ${conditions.join(' AND ')}`

  query = `
    SELECT COUNT(*) AS "totalFilteredProducts"
    FROM products
    ${whereClause}
    `
  const result = await pool.query(query, params);

  return parseInt(result.rows[0].totalFilteredProducts, 10);
}

export const filterProducts = async (search: string = '', limit: number, offset: number, availableOnly: boolean): Promise<Products> => {
  let query;
  const searchTerm = `%${search}%`;
  const params = [searchTerm, limit, offset]
  const conditions = [];

  if (availableOnly) {
    conditions.push(`p.state = 'available'`);
  }

  conditions.push(`(LOWER(p.name) LIKE $1 OR LOWER(p.description) LIKE $1)`);
  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  query = `
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
      ARRAY_AGG(i.image_url) FILTER (WHERE i.image_url IS NOT NULL) AS"images",
      c.name AS "categoryName",
      s.name AS "subCategoryName"
    FROM products p
    LEFT JOIN product_images i ON p.id = i.product_id
    JOIN subcategories s ON s.id = p.subcategory_id 
    JOIN categories c ON c.id = s.category_id
    ${whereClause}
    GROUP BY 
        p.id, p.name, p.description, p.discount, p.brand,
        p.subcategory_id, p.state, p.price, c.id, c.name, s.name
    ORDER BY 
      p.created_at DESC
      LIMIT $2 
      OFFSET $3
    `

  const result = await pool.query(query, params);
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
      p.price as "originalPrice",
      p.created_at AS "createdAt",
      ARRAY_AGG(i.image_url) FILTER (WHERE i.image_url IS NOT NULL) AS "images"
    FROM products p
    LEFT JOIN product_images i ON p.id = i.product_id
    JOIN subcategories s ON s.id = p.subcategory_id
    JOIN categories c ON c.id = s.category_id
    WHERE p.id = $1
    GROUP BY 
        p.id, p.name, p.description, p.discount, p.brand,
        p.subcategory_id, p.state, p.price, c.id, p.created_at
    `, [productId]);

  const product = result.rows[0];

  const normalizedProduct: Product = {
    ...product,
    images: product.images ?? [],  // replace null with []
    createdAt: parseToFormmatedDate(product.createdAt), // Parse to "day moth year format"
    discountedPrice: calculateDiscountedPrice(product.originalPrice, product.discount)
  };


  return normalizedProduct;
}

export const patchProductById = async (productId: number, body: PatchProduct, client: PoolClient): Promise<Product> => {
  const { name, description, subCategoryId, originalPrice, discount, brand, state } = body;
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
    `, [name, description, subCategoryId, originalPrice, discount, brand, state, productId]);
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


