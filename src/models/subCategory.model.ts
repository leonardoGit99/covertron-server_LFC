import z from 'zod';
import { createSubCategorySchema } from '../schemas/subCategory.schema';
import { updateCategorySchema } from '../schemas/category.schema';

export type CreateSubCategoryDTO = z.infer<typeof createSubCategorySchema>

export type UpdateSubCategoryDTO = z.infer<typeof updateCategorySchema>

export type SubCategory = CreateSubCategoryDTO & {
  id: number
}
export type SubCategories = SubCategory[]