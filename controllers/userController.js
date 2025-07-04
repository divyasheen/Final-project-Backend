import { getDB } from "../utils/db.js";

export const getUserProgress = async (req, res) => {
  try {
    const db = getDB();

    const [total] = await db.execute(`SELECT COUNT(*) AS count FROM exercises`);

    const [completed] = await db.execute(
      `SELECT COUNT(*) AS count FROM user_exercise_progress 
       WHERE user_id = ? AND is_completed = TRUE`,
      [req.user.id]
    );

    const [nextExercise] = await db.execute(
      `SELECT e.id, e.title 
       FROM exercises e
       LEFT JOIN user_exercise_progress uep 
       ON e.id = uep.exercise_id AND uep.user_id = ?
       WHERE uep.is_completed IS NULL OR uep.is_completed = FALSE
       ORDER BY e.id
       LIMIT 1`,
      [req.user.id]
    );
/* 
    const [badgesNames] = await db.execute(
      `SELECT badge_id 
       FROM user_badges 
       WHERE id = ?`,
      [req.user.id]
    ); */

    res.json({
      totalExercises: total[0].count,
      completedExercises: completed[0].count,
      nextExercise: nextExercise[0] || null,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const db = getDB();
    const userId = req.params.id;

    // Get user basic info
    const [users] = await db.execute(
      `SELECT *
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Calculate level (assuming 1000 XP per level)
    const level = Math.floor(user.xp / 1000);

    // Get user badges count
    const [badges] = await db.execute(
      `SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?`,
      [userId]
    );
    
    // Get user rank (simplified example - you might need a more complex query)
    const [rank] = await db.execute(
      `SELECT 
        (SELECT COUNT(*) + 1 
         FROM users 
         WHERE xp > (SELECT xp FROM users WHERE id = ?)
        ) as user_rank`,
      [userId]
    );

    const badgeConditions = [
      { count: 1, badge_id: 1 },
      { count: 5, badge_id: 2 },
      { count: 10, badge_id: 3 },
      { count: 20, badge_id: 4 },
    ];

    const [completedTotal] = await db.execute(
      `SELECT COUNT(*) AS count FROM user_exercise_progress
      WHERE user_id = ? AND is_completed = TRUE`,
      [userId]
    );

    for (const badge of badgeConditions) {
      if (completedTotal[0].count >= badge.count) {
        await db.execute(
          `INSERT IGNORE INTO user_badges (user_id, badge_id, assigned_at) VALUES (?, ?, NOW())`,
          [userId, badge.badge_id]
        );
      }
    }

    res.json({
      ...user,
      level,
      badgesCount: badges[0].count,
      rank: rank[0].user_rank,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const db = getDB();

    // Since we're using authenticateUser middleware, req.user is available
    const [users] = await db.execute(
      `SELECT id, username, email, role, xp, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Get user badges count
    const [badges] = await db.execute(
      `SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?`,
      [req.user.id]
    );

    // Get user rank
    const [rank] = await db.execute(
      `SELECT COUNT(*) + 1 as rank FROM users WHERE xp > ?`,
      [user.xp || 0]
    );

    res.json({
      ...user,
      badgesCount: badges[0].count,
      rank: rank[0].rank,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editUser = async (req, res) => {
  console.log("Request body:", req.body);

  // JB: destructure the body
  const { id, location, info, social } = req.body;
  const db = getDB();

  try {
    // JB: Say the db what it has to do with the informations from the body if they are longer than 0 (update .. duuuh!)
    if (location && location.trim().length > 0) {
      await db.execute(`UPDATE users SET location = ? WHERE id = ?`, [
        location,
        id,
      ]);
    }

    if (social && social.trim().length > 0) {
      await db.execute(`UPDATE users SET social = ? WHERE id = ?`, [
        social,
        id,
      ]);
    }

    if (info && info.trim().length > 0) {
      await db.execute(`UPDATE users SET info = ? WHERE id = ?`, [info, id]);
    }

    if (!location && !social && !info) {
      return res.status(400).send("No values to update");
    }

    //JB: Celebrate the victory!!
    res.status(200).send("Profil aktualisiert");

    //JB: Weak code will catch errors ... well ... yeah ... story of my backend life!
  } catch (err) {
    console.error(err);
    res.status(500).send("Fehler beim Aktualisieren");
  }
};

export const getBadges = async(req, res) => {
  const db = getDB(); 
  const id = req.params.id;

  try {
    const [userBadges] = await db.execute(
      `SELECT badge_id 
       FROM user_badges 
       WHERE user_id = ?`,
       [id]
    );

     const badgeDetails = [];

    for (let badge of userBadges) {

      const [badgeInfo] = await db.execute(
        `SELECT *
        FROM badges 
        WHERE id = ?`,
        [badge.badge_id]
      )
          badgeDetails.push(badgeInfo[0]);
      }

      res.json({badges: badgeDetails});

  } catch (error) {
    throw err;
  }
}
