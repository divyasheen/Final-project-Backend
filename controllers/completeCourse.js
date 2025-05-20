async function completeCourse(userId, courseId, connection) {
    try {
      await connection.beginTransaction();
  
      // 1. Kurs speichern (INSERT IGNORE = kein Fehler bei Doppelung)
      await connection.execute(
        `INSERT IGNORE INTO user_progress (user_id, lesson_id) VALUES (?, ?)`,
        [userId, lessonId]
      );
  
      // 2. Kursanzahl zählen
      const [rows] = await connection.execute(
        `SELECT COUNT(*) AS count FROM user_progress WHERE user_id = ?`,
        [userId]
      );
      const completedCount = parseInt(rows[0].count);
  
      // 3. Badge vergeben, wenn 9 lessons gezählt wurden
       if (completedCount === 9) {
        const [badgeRows] = await connection.execute(
          `SELECT id FROM badges WHERE dependency = '"complete_the_first_course"'`
        );
        const badgeId = badgeRows[0]?.id;
  
        if (badgeId) {
          await connection.execute(
            `INSERT IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)`,
            [userId, badgeId]
          );
        }
      }
  
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    }
  }