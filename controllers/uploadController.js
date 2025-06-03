//JB: Disclaimer: It is just me playing around with stuff

/* import { getDB } from "../utils/db";

// ------------ USERPICTURE - UPLOADER ----------------

export const uploadPicture = async (req, res, next) => {
    try {

        const db = getDB();

      // JB: Get informations for storing them later in DB
      const username = req.body.username;
      const pictureBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;
  
      //JB: store Data inside the DB
      await db.execute(
        'INSERT INTO users (username, avatar, avatar_mime) VALUES (?, ?, ?)',
        [username, pictureBuffer, mimeType]
      );
  
      // JB: Send respond if sucessfull
      res.send('Bild gespeichert!');
    } catch (error) {
      next(error);
    }
  }; */