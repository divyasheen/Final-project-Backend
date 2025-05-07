import express from 'express';

const router = express.Router();

router.post("/register", (req, res) => {
    res.status(200).json({ msg: "User registered successfully!" });
})
router.post("/login", (req, res) => {
    res.status(200).json({ msg: "User logged in successfully!" });
})
router.post("/logout", (req, res) => {
    res.status(200).json({ msg: "User logged out successfully!" });
})

export default router;