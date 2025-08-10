import z from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  subCategoryId: z.coerce.number().int().min(1, "Selecciona una sub-categoría válida"),
  originalPrice: z.coerce.number().min(0, "El precio debe ser un valor numérico"),
  brand: z.string().min(2, "La marca debe contener más de 2 caracteres"),
  discount: z.coerce.number().min(0, "El descuento debe ser un valor numérico")
});


export const patchProductSchema = productSchema.extend({
  state: z.enum(['available', 'sold out']),
  deletedImages: z.union([
    z.string(),
    z.array(z.string())
  ]).optional().transform(val => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  })
});