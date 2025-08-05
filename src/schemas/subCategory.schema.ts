import z from 'zod';

export const subCategorySchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().min(1, "description is required"),
  categoryId: z.coerce.number()
})
