import { Request, Response, NextFunction } from 'express';
import pool from '../db';

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allCategories = await pool.query('SELECT * FROM categories');
    res.json(allCategories.rows);
  } catch (error) {
    next(error);
  }
};

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

export const deleteCategorie = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    // Suponiendo pool.query está definido y retorna Promise<{rowCount: number, rows: any[]}>
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


