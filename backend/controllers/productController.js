import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";

// @desc     Fetch all products
// @route    GET /api/products
// @access   Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;

  // Filtro por palabra clave
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  // Filtro por categoría
  const category = req.query.category ? { category: req.query.category } : {};

  // Contar documentos que coincidan con los filtros
  const count = await Product.countDocuments({
    ...keyword,
    ...category,
  });

  // Encontrar productos con los filtros aplicados
  const products = await Product.find({
    ...keyword,
    ...category,
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc     Fetch a product
// @route    GET /api/products/:id
// @access   Public
const getProductsById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    res.status(404);
    throw new Error("Recurso no encontrado");
  }
});

// @desc     Create a product
// @route    POST /api/products
// @access   Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: "Nombre genérico",
    price: 0,
    discountPrice: null, // Agregar campo discountPrice
    user: req.user._id,
    image: "/images/sample.jpg",
    brand: "Marca genérica",
    category: "Categoría genérica",
    countInStock: 0,
    numReviews: 0,
    description: "Descripción genérica",
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc     Update a product
// @route    PUT /api/products/:id
// @access   Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
    discountPrice,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = parseFloat(price).toFixed(2); // Asegurarse de que el precio tenga dos decimales
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;
    product.discountPrice = discountPrice
      ? parseFloat(discountPrice).toFixed(2)
      : null; // Actualizar discountPrice con dos decimales o null

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Recurso no encontrado");
  }
});

// @desc     Delete a product
// @route    DELETE /api/products/:id
// @access   Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.status(200).json({ message: "Producto borrado" });
  } else {
    res.status(404);
    throw new Error("Recurso no encontrado");
  }
});

// @desc     Create a new review
// @route    POST /api/products/:id/reviews
// @access   Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Producto ya reseñado");
    }
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Reseña añadida" });
  } else {
    res.status(404);
    throw new Error("Recurso no encontrado");
  }
});

// @desc     Get top rated prodcuts
// @route    GET /api/products/top
// @access   Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.status(200).json(products);
});

// @desc     Fetch all unique product categories
// @route    GET /api/products/categories
// @access   Public
const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category");
  res.json(categories);
});

export {
  getProducts,
  getProductsById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductCategories,
};
