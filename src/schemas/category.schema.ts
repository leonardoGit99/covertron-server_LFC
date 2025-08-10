import z from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().min(1, "description is required")
})

export const updateCategorySchema = createCategorySchema.partial();

