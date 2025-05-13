import express from 'express';
import { 
  getCoursesWithLessons, 
  getExercisesForLesson,
  getLessonContent 
} from '../controllers/courseController.js';

const router = express.Router();

// Get all courses with their lessons
router.get('/', async (req, res, next) => {
  try {
    const courses = await getCoursesWithLessons();
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

// Get exercises for a lesson
router.get('/:courseId/lessons/:lessonId/exercises', async (req, res, next) => {
  try {
    const exercises = await getExercisesForLesson(req.params.lessonId);
    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

// Get specific lesson content
router.get('/lessons/:lessonId', async (req, res, next) => {
  try {
    const lesson = await getLessonContent(req.params.lessonId);
    res.json(lesson);
  } catch (error) {
    next(error);
  }
});

export default router;