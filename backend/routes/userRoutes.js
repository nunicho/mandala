import express from "express";
const router = express.Router();
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  validateUserRegistration,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors,
} from "../middleware/validations/userValidation.js";

router.post(
  "/forgotPassword",
  validateForgotPassword,
  handleValidationErrors,
  forgotPassword
);
router.post(
  "/resetPassword",
  validateResetPassword,
  handleValidationErrors,
  resetPassword
);

router
  .route("/")
  .post(validateUserRegistration, handleValidationErrors, registerUser)
  .get(protect, admin, getUsers);
router.post("/logout", logoutUser);
router.post("/auth", authUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .put(protect, admin, updateUser);

export default router;
