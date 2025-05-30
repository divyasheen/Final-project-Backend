import express from 'express';
import {
  getCoursesWithLessons,
  getExercisesForLesson,
  getLessonContent,
  getExerciseById,
  trackExerciseCompletion, getNextIncompleteExercise, getUserExerciseProgress,
  completeCourse
} from '../controllers/courseController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all courses with their lessons
router.get('/', async (req, res, next) => {
  try {
    const courses = await getCoursesWithLessons();
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'No courses found' });
    }
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    next(error);
  }
});

router.get('/:courseId/lessons/:lessonId/exercises', async (req, res, next) => {
  try {
    const exercises = await getExercisesForLesson(req.params.lessonId);
    if (!exercises || exercises.length === 0) {
      return res.status(404).json({ message: 'No exercises found for this lesson' });
    }
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    next(error);
  }
});

router.get('/lessons/:lessonId', async (req, res, next) => {
  try {
    const lesson = await getLessonContent(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    next(error);
  }
});


router.get('/exercises/:exerciseId', async (req, res, next) => {
  try {
    const exercise = await getExerciseById(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    next(error);
  }
});
router.post('/exercises/:id/complete', authenticateUser, async (req, res) => {
  try {
    await trackExerciseCompletion(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/exercises/:id/next', authenticateUser, async (req, res) => {
  try {
    const nextExerciseId = await getNextIncompleteExercise(req.user.id, req.params.id);
    res.json({ nextExerciseId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get lesson progress
router.get('/lessons/:lessonId/progress', authenticateUser, async (req, res) => {
  try {
    const progress = await getUserExerciseProgress(req.user.id, req.params.lessonId);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Future Code to fetch dependency for badges Id 1----- 
router.post('/:courseId/complete', async (req, res) => {

  const userId = req.body.user_id;
  const lessonId = req.params.lesson_id;

  try {
    await completeCourse(userId, courseId);
    res.status(200).json({ message: 'Course completed and badges checked.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error completing course.' });
  } finally {
    connection.release();
  }
});

export default router;
