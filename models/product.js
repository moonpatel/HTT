import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
  },
  description: {
    type: String,
    required: [true, "Please Enter Description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter Price"],
  },
  // stock: {
  //   type: Number,
  //   required: [true, "Please Enter Stock"],
  // },

  images: [{ public_id: String, url: String }],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ratings: {
    type: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to user who rated
        rating: { type: Number, required: true, min: 1, max: 5 }, // Rating value (1-5)
        comment: { type: String }, // Optional comment for the rating
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
});

schema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) {
    return 0;
  }
  const totalRating = this.ratings.reduce(
    (acc, rating) => acc + rating.rating,
    0
  );
  return totalRating / this.ratings.length;
});

export const Product = mongoose.model("Product", schema);
