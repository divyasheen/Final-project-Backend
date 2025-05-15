import express from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/authController.js';
import { validateUser,loginValidationUser } from '../middlewares/validateUser.js';
import { googleLogin } from '../controllers/authController.js';
const router = express.Router();

router.post("/register", validateUser, registerUser)
router.post("/login",loginValidationUser, loginUser)
router.post("/logout", logoutUser)
router.post("/google-login", googleLogin);

export default router;