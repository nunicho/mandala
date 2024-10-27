import path from "path";
import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); // Directorio donde se guardarán los archivos subidos
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Solo se permiten imágenes con extensiones jpeg, jpg, png o webp"
      )
    );
  }
}

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single("image");

router.post("/", (req, res) => {
  uploadSingleImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Un error de multer ocurrió durante la carga
      res
        .status(400)
        .json({ message: "Error al subir la imagen", error: err.message });
    } else if (err) {
      // Otro tipo de error ocurrió
      res
        .status(500)
        .json({ message: "Error interno del servidor", error: err.message });
    } else {
      // La imagen se subió correctamente
      res.status(200).json({
        message: "Imagen subida correctamente",
        image: `/${req.file.path}`, // Ruta relativa para acceder a la imagen
      });
    }
  });
});

export default router;
