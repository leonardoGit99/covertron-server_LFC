import z from 'zod';

export const createCategorySchema = z.object({
  name: z.coerce.string().trim().min(1, "El nombre es obligatorio").max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().trim().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
})

export const updateCategorySchema = createCategorySchema.partial();

