const router = express.Router();

router.post("/register", user_validations, registerUser);
router.post("/login", loginValidation, loginUser);
router.get("/verify/:token", verifyUser);


export default router;
