import { Router } from "express";
import { createProduct, deleteProduct, getAllProducts, getAllProductsAdmin, getOneProduct, getOneProductAdmin, updateProduct } from "../controllers/products.controller";
import multer from 'multer'
import { requireAuth } from "../middlewares/requireAuth";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); //To storage the imgs in memory and upload to cloudinary directly
const router = Router();

router.post('/products', requireAuth, upload.array('imgs', 10), createProduct)
router.get('/admin/products',requireAuth, getAllProductsAdmin);
router.get('/products', getAllProducts);
router.get('/admin/products/:id', requireAuth, getOneProductAdmin);
router.get('/products/:id', getOneProduct);
router.patch('/products/:id', requireAuth, upload.array('imgs', 10), updateProduct);
router.delete('/products/:id',requireAuth, deleteProduct);

export default router;