import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dummyAuth } from '../middleware/auth.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';

const router = express.Router();

// Get all coupons
router.get('/', dummyAuth, asyncHandler(async (req, res) => {
  const coupons = await Coupon.find()
    .populate('applicable', 'name email')
    .populate('usedBy.user', 'name email')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: coupons
  });
}));

// Get single coupon
router.get('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('applicable', 'name email')
    .populate('usedBy.user', 'name email');
  
  if (!coupon) {
    return res.status(404).json({ message: 'Coupon not found' });
  }
  
  res.json({
    success: true,
    data: coupon
  });
}));

// Create coupon
router.post('/', dummyAuth, asyncHandler(async (req, res) => {
  const {
    couponCode,
    applicable,
    priceCondition,
    reductionPrice,
    reductionPercent,
    maxUsage,
    expiryDate
  } = req.body;
  
  // If no users specified, apply to all customers
  let applicableUsers = applicable;
  if (!applicable || applicable.length === 0) {
    const allCustomers = await User.find({ 
      role: 'customer', 
      isActive: true 
    }).select('_id');
    applicableUsers = allCustomers.map(u => u._id);
  }
  
  const coupon = await Coupon.create({
    couponCode,
    applicable: applicableUsers,
    priceCondition,
    reductionPrice: reductionPrice || 0,
    reductionPercent: reductionPercent || 0,
    maxUsage,
    expiryDate
  });
  
  res.status(201).json({
    success: true,
    data: coupon
  });
}));

// Update coupon
router.put('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    return res.status(404).json({ message: 'Coupon not found' });
  }
  
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('applicable', 'name email');
  
  res.json({
    success: true,
    data: updatedCoupon
  });
}));

// Delete coupon
router.delete('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    return res.status(404).json({ message: 'Coupon not found' });
  }
  
  await Coupon.findByIdAndUpdate(req.params.id, { isActive: false });
  
  res.json({
    success: true,
    message: 'Coupon deleted successfully'
  });
}));

// Toggle coupon status
router.patch('/:id/toggle', dummyAuth, asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    return res.status(404).json({ message: 'Coupon not found' });
  }
  
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  
  res.json({
    success: true,
    data: coupon
  });
}));

// Get coupon usage statistics
router.get('/:id/stats', dummyAuth, asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    return res.status(404).json({ message: 'Coupon not found' });
  }
  
  const stats = {
    totalApplicableUsers: coupon.applicable.length,
    totalUsed: coupon.usedBy.length,
    usagePercentage: coupon.applicable.length > 0 
      ? (coupon.usedBy.length / coupon.applicable.length * 100).toFixed(2)
      : 0,
    remainingUsage: coupon.maxUsage - coupon.usedBy.length,
    isExpired: new Date(coupon.expiryDate) < new Date()
  };
  
  res.json({
    success: true,
    data: stats
  });
}));

export default router;