import express from "express";
import {
  createComment,
  getCommentsByPostId,
  likeComment,
  unlikeComment,
  getCommentLikes,
} from "../controllers/comment.js";
import { isAuthenticated } from "../middleware/auth.js"; // Assuming authentication middleware
// import { isAuthorized } from "../middleware/auth.js"; // Assuming authorization middleware (optional)

const router = express.Router();

// Create Comment Route
router.post("/:postId/comments", isAuthenticated, createComment);

// Get Comments by Post ID Route
router.get("/:postId/comments", getCommentsByPostId);

// Like Comment Route
router.post("/:commentId/like", isAuthenticated, likeComment);

// Unlike Comment Route
router.delete("/:commentId/unlike", isAuthenticated, unlikeComment);

// Get Comment Likes Route (optional)
router.get("/:commentId/likes", getCommentLikes);

// // Update Comment Route (optional, requires authorization)
// router.put("/:commentId", isAuthorized, updateComment);

// // Delete Comment Route (optional, requires authorization)
// router.delete("/:commentId", isAuthorized, deleteComment);

export default router;