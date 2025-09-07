import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './errorHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Dummy middleware for development
export const dummyAuth = (req, res, next) => {
  // Mock owner user for development
  req.user = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Owner Admin',
    email: 'owner@stylehub.com',
    role: 'owner'
  };
  next();
};