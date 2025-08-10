import z from 'zod';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>
export type updateCategoryDTO = z.infer<typeof updateCategorySchema>
export type Category = CreateCategoryDTO & {
  id: number
}
export type Categories = Category[]

