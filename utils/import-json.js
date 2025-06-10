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
  console.log("Attempting to read JSON from:", filePath);
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
  }*/

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
      [
        lesson.id,
        lesson.course_id,
        lesson.title,
        lesson.content,
        lesson.example,
      ]
    );
  }

  // ===== EXERCISES THIRD =====
  const exercises = await readJsonFile("../data/exercises.json");
  for (const exercise of exercises) {
    const safe = (val, fallback = null) => (val === undefined ? fallback : val);

    await db.execute(
      `INSERT INTO exercises (id, lesson_id, title, description, xp_reward, difficulty, example, placeholder)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    lesson_id = VALUES(lesson_id),
    title = VALUES(title),
    description = VALUES(description),
    xp_reward = VALUES(xp_reward),
    difficulty = VALUES(difficulty),
    example = VALUES(example),
    placeholder = VALUES(placeholder)`,
      [
        safe(exercise.id),
        safe(exercise.lesson_id),
        safe(exercise.title),
        safe(exercise.description),
        safe(exercise.xp_reward, 10),
        safe(exercise.difficulty, "easy"),
        safe(exercise.example),
        safe(exercise.placeholder),
      ]
    );
  }

  // ===== TEST CASES FOURTH =====
  const testcases = await readJsonFile("../data/testcases.json");
  for (const testcase of testcases) {
    try {
      await db.execute(
        `INSERT INTO testcases
            (test_id, exercise_id, test_type, selector, property, expected_value, input_value, is_hidden, weight, viewport_size, error_message, time_limit, description, input)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            exercise_id = VALUES(exercise_id),
            test_type = VALUES(test_type),
            selector = VALUES(selector),
            property = VALUES(property),
            expected_value = VALUES(expected_value),
            input_value = VALUES(input_value),  -- Add this
            is_hidden = VALUES(is_hidden),
            weight = VALUES(weight),
            viewport_size = VALUES(viewport_size),
            error_message = VALUES(error_message),
            time_limit = VALUES(time_limit),    -- Add this
            description = VALUES(description),  -- Add this
            input = VALUES(input)               -- Ensure this is mapped correctly
          `,
        [
          // Ensure parameters match the exact order of columns in the INSERT statement
          testcase.test_id === undefined ? null : testcase.test_id,
          testcase.exercise_id === undefined ? null : testcase.exercise_id,
          testcase.test_type === undefined ? null : testcase.test_type,
          testcase.selector === undefined ? "" : testcase.selector,
          testcase.property === undefined ? "" : testcase.property,
          testcase.expected_value === undefined
            ? null
            : testcase.expected_value,
          // --- NEWLY ADDED/CORRECTED MAPPINGS ---
          testcase.input_value === undefined ? "" : testcase.input_value, // Assuming JSON *might* have this, otherwise null
          testcase.is_hidden === undefined ? false : testcase.is_hidden,
          testcase.weight === undefined ? 1 : testcase.weight,
          testcase.viewport_size === undefined ? null : testcase.viewport_size,
          testcase.error_message === undefined ? "" : testcase.error_message,
          testcase.time_limit === undefined ? 1 : testcase.time_limit, // JSON has this field
          testcase.description === undefined ? "" : testcase.description, // JSON has this field
          testcase.input === undefined ? "" : testcase.input, // This will now correctly map the code
        ]
      );
    } catch (error) {
      console.error(
        "Error inserting/updating testcase:",
        testcase.test_id,
        error
      );
    }
  }
};
importDataJson();

/* // ===== BADGES FIFTH =====
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
