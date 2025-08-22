import z from 'zod';

export const createSubCategorySchema = z.object({
  name: z.coerce.string().trim().min(1, "El nombre es obligatorio").max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().trim().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  categoryId: z.coerce.number().int().min(1, "Selecciona una categoría válida")
})

export const updateSubCategorySchema = createSubCategorySchema.partial();
