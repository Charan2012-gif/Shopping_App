import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dummyAuth } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = express.Router();

// Get all orders
router.get('/', dummyAuth, asyncHandler(async (req, res) => {
  const { 
    status, 
    page = 1, 
    limit = 10, 
    startDate, 
    endDate,
    search 
  } = req.query;
  
  let query = {};
  
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'user.name': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const orders = await Order.find(query)
    .populate('user', 'name email mobile')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Order.countDocuments(query);
  
  res.json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
}));

// Get single order
router.get('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email mobile address');
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  res.json({
    success: true,
    data: order
  });
}));

// Update order status
router.put('/:id/status', dummyAuth, asyncHandler(async (req, res) => {
  const { status, trackingId } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  const updateData = { status };
  if (trackingId) updateData.trackingId = trackingId;
  
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('user', 'name email mobile');
  
  res.json({
    success: true,
    data: updatedOrder
  });
}));

// Cancel order
router.put('/:id/cancel', dummyAuth, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  if (['delivered', 'cancelled'].includes(order.status)) {
    return res.status(400).json({
      message: 'Cannot cancel order in current status'
    });
  }
  
  order.status = 'cancelled';
  await order.save();
  
  res.json({
    success: true,
    data: order
  });
}));

export default router;