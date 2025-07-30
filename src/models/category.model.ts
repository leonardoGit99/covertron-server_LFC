import z from 'zod';
import { categorySchema } from '../schemas/category.schema';

export type NewCategory = z.infer<typeof categorySchema>
export type Category = NewCategory & {
  id: number
}
export type Categories = Category[]

