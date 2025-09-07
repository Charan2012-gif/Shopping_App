import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dummyAuth } from '../middleware/auth.js';
import Collection from '../models/Collection.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get all collections
router.get('/', asyncHandler(async (req, res) => {
  const collections = await Collection.find({ isActive: true }).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: collections
  });
}));

// Get single collection
router.get('/:id', asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }
  
  res.json({
    success: true,
    data: collection
  });
}));

// Create collection
router.post('/', dummyAuth, asyncHandler(async (req, res) => {
  const { name, imageUrl, description } = req.body;
  
  const collection = await Collection.create({
    name,
    imageUrl,
    description
  });
  
  res.status(201).json({
    success: true,
    data: collection
  });
}));

// Update collection
router.put('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }
  
  const updatedCollection = await Collection.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.json({
    success: true,
    data: updatedCollection
  });
}));

// Delete collection
router.delete('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  
  if (!collection) {
    return res.status(404).json({ message: 'Collection not found' });
  }
  
  // Check if collection has products
  const productCount = await Product.countDocuments({ collection: req.params.id });
  
  if (productCount > 0) {
    return res.status(400).json({
      message: 'Cannot delete collection with existing products'
    });
  }
  
  await Collection.findByIdAndUpdate(req.params.id, { isActive: false });
  
  res.json({
    success: true,
    message: 'Collection deleted successfully'
  });
}));

export default router;