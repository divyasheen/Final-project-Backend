import express from 'express';
import { loginUser, logoutUser, registerUser,verifyUser,googleLogin,forgotPassword,resetPassword, resendVerification } from '../controllers/authController.js';
import { validateUser,loginValidationUser } from '../middlewares/validateUser.js';
const router = express.Router();

router.post("/register", validateUser, registerUser)
router.post("/login",loginValidationUser, loginUser)
router.post("/logout", logoutUser)
router.post("/google-login", googleLogin);
router.get('/verify/:token', verifyUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post('/resend-verification',resendVerification)
export default router;