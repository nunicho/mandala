import { check, validationResult } from "express-validator";

export const validateUserRegistration = [
  check("name", "El nombre es requerido")
    .notEmpty()
    .isLength({ min: 2, max: 30 }),
  check("email", "Incluya un correo electrónico válido")
    .isEmail()
    .notEmpty()
    .isLength({ min: 2, max: 30 }),
  check("password", "La contraseña debe tener al menos 5 caracteres")
    .notEmpty()
    .isLength({
      min: 5,
    }),
];

export const validateForgotPassword = [
  check("email", "Incluya un correo electrónico válido")
    .notEmpty()
    .isEmail(),
];

export const validateResetPassword = [
  check("newPassword", "La contraseña debe tener al menos 5 caracteres")
    .notEmpty()
    .isLength({
      min: 5,
    }),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
