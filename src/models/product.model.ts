import z from "zod";
import { productSchema } from "../schemas/product.schema";

export type NewProduct = z.infer<typeof productSchema>

export type Product = NewProduct & {
  id: number,
  categoryId: number,
  state: string,
  images: string[]
}

export type Products = Product[];