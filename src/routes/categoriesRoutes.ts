import { Router } from 'express';
import { createCategorie, deleteCategorie, getAllCategories, getOneCategorie, updateCategorie } from '../controllers/categories.controller';

const router = Router();
console.log(typeof deleteCategorie)
router.get('/categories', getAllCategories);
router.get('/categories/:id', getOneCategorie);
router.post('/categories', createCategorie);
router.delete('/categories/:id', deleteCategorie);
router.put('/categories/:id', updateCategorie);


export default router;
