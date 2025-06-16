import { getDB } from "../utils/db.js";

export const getCoursesWithLessons = async () => {
  const db = getDB();

  // Get all courses
  const [courses] = await db.query(
    "SELECT id, title, description FROM courses ORDER BY id"
  );

  // Get lessons for each course
  for (const course of courses) {
    const [lessons] = await db.query(
      "SELECT id, title, content, example FROM lessons WHERE course_id = ? ORDER BY id", // Removed position
      [course.id]
    );

    course.lessons = lessons;
  }

  return courses;
};

export const getExercisesForLesson = async (lessonId) => {
  const db = getDB();
  const [exercises] = await db.query(
    "SELECT * FROM exercises WHERE lesson_id = ? ORDER BY id",
    [lessonId]
  );
  return exercises;
};

export const getLessonContent = async (lessonId) => {
  const db = getDB();
  const [lesson] = await db.query(
    "SELECT id, title, content, example FROM lessons WHERE id = ?", // Removed position from SELECT *
    [lessonId]
  );
  return lesson[0];
};

export const getExerciseById = async (exerciseId) => {
  const db = getDB();
  const [exercise] = await db.query("SELECT * FROM exercises WHERE id = ?", [
    exerciseId,
  ]);
  return exercise[0];
};

export const trackExerciseCompletion = async (userId, exerciseId) => {
  // Validate inputs
  if (!userId) throw new Error("User ID is required");
  if (!exerciseId) throw new Error("Exercise ID is required");

  const db = getDB();

  try {
    await db.beginTransaction();

    // Convert to numbers and validate
    const numericUserId = Number(userId);
    const numericExerciseId = Number(exerciseId);
    
    if (isNaN(numericUserId)) throw new Error("Invalid User ID");
    if (isNaN(numericExerciseId)) throw new Error("Invalid Exercise ID");

    // Check if exercise was already completed before
    const [existingProgress] = await db.execute(
      `SELECT is_completed FROM user_exercise_progress 
       WHERE user_id = ? AND exercise_id = ?`,
      [numericUserId, numericExerciseId]
    );

    const wasAlreadyCompleted = existingProgress.length > 0 && existingProgress[0].is_completed;

    // Mark exercise as completed (or update timestamp if already completed)
    await db.execute(
      `INSERT INTO user_exercise_progress 
       (user_id, exercise_id, is_completed, completed_at) 
       VALUES (?, ?, TRUE, NOW())
       ON DUPLICATE KEY UPDATE is_completed = TRUE, completed_at = NOW()`,
      [numericUserId, numericExerciseId]
    );

    // Get exercise details
    const [exercise] = await db.execute(
      `SELECT xp_reward, lesson_id FROM exercises WHERE id = ?`,
      [numericExerciseId]
    );

    if (exercise.length > 0) {
      const xpReward = exercise[0].xp_reward;
      const lessonId = exercise[0].lesson_id;

      // Only award XP if this is the first completion
      if (!wasAlreadyCompleted) {
        // Update user's XP
        await db.execute(
          `UPDATE users SET xp = xp + ? WHERE id = ?`, 
          [xpReward, numericUserId]
        );

        // Check lesson completion (only if this was a new exercise completion)
        const [allExercises] = await db.execute(
          `SELECT id FROM exercises WHERE lesson_id = ?`,
          [lessonId]
        );

        const [completedExercises] = await db.execute(
          `SELECT COUNT(*) AS count FROM user_exercise_progress 
           WHERE user_id = ? AND exercise_id IN 
           (SELECT id FROM exercises WHERE lesson_id = ?) AND is_completed = TRUE`,
          [numericUserId, lessonId]
        );

        if (completedExercises[0].count === allExercises.length) {
          await db.execute(
            `INSERT INTO user_progress (user_id, lesson_id, xp_earned, completed_at)
             VALUES (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE xp_earned = VALUES(xp_earned), completed_at = NOW()`,
            [numericUserId, lessonId, xpReward * allExercises.length]
          );
        }
      }

      // Award badges (we still want to check badges even if XP wasn't awarded)
      const badgeConditions = [
        { count: 1, badge_id: 1 },
        { count: 5, badge_id: 2 },
        { count: 10, badge_id: 3 },
        { count: 20, badge_id: 4 },
      ];

      const [completedTotal] = await db.execute(
        `SELECT COUNT(*) AS count FROM user_exercise_progress 
         WHERE user_id = ? AND is_completed = TRUE`,
        [numericUserId]
      );

      for (const badge of badgeConditions) {
        if (completedTotal[0].count >= badge.count) {
          await db.execute(
            `INSERT IGNORE INTO user_badges (user_id, badge_id, assigned_at) 
             VALUES (?, ?, NOW())`,
            [numericUserId, badge.badge_id]
          );
        }
      }
    }

    await db.commit();
  } catch (err) {
    await db.rollback();
    console.error("Database error in trackExerciseCompletion:", {
      userId,
      exerciseId,
      error: err.message
    });
    throw err;
  }
};
export const getUserExerciseProgress = async (userId, lessonId) => {
  const db = getDB();

  const [progress] = await db.execute(
    `SELECT e.id, e.title, uep.is_completed, uep.completed_at
     FROM exercises e
     LEFT JOIN user_exercise_progress uep ON e.id = uep.exercise_id AND uep.user_id = ?
     WHERE e.lesson_id = ?
     ORDER BY e.id`,
    [userId, lessonId]
  );

  return progress;
};

