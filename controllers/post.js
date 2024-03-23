import { asyncError } from "../middleware/error.js";
import { Post } from "../models/post.js"; // Assuming Post model
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";

export const likePost = async (likedById, post) => {
  try {
    post.likes.push(likedById); // Assuming this comes from the calling route
    post.likeCount = post.likes.length; // Update like count
    await post.save();
    return post;
  } catch (error) {
    console.error(error.message);
    throw new Error("Error liking post"); // Re-throw for central error handling
  }
};

export const unlikePost = async (unlikedById, post) => {
  try {
    const likeIndex = post.likes.indexOf(unlikedById);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
      post.likeCount = post.likes.length; // Update like count
      await post.save();
    }
    return post;
  } catch (error) {
    console.error(error.message);
    throw new Error("Error unliking post"); // Re-throw for central error handling
  }
};

export const likePostRoute = asyncError(async (req, res, next) => {
  const { postId } = req.params; // Assuming postId is in URL parameter
  const userId = req.user._id; // Get user ID from authenticated user

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return next(new Error("Post not found"));
    }

    // Check if user already liked the post
    if (post.likes.includes(userId)) {
      return next(new Error("You already liked this post"));
    }

    await likePost(userId, post); // Call function for additional like logic (optional)

    res.json({ message: "Post liked successfully", likes: post.likes.length });
  } catch (error) {
    console.error(error.message);
    next(error); // Pass error to central error handler
  }
});

export const unlikePostRoute = asyncError(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return next(new Error("Post not found"));
    }

    // Check if user has already liked the post (unlike only makes sense if liked)
    if (!post.likes.includes(userId)) {
      return next(new Error("You have not liked this post"));
    }

    await unlikePost(userId, post); // Call function for additional unlike logic (optional)

    res.json({
      message: "Post unliked successfully",
      likes: post.likes.length,
    });
  } catch (error) {
    console.error(error.message);
    next(error); // Pass error to central error handler
  }
});

export const createPost = async (req, res, next) => {
  try {
    // Extract post data from request body
    const { title, description } = req.body;

    // Validate post data (implementation omitted for brevity)
    // TODO

    // Handle image upload (optional)
    let imageUrl = null;
    if (req.file) {
      const file = getDataUri(req.file);
      const { public_id, secure_url } = await cloudinary.v2.uploader.upload(
        file.content
      );
      imageUrl = secure_url;
    }

    // Create new post model
    const newPost = new Post({
      title,
      description,
      imageUrl,
      createdBy: req.user._id, // Assuming user ID from authenticated user
    });

    // Save the new post
    const savedPost = await newPost.save();

    // Send successful response
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    console.error(error.message);
    next(error); // Pass error to central error handler
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return next(new Error("Post not found", 404)); // Custom error with status code
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error(error.message);
    next(error); // Pass error to central error handler
  }
};