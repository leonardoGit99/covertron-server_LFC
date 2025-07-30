import z from 'zod';
import { subCategorySchema } from '../schemas/subCategory.schema';

export type NewSubCategory = z.infer<typeof subCategorySchema>
export type SubCategory = NewSubCategory & {
  id: number
}
export type SubCategories = SubCategory[]