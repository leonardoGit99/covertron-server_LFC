import { Request, Response, NextFunction } from 'express';
import pool from '../db';


export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *', [name, description]);

    res.status(201).json({
      message: 'Category created successfully',
      data: result.rows[0]
    })
  } catch (error) {
    next(error);
  }
};


export const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    console.log(result)

    if (result.rows.length === 0) {
      res.status(200).json({
        message: 'No categories found',
        data: []
      });
      return;
    }

    res.status(200).json({
      message: `Total categories: ${result.rows.length}`,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getOneCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id=$1', [id])
    res.status(200).json({
      message: 'Category found successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}


export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, description } = req.body;

    //Begin transaction
    await client.query('BEGIN');

    // Update categorie
    const result = await client.query('UPDATE categories SET name=$1, description=$2 WHERE id=$3 RETURNING *', [name, description, id]);

    // There's no category
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      res.status(200).json({
        message: 'Category not found',
        data: {}
      });
      return;
    }

    // Commit in case all works good
    await client.query('COMMIT');
    res.status(200).json({
      message: "Categorie updated successufully",
      category: result.rows[0]
    });
  } catch (error) {
    // Rollback in case something wrong happend
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release(); // Leave connection
  }
}

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query('DELETE FROM categories WHERE id=$1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      res.status(200).json({
        message: "Categorie not found",
        data: {}
      });
      return;
    }
    res.status(200).json({
      message: "Categorie deleted",
      data: {}
    });
  } catch (error) {
    next(error);
  }
}



