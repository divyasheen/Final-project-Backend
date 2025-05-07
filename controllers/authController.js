import { db } from "../utils/db.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const { username, email, password} = req.Body

    try {
        const hashedPassword = await hashPassword(password);

        const [result] = await db.execute(
            `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
            [username, email, password]
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

