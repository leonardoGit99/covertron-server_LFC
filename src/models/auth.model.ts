import z from "zod";
import { loginSchema } from "../schemas/auth.schema";

export type LoginDTO = z.infer<typeof loginSchema>; 

export type User = LoginDTO & {
  id: number; 
  name: string;
  password: string; // Hashed password
  role: 'admin' | 'user';
};