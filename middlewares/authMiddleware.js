import jwt from 'jsonwebtoken';
import { getDB } from '../utils/db.js';

export const authenticateUser = async (req, res, next) => {
  try {
    // 1. Get token from headers, cookies, or query params
    const token = req.headers.authorization?.split(' ')[1] || 
                 req.cookies?.token || 
                 req.query?.token;
   console.log("token",token);

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 2. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Verify user exists in database
    const db = getDB();
    const [users] = await db.execute(
      'SELECT id, email, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // 4. Attach user to request object
    req.user = users[0];
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
};