import { Request } from "express";
import { TokenPayload } from "../models/token.model";
import { JWT_SECRET } from ".";
import { jwtVerify } from "jose";

export const getCurrentUser = async (req: Request): Promise<TokenPayload | null> => {
  try {
    const token = req.cookies?.token; // Recover token from cookies thanks to cookie-parser
    if (!token) return null;

    const secret = new TextEncoder().encode(JWT_SECRET);
    const {payload} = await jwtVerify(token, secret);

    return payload as unknown as TokenPayload;
  } catch (error) {
    console.log(error);
    return null;
  }
}