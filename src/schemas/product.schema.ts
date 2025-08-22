import z from 'zod';

export const createProductSchema = z.object({
  name: z.coerce
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "El nombre no puede tener más de 150 caracteres"),
  description: z.coerce
    .string()
    .trim()
    .max(1000, "La descripción no puede tener más de 1000 caracteres")
    .optional(),
  subCategoryId: z.coerce
    .number({
      message: "Selecciona una sub categoría"
    })
    .int()
    .positive({
      message: "Selecciona una sub categoría"
    })
    .refine(
      (val) => val !== null && !isNaN(val),
      { message: "Selecciona una sub categoría" }
    ),
  originalPrice: z.coerce
    .number({
      message: "El precio es obligatorio"
    })
    .int()
    .positive({
      message: "El precio es obligatorio"
    })
    .min(0, "El precio debe ser mayor o igual a 0")
    .max(10000, "El precio no puede ser más de 10000 Bs.")
    .multipleOf(0.01),
  brand: z.coerce
    .string()
    .trim()
    .min(1, "La marca es obligatoria")
    .max(75, "La marca no puede tener más de 75 caracteres"),
  discount: z.coerce.number().default(0).optional()
});


export const updateProductSchema = createProductSchema.extend({
  state: z.enum(['available', 'sold out']),
  deletedImages: z.union([
    z.string(),
    z.array(z.string())
  ]).optional().transform(val => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  })
});