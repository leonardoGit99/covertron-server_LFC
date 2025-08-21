import { NextFunction, Request, Response } from "express"
import { countCategories } from "../services/category.service"
import { countSubCategories } from "../services/subCategory.service";
import { countProducts } from "../services/product.service";

export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalCategories = await countCategories();
    const totalSubCategories = await countSubCategories();
    const totalProducts = await countProducts();

    if (totalCategories === 0 && totalSubCategories === 0 && totalProducts === 0) {
      res.status(200).json({
        success: false,
        message: 'No data found',
        data: {
          categories: 0,
          subCategories: 0,
          products: 0,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        categories: totalCategories,
        subCategories: totalSubCategories,
        products: totalProducts
      },
    });
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    next(error);
  }
};