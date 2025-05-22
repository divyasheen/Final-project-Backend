import { getDB } from "../utils/db.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';
import {verifyEmailTemplate, verifyUserByEmail, passwordResetTemplate } from "../utils/mail.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);






// Register a new user and send a verification email
export const registerUser = async (req, res) => {
  const { username, email, password, role = "student" } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  console.log("Attempting to register:", normalizedEmail);

  try {
    const hashedPassword = await hashPassword(password);
    const db = getDB();

    const [existing] = await db.execute(
      `SELECT id FROM users WHERE email = ?`,
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email still in use" });
    }

    const [result] = await db.execute(
      `INSERT INTO users (username, email, password_hash, role,  created_at, verified) VALUES (?, ?, ?, ?, ?, ?)`,
      [username, normalizedEmail, hashedPassword, role, new Date(), 0]
    );

    const userId = result.insertId;

    // Generate verification token
    const verifyToken = jwt.sign(
      { id: userId, email: normalizedEmail },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );


    // Send verification email
    const html = verifyEmailTemplate(username, verifyToken);
    await verifyUserByEmail(normalizedEmail, "Verify your account", html);

    res.status(201).json({
      message: "User registered. Please check your email to verify your account.",
    
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};







// Email verification endpoint using token from URL params
export const verifyUser = async (req, res) => {
  const { token } = req.params;
  console.log("Received token:", token);

  const db = getDB();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    if (!decoded) {
      return res.status(400).json({ error: "Invalid token" });
    }
    // Mark user as verified in DB
    await db.execute(`UPDATE users SET verified = 1 WHERE id = ?`, [decoded.id]);

    return res.redirect("http://localhost:5173/verification-success"); // Redirect on successful verification
  } catch (error) {
    console.error("Verification error:", error);
    res.redirect("http://localhost:5173/verification-error"); // Redirect on error
  }
};














// Login a user with email & password
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const db = getDB();

  try {
    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [normalizedEmail]);
    if (rows.length === 0) return res.status(400).json({ error: "Invalid email or password" });

    const user = rows[0];
    
    // Check if email is verified
    if (!user.verified) return res.status(401).json({ error: "Email not verified" });

    // Check password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    // Generate JWT and set it as a cookie
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    });

    res.status(200).json({ message: "Login successful", token, id: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};










// Log out user (placeholder, no token blacklisting here)
export const logoutUser = (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
};

// Google OAuth login using ID token from client
export const googleLogin = async (req, res) => {
  const { credential } = req.body;
  const db = getDB();

  try {
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check if user exists; if not, create a new one and mark as verified
    const [existingUsers] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);

    let user;
    if (existingUsers.length > 0) {
      user = existingUsers[0];
    } else {
      const [result] = await db.execute(
        `INSERT INTO users (username, email, role, created_at, verified) VALUES (?, ?, ?, ?, 1)`,
        [name, email, "student", new Date()]
      );

      user = { id: result.insertId, username: name, email, role: "student" };
    }

    // Generate and return JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3600000
    });

    res.status(200).json({ message: "Google login successful", user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ error: "Google login failed" });
  }
};












// Send password reset link to user's email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const db = getDB();
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [users] = await db.execute(`SELECT id, username FROM users WHERE email = ?`, [normalizedEmail]);
    if (users.length === 0) return res.status(400).json({ error: "Email not found" });

    const user = users[0];

    // Create reset token and send reset email
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    //Give the url token 
    const html = passwordResetTemplate(user.username, token);
    const result = await verifyUserByEmail(email, "Reset Your Password", html);
        
        
    if (result.success) {
      res.status(200).json({ message: "Reset link sent to email" });
    } else {
      res.status(500).json({ error: "Email could not be sent" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};








// Handle password reset with a new password and token
export const resetPassword = async (req, res) => {
  //Getting the token and the new pass
  const { token, newPassword } = req.body;
  
  const db = getDB();

  try {
    // Verify the token AND Verify if it's the user 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash new password and update DB
    const hashedPassword = await hashPassword(newPassword);
    await db.execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [hashedPassword, decoded.id]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};



//Send the user a Verification  button to his/her email



export const resendVerification = async (req, res) => {
  const { email } = req.body;
  const db = getDB();
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [users] = await db.execute(
      `SELECT id, username, verified FROM users WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) return res.status(404).json({ error: "User not found" });

    const user = users[0];

    if (user.verified) {
      return res.status(400).json({ error: "User already verified" });
    }

    const verifyToken = jwt.sign(
      { id: user.id, email: normalizedEmail },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const html = verifyEmailTemplate(user.username, verifyToken);
    await verifyUserByEmail(normalizedEmail, "Verify your account", html);

    res.status(200).json({ message: "Verification email resent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
