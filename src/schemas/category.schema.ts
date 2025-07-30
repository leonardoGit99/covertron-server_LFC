import z from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().min(1, "description is required")
})

