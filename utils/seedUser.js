import { connect2DB, getDB } from "./db.js";

const seedUser = async () => {
  await connect2DB();

  const db = getDB();

  const insertQuery = `INSERT INTO users (name, email, age, is_admin)
        VALUES (?, ?, ?, ?)`;

  try {
    const [result] = await db.execute(insertQuery, [
      "Andy",
      "mail@andy.com",
      25,
      false,
    ]);

    console.log(`✅ User seeded with ID: ${result.insertId}`);
  } catch (err) {
    console.error("❌ Error seeding user:", err.message);
  }
};

seedUser();