export const getNextIncompleteExercise = async (userId, currentExerciseId) => {
  const db = getDB();

  // Get current exercise's lesson and course
  const [currentExercise] = await db.execute(
    `SELECT e.lesson_id, l.course_id 
     FROM exercises e
     JOIN lessons l ON e.lesson_id = l.id
     WHERE e.id = ?`,
    [currentExerciseId]
  );

  if (currentExercise.length === 0) return null;

  const lessonId = currentExercise[0].lesson_id;
  const courseId = currentExercise[0].course_id;

  // Find next incomplete exercise in same lesson
  const [nextExercise] = await db.execute(
    `SELECT e.id 
     FROM exercises e
     LEFT JOIN user_exercise_progress uep ON e.id = uep.exercise_id AND uep.user_id = ?
     WHERE e.lesson_id = ? AND (uep.is_completed IS NULL OR uep.is_completed = FALSE)
     ORDER BY e.id
     LIMIT 1`,
    [userId, lessonId]
  );

  if (nextExercise.length > 0) {
    return nextExercise[0].id;
  }

  // If all exercises in lesson are completed, find next lesson's first exercise
  const [nextLesson] = await db.execute(
    `SELECT l.id 
     FROM lessons l
     WHERE l.course_id = ? AND l.id > ?
     ORDER BY l.id
     LIMIT 1`,
    [courseId, lessonId]
  );

  if (nextLesson.length > 0) {
    const [firstExercise] = await db.execute(
      `SELECT id FROM exercises WHERE lesson_id = ? ORDER BY id LIMIT 1`,
      [nextLesson[0].id]
    );

    if (firstExercise.length > 0) {
      return firstExercise[0].id;
    }
  }

  return null; // No more exercises
};

export const getNextLesson = async (userId, currentLessonId) => {
  const db = getDB();
  
  // Get current lesson's course
  const [current] = await db.execute(
    `SELECT course_id FROM lessons WHERE id = ?`,
    [currentLessonId]
  );
  if (current.length === 0) return null;

  // Check if all exercises in current lesson are completed
  const [completed] = await db.execute(
    `SELECT COUNT(*) as count FROM user_exercise_progress
     WHERE user_id = ? AND exercise_id IN 
     (SELECT id FROM exercises WHERE lesson_id = ?) AND is_completed = TRUE`,
    [userId, currentLessonId]
  );

  const [total] = await db.execute(
    `SELECT COUNT(*) as count FROM exercises WHERE lesson_id = ?`,
    [currentLessonId]
  );

  // Only proceed if current lesson is complete
  if (completed[0].count < total[0].count) return null;

  // Get next lesson in same course
  const [next] = await db.execute(
    `SELECT id FROM lessons 
     WHERE course_id = ? AND id > ?
     ORDER BY id LIMIT 1`,
    [current[0].course_id, currentLessonId]
  );

  return next.length > 0 ? next[0].id : null;
};
/* export const completeCourse = async (userId, lessonId) => {
  try {

    // JB: Starts transaction - Which means that EVERY DB commands will start - all or none.  
    await db.beginTransaction();

    // JB: The exercise will be stored inside the user_progress. If the user-lesson-combination already exists, it get ignored and nothing is added in the BE
    await db.execute(
      `INSERT IGNORE INTO user_progress (user_id, lesson_id) VALUES (?, ?)`,
      [userId, lessonId]
    );

    // JB: The  users get count
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS count FROM user_progress WHERE user_id = ?`,
      [userId]
    );

    // JB: 
    const completedCount = parseInt(rows[0].count);

    // 
     if (completedCount === 9) {
      const [badgeRows] = await db.execute(
        `SELECT id FROM badges WHERE dependency = '"complete_the_first_course"'`
      );
      const badgeId = badgeRows[0]?.id;

      if (badgeId) {
        await db.execute(
          `INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)`,
          [userId, badgeId]
        );
      }
    }

    await db.commit();
  } catch (err) {
    await db.rollback();
    throw err;
  }
} */
