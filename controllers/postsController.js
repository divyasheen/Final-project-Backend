import { getDB } from '../utils/db.js';

// Get all posts with their comments and community names
export const allPosts = async (req, res) => {
  const db = getDB();

  try {
    // Fetch posts joined with user and community info
    const [posts] = await db.execute(`
      SELECT 
        posts.id,
        posts.title,
        posts.body,
        posts.created_at,
        users.username AS author,
        communities.name AS community
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN communities ON posts.community_id = communities.id
      ORDER BY posts.created_at DESC
    `);

    // Fetch all comments with commenter username
    const [comments] = await db.execute(`
      SELECT 
        comments.id,
        comments.content,
        comments.post_id,
        comments.user_id,
        comments.created_at,
        users.username AS commenter
      FROM comments
      JOIN users ON comments.user_id = users.id
      ORDER BY comments.created_at ASC
    `);

    // Attach comments to each post by filtering on post_id
    const postsWithComments = posts.map(post => {
      post.comments = comments.filter(c => c.post_id === post.id);
      return post;
    });

    res.json(postsWithComments);
  } catch (err) {
    console.error('Error fetching posts with comments:', err);
    res.status(500).json({ error: 'Failed to fetch posts with comments' });
  }
};

// Create a new post with title, body, and community_id
export const createPost = async (req, res) => {
  const db = getDB();
  const { title, body, community_id } = req.body;
  const user_id = req.user.id;

  if (!title || !body || !community_id) {
    return res.status(400).json({ error: 'Missing title, body, or community_id' });
  }

  // Validate community_id exists
  try {
    const [community] = await db.execute('SELECT id FROM communities WHERE id = ?', [community_id]);
    if (community.length === 0) {
      return res.status(400).json({ error: 'Invalid community_id' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error checking community' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO posts (user_id, title, body, community_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user_id, title, body, community_id]
    );

    res.status(200).json({ message: 'Post created', postId: result.insertId });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Add a comment to a specific post
export const addCommentToPost = async (req, res) => {
  const db = getDB();

  const postId = req.params.id;
  const { user_id, content } = req.body;

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

    // Retrieve the newly inserted comment to send back
    const [newComment] = await db.query(
      `SELECT * FROM comments WHERE id = ?`,
      [insertResult.insertId]
    );

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
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
