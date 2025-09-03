import { User } from "../models/auth.model";
import pool from "../utils/db";

export const findUserByEmail = async (email: string): Promise<User> => {
  const result = await pool.query(`
    SELECT id,
    username as "name",
    email,
    password,
    role_id AS "role"
    FROM users
    WHERE email = $1
    `, [email]);

  return result.rows[0];
}