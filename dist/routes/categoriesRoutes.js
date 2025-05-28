"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_controller_1 = require("../controllers/categories.controller");
const router = (0, express_1.Router)();
router.get('/categories', categories_controller_1.getAllCategories);
exports.default = router;
