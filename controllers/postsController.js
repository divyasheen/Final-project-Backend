import { getDB } from "../utils/db.js";

//Getting all posts with pagination and comments
export const allPosts = async (req, res) => {
  const db = getDB();

  let limit = parseInt(req.query.limit);
  let offset = parseInt(req.query.offset);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    // DO NOT use placeholders for LIMIT and OFFSET here
    const [posts] = await db.query(
      `
      SELECT 
        posts.id,
        posts.title,
        posts.body,
        posts.created_at,
        posts.user_id,  
        users.username AS author,
        communities.name AS community
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN communities ON posts.community_id = communities.id
      ORDER BY posts.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
      `
    );

    const postIds = posts.map((post) => post.id);

    let comments = [];
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => "?").join(", ");
      const [commentRows] = await db.query(
        `
        SELECT 
          comments.id,
          comments.content,
          comments.post_id,
          comments.user_id,
          comments.created_at,
          users.username AS commenter
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.post_id IN (${placeholders})
        ORDER BY comments.created_at ASC
        `,
        postIds
      );

      comments = commentRows;
    }

    const postsWithComments = posts.map((post) => {
      post.comments = comments.filter((c) => c.post_id === post.id);
      return post;
    });

    res.json(postsWithComments);
  } catch (err) {
    console.error("Error fetching posts with comments:", err);
    res.status(500).json({ error: "Failed to fetch posts with comments" });
  }
};

// Get all posts in a specific community with pagination and comments
export const communityPosts = async (req, res) => {
  const db = getDB();
  const { communityId } = req.params;

  let limit = parseInt(req.query.limit);
  let offset = parseInt(req.query.offset);

  if (isNaN(limit) || limit <= 0) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  try {
    const [posts] = await db.query(
      `
      SELECT 
        posts.id,
        posts.title,
        posts.body,
        posts.created_at,
        posts.user_id,  
        users.username AS author,
        communities.name AS community
      FROM posts
      JOIN users ON posts.user_id = users.id
      JOIN communities ON posts.community_id = communities.id
      WHERE posts.community_id = ?
      ORDER BY posts.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
      `,
      [communityId]
    );

    const postIds = posts.map((post) => post.id);

    let comments = [];
    if (postIds.length > 0) {
      const placeholders = postIds.map(() => "?").join(", ");
      const [commentRows] = await db.query(
        `
        SELECT 
          comments.id,
          comments.content,
          comments.post_id,
          comments.user_id,
          comments.created_at,
          users.username AS commenter
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.post_id IN (${placeholders})
        ORDER BY comments.created_at ASC
        `,
        postIds
      );

      comments = commentRows;
    }

    const postsWithComments = posts.map((post) => {
      post.comments = comments.filter((c) => c.post_id === post.id);
      return post;
    });

    res.json(postsWithComments);
  } catch (err) {
    console.error("Error fetching community posts:", err);
    res.status(500).json({ error: "Failed to fetch community posts" });
  }
};

// Create a new post with title, body, and community_id
export const createPost = async (req, res) => {
  const db = getDB();
  const { title, body, community_id } = req.body;
  const user_id = req.user.id;

  if (!title || !body || !community_id) {
    return res
      .status(400)
      .json({ error: "Missing title, body, or community_id" });
  }

  // Validate community_id exists
  try {
    const [community] = await db.execute(
      "SELECT id FROM communities WHERE id = ?",
      [community_id]
    );
    if (community.length === 0) {
      return res.status(400).json({ error: "Invalid community_id" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error checking community" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO posts (user_id, title, body, community_id, created_at) VALUES (?, ?, ?, ?, NOW())",
      [user_id, title, body, community_id]
    );

    res.status(200).json({ message: "Post created", postId: result.insertId });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// Add a comment to a specific post
export const addCommentToPost = async (req, res) => {
  const db = getDB();

  const postId = req.params.id;
  const user_id = req.user.id; // ✅ from token
  const { content } = req.body;

  // Validate presence of user_id and content
  if (!user_id || !content) {
    return res.status(400).json({ message: "Missing user_id or content" });
  }

  try {
    // Insert new comment linked to the post
    const [insertResult] = await db.query(
      `INSERT INTO comments (post_id, user_id, content, created_at)
       VALUES (?, ?, ?, NOW())`,
      [postId, user_id, content]
    );

    // Retrieve the newly inserted comment along with the commenter name
    const [newComment] = await db.query(
      `SELECT 
         comments.id,
         comments.post_id,
         comments.user_id,
         comments.content,
         comments.created_at,
         users.username AS commenter
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.id = ?`,
      [insertResult.insertId]
    );

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

//Delete a comment by ID
export const deleteComment = async (req, res) => {
  const db = getDB();
  const commentId = req.params.id;
  const user_id = req.user.id; // Get user ID from token

  try {
    // Check if the comment exists and belongs to the user
    const [comment] = await db.query(
      `SELECT * FROM comments WHERE id = ? AND user_id = ?`,
      [commentId, user_id]
    );

    if (comment.length === 0) {
      return res
        .status(404)
        .json({ message: "Comment not found or unauthorized" });
    }

    // Delete the comment
    await db.query(`DELETE FROM comments WHERE id = ?`, [commentId]);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};

//Edit comment by ID
export const editComment = async (req, res) => {
  const db = getDB();
  const id = req.params.id;
  const { content } = req.body;
  const user_id = req.user.id; // Get user ID from token
  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }
  try {
    // Check if the comment exists and belongs to the user
    const [comment] = await db.query(
      `SELECT * FROM comments WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );

    if (comment.length === 0) {
      return res
        .status(404)
        .json({ message: "Comment not found or unauthorized" });
    }

    // Update the comment
    await db.query(
      `UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?`,
      [content, id]
    );

    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Error updating comment" });
  }
};

// Get a single post by ID along with its comments and community name
export const getSinglePostWithComments = async (req, res) => {
  const db = getDB();

  const postId = req.params.id;

  try {
    // Get the post joined with its community name
    const [postData] = await db.query(
      `SELECT 
         posts.*, 
         communities.name AS community_name 
       FROM posts
       LEFT JOIN communities ON posts.community_id = communities.id
       WHERE posts.id = ?`,
      [postId]
    );

    if (postData.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get all comments for this post
    const [commentsData] = await db.query(
      `SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC`,
      [postId]
    );

    // Attach comments array to the post object
    const post = postData[0];
    post.comments = commentsData;

    res.json(post);
  } catch (error) {
    console.error("Error getting post with comments:", error);
    res.status(500).json({ message: "Error retrieving post" });
  }
};

//Delete a post by ID
export const deletePost = async (req, res) => {
  const db = getDB();
  const postId = req.params.id;
  const userId = req.user.id; // Get user ID from token

  try {
    // Check if the post exists and belongs to the user
    const [post] = await db.query(
      `SELECT * FROM posts WHERE id = ? AND user_id = ?`,
      [postId, userId]
    );

    if (post.length === 0) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    // First, delete associated comments
    await db.query(`DELETE FROM comments WHERE post_id = ?`, [postId]);

    // Then delete the post itself
    await db.query(`DELETE FROM posts WHERE id = ?`, [postId]);

    res
      .status(200)
      .json({ message: "Post and its comments deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
};

// JB: Get posts by Id and limit the latest to 3
export const getPostsbyId = async (req, res) => {
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
}