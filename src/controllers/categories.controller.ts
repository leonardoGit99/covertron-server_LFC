import { Request, Response, NextFunction } from 'express';
import pool from '../db';


export const createCategorie = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description } = req.body;
  try {
    const categorie = await pool.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *', [name, description]);

    res.status(201).json({
      message: 'Categorie created successfully',
      categorie: categorie.rows[0]
    })
  } catch (error) {
    next(error);
  }
};


export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allCategories = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(allCategories.rows);
  } catch (error) {
    next(error);
  }
};

export const getOneCategorie = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const categorie = await pool.query('SELECT name, description FROM categories WHERE id=$1', [id])
    res.json(categorie.rows[0]);
  } catch (error) {
    next(error);
  }
}


export const updateCategorie = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      res.status(404).json({ message: 'Category not found' });
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

export const deleteCategorie = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query('DELETE FROM categories WHERE id=$1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: "Categorie not found" });
      return;
    }
    res.status(204).json({ message: "Categorie deleted" });
  } catch (error) {
    next(error);
  }
}



