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

/*   // ===== COURSES FIRST =====
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
  } */

  // ===== EXERCISES THIRD =====
  const exercises = await readJsonFile("../data/exercises.json");
  for (const exercise of exercises) {
    await db.execute(
      `INSERT INTO exercises (id, lesson_id, title, description, xp_reward, difficulty, example)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        lesson_id = VALUES(lesson_id),
        title = VALUES(title),
        description = VALUES(description),
        xp_reward = VALUES(xp_reward),
        difficulty = VALUES(difficulty),
        example = VALUES(example)`,
      [
        exercise.id,
        exercise.lesson_id,
        exercise.title,
        exercise.description,
        exercise.xp_reward,
        exercise.difficulty,
        exercise.example
      ]
    );
  }
/*     // ===== TEST CASES FOURTH =====
  const testcases = await readJsonFile("../data/testcases.json");
  for (const testcase of testcases) {
    await db.execute(
      `INSERT INTO testcases 
        (test_id, exercise_id, test_type, selector, property, expected_value, is_hidden, weight, viewport_size, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        exercise_id = VALUES(exercise_id),
        test_type = VALUES(test_type),
        selector = VALUES(selector),
        property = VALUES(property),
        expected_value = VALUES(expected_value),
        is_hidden = VALUES(is_hidden),
        weight = VALUES(weight),
        viewport_size = VALUES(viewport_size),
        error_message = VALUES(error_message)`,
      [
        testcase.test_id,
        testcase.exercise_id,
        testcase.test_type,
        testcase.selector,
        testcase.property || null,          // nullable
        testcase.expected_value,
        testcase.is_hidden || false,
        testcase.weight || 1,
        testcase.viewport_size || null,     // nullable
        testcase.error_message
      ]
    );
  }


  // ===== BADGES FIFTH =====
  const badges = await readJsonFile("../data/badges.json");
  for (const badge of badges) {
    await db.execute(
      `INSERT INTO badges (id, name, description, icon_url, dependency)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        id = VALUES(id),
        name = VALUES(name),
        description = VALUES(description),
        icon_url = VALUES(icon_url),
        dependency = VALUES(dependency)`,
      [
        badge.id,
        badge.name,
        badge.description,
        badge.icon_url,
        badge.dependency
      ]
    );
  } */

  console.log("✅ All data imported successfully!");
  await db.end();
};

importDataJson();
