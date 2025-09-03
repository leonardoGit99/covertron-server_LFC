import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getOneCategory, updateCategory } from "../controllers/categories.controller";
import { requireAuth } from "../middlewares/requireAuth";


const router = Router();

router.get('/categories', getAllCategories);
router.get('/categories/:id',requireAuth ,getOneCategory);
router.post('/categories', requireAuth, createCategory);
router.delete('/categories/:id', requireAuth, deleteCategory);
router.patch('/categories/:id', requireAuth, updateCategory);


export default router;