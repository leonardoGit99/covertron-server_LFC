import { Request, Response, NextFunction } from 'express';
import pool from '../utils/db';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';
import { deleteCategoryById, insertCategory, fetchAllCategories, updateCategoryById, fetchCategoryById, validateDuplicateCategory } from '../services/category.service';
import { z } from 'zod';
import { parseIdParam } from '../utils/parseIdParam';

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Body Validation
    const { success, data, error } = createCategorySchema.safeParse(req.body);
    if (!success) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error ? z.treeifyError(error) : {}
      })
      return;
    }

    const duplicatedCategoryName = await validateDuplicateCategory(data.name);

    if (duplicatedCategoryName) {
      res.status(400).json({
        success: false,
        message: 'Category name already exists'
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
    console.log(error);
    next(error);
  }
};


export const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await fetchAllCategories();

    res.status(200).json({
      success: true,
      message: categories.length === 0 ? 'No categories found' : 'Categories retrieved successfully',
      data: {
        total: categories.length,
        categories: categories
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOneCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categoryId = parseIdParam(req, res);
    if (categoryId === null) return;

    const category = await fetchCategoryById(categoryId);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'No categories found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category found',
      data: category
    });
  } catch (error) {
    console.log(error);
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
    const categoryId = parseIdParam(req, res);
    if (categoryId === null) return;

    // Body Validation
    const { success, data: validatedCategory, error } = updateCategorySchema.safeParse(req.body);


    if (!success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.treeifyError(error)
      });
      return;
    }

    if (validatedCategory.name !== undefined) {
      const duplicatedCategoryName = await validateDuplicateCategory(validatedCategory.name);

      if (duplicatedCategoryName) {
        res.status(400).json({
          success: false,
          message: 'Category name already exists'
        })
        return;
      }
    }
    // Getting Category store in db (previous category)
    const currentCategory = await fetchCategoryById(categoryId);

    if (!currentCategory) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }
    // Validating if it doesn't have changes
    if (currentCategory.name === validatedCategory.name && currentCategory.description === validatedCategory.description) {
      res.status(200).json({
        success: true,
        message: 'No changes detected',
        data: currentCategory
      });
      return;
    }

    // Begin transaction
    await client.query('BEGIN');

    // Call to update service in db
    const categoryUpdated = await updateCategoryById(categoryId, validatedCategory, client);

    // If there is not the category during update, rollback
    if (!categoryUpdated) {
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
      data: categoryUpdated
    });
  } catch (error) {
    // If there's an error, rollback
    await client.query('ROLLBACK');
    console.log(error);
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
    const categoryId = parseIdParam(req, res);
    if (categoryId === null) return;

    const deletedCategory = await deleteCategoryById(categoryId);

    if (!deletedCategory) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};



