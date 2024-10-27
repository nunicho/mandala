import asyncHandler from "../middleware/asyncHandler.js";
import Promotion from "../models/promotionModel.js";
import Product from "../models/productModel.js";

// @desc    Create a new promotion
// @route   POST /api/promotions
// @access  Private/Admin
const createPromotion = asyncHandler(async (req, res) => {
  const {
    name = "Nombre genérico",
    description = "Descripción genérica",
    discountPercentage = 20,
    startDate, // Puede ser nulo
    duration = 7, // Duración predeterminada en días
    products,
  } = req.body;

  // Validar el porcentaje de descuento
  if (discountPercentage > 100 || discountPercentage < 0) {
    res.status(400);
    throw new Error("Discount percentage must be between 0 and 100");
  }

  // Calcular la fecha de finalización basada en la fecha de inicio y la duración, si existe `startDate`
  let endDate = null;
  if (startDate) {
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
  }

  // Crear la promoción
  const promotion = new Promotion({
    name,
    description,
    discountPercentage,
    startDate: startDate || null,
    duration,
    endDate: endDate || null, // Puede ser nulo si no hay startDate
    active: false, // Las promociones nuevas están inactivas por defecto
    products: products || [], // Lista de productos asociados
  });

  const createdPromotion = await promotion.save();

  // Actualizar productos con el ID de la promoción
  if (products && products.length > 0) {
    await Product.updateMany(
      { _id: { $in: products } },
      { $push: { promotions: createdPromotion._id } }
    );
  }

  res.status(201).json(createdPromotion);
});


// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
const getPromotions = asyncHandler(async (req, res) => {
  const promotions = await Promotion.find({});
  res.json(promotions);
});

// @desc    Fetch a promotion by ID
// @route   GET /api/promotions/:id
// @access  Private/Admin
const getPromotionById = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id).populate('products');
  if (promotion) {
    return res.json(promotion);
  } else {
    res.status(404);
    throw new Error("Promotion not found");
  }
});

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
//ANTERIOR
const updatePromotion = asyncHandler(async (req, res) => {
  const { name, description, discountPercentage, duration } = req.body;

  // Validar el porcentaje de descuento
  if (discountPercentage > 100 || discountPercentage < 0) {
    res.status(400);
    throw new Error("Discount percentage must be between 0 and 100");
  }

  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    // Actualizar los campos permitidos
    promotion.name = name || promotion.name;
    promotion.description = description || promotion.description;
    promotion.discountPercentage =
      discountPercentage !== undefined
        ? discountPercentage
        : promotion.discountPercentage;

    // Actualizar duración y endDate solo si active es true
    if (duration !== undefined && promotion.active) {
      if (duration < 0) {
        res.status(400);
        throw new Error("Duration must be a positive number");
      }

      // Actualizar duración
      promotion.duration = duration;

      // Recalcular endDate basado en la nueva duración
      promotion.endDate = new Date(
        promotion.startDate.getTime() + duration * 24 * 60 * 60 * 1000
      );
    }

    const updatedPromotion = await promotion.save();

    // Si la promoción está activa, actualizar los precios de descuento de los productos
    if (promotion.active) {
      const products = await Product.find({ _id: { $in: promotion.products } });
      for (let product of products) {
        product.discountPrice =
          product.price * (1 - promotion.discountPercentage / 100);
        await product.save();
      }
    }

    res.json(updatedPromotion);
  } else {
    res.status(404);
    throw new Error("Promotion not found");
  }
});

// @desc    Add product to promotion
// @route   PUT /api/promotions/:id/addProduct
// @access  Private/Admin
const addProductPromotion = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const promotion = await Promotion.findById(req.params.id);
  const product = await Product.findById(productId);

  if (promotion && product) {
    if (!promotion.products.includes(productId)) {
      promotion.products.push(productId);
      await promotion.save();

      if (promotion.active) {
        product.discountPrice = product.price * (1 - promotion.discountPercentage / 100);
        product.promotions.push(promotion._id);
        await product.save();
      }

      res.json({ message: "Product added to promotion" });
    } else {
      res.status(400);
      throw new Error("Product already in promotion");
    }
  } else {
    res.status(404);
    throw new Error("Promotion or product not found");
  }
});

