import { Request, Response, NextFunction } from 'express';
import pool from '../utils/db';
import { categorySchema } from '../schemas/category.schema';
import { deleteCategoryById, insertCategory, selectAllCategories, selectCategoryById, updateCategoryById } from '../services/category.service';
import { z } from 'zod';
import { parseIdParam } from '../utils/categoryHelper';

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Body Validation
    const { success, data, error } = categorySchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error ? z.treeifyError(error) : {}
      })
      return;
    }

    const result = await insertCategory(data);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result
    })
  } catch (error) {
    next(error);
  }
};


export const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await selectAllCategories();

    res.status(200).json({
      success: true,
      message: result.length === 0 ? 'No categories found' : 'Categories retrieved successfully',
      data: {
        total: result.length,
        categories: result
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOneCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return;

    const result = await selectCategoryById(id);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'No categories found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category found',
      data: result
    });
  } catch (error) {
    next(error);
  }
}


export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const client = await pool.connect();

  try {

    // Id validation
    const id = parseIdParam(req, res);
    if (id === null) return;

    // Body Validation
    const { success, data, error } = categorySchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.treeifyError(error)
      });
      return;
    }

    // Getting Category store in db (previous category)
    const prevCategory = await selectCategoryById(id);

    if (!prevCategory) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }
    // Validating if it doesn't have changes
    if (prevCategory.name === data.name && prevCategory.description === data.description) {
      res.status(200).json({
        success: true,
        message: 'No changes detected',
        data: prevCategory
      });
      return;
    }

    // Begin transaction
    await client.query('BEGIN');

    // Call to update service in db
    const result = await updateCategoryById(id, data, client);

    // If there is not the category during update, rollback
    if (!result) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        message: 'Category not found during update'
      });
      return;
    }

    // Commit changes
    await client.query('COMMIT');

    // Response
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: result
    });
  } catch (error) {
    // If there's an error, rollback
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release(); // Leave connection
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req, res);
    if (id === null) return;

    const result = await deleteCategoryById(id);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: { id: result.id }
    });
  } catch (error) {
    next(error);
  }
};



