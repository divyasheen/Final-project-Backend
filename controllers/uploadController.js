//JB: Disclaimer: It is just me playing around with stuff

import { getDB } from '../utils/db.js';

// ------------ USERPICTURE - UPLOADER ----------------

export const uploadPicture = async (req, res) => {

  const db = getDB();

  if (!req.file) {
    return res.status(400).json({ error: 'Keine Datei hochgeladen' });
  }

  const { name, type } = req.file;
  const {userId} = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO user_images (user_id, image, mime_type) VALUES (?, ?, ?)',
      [userId, name, type]
    );
    res.status(201).json({ message: 'Bild gespeichert', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Speichern in DB' });
  }
};