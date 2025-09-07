import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dummyAuth } from '../middleware/auth.js';
import Discount from '../models/Discount.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get all discounts
router.get('/', dummyAuth, asyncHandler(async (req, res) => {
  const discounts = await Discount.find()
    .populate('products', 'name collection')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: discounts
  });
}));

// Get single discount
router.get('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const discount = await Discount.findById(req.params.id)
    .populate('products', 'name collection type');
  
  if (!discount) {
    return res.status(404).json({ message: 'Discount not found' });
  }
  
  res.json({
    success: true,
    data: discount
  });
}));

// Create discount
router.post('/', dummyAuth, asyncHandler(async (req, res) => {
  const {
    name,
    products,
    discountPercent,
    startDate,
    endDate,
    description
  } = req.body;
  
  // If no products specified, apply to all products
  let applicableProducts = products;
  if (!products || products.length === 0) {
    const allProducts = await Product.find({ isActive: true }).select('_id');
    applicableProducts = allProducts.map(p => p._id);
  }
  
  const discount = await Discount.create({
    name,
    products: applicableProducts,
    discountPercent,
    startDate,
    endDate,
    description
  });
  
  res.status(201).json({
    success: true,
    data: discount
  });
}));

// Update discount
router.put('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const discount = await Discount.findById(req.params.id);
  
  if (!discount) {
    return res.status(404).json({ message: 'Discount not found' });
  }
  
  const updatedDiscount = await Discount.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('products', 'name');
  
  res.json({
    success: true,
    data: updatedDiscount
  });
}));

// Delete discount
router.delete('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const discount = await Discount.findById(req.params.id);
  
  if (!discount) {
    return res.status(404).json({ message: 'Discount not found' });
  }
  
  await Discount.findByIdAndUpdate(req.params.id, { isActive: false });
  
  res.json({
    success: true,
    message: 'Discount deleted successfully'
  });
}));

// Toggle discount status
router.patch('/:id/toggle', dummyAuth, asyncHandler(async (req, res) => {
  const discount = await Discount.findById(req.params.id);
  
  if (!discount) {
    return res.status(404).json({ message: 'Discount not found' });
  }
  
  discount.isActive = !discount.isActive;
  await discount.save();
  
  res.json({
    success: true,
    data: discount
  });
}));

export default router;