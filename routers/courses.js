import express from "express";
import {
  getCoursesWithLessons,
  getExercisesForLesson,
  getLessonContent,
  getExerciseById,
  trackExerciseCompletion,
  getNextIncompleteExercise,
  getNextLesson,
  getUserExerciseProgress,
  getExercisesForCourse,
  //completeCourse,
} from "../controllers/courseController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all courses with their lessons
router.get("/", async (req, res, next) => {
  try {
    const courses = await getCoursesWithLessons();
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    next(error);
  }
});

router.get("/:courseId/lessons/:lessonId/exercises", async (req, res, next) => {
  try {
    const exercises = await getExercisesForLesson(req.params.lessonId);
    if (!exercises || exercises.length === 0) {
      return res
        .status(404)
        .json({ message: "No exercises found for this lesson" });
    }
    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    next(error);
  }
});
router.get("/:courseId/exercises", authenticateUser, async (req, res, next) => {
  try {
    const exercises = await getExercisesForCourse(
      req.params.courseId, 
      req.user.id
    );
    if (!exercises || exercises.length === 0) {
      return res.status(404).json({ message: "No exercises found for this course" });
    }
    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    next(error);
  }
});
router.get("/lessons/:lessonId", async (req, res, next) => {
  try {
    const lesson = await getLessonContent(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
   // Return course_id with lesson data
    res.json({
      ...lesson,
      course_id: lesson.course_id
    });
  } catch (error) {
    next(error);
  }
});

router.get("/exercises/:exerciseId", async (req, res, next) => {
  try {
    const exercise = await getExerciseById(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
   // Return course_id with exercise data
    res.json({
      ...exercise,
      course_id: exercise.course_id
    });
  } catch (error) {
    next(error);
  }
});
router.post("/exercises/:id/complete", authenticateUser, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    if (!req.params.id) {
      return res.status(400).json({ error: "Exercise ID is required" });
    }

    await trackExerciseCompletion(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error in completion endpoint:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/exercises/:id/next", authenticateUser, async (req, res) => {
  try {
    const nextExerciseId = await getNextIncompleteExercise(
      req.user.id,
      req.params.id
    );
    res.json({ nextExerciseId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/lessons/:id/next", authenticateUser, async (req, res) => {
  try {
    const nextLesson = await getNextLesson(req.user.id, req.params.id);
    
    // Get course ID for the current lesson
    const currentLesson = await getLessonContent(req.params.id);
    
    res.json({ 
      nextLessonId: nextLesson?.id || nextLesson,
      course_id: currentLesson.course_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// New endpoint: Get course ID by exercise ID
router.get("/exercises/:exerciseId/course", async (req, res) => {
  try {
    const exercise = await getExerciseById(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.json({ course_id: exercise.course_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lesson progress
router.get(
  "/lessons/:lessonId/progress",
  authenticateUser,
  async (req, res) => {
    try {
      const progress = await getUserExerciseProgress(
        req.user.id,
        req.params.lessonId
      );
      res.json(progress);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* // --- Future Code to fetch dependency for badges Id 1-----
router.post("/:courseId/complete", async (req, res) => {
  const userId = req.body.user_id;
  const lessonId = req.params.lesson_id;

  try {
    await completeCourse(userId, courseId);
    res.status(200).json({ message: "Course completed and badges checked." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error completing course." });
  } finally {
    connection.release();
  }
}); */

export default router;
