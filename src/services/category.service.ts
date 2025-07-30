import { PoolClient } from "pg";
import { Categories, Category, NewCategory } from "../models/category.model";
import pool from "../utils/db";

export const insertCategory = async (validatedBody: NewCategory): Promise<Category> => {
  const { name, description } = validatedBody;
  const result = await pool.query(`
    INSERT INTO categories (name, description)
    VALUES ($1, $2) 
    RETURNING id, name, description`,
    [name, description]);

  return result.rows[0];
}

export const selectAllCategories = async (): Promise<Categories> => {
  const result = await pool.query(`
    SELECT id, name, description  
    FROM categories 
    ORDER BY name ASC
    `);

  return result.rows
}

export const selectCategoryById = async (id: number): Promise<Category> => {
  const result = await pool.query(`
    SELECT id, name, description
    FROM categories 
    WHERE id=$1`,
    [id])

  return result.rows[0];
}

export const updateCategoryById = async (id: number, body: NewCategory, client: PoolClient): Promise<Category> => {
  const { name, description } = body;
  const result = await client.query(`
    UPDATE categories 
    SET name=$1, description=$2 
    WHERE id=$3
    RETURNING id,name,description
    `,
    [name, description, id]);

  return result.rows[0];
}

export const deleteCategoryById = async (id: number): Promise<Category> => {
  const result = await pool.query(`
    DELETE FROM categories 
    WHERE id=$1 
    RETURNING *
    `, [id])

  return result.rows[0];
}