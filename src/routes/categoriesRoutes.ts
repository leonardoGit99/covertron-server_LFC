import { Router } from 'express';
import { createCategorie, deleteCategorie, getAllCategories } from '../controllers/categories.controller';

const router = Router();
console.log(typeof deleteCategorie)
router.get('/categories', getAllCategories);
router.post('/categories', createCategorie);
router.delete('/categories/:id', deleteCategorie);


export default router;
