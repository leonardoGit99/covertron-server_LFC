import { Request, Response, NextFunction } from 'express';
import pool from '../utils/db';
import { subCategorySchema } from '../schemas/subCategory.schema';
import z, { success } from 'zod';
import { deleteSubCategoryById, fetchAllSubCategories, getAllSubCategoriesByCategory, getOneSubCategoryById, insertSubCategory, updateSubCategoryById } from '../services/subCategory.service';
import { parseIdParam } from '../utils/categoryHelper';


export const createSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categoryId = parseIdParam(req, res);
    if (categoryId === null) return;

    const { success, data, error } = subCategorySchema.safeParse(req.body);
    if (!success) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error ? z.treeifyError(error) : {}
      })
      return;
    }

    const result = await insertSubCategory(data, categoryId);

    res.status(201).json({
      success: true,
      message: 'Sub-category created successfully',
      data: result
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
};


export const getAllSubCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Query ?categoryId=x getSubcategoriesByCategory
    const { categoryId } = req.query;

    if (categoryId) {
      if (isNaN(Number(categoryId))) {
        res.status(404).json({
          success: false,
          message: 'Invalid categoryId'
        });
        return;
      }

      const subCategoriesByCategory = await getAllSubCategoriesByCategory(Number(categoryId));

      res.status(200).json({
        success: true,
        message: subCategoriesByCategory.length === 0 ? 'No sub-categories found' : 'Sub categories retrieved successfully',
        data: {
          total: subCategoriesByCategory.length,
          subCategories: subCategoriesByCategory
        }
      });
      return;
    }

    // Get All subcategories
    const subCategories = await fetchAllSubCategories();

    if (subCategories.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No sub-categories found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: subCategories.length === 0 ? 'No sub-categories found' : 'Sub categories retrieved successfully',
      data: {
        total: subCategories.length,
        subCategories: subCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOneSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const subCategoryId = parseIdParam(req, res);
    if (subCategoryId === null) return;
    const subCategory = await getOneSubCategoryById(subCategoryId);
    if (!subCategory) {
      res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      })
    }
    res.status(200).json({
      success: true,
      message: `Sub-category found`,
      data: subCategory
    });
  } catch (error) {
    next(error);
  }
}



export const updateSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const client = await pool.connect();

  try {
    // Id SubCategory validation
    const { categoryId, subCategoryId } = req.params;
    if (isNaN(Number(categoryId)) || isNaN(Number(subCategoryId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
      return;
    }

    // Body validation
    const { success, data, error } = subCategorySchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.treeifyError(error)
      })
      return;
    }

    // Getting subcategory in db (previous subcategory
    const prevSubCategory = await getOneSubCategoryById(Number(subCategoryId));
    if (!prevSubCategory) {
      res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      })
      return;
    }

    if (prevSubCategory.name === data.name && prevSubCategory.description === data.description) {
      res.status(200).json({
        success: true,
        message: 'No changes detected',
        data: prevSubCategory
      });
      return;
    }


    //Begin transaction
    await client.query('BEGIN');


    // Update sub-category
    const subCategoryUpdated = await updateSubCategoryById(Number(categoryId), Number(subCategoryId), data, client);

    // There aren't subcategories
    if (!subCategoryUpdated) {
      await client.query('ROLLBACK');
      res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      });
      return;
    }

    // Commit in case all works good
    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: "Sub-category updated successfully",
      data: subCategoryUpdated
    });
  } catch (error) {
    // Rollback in case something wrong happend
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release(); // Leave connection
  }
}

export const deleteSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await pool.connect();

    const idSubCategory = parseIdParam(req, res);
    if (idSubCategory === null) return;

    const result = await deleteSubCategoryById(idSubCategory, client);

    if (result === 0) {
      res.status(404).json({
        succes: false,
        message: "Sub-category not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Sub-category deleted",
    });
  } catch (error) {
    next(error);
  }
}



