import { Request, Response } from "express";

export const parseIdParam = (req: Request, res: Response): number | null => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid category ID'
    });
    return null;
  }
  return id;
};