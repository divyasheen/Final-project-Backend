import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import {
  getUserProgress,
  getUserById,
  getCurrentUser,
  editUser,
  getBadges,
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

// JB: get the badges of an user
router.get("/:id/getBadges", getBadges)

export default router;
