import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    // required: [true, "Please enter a title for your post"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description for your post"],
  },
  image: {
    type: String,
    // required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

export const Post = mongoose.model("Post", schema);
