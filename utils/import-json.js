import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { connect2DB, getDB } from "./db.js";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON helper
const readJsonFile = async (relativePath) => {
  const filePath = path.join(__dirname, relativePath);
  const fileContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContent);
};

const importDataJson = async () => {
  await connect2DB();
  const db = getDB();

  // ===== COURSES FIRST =====
  const courses = await readJsonFile("../data/courses.json");
  for (const course of courses) {
    await db.execute(
      `INSERT INTO courses (id, title, description)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description)`,
      [course.id, course.title, course.description]
    );
  }

  // ===== LESSONS SECOND =====
  const lessons = await readJsonFile("../data/lessons.json");
  for (const lesson of lessons) {
    await db.execute(
      `INSERT INTO lessons (id, course_id, title, content, example) 
      VALUES (?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE
        course_id = VALUES(course_id),
        title = VALUES(title),
        content = VALUES(content),
        example = VALUES(example)`,
      [lesson.id, lesson.course_id, lesson.title, lesson.content, lesson.example]
    );
  }

  // ===== EXERCISES THIRD =====
  const exercises = await readJsonFile("../data/exercises.json");
  for (const exercise of exercises) {
    await db.execute(
      `INSERT INTO exercises (id, lesson_id, title, description, xp_reward, difficulty)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        lesson_id = VALUES(lesson_id),
        title = VALUES(title),
        description = VALUES(description),
        xp_reward = VALUES(xp_reward),
        difficulty = VALUES(difficulty)`,
      [
        exercise.id,
        exercise.lesson_id,
        exercise.title,
        exercise.description,
        exercise.xp_reward,
        exercise.difficulty,
      ]
    );
  }

  console.log("✅ All data imported successfully!");
  await db.end();
};

importDataJson();
