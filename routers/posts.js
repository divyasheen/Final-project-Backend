import express from "express";
import {
  allPosts,
  createPost,
  addCommentToPost,
  getSinglePostWithComments,
  deletePost,
  deleteComment,
  editComment,
} from "../controllers/postsController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

//JB : import for testing controller
import { getDB } from "../utils/db.js";

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

// JB: fetch posts by id
router.get("/userPosts/:id", async (req, res) => {
  try {
    const db = getDB();
    const [posts] = await db.execute(
      `SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 3`,
      [req.params.id]
    );

    res.json(posts);

  } catch (error) {
    console.error("BE - Error at fetching user posts: ", error)
  }
});

export default router;
