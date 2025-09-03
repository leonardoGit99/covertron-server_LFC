import { NextFunction, Request, Response } from "express";
import { getCurrentUser } from "../utils/auth";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
   try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Asignamos user a req para que los controllers lo usen
    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}