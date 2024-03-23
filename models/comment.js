import mongoose from "mongoose";

const schema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Please enter a comment"],
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
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likeCount: {
    type: mongoose.Schema.Types.Number,
    default: 0,
  },
});

export const Comment = mongoose.model("Comment", schema);
