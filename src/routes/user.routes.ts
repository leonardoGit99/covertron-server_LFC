import { Router } from "express";
import { whoAmI } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get('/me', requireAuth, whoAmI)

export default router;