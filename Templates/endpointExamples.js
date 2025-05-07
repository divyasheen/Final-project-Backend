// GET     /users               → List all users (admin only)
// GET     /users/:id           → Get user by ID
// POST    /users               → Register new user
// PUT     /users/:id           → Update user info
// DELETE  /users/:id           → Delete user (admin only)

// POST    /auth/login          → User login
// POST    /auth/logout         → User logout (client-side mostly)
// GET     /auth/me             → Get current user (based on token)

// GET     /courses             → Get list of all courses
// GET     /courses/:id         → Get single course with modules
// POST    /courses             → Create course (admin only)
// PUT     /courses/:id         → Update course
// DELETE  /courses/:id         → Delete course

// GET     /modules/:id         → Get module by ID
// POST    /courses/:id/modules → Add module to course
// PUT     /modules/:id         → Update module
// DELETE  /modules/:id         → Delete module

// GET     /lessons/:id         → Get lesson content
// POST    /modules/:id/lessons → Create lesson under a module
// PUT     /lessons/:id         → Update lesson
// DELETE  /lessons/:id         → Delete lesson

// GET     /lessons/:id/challenges → Get challenges in lesson
// POST    /lessons/:id/challenges → Add challenge
// GET     /challenges/:id         → Get single challenge
// POST    /challenges/:id/submit  → Submit challenge (validate, award XP)

// GET     /lessons/:id/quiz           → Get quiz for a lesson
// POST    /lessons/:id/quiz           → Create quiz (admin)
// GET     /quizzes/:id/questions      → List all questions
// POST    /quizzes/:id/questions      → Add question
// POST    /quizzes/:id/submit         → Submit answers (auto-grade, award XP)

// GET     /users/:id/progress         → Get user's learning progress
// GET     /users/:id/xp               → Get total XP

// GET     /badges                     → List all badges
// GET     /users/:id/badges           → Get earned badges
// POST    /badges                     → Create new badge (admin)

// GET     /leaderboard                → Get top XP holders

// GET     /lessons/:id/comments       → Get comments on lesson
// POST    /lessons/:id/comments       → Post a comment
// DELETE  /comments/:id               → Delete comment (owner or admin)

// POST    /analytics                  → Log user event (e.g. lesson viewed)
// GET     /analytics                  → Admin-only: see usage data


// ### Example Queries

// Example: Register a new user
// POST /users
// Body:
// {
//   username: "johndoe",
//   email: "john@example.com",
//   password: "secret123",
//   role: "student"
// }

const sqlRegisterUser = `
  INSERT INTO users (username, email, password, role)
  VALUES ('johndoe', 'john@example.com', 'secret123', 'student');
`;

// Example: Get user by ID
// GET /users/1

const sqlGetUserById = `
  SELECT id, username, email, role FROM users WHERE id = 1;
`;

// Example: Create a new course
// POST /courses
// Body:
// {
//   title: "HTML Basics",
//   description: "Learn how to build HTML pages",
//   difficulty: "beginner"
// }

const sqlCreateCourse = `
  INSERT INTO courses (title, description, difficulty)
  VALUES ('HTML Basics', 'Learn how to build HTML pages', 'beginner');
`;

// Example: Submit a quiz
// POST /quizzes/submit
// Body:
// {
//   user_id: 1,
//   quiz_id: 5,
//   score: 90
// }

const sqlSubmitQuiz = `
  INSERT INTO quiz_submissions (user_id, quiz_id, score, submitted_at)
  VALUES (1, 5, 90, NOW());
`;

// Example: Update user XP after completing a challenge
// PATCH /users/1/xp
// Body:
// {
//   xpEarned: 50
// }

const sqlUpdateUserXP = `
  UPDATE users
  SET xp = xp + 50
  WHERE id = 1;
`;

// Example: Get user progress
// GET /users/1/progress

const sqlGetUserProgress = `
  SELECT course_id, lesson_id, completed_at
  FROM user_progress
  WHERE user_id = 1;
`;

// Example: Get user achievements
// GET /users/1/achievements

const sqlGetUserAchievements = `
  SELECT a.id, a.title, a.description, ua.earned_at
  FROM achievements a
  JOIN user_achievements ua ON a.id = ua.achievement_id
  WHERE ua.user_id = 1;
`;

// Example: Add a new achievement to user
// POST /users/1/achievements
// Body:
// {
//   achievement_id: 3
// }

const sqlAddUserAchievement = `
  INSERT INTO user_achievements (user_id, achievement_id, earned_at)
  VALUES (1, 3, NOW());
`;

// Example: Get leaderboard
// GET /leaderboard

const sqlGetLeaderboard = `
  SELECT id, username, xp
  FROM users
  ORDER BY xp DESC
  LIMIT 10;
`;

// Example: Get badges for user
// GET /users/1/badges

const sqlGetUserBadges = `
  SELECT b.id, b.name, b.description, ub.earned_at
  FROM badges b
  JOIN user_badges ub ON b.id = ub.badge_id
  WHERE ub.user_id = 1;
`;

// Example: Admin creates a challenge
// POST /admin/challenges
// Body:
// {
//   course_id: 2,
//   title: "CSS Grid Layout",
//   description: "Complete a grid-based layout",
//   xp_reward: 100
// }

const sqlCreateChallenge = `
  INSERT INTO challenges (course_id, title, description, xp_reward)
  VALUES (2, 'CSS Grid Layout', 'Complete a grid-based layout', 100);
`;

// Example: User submits a challenge
// POST /challenges/submit
// Body:
// {
//   user_id: 1,
//   challenge_id: 7,
//   submission_url: "https://github.com/user/repo",
//   passed: true
// }

const sqlSubmitChallenge = `
  INSERT INTO challenge_submissions (user_id, challenge_id, submission_url, passed, submitted_at)
  VALUES (1, 7, 'https://github.com/user/repo', true, NOW());
`;

// Example: Update user course progress
// PATCH /users/1/progress
// Body:
// {
//   course_id: 2,
//   lesson_id: 6
// }

const sqlUpdateCourseProgress = `
  INSERT INTO user_progress (user_id, course_id, lesson_id, completed_at)
  VALUES (1, 2, 6, NOW())
  ON DUPLICATE KEY UPDATE completed_at = NOW();
`;

// Example: Create a lesson
// POST /admin/lessons
// Body:
// {
//   course_id: 1,
//   title: "Intro to HTML",
//   content: "<p>Welcome to HTML</p>",
//   order: 1
// }

const sqlCreateLesson = `
  INSERT INTO lessons (course_id, title, content, lesson_order)
  VALUES (1, 'Intro to HTML', '<p>Welcome to HTML</p>', 1);
`;

// Example: Create a quiz for a lesson
// POST /admin/quizzes
// Body:
// {
//   lesson_id: 1,
//   question: "What does HTML stand for?",
//   options: ["Hyperlinks and Text Markup Language", "Hyper Text Markup Language", "Home Tool Markup Language"],
//   correct_option: 1
// }

const sqlCreateQuiz = `
  INSERT INTO quizzes (lesson_id, question, options, correct_option)
  VALUES (1, 'What does HTML stand for?', JSON_ARRAY('Hyperlinks and Text Markup Language', 'Hyper Text Markup Language', 'Home Tool Markup Language'), 1);
`;

// Example: Update level based on XP
// PATCH /users/1/level
// XP thresholds are determined in app logic

const sqlUpdateUserLevel = `
  UPDATE users
  SET level = 3
  WHERE id = 1;
`;
