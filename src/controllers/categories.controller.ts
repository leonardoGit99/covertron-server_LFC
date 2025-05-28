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

export default {
  getAllCategories,
};
