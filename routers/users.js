import express from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/authController.js';
import { validateUser } from '../middlewares/validateUser.js';

const router = express.Router();

router.post("/register", validateUser, registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)

export default router;