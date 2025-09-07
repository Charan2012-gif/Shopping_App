import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dummyAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all customers
router.get('/customers', dummyAuth, asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  
  let query = { role: 'customer', isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } }
    ];
  }
  
  const customers = await User.find(query)
    .select('-orderHistory')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await User.countDocuments(query);
  
  res.json({
    success: true,
    data: customers,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
}));

// Get single customer
router.get('/customers/:id', dummyAuth, asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id)
    .populate('orderHistory', 'orderNumber totalMRP finalAmount status createdAt');
  
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  res.json({
    success: true,
    data: customer
  });
}));

// Update customer status
router.patch('/customers/:id/status', dummyAuth, asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  
  const customer = await User.findById(req.params.id);
  
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  customer.isActive = isActive;
  await customer.save();
  
  res.json({
    success: true,
    data: customer
  });
}));

export default router;