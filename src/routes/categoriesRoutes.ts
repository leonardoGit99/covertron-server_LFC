import { Router } from 'express';
import { createCategorie, deleteCategorie, getAllCategories, getOneCategorie, updateCategorie } from '../controllers/categoriesController';

const router = Router();

router.get('/categories', getAllCategories);
router.get('/categories/:id', getOneCategorie);
router.post('/categories', createCategorie);
router.delete('/categories/:id', deleteCategorie);
router.put('/categories/:id', updateCategorie);


export default router;
