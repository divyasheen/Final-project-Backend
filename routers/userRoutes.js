import express from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { 
  getUserProgress, 
  getUserById,
  getCurrentUser,
  editUser,
} from '../controllers/userController.js';
import { uploadPicture } from '../controllers/uploadController.js';
import upload from '../middlewares/uploadFiles.js';

const router = express.Router();

// Get user progress summary
router.get('/progress', authenticateUser, getUserProgress);

// Get user by ID (public info)
router.get('/:id', getUserById);

// Get current authenticated user's details
router.get('/me', authenticateUser, getCurrentUser);

//JB: edit User profile
router.patch("/:id/edit", editUser)

// JB: Try-and-Error pic uplaod
router.post("/:id/upload", upload.single('image'), uploadPicture)

export default router;