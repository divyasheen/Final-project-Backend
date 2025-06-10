import express from "express";
import {
  allPosts,
  createPost,
  addCommentToPost,
  getSinglePostWithComments,
  deletePost,
  deleteComment,
  editComment
} from "../controllers/postsController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

//Get all Posts with comments
router.get("/", allPosts);
//Get Posts with comments for one user or one post
router.get("/:id", getSinglePostWithComments);
//Delete a Post by id
router.delete("/:id", authenticateUser, deletePost);

//create  a Post
router.post("/", authenticateUser, createPost);

//Adding Comments to the Post
router.post("/:id/comments", authenticateUser, addCommentToPost);
router.patch("/comments/:id", authenticateUser, editComment);

// Delete a comment
router.delete("/comments/:id", authenticateUser, deleteComment);
export default router;
