import { Router } from "express";
import categoriesRoutes from "./categories.routes";
import subCategoriesRoutes from "./subcategories.routes"
import productRoutes from "./products.routes"
import dashboardRoutes from "./dashboard.routes"
import authRoutes from './auth.routes'
import userRoutes from './user.routes'

const router = Router();

router.use(categoriesRoutes);
router.use(subCategoriesRoutes);
router.use(productRoutes);
router.use(dashboardRoutes);
router.use(authRoutes);
router.use(userRoutes);

export default router;
