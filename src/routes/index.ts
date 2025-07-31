import { Router } from "express";
import categoriesRoutes from "./categories.routes";
import subCategoriesRoutes from "./subcategories.routes"
import productRoutes from "./products.routes"
const router = Router();

router.use(categoriesRoutes);
router.use(subCategoriesRoutes);
router.use(productRoutes);

export default router;
