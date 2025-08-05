import { Router } from "express";
import { createProduct, getAllProducts, getOneProduct, updateProduct } from "../controllers/products.controller";
import multer from 'multer'
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); //To storage the imgs in memory and upload to cloudinary directly
const router = Router();

router.post('/products', upload.array('imgs', 10), createProduct)
router.get('/products', getAllProducts);
router.get('/products/:id', getOneProduct);
router.patch('/products/:id', upload.array('imgs', 10), updateProduct);

export default router;