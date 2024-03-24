import { asyncError } from "../middleware/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import errorHanlder from "../utils/error.js";
import { stripe } from "../server.js";

export const proccessPayment = asyncError(async (req, res, next) => {
  const { totalAmount } = req.body;
  const { client_secret } = await stripe.paymentIntents.create({
    amount: Number(totalAmount * 100),
    currency: "inr",
  });
  res.status(200).json({
    success: true,
    client_secret,
  });
});

export const createOrder = asyncError(async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingCharges,
      totalAmount,
      dineIn
    } = req.body;

    await Order.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingCharges,
      totalAmount,
      dineIn
    });

    for (let i = 0; i < orderItems.length; i++) {
      const product = await Product.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }

    // NOTE: you need to use transactions here
    // Award coins for orders above 300
    let coins = 0;
    if (totalAmount > 300) {
      coins = Math.floor(totalAmount * 0.05); // Calculate 5% of total amount
      console.log(totalAmount, coins);
      // Implement logic to update user's coin balance (replace with your logic)
      req.user.coins += coins;
    }
    req.user.totalSpent += totalAmount;
    await req.user.save();
    res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
      coinsReceived: coins,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
});

export const getAdminOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({});

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getMyOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderDetails = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  res.status(200).json({
    success: true,
    order,
  });
});

export const proccessOrder = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  if (order.orderStatus === "Preparing") order.orderStatus = "Shipped";
  else if (order.orderStatus === "Shipped") {
    order.orderStatus = "Delivered";
    order.deliveredAt = new Date(Date.now());
  } else return next(new errorHanlder("Order Already Delivered", 404));
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order Proccessed Successfully",
  });
});
