import { Router } from 'express';
import { getAllCategories } from '../controllers/categories.controller';

const router = Router();

router.get('/categories', getAllCategories);

export default router;