// @desc    Remove a product from a promotion
// @route   PUT /api/promotions/:id/removeProduct
// @access  Private/Admin
const removeProductPromotion = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const promotion = await Promotion.findById(req.params.id);
  const product = await Product.findById(productId);

  if (promotion && product) {
    // Remove product from promotion's product list
    promotion.products = promotion.products.filter(
      (prodId) => prodId.toString() !== productId.toString()
    );
    await promotion.save();

    // Remove promotion from product's promotions list
    product.promotions = product.promotions.filter(
      (promoId) => promoId.toString() !== promotion._id.toString()
    );

    // Update discountPrice to the highest discount available
    if (product.promotions.length > 0) {
      const activePromotions = await Promotion.find({
        _id: { $in: product.promotions },
        active: true,
      });
      const highestDiscountPromotion = activePromotions.reduce(
        (max, promo) =>
          promo.discountPercentage > max.discountPercentage ? promo : max,
        activePromotions[0]
      );
      product.discountPrice =
        product.price * (1 - highestDiscountPromotion.discountPercentage / 100);
    } else {
      product.discountPrice = null;
    }

    await product.save();

    res.json({ message: "Product removed from promotion" });
  } else {
    res.status(404);
    throw new Error("Promotion or product not found");
  }
});

// @desc    Activate/Deactivate promotion
// @route   PUT /api/promotions/:id/togglePromotion
// @access  Private/Admin
const togglePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    // Verificar el estado actual de la promoción
    if (promotion.active) {
      // Desactivar la promoción
      promotion.active = false;
      promotion.startDate = null;
      promotion.endDate = null;

      // Restablecer los precios de descuento de los productos
      const products = await Product.find({ _id: { $in: promotion.products } });
      for (let product of products) {
        product.discountPrice = null;
        product.promotions = product.promotions.filter(
          (promoId) => promoId.toString() !== promotion._id.toString()
        );
        await product.save();
      }
    } else {
      // Activar la promoción
      const now = new Date();
      promotion.active = true;
      promotion.startDate = now;
      promotion.endDate = new Date(
        now.getTime() + promotion.duration * 24 * 60 * 60 * 1000
      );

      // Aplicar los precios de descuento a los productos
      const products = await Product.find({ _id: { $in: promotion.products } });
      for (let product of products) {
        product.discountPrice =
          product.price * (1 - promotion.discountPercentage / 100);
        if (!product.promotions.includes(promotion._id)) {
          product.promotions.push(promotion._id);
        }
        await product.save();
      }
    }

    await promotion.save();
    res.json({ message: "Promotion state toggled", promotion });
  } else {
    res.status(404);
    throw new Error("Promotion not found");
  }
});

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    if (promotion.active) {
      // Remove discount from products and update with highest discount available
      const products = await Product.find({ _id: { $in: promotion.products } });
      for (let product of products) {
        product.promotions = product.promotions.filter(
          (promoId) => promoId.toString() !== promotion._id.toString()
        );

        if (product.promotions.length > 0) {
          const activePromotions = await Promotion.find({
            _id: { $in: product.promotions },
            active: true,
          });
          if (activePromotions.length > 0) {
            const highestDiscountPromotion = activePromotions.reduce(
              (max, promo) =>
                promo.discountPercentage > max.discountPercentage ? promo : max,
              activePromotions[0]
            );
            product.discountPrice =
              product.price *
              (1 - highestDiscountPromotion.discountPercentage / 100);
          } else {
            product.discountPrice = null;
          }
        } else {
          product.discountPrice = null;
        }

        await product.save();
      }
    }

    await Promotion.deleteOne({ _id: req.params.id });
    res.json({ message: "Promotion removed" });
  } else {
    res.status(404);
    throw new Error("Promotion not found");
  }
});

export {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  addProductPromotion,
  removeProductPromotion,
  togglePromotion,
  deletePromotion,
};


