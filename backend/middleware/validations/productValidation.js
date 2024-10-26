import { check, validationResult } from "express-validator";


export const validateProductReview = [
  check(
    "rating",
    "La calificación es requerida y debe ser un número entre 1 y 5"
  ).isInt({ min: 1, max: 5 }),
  check(
    "comment",
    "El comentario es requerido y debe tener entre 5 y 1000 caracteres"
  )
    .notEmpty()
    .isLength({ min: 5, max: 1000 }),
];

export const validateProductUpdate = [
  check("name", "El nombre es requerido y debe tener entre 2 y 100 caracteres")
    .notEmpty()
    .isLength({ min: 2, max: 100 }),
  check("price", "El precio debe ser un número positivo").isFloat({ gt: 0 }),
  check(
    "description",
    "La descripción es requerida y debe tener entre 5 y 1000 caracteres"
  )
    .notEmpty()
    .isLength({ min: 5, max: 1000 }),
  check("image", "La imagen es requerida").notEmpty(),
  check("brand", "La marca es requerida y debe tener entre 2 y 100 caracteres")
    .notEmpty()
    .isLength({ min: 2, max: 100 }),
  check(
    "category",
    "La categoría es requerida y debe tener entre 2 y 100 caracteres"
  )
    .notEmpty()
    .isLength({ min: 2, max: 100 }),
  check("countInStock", "El stock debe ser un número entero no negativo").isInt(
    { min: 0 }
  ),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
