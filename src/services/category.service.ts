import { PoolClient } from "pg";
import { Categories, Category, CreateCategoryDTO, updateCategoryDTO } from "../models/category.model";
import pool from "../utils/db";

export const insertCategory = async (validatedBody: CreateCategoryDTO): Promise<Category> => {
  const { name, description } = validatedBody;
  const result = await pool.query(`
    INSERT INTO categories (name, description)
    VALUES ($1, $2) 
    RETURNING id, name, description`,
    [name, description]);

  return result.rows[0];
}

export const fetchAllCategories = async (): Promise<Categories> => {
  const result = await pool.query(`
    SELECT 
      id, 
      name, 
      description  
    FROM categories 
    ORDER BY name ASC
    `);

  return result.rows
}

export const fetchCategoryById = async (categoryId: number): Promise<Category> => {
  const result = await pool.query(`
    SELECT 
      id, 
      name, 
      description
    FROM categories 
    WHERE id=$1`,
    [categoryId])

  return result.rows[0];
}

export const updateCategoryById = async (id: number, body: updateCategoryDTO, client: PoolClient): Promise<Category> => {
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
    RETURNING id
    `, [id])

  return result.rows[0];
}