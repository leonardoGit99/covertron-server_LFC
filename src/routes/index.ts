import { Router } from 'express';
import { createCategory, deleteCategory, getAllCategories, getOneCategory, updateCategory } from '../controllers/categoriesController';
import { createSubCategory, deleteSubCategory, getAllSubCategories, getOneSubCategory, updateSubCategory } from '../controllers/subCategoriesController';

const router = Router();

// Categories Routes
router.get('/categories', getAllCategories);
router.get('/categories/:id', getOneCategory);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);
router.put('/categories/:id', updateCategory);

// Sub Categories Routes
router.get('/sub-categories', getAllSubCategories);
router.get('/sub-categories/:id', getOneSubCategory);
router.post('/sub-categories', createSubCategory);
router.delete('/sub-categories/:id', deleteSubCategory);
router.put('/sub-categories/:id', updateSubCategory);

export default router;
