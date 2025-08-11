import z from "zod";
import {  createProductSchema, updateProductSchema } from "../schemas/product.schema";

// ADMIN USER
export type CreateProductDTO = z.infer<typeof createProductSchema>
export type UpdateProductDTO = z.infer<typeof updateProductSchema>

export interface Product extends CreateProductDTO {
  id: number,
  categoryId: number,
  categoryName: string,
  subCategoryName: string,
  state: "available" | "sold out",
  images: string[],
  createdAt: string,
  updatedAt: string,
  discountedPrice: number
}

export type ProductDetailAdminDTO = Omit<Product, 'categoryName' | 'subCategoryName' | 'createdAt' | 'updatedAt' | 'discountedPrice'>




// NORMAL USER
export type ProductSummaryDTO = Omit<Product, 'description' | 'categoryId' | 'subCategoryId' | 'state' | 'categoryName' | 'subCategoryName' | 'images' | 'createdAt' | 'updatedAt'> & {
  image: string
}

export type ProductDetailDTO = Omit<Product, 'categoryName' | 'subCategoryName' | 'updatedAt' | 'state'>
