import { getDB } from "../utils/db.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        
        // create token for auto-login after registration
        const token = jwt.sign(
            { id: result.insertId, email: normalizedEmail },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        // set as cookie for sessions
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 3600000, // 1hour
        })

        const user = {
            id: result.userId,
            username,
            role
        }

        res.status(201).json({
            message: "User registered successfully",
            user
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
        res.cookie('token', token, {
            httpOnly: true,        // Can't access in JS
            secure: false,         // Set true in production (HTTPS)
            sameSite: 'lax',       // Or 'strict'
            maxAge: 3600000        // 1 hour
          });
        res.status(200).json({ message: "Login successful", token,id:user.id })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal server error" })
    }
}


export const logoutUser = (req, res) => {
    // In real life, you'd blacklist the token, but here we just send a message
    res.status(200).json({ message: "User logged out successfully" })
}





//google Login

export const googleLogin = async (req, res) => {
    const { credential } = req.body;

    try {
        console.log("Received ID Token:", credential); // This will log the token received in the POST request.
console.log("Expected Google Client ID:", process.env.GOOGLE_CLIENT_ID); // This logs the client ID from the environment.
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        const db = getDB();
        const [existingUsers] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);

        let user;

        if (existingUsers.length > 0) {
            user = existingUsers[0];
        } else {
            // If new user, register them automatically
            const [result] = await db.execute(
                `INSERT INTO users (username, email, role, created_at) VALUES (?, ?, ?, ?)`,
                [name, email, "student", new Date()]
            );

            user = {
                id: result.insertId,
                username: name,
                email,
                role: "student"
            };
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production
            sameSite: "lax",
            maxAge: 3600000
        });

        res.status(200).json({ message: "Google login successful", user });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ error: "Google login failed" });
    }
};
