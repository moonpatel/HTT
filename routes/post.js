import express from "express";
import { isAuthenticated } from "../middleware/auth.js"; // Assuming auth middleware
import { createPost, getPostById, getPosts, likePostRoute, unlikePostRoute } from "../controllers/post.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.get("/posts", getPosts);
router.get("/:postId", getPostById);
router.post("/", isAuthenticated, singleUpload, createPost);
router.post("/:postId/like", isAuthenticated, likePostRoute);
router.delete("/:postId/unlike", isAuthenticated, unlikePostRoute);

export default router;