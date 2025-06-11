import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  getUserProgress,
  getUserById,
  getCurrentUser,
  editUser,
} from "../controllers/userController.js";
import { getImage, uploadImage } from "../controllers/uploadController.js";
import multer from "multer";
import { getDB } from "../utils/db.js";

// JB: I need this for the image uploader
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Get user progress summary
router.get("/progress", authenticateUser, getUserProgress);

// Get user by ID (public info)
router.get("/:id", getUserById);

// Get current authenticated user's details
router.get("/me", authenticateUser, getCurrentUser);

//JB: edit User profile
router.patch("/:id/edit", editUser);

// JB: upload image into bucket and DB
router.post("/:id/upload", upload.single("image"), uploadImage);

// JB: get avatar
router.get("/:id/getProfilPic", getImage);

router.get("/:id/getBadges", async(req, res) => {

  const db = getDB(); 
  const id = req.params.id;

  try {
    const [userBadges] = await db.execute(
      `SELECT badge_id 
       FROM user_badges 
       WHERE user_id = ?`,
       [id]
    );

     const badgeDetails = [];

    for (let badge of userBadges) {

      const [badgeInfo] = await db.execute(
        `SELECT name, description
        FROM badges 
        WHERE id = ?`,
        [badge.badge_id]
      )
          badgeDetails.push(badgeInfo[0]);
      }

      res.json({badges: badgeDetails});

  } catch (error) {
    throw err;
  }
})

export default router;
