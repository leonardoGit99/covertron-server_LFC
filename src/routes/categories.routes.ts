import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getOneCategory, updateCategory } from "../controllers/categoriesController";


const router = Router();

router.get('/categories', getAllCategories);
router.get('/categories/:id', getOneCategory);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);
router.put('/categories/:id', updateCategory);


export default router;