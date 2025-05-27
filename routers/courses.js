import express from 'express';
import {
  getCoursesWithLessons,
  getExercisesForLesson,
  getLessonContent,
  getExerciseById,
  trackExerciseCompletion, getNextIncompleteExercise,
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
// Get user progress summary
router.get('/api/user/progress', authenticateUser, async (req, res) => {
  try {
    const db = getDB();
    
    // Get total exercises count
    const [total] = await db.execute(
      `SELECT COUNT(*) AS count FROM exercises`
    );
    
    // Get completed exercises count
    const [completed] = await db.execute(
      `SELECT COUNT(*) AS count FROM user_exercise_progress 
       WHERE user_id = ? AND is_completed = TRUE`,
      [req.user.id]
    );
    
    // Get next incomplete exercise
    const [nextExercise] = await db.execute(
      `SELECT e.id, e.title 
       FROM exercises e
       LEFT JOIN user_exercise_progress uep ON e.id = uep.exercise_id AND uep.user_id = ?
       WHERE uep.is_completed IS NULL OR uep.is_completed = FALSE
       ORDER BY e.id
       LIMIT 1`,
      [req.user.id]
    );
    
    res.json({
      totalExercises: total[0].count,
      completedExercises: completed[0].count,
      nextExercise: nextExercise[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get lesson progress
router.get('/lessons/:lessonId/progress', authenticateUser, async (req, res) => {
  try {
    const db = getDB();
    
    const [exercises] = await db.execute(
      `SELECT e.id, e.title, 
              CASE WHEN uep.is_completed THEN 1 ELSE 0 END AS completed
       FROM exercises e
       LEFT JOIN user_exercise_progress uep ON e.id = uep.exercise_id AND uep.user_id = ?
       WHERE e.lesson_id = ?
       ORDER BY e.id`,
      [req.user.id, req.params.lessonId]
    );
    
    res.json(exercises);
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
