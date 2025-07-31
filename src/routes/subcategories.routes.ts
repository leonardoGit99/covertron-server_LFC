import { Router } from "express";
import { createSubCategory, deleteSubCategory, getAllSubCategories, getOneSubCategory, updateSubCategory } from "../controllers/subCategories.controller";


const router = Router();
router.get('/sub-categories', getAllSubCategories);
router.get('/sub-categories/:id', getOneSubCategory);
router.post('/categories/:id/sub-categories', createSubCategory);
router.delete('/sub-categories/:id', deleteSubCategory);
router.put('/categories/:categoryId/sub-categories/:subCategoryId', updateSubCategory);


export default router;