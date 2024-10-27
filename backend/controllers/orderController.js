import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { calcPrices } from "../utils/calcPrices.js";
import { verifyPayPalPayment, checkIfNewTransaction } from "../utils/paypal.js";

// @desc     Create new order
// @route    POST /api/orders
// @access   Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No se ordenaron ítems");
  }

  // get the ordered items from our database
  const itemsFromDB = await Product.find({
    _id: { $in: orderItems.map((x) => x._id) },
  });

  // map over the order items and use the price from our items from database
  const dbOrderItems = orderItems.map((itemFromClient) => {
    const matchingItemFromDB = itemsFromDB.find(
      (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
    );

    // Verificar si el producto tiene discountPrice, usarlo en lugar de price
    const finalPrice =
      matchingItemFromDB.discountPrice || matchingItemFromDB.price;

    return {
      ...itemFromClient,
      product: itemFromClient._id,
      price: finalPrice, // Usar el precio final aquí
      // Remove _id: undefined,
    };
  });

  // Check if there is enough stock for each item
  for (const item of dbOrderItems) {
    const product = itemsFromDB.find((p) => p._id.toString() === item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Producto no encontrado con id ${item.product}`);
    }
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(
        `No hay suficiente stock para el producto ${product.name}`
      );
    }
  }

  // calculate prices
  const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
    calcPrices(dbOrderItems);

  try {
    // Update stock for each product
    for (const item of dbOrderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Producto no encontrado con id ${item.product}`);
      }

      // Verificar nuevamente el stock antes de restar
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(
          `No hay suficiente stock para el producto ${product.name}`
        );
      }

      product.countInStock -= item.qty; // Resta la cantidad ordenada
      await product.save();
    }

    // Create order
    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc     Get logged in user orders
// @route    GET /api/orders/myorders
// @access   Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

// @desc     Get order by Id
// @route    GET /api/orders/:id
// @access   Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404);
    throw new Error("Orden no encontrada");
  }
});

// @desc     Update order to paid
// @route    PUT /api/orders/:id/pay
// @access   Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const { verified, value } = await verifyPayPalPayment(req.body.id);
  if (!verified) throw new Error("Pago no verificado");

  // check if this transaction has been used before
  const isNewTransaction = await checkIfNewTransaction(Order, req.body.id);
  if (!isNewTransaction)
    throw new Error("La transacción ya ha sido usada antes");

  const order = await Order.findById(req.params.id);

  if (order) {
    // Check the correct amount was paid
    // Ensure both values have two decimals for comparison
    const orderTotalPrice = order.totalPrice.toFixed(2);
    const paymentAmount = Number(value).toFixed(2);

    const paidCorrectAmount = orderTotalPrice === paymentAmount;
    if (!paidCorrectAmount) throw new Error("Monto a pagar incorrecto");

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Orden no encontrada");
  }
});

// @desc     Update order to delivered
// @route    PUT /api/orders/:id/deliver
// @access   Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updateOrder = await order.save();

    res.status(200).json(updateOrder);
  } else {
    res.status(404);
    throw new Error("Orden no encontrada");
  }
});

// @desc     Get all orders
// @route    GET /api/orders/
// @access   Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.status(200).json(orders);
});

// @desc     Delete order and restock items
// @route    DELETE /api/orders/:id
// @access   Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Orden no encontrada");
  }

  // Verificar si la orden está marcada como expirada
  if (!order.isExpired) {
    res.status(400);
    throw new Error("Solo se pueden eliminar órdenes expiradas");
  }

  // Verificar si la orden está pagada
  if (order.isPaid) {
    res.status(400);
    throw new Error("No se pueden eliminar órdenes pagadas");
  }

  // Restituir el stock de los productos asociados a la orden
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock += item.qty;
      await product.save();
    }
  }

  await Order.deleteOne({ _id: order._id });
  res.status(200).json({ message: "Orden eliminada y stock restituido" });
});

// @desc     Cancel order and restock items
// @route    DELETE /api/orders/:id/cancel
// @access   Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Orden no encontrada");
  }

  // Verificar que la orden pertenece al usuario que realiza la petición
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("No autorizado para cancelar esta orden");
  }

  // Verificar si la orden está pagada
  if (order.isPaid) {
    res.status(400);
    throw new Error("No se pueden cancelar órdenes pagadas");
  }

  // Restituir el stock de los productos asociados a la orden
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock += item.qty;
      await product.save();
    }
  }

  await Order.deleteOne({ _id: order._id });
  res.status(200).json({ message: "Orden cancelada y stock restituido" });
});

export default deleteOrder;
export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  deleteOrder,
  cancelOrder,
};
