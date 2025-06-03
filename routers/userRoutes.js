import express from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { 
  getUserProgress, 
  getUserById,
  getCurrentUser,
} from '../controllers/userController.js';

const router = express.Router();

// Get user progress summary
router.get('/progress', authenticateUser, getUserProgress);

// Get user by ID (public info)
router.get('/:id', getUserById);

// Get current authenticated user's details
router.get('/me', authenticateUser, getCurrentUser);

export default router;