import { Request, Response, NextFunction } from 'express';
import pool from '../db';


export const createSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description, category_id } = req.body;
  console.log(req.body)
  try {
    const result = await pool.query(`INSERT INTO subcategories (name, description, category_id) VALUES ($1, $2, $3) RETURNING *`, [name, description, category_id]);

    res.status(201).json({
      message: 'Sub-category created successfully',
      data: result.rows[0]
    })
  } catch (error) {
    console.log(error);

    next(error);
  }
};


export const getAllSubCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM subcategories ORDER BY name ASC');
    console.log(result)

    if (result.rows.length === 0) {
      res.status(200).json({
        message: 'No sub-categories found',
        data: []
      });
      return;
    }

    res.status(200).json({
      message: `Total sub-categories: ${result.rows.length}`,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getOneSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT subcategories.*, categories.name AS category_name FROM subcategories JOIN categories ON subcategories.category_id = categories.id WHERE subcategories.id = $1', [id]);

    res.json({
      message: `Sub-category found`,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}


export const updateSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { name, description, category_id } = req.body;

    //Begin transaction
    await client.query('BEGIN');

    // Update sub-category
    const result = await client.query('UPDATE subcategories SET name=$1, description=$2, category_id=$3 WHERE id=$4 RETURNING *', [name, description,category_id, id]);

    // There aren't subcategories
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      res.status(200).json({
        message: 'Sub-category not found',
        data: {}
      });
      return;
    }

    // Commit in case all works good
    await client.query('COMMIT');
    res.status(200).json({
      message: "Sub-category updated successfully",
      data: result.rows[0]
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
    const id = parseInt(req.params.id, 10);
    const result = await pool.query('DELETE FROM subcategories WHERE id=$1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      res.status(200).json({
        message: "Sub-category not found"
      });
      return;
    }
    res.status(200).json({ message: "Sub-category deleted" });
  } catch (error) {
    next(error);
  }
}



