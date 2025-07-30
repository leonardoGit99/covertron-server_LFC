import { Router } from "express";
import categoriesRoutes from "./categories.routes";
import subCategoriesRoutes from "./subcategories.routes"
const router = Router();

router.use(categoriesRoutes);
router.use(subCategoriesRoutes);

export default router;
