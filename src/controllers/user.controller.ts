import { NextFunction, Request, Response } from "express";
import { TokenPayload } from "../models/token.model";

// Extender Request para incluir user
interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const whoAmI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user } = req;

    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        iat: user.iat,
        exp: user.exp
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}