import { getDB } from '../utils/db.js';

export const getCoursesWithLessons = async () => {
  const db = getDB();
  
  // Get all courses
  const [courses] = await db.query('SELECT id, title, description FROM courses ORDER BY id');
  
  // Get lessons for each course
  for (const course of courses) {
    const [lessons] = await db.query(
      'SELECT id, title, content FROM lessons WHERE course_id = ? ORDER BY id', // Removed position
      [course.id]
    );
   
    course.lessons = lessons;
  }
  
  return courses;
};

export const getExercisesForLesson = async (lessonId) => {
  const db = getDB();
  const [exercises] = await db.query(
    'SELECT * FROM exercises WHERE lesson_id = ? ORDER BY id',
    [lessonId]
  );
  return exercises;
};

export const getLessonContent = async (lessonId) => {
  const db = getDB();
  const [lesson] = await db.query(
    'SELECT id, title, content FROM lessons WHERE id = ?', // Removed position from SELECT *
    [lessonId]
  );
  return lesson[0];
};

export const getExerciseById = async (exerciseId) => {
  const db = getDB();
  const [exercise] = await db.query(
    'SELECT * FROM exercises WHERE id = ?',
    [exerciseId]
  );
  return exercise[0];
};

export const completeCourse = async (userId, lessonId) => {
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

    // 3. Badge vergeben, wenn 9 lessons gezählt wurden
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
}