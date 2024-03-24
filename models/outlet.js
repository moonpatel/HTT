import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    // required:true
  },
  location: {
    type: { type: String, default: "Point" }, // GeoJSON Point type
    coordinates: [Number], // Array of [longitude, latitude]
  },
  rating: {
    type: Number,
  },
  dineIn: {
    type: Boolean,
    default: true, // Indicate if dine-in is available
  },
  offers: {
    type: [
      {
        name: String,
        description: String,
        startDate: Date,
        endDate: Date,
      },
    ],
  },
  coupons: {
    type: [
      {
        code: String,
        discount: Number,
        minOrderValue: Number,
        expiryDate: Date,
      },
    ],
  },
  delivery: {
    type: {
      minDeliveryAmount: Number,
      deliveryFee: Number,
      estimatedTime: String, // Estimated delivery time in minutes
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

schema.index({ location: "2dsphere" }); // Create geospatial index

export const Outlet = mongoose.model("Outlet", schema);
