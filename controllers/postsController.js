import { getDB } from "../utils/db.js";

// Getting all posts with pagination, comments, likes and dislikes counts
export const allPosts = async (req, res) => {
  const db = getDB();
  const userId = req.user?.id; // get from token

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
        communities.name AS community,
        COUNT(DISTINCT likes.id) AS like_count,
        COUNT(DISTINCT dislikes.id) AS dislike_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN communities ON posts.community_id = communities.id
      LEFT JOIN likes ON likes.post_id = posts.id
      LEFT JOIN dislikes ON dislikes.post_id = posts.id
      GROUP BY posts.id
      ORDER BY posts.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const postIds = posts.map((post) => post.id);

    // Step 1: Fetch user likes/dislikes for those posts
    let likedPosts = [];
    let dislikedPosts = [];

    if (userId && postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(', ');
      const [likes] = await db.query(
        `SELECT post_id FROM likes WHERE user_id = ? AND post_id IN (${placeholders})`,
        [userId, ...postIds]
      );
      const [dislikes] = await db.query(
        `SELECT post_id FROM dislikes WHERE user_id = ? AND post_id IN (${placeholders})`,
        [userId, ...postIds]
      );

      likedPosts = likes.map((l) => l.post_id);
      dislikedPosts = dislikes.map((d) => d.post_id);
    }

    // Step 2: Attach userLiked and userDisliked flags
    const postsWithFlags = posts.map((post) => ({
      ...post,
      userLiked: likedPosts.includes(post.id),
      userDisliked: dislikedPosts.includes(post.id),
    }));

    // Step 3: Fetch comments
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

    // Step 4: Attach comments
    const postsWithComments = postsWithFlags.map((post) => ({
      ...post,
      comments: comments.filter((c) => c.post_id === post.id),
    }));

    res.json(postsWithComments);
  } catch (err) {
    console.error("Error fetching posts with comments:", err);
    res.status(500).json({ error: "Failed to fetch posts with comments" });
  }
};


// Get all posts in a specific community with pagination, comments, likes and dislikes counts
export const communityPosts = async (req, res) => {
  const db = getDB();
  const { communityId } = req.params;
  const userId = req.user?.id;

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
        communities.name AS community,
        COUNT(DISTINCT likes.id) AS like_count,
        COUNT(DISTINCT dislikes.id) AS dislike_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      JOIN communities ON posts.community_id = communities.id
      LEFT JOIN likes ON likes.post_id = posts.id
      LEFT JOIN dislikes ON dislikes.post_id = posts.id
      WHERE posts.community_id = ?
      GROUP BY posts.id
      ORDER BY posts.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [communityId, limit, offset]
    );

    const postIds = posts.map((post) => post.id);

    let likedPosts = [];
    let dislikedPosts = [];

    if (userId && postIds.length > 0) {
      const placeholders = postIds.map(() => '?').join(', ');
      const [likes] = await db.query(
        `SELECT post_id FROM likes WHERE user_id = ? AND post_id IN (${placeholders})`,
        [userId, ...postIds]
      );
      const [dislikes] = await db.query(
        `SELECT post_id FROM dislikes WHERE user_id = ? AND post_id IN (${placeholders})`,
        [userId, ...postIds]
      );
      likedPosts = likes.map((l) => l.post_id);
      dislikedPosts = dislikes.map((d) => d.post_id);
    }

    const postsWithFlags = posts.map((post) => ({
      ...post,
      userLiked: likedPosts.includes(post.id),
      userDisliked: dislikedPosts.includes(post.id),
    }));

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

    const postsWithComments = postsWithFlags.map((post) => ({
      ...post,
      comments: comments.filter((c) => c.post_id === post.id),
    }));

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

