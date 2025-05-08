import { getDB } from "../utils/db.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const { username, email, password, role = "student" } = req.body

    const normalizedEmail = email.trim().toLowerCase()
    console.log("Attempting to register:", normalizedEmail);


    try {
        const hashedPassword = await hashPassword(password);

        const db = getDB();

        const [existing] = await db.execute(`SELECT id FROM users WHERE email = ?`, [normalizedEmail])
        if (existing.length > 0) {
            return res.status(400).json({ error: "Email still in use" })
        }

        const [result] = await db.execute(
            `INSERT INTO users (username, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)`,
            [username, normalizedEmail, hashedPassword, role, new Date()]
        )

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        })
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                error: "Email already in use"
            })
        }
        console.error(error)
        res.status(500).json({
            error: "Internal server error"
        })
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body

    const normalizedEmail = email.trim().toLowerCase()
    console.log("Attempting to login:", normalizedEmail);

    const db = getDB() 

    try {
        const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [normalizedEmail])
        if (rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" })
        }

        const user = rows[0]
        const isMatch = await comparePassword(password, user.password_hash)
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" })
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.status(200).json({ message: "Login successful", token })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal server error" })
    }
}


export const logoutUser = (req, res) => {
    // In real life, you'd blacklist the token, but here we just send a message
    res.status(200).json({ message: "User logged out successfully" })
}