/*

import asyncHandler from "../middleware/asyncHandler.js";
import Promotion from "../models/promotionModel.js";
import Product from "../models/productModel.js";

// @desc    Create a new promotion
// @route   POST /api/promotions
// @access  Private/Admin
// @desc    Create a new promotion
// @route   POST /api/promotions
// @access  Private/Admin
const createPromotion = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    discountPercentage,
    startDate,
    endDate,
    products,
  } = req.body;

  if (!name || discountPercentage === undefined || !startDate || !endDate) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  if (discountPercentage > 100 || discountPercentage < 0) {
    res.status(400);
    throw new Error("Discount percentage must be between 0 and 100");
  }

  const promotion = new Promotion({
    name,
    description,
    discountPercentage,
    startDate,
    endDate,
    active: false, // New promotions are inactive by default
    products: products || [], // Lista de productos asociados
  });

  const createdPromotion = await promotion.save();

  // Actualizar productos con el ID de la promoción
  if (products && products.length > 0) {
    await Product.updateMany(
      { _id: { $in: products } },
      { $push: { promotions: createdPromotion._id } }
    );
  }

  res.status(201).json(createdPromotion);
});


// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
const getPromotions = asyncHandler(async (req, res) => {
  const promotions = await Promotion.find({});
  res.json(promotions);
});

// @desc    Add product to promotion
// @route   PUT /api/promotions/:id/addProduct
// @access  Private/Admin
const addProductPromotion = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const promotion = await Promotion.findById(req.params.id);
  const product = await Product.findById(productId);

  if (promotion && product) {
    if (!promotion.products.includes(productId)) {
      promotion.products.push(productId);
      await promotion.save();

      if (promotion.active) {
        product.discountPrice = product.price * (1 - promotion.discountPercentage / 100);
        product.promotions.push(promotion._id);
        await product.save();
      }

      res.json({ message: "Product added to promotion" });
    } else {
      res.status(400);
      throw new Error("Product already in promotion");
    }
  } else {
    res.status(404);
    throw new Error("Promotion or product not found");
  }
});

// @desc    Remove a product from a promotion
// @route   PUT /api/promotions/:id/removeProduct
// @access  Private/Admin
const removeProductPromotion = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const promotion = await Promotion.findById(req.params.id);
  const product = await Product.findById(productId);

  if (promotion && product) {
    // Remove product from promotion's product list
    promotion.products = promotion.products.filter(
      (prodId) => prodId.toString() !== productId.toString()
    );
    await promotion.save();

    // Remove promotion from product's promotions list
    product.promotions = product.promotions.filter(
      (promoId) => promoId.toString() !== promotion._id.toString()
    );

    // Remove discountPrice if no active promotions
    if (product.promotions.length === 0) {
      product.discountPrice = null;
    }

    await product.save();

    res.json({ message: "Product removed from promotion" });
  } else {
    res.status(404);
    throw new Error("Promotion or product not found");
  }
}); 

const changeDiscountPromotion = asyncHandler(async (req, res) => {
  const { discountPercentage } = req.body;

  if (discountPercentage > 100 || discountPercentage < 0) {
    res.status(400);
    throw new Error("Discount percentage must be between 0 and 100");
  }

  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    promotion.discountPercentage =
      discountPercentage !== undefined
        ? discountPercentage
        : promotion.discountPercentage;
    await promotion.save();

    if (promotion.active) {
      const products = await Product.find({ _id: { $in: promotion.products } });
      for (let product of products) {
        product.discountPrice =
          product.price * (1 - promotion.discountPercentage / 100);
        await product.save();
      }
    }

    res.json({ message: "Promotion discount updated" });
  } else {
    res.status(404);
    throw new Error("Promotion not found");
  }
});


// @desc    Change start and end date for promotion
// @route   PUT /api/promotions/:id/changeDate
// @access  Private/Admin
const changeDatePromotion = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    const now = new Date();

    if (startDate && new Date(startDate) < now) {
      res.status(400);
      throw new Error("Start date cannot be in the past");
    }

    if (endDate && new Date(endDate) < now) {
      res.status(400);
      throw new Error("End date cannot be in the past");
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      res.status(400);
      throw new Error("Start date cannot be after end date");
    }

    promotion.startDate = startDate || promotion.startDate;
    promotion.endDate = endDate || promotion.endDate;
    await promotion.save();

    res.json({ message: "Promotion dates updated" });
  } else {
    res.status(404);
    throw new Error("Promotion not found");
  }
});


// @desc    Activate/Deactivate promotion
// @route   PUT /api/promotions/:id/togglePromotion
// @access  Private/Admin
const togglePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    promotion.active = !promotion.active; // Toggle active state
    await promotion.save();

    const products = await Product.find({ _id: { $in: promotion.products } });

    if (promotion.active) {
      // Apply discount to products
      for (let product of products) {
        product.discountPrice =
          product.price * (1 - promotion.discountPercentage / 100);
        if (!product.promotions.includes(promotion._id)) {
          product.promotions.push(promotion._id);
        }
        await product.save();
      }
    } else {
      // Remove discount from products
      for (let product of products) {
        product.discountPrice = null;
        product.promotions = product.promotions.filter(
          (promoId) => promoId.toString() !== promotion._id.toString()
        );
        await product.save();
      }
    }

    res.json({ message: "Promotion state toggled", promotion });
  } else {
    res.status(404);
    throw new Error("Promotion not found");
  }
});

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);

  if (promotion) {
    if (promotion.active) {
      // Remove discount from products
      const products = await Product.find({ _id: { $in: promotion.products } });
      for (let product of products) {
        product.discountPrice = null;
        product.promotions = product.promotions.filter(
          (promoId) => promoId.toString() !== promotion._id.toString()
        );
        await product.save();
      }
    }

    await Promotion.deleteOne({ _id: req.params.id });
    res.json({ message: "Promotion removed" });
  } else {
    res.status(404);
    throw new Error("Promotion not found");
  }
}); 

export {
  createPromotion,
  getPromotions,
  addProductPromotion,
  removeProductPromotion,
  changeDiscountPromotion,
  changeDatePromotion,
  togglePromotion,
  deletePromotion,
};

*/