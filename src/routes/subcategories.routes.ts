import { Router } from "express";
import { createSubCategory, deleteSubCategory, getAllSubCategories, getOneSubCategory, updateSubCategory } from "../controllers/subCategories.controller";
import { requireAuth } from "../middlewares/requireAuth";


const router = Router();
router.get('/sub-categories', requireAuth, getAllSubCategories);
router.get('/sub-categories/:id', requireAuth, getOneSubCategory);
router.post('/categories/:id/sub-categories', requireAuth, createSubCategory);
router.delete('/sub-categories/:id', requireAuth, deleteSubCategory);
router.put('/categories/:categoryId/sub-categories/:subCategoryId', requireAuth, updateSubCategory);


export default router;