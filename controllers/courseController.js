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