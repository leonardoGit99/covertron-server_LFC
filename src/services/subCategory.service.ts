import { PoolClient } from "pg";
import { CreateSubCategoryDTO, SubCategories, SubCategory, UpdateSubCategoryDTO } from "../models/subCategory.model";
import pool from "../utils/db";

export const insertSubCategory = async (body: CreateSubCategoryDTO, categoryId: number): Promise<SubCategory> => {
  const { name, description } = body;
  const result = await pool.query(`
    INSERT INTO subcategories (name, description, category_id) 
    VALUES ($1, $2, $3) 
    RETURNING 
    id,
    name, 
    description,
    category_id AS "categoryId"
    `, [name, description, categoryId]);

  return result.rows[0];
}

export const getAllSubCategoriesByCategory = async (categoryId: number): Promise<SubCategories> => {
  const result = await pool.query(`
    SELECT * 
    FROM subcategories 
    WHERE category_id = $1`, [categoryId]);

  return result.rows;
}

export const fetchAllSubCategories = async (): Promise<SubCategories> => {
  const result = await pool.query(`
    SELECT s.id, 
    s.name, 
    s.description, 
    s.category_id AS "categoryId",
    c.name AS "categoryName" 
    FROM subcategories s 
    JOIN categories c ON c.id = s.category_id
    ORDER BY c.name ASC`);

  return result.rows;
}

export const getOneSubCategoryById = async (subCategoryId: number): Promise<SubCategory> => {
  const result = await pool.query(`
    SELECT subcategories.id, 
    subcategories.category_id AS "categoryId", 
    subcategories.name, 
    subcategories.description, 
    categories.name AS "categoryName" 
    FROM subcategories 
    JOIN categories ON subcategories.category_id = categories.id 
    WHERE subcategories.id = $1`, [subCategoryId]);

  return result.rows[0];
}

export const updateSubCategoryById = async (categoryId: number, subCategoryId: number, body: UpdateSubCategoryDTO, client: PoolClient): Promise<SubCategory> => {
  const { name, description } = body;
  const result = await client.query(`
    UPDATE subcategories 
    SET name=$1, description=$2, category_id=$3 
    WHERE id=$4 
    RETURNING
    id,
    name, 
    description,
    category_id as "categoryId"
    `, [name, description, categoryId, subCategoryId]);

  return result.rows[0];
}


export const deleteSubCategoryById = async (subCategoryId: number): Promise<boolean> => {
  const result = await pool.query(`
    DELETE FROM subcategories 
    WHERE id=$1
    `, [subCategoryId])

  return result.rowCount !== null && result.rowCount > 0;
}


export const countSubCategories = async (): Promise<number> => {
  const query = (`
    SELECT COUNT(*) AS "totalSubCategories"
    FROM subcategories
    `)

  const result = await pool.query(query);
  return parseInt(result.rows[0].totalSubCategories, 10);
}