// Add a comment to a specific post (unchanged)
export const addCommentToPost = async (req, res) => {
  const db = getDB();

  const postId = req.params.id;
  const user_id = req.user.id; // ✅ from token
  const { content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({ message: "Missing user_id or content" });
  }

  try {
    const [insertResult] = await db.query(
      `INSERT INTO comments (post_id, user_id, content, created_at)
       VALUES (?, ?, ?, NOW())`,
      [postId, user_id, content]
    );

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

// Delete a comment by ID (unchanged)
export const deleteComment = async (req, res) => {
  const db = getDB();
  const commentId = req.params.id;
  const user_id = req.user.id;

  try {
    const [comment] = await db.query(
      `SELECT * FROM comments WHERE id = ? AND user_id = ?`,
      [commentId, user_id]
    );

    if (comment.length === 0) {
      return res
        .status(404)
        .json({ message: "Comment not found or unauthorized" });
    }

    await db.query(`DELETE FROM comments WHERE id = ?`, [commentId]);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};

// Edit comment by ID (unchanged)
export const editComment = async (req, res) => {
  const db = getDB();
  const id = req.params.id;
  const { content } = req.body;
  const user_id = req.user.id;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }
  try {
    const [comment] = await db.query(
      `SELECT * FROM comments WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );

    if (comment.length === 0) {
      return res
        .status(404)
        .json({ message: "Comment not found or unauthorized" });
    }

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

// Get a single post by ID along with its comments and community name, including likes/dislikes counts
export const getSinglePostWithComments = async (req, res) => {
  const db = getDB();

  const postId = req.params.id;

  try {
    const [postData] = await db.query(
      `SELECT 
         posts.*, 
         communities.name AS community_name,
         (SELECT COUNT(*) FROM likes WHERE post_id = ?) AS like_count,
         (SELECT COUNT(*) FROM dislikes WHERE post_id = ?) AS dislike_count
       FROM posts
       LEFT JOIN communities ON posts.community_id = communities.id
       WHERE posts.id = ?`,
      [postId, postId, postId]
    );

    if (postData.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const [commentsData] = await db.query(
      `SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC`,
      [postId]
    );

    const post = postData[0];
    post.comments = commentsData;

    res.json(post);
  } catch (error) {
    console.error("Error getting post with comments:", error);
    res.status(500).json({ message: "Error retrieving post" });
  }
};

// Delete a post by ID (unchanged)
export const deletePost = async (req, res) => {
  const db = getDB();
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const [post] = await db.query(
      `SELECT * FROM posts WHERE id = ? AND user_id = ?`,
      [postId, userId]
    );

    if (post.length === 0) {
      return res
        .status(404)
        .json({ message: "Post not found or unauthorized" });
    }

    await db.query(`DELETE FROM comments WHERE post_id = ?`, [postId]);
    await db.query(`DELETE FROM posts WHERE id = ?`, [postId]);

    res
      .status(200)
      .json({ message: "Post and its comments deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
};

// Get posts by user ID (unchanged)
export const getPostsbyId = async (req, res) => {
  try {
    const db = getDB();
    const [posts] = await db.execute(
      `SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 3`,
      [req.params.id]
    );

    res.json(posts);
  } catch (error) {
    console.error("BE - Error at fetching user posts: ", error);
  }
};

// Like a post (unchanged)
export const likePost = async (req, res) => {
  const db = getDB();
  const user_id = req.user.id;
  const post_id = req.params.id;

  try {
    await db.execute(
      `DELETE FROM dislikes WHERE user_id = ? AND post_id = ?`,
      [user_id, post_id]
    );

    await db.execute(
      `INSERT IGNORE INTO likes (user_id, post_id) VALUES (?, ?)`,
      [user_id, post_id]
    );

    const [[{ like_count }]] = await db.execute(
      `SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?`,
      [post_id]
    );
    const [[{ dislike_count }]] = await db.execute(
      `SELECT COUNT(*) AS dislike_count FROM dislikes WHERE post_id = ?`,
      [post_id]
    );

    res.json({ like_count, dislike_count });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking post" });
  }
};

// Unlike a post (unchanged)
export const unlikePost = async (req, res) => {
  const db = getDB();
  const user_id = req.user.id;
  const post_id = req.params.id;

  try {
    await db.execute(
      `DELETE FROM likes WHERE user_id = ? AND post_id = ?`,
      [user_id, post_id]
    );

    const [[{ like_count }]] = await db.execute(
      `SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?`,
      [post_id]
    );
    const [[{ dislike_count }]] = await db.execute(
      `SELECT COUNT(*) AS dislike_count FROM dislikes WHERE post_id = ?`,
      [post_id]
    );

    res.json({ like_count, dislike_count });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ message: "Error unliking post" });
  }
};

// **Dislike a post**
export const dislikePost = async (req, res) => {
  const db = getDB();
  const user_id = req.user.id;
  const post_id = req.params.id;

  try {
    await db.execute(
      `DELETE FROM likes WHERE user_id = ? AND post_id = ?`,
      [user_id, post_id]
    );

    await db.execute(
      `INSERT IGNORE INTO dislikes (user_id, post_id) VALUES (?, ?)`,
      [user_id, post_id]
    );

    const [[{ dislike_count }]] = await db.execute(
      `SELECT COUNT(*) AS dislike_count FROM dislikes WHERE post_id = ?`,
      [post_id]
    );
    const [[{ like_count }]] = await db.execute(
      `SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?`,
      [post_id]
    );

    res.json({ like_count, dislike_count });
  } catch (error) {
    console.error("Error disliking post:", error);
    res.status(500).json({ message: "Error disliking post" });
  }
};

// **Remove dislike from a post**
export const removeDislike = async (req, res) => {
  const db = getDB();
  const user_id = req.user.id;
  const post_id = req.params.id;

  try {
    await db.execute(
      `DELETE FROM dislikes WHERE user_id = ? AND post_id = ?`,
      [user_id, post_id]
    );

    const [[{ dislike_count }]] = await db.execute(
      `SELECT COUNT(*) AS dislike_count FROM dislikes WHERE post_id = ?`,
      [post_id]
    );
    const [[{ like_count }]] = await db.execute(
      `SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?`,
      [post_id]
    );

    res.json({ like_count, dislike_count });
  } catch (error) {
    console.error("Error removing dislike:", error);
    res.status(500).json({ message: "Error removing dislike" });
  }
};




export const countAllPosts = async (req, res) => {
  try {
    const db = getDB();
    const [amountPosts] = await db.query("SELECT COUNT(*) as count FROM posts");
    if (!amountPosts) {
      return res.status(404).json({ message: "BE - No posts found, while counting." });
    }
    res.json(amountPosts);
  } catch (error) {
    console.error("BE - Error counting all posts; ", error);
  }
}