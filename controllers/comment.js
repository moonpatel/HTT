import mongoose from "mongoose";
import { Comment } from "../models/comment.js"; // Assuming comment model
import { Post } from "../models/post.js";

export const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Validate input
    if (!text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // Check for valid ObjectID format (assuming MongoDB)
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Verify user authentication and post existence
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }


    const newComment = new Comment({
      text,
      createdBy: req.user._id,
      postId,
    });

    const savedComment = await newComment.save();

    // Update post with new comment ID
    post.comments.push(savedComment._id);
    await post.save();

    res.status(201).json({ message: "Comment created successfully", comment: savedComment });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" }); // Or provide more specific error information
  }
};
export const getCommentsByPostId = async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Check for valid ObjectID format (assuming MongoDB)
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return next(new Error("Invalid post ID"));
    }

    const post = await Post.findById(postId).populate("comments"); // Populate existing comments

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Retrieve comments using the populated comments array
    const comments = post.comments;

    res.status(200).json({ comments });
  } catch (error) {
    console.error(error.message);
    next(error); // Pass error to central error handler
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new Error("Comment not found"));
    }

    if (comment.likes.includes(userId)) {
      return next(new Error("You already liked this comment"));
    }

    comment.likes.push(userId);
    comment.likeCount = comment.likes.length;
    await comment.save();

    res.json({
      message: "Comment liked successfully",
      likes: comment.likes.length,
    });
  } catch (error) {
    console.error(error.message);
    next(error); // Pass error to central error handler
  }
};

export const unlikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new Error("Comment not found"));
    }

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex === -1) {
      return next(new Error("You have not liked this comment"));
    }

    comment.likes.splice(likeIndex, 1);
    comment.likeCount = comment.likes.length;
    await comment.save();

    res.json({
      message: "Comment unliked successfully",
      likes: comment.likes.length,
    });
  } catch (error) {
    console.error(error.message);
    next(error); // Pass error to central error handler
  }
};

export const getCommentLikes = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId).populate(
      "likes",
      "username profilePicture"
    ); // populate user details (optional)

    if (!comment) {
      return next(new Error("Comment not found"));
    }

    res.json({ likes: comment.likes });
  } catch (error) {
    console.error(error.message);
    next(error); // Pass error to central error handler
  }
};

// Optional functions (implement if needed)
export const updateComment = async (req, res, next) => {
  // Implement logic to update comment content based on authorization checks
};

export const deleteComment = async (req, res, next) => {
  // Implement logic to delete comment based on authorization checks
};
