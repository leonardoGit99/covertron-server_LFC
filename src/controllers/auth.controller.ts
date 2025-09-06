import { NextFunction, Request, Response } from "express";
import { loginSchema } from "../schemas/auth.schema";
import z from "zod";
import { JWT_SECRET } from "../utils";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from "../services/auth.service";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Body Validation
    const { success, data, error } = loginSchema.safeParse(req.body);

    // Detect environment
    // const isProd = process.env.NODE_ENV === "production";

    console.log(req.body)
    // If validation fails
    if (!success) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: z.treeifyError(error)
      });
      return;
    }

    // Find user in DB
    const userExistence = await findUserByEmail(data.email);
    if (!userExistence) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    const user = userExistence;

    // Compare passwords
    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { uid: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // solo true en producción
      sameSite: "lax", // "none" en prod (dominios distintos), "lax" en local
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/'
    });

    // Respond with success
    res.status(200).json({
      success: true,
      message: 'Login successful'
    });

  } catch (error) {
    console.log(error);
    next(error);
  }

}