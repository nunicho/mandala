import cron from "node-cron";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/orderModel.js";
import Promotion from "../models/promotionModel.js";
import Product from "../models/productModel.js";

dotenv.config();

// Conectar a la base de datos MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Función para actualizar el campo isExpired en órdenes
const updateExpiredOrders = async () => {
  const expirationTime = new Date(Date.now() - 2 * 60 * 1000); // 2 minutos atrás

  try {
    await Order.updateMany(
      {
        createdAt: { $lt: expirationTime },
        isPaid: false,
        isExpired: false,
      },
      { isExpired: true }
    );
    console.log("Ordenes actualizadas a isExpired = true");
  } catch (error) {
    console.error("Error actualizando ordenes expiradas:", error);
  }
};

// Función para manejar la expiración de promociones
const checkPromotionExpiration = async () => {
  const now = new Date();
  const expiredPromotions = await Promotion.find({
    endDate: { $lt: now },
    active: true,
  });

  for (let promotion of expiredPromotions) {
    promotion.active = false;
    await promotion.save();

    const products = await Product.find({ _id: { $in: promotion.products } });
    for (let product of products) {
      product.discountPrice = null;
      product.promotions = product.promotions.filter(
        (promoId) => promoId.toString() !== promotion._id.toString()
      );
      await product.save();
    }
  }

  console.log("Checked and updated expired promotions");
};

// Programar la tarea cron para ejecutarse cada minuto
cron.schedule("* * * * *", () => {
  updateExpiredOrders();
  checkPromotionExpiration();
});

/*
import cron from "node-cron";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../models/orderModel.js";

dotenv.config();

// Conectar a la base de datos MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Función para actualizar el campo isExpired
const updateExpiredOrders = async () => {
  const expirationTime = new Date(Date.now() - 2 * 60 * 1000); // 2 minutos atrás

  try {
    await Order.updateMany(
      {
        createdAt: { $lt: expirationTime },
        isPaid: false,
        isExpired: false,
      },
      { isExpired: true }
    );
    //console.log("Ordenes actualizadas a isExpired = true");
  } catch (error) {
    console.error("Error actualizando ordenes expiradas:", error);
  }
};

// Programar la tarea cron para ejecutarse cada minuto
cron.schedule("* * * * *", () => {
  updateExpiredOrders();
});

*/
