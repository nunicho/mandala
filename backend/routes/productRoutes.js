import express from "express";
const router = express.Router();
import {
  getProducts,
  getProductsById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductCategories,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkObjectId.js";
import {
  validateProductReview,
  validateProductUpdate,
  handleValidationErrors,
} from "../middleware/validations/productValidation.js";

router.route("/").get(getProducts).post(protect, admin, createProduct);
router.get("/top", getTopProducts);
router.get("/categories", getProductCategories);
router
  .route("/:id")
  .get(checkObjectId, getProductsById)
  .put(
    protect,
    admin,
    checkObjectId,
    validateProductUpdate,
    handleValidationErrors,
    updateProduct
  )
  .delete(protect, admin, checkObjectId, deleteProduct);
router
  .route("/:id/reviews")
  .post(
    protect,
    checkObjectId,
    validateProductReview,
    handleValidationErrors,
    createProductReview
  );

export default router;
