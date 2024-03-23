import mongoose from "mongoose";

const schema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    pinCode: {
      type: Number,
    },
  },

  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  dineIn: {
    type:Boolean,
    require:true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD",
  },

  paidAt: Date,
  paymentInfo: {
    id: String,
    status: String,
  },
  itemsPrice: {
    type: Number,
    required: true,
  },
  taxPrice: {
    type: Number,
    required: true,
  },
  deliveryCharges: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },

  orderStatus: {
    type: String,
    enum: ["Preparing", "Out for delivery", "Delivered"],
    default: "Preparing",
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Order = mongoose.model("Order", schema);
