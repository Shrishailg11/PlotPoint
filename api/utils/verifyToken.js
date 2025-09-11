import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  console.log("🛠 verifyToken called");
  console.log("req.cookies:", req.cookies);

  const token = req.cookies.access_token;

  if (!token) {
    return next(errorHandler(401, 'Unauthorized - No token provided'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(403, 'Forbidden - Invalid token'));
    }

    req.user = user;
    next();
  });
};