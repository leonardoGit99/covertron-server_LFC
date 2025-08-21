import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getOneCategory, updateCategory } from "../controllers/categories.controller";
import { getDashboardData } from "../controllers/dashboard.controller";


const router = Router();

router.get('/dashboard', getDashboardData);


export default router;