import jwt from 'jsonwebtoken';
import { getDB } from '../utils/db.js';

export const authenticateUser = async (req, res, next) => {
  try {
    // 1. Get token from cookies first, then headers
    const token = req.cookies?.token || 
                 req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 2. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Verify user exists in database
    const db = getDB();
    const [users] = await db.execute(
      'SELECT id, email, role, verified FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!users[0].verified) {
      return res.status(403).json({ error: 'Email not verified' });
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