import { getDB } from '../utils/db.js';

export const getCoursesWithLessons = async () => {
  const db = getDB();
  
  // Get all courses
  const [courses] = await db.query('SELECT * FROM courses ORDER BY id');
  
  // Get lessons for each course
  for (const course of courses) {
    const [lessons] = await db.query(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY id',
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
    'SELECT * FROM lessons WHERE id = ?',
    [lessonId]
  );
  return lesson[0];
};