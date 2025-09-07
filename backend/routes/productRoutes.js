import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dummyAuth } from '../middleware/auth.js';
import Product from '../models/Product.js';
import ProductQuantity from '../models/ProductQuantity.js';
import Collection from '../models/Collection.js';

const router = express.Router();

// Get all products with search and filters
router.get('/', asyncHandler(async (req, res) => {
  const { search, collection, type, gender, page = 1, limit = 10 } = req.query;
  
  let query = { isActive: true };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (collection) query.collection = collection;
  if (type) query.type = type;
  if (gender) query.gender = gender;
  
  const products = await Product.find(query)
    .populate('collection', 'name imageUrl')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Product.countDocuments(query);
  
  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
}));

// Get single product with quantities
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('collection');
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const quantities = await ProductQuantity.find({ product: req.params.id });
  
  res.json({
    success: true,
    data: {
      ...product.toObject(),
      quantities
    }
  });
}));

// Create product
router.post('/', dummyAuth, asyncHandler(async (req, res) => {
  const {
    collection,
    name,
    description,
    type,
    gender,
    activity,
    images,
    availableColors,
    availableSizes
  } = req.body;
  
  // Verify collection exists
  const collectionExists = await Collection.findById(collection);
  if (!collectionExists) {
    return res.status(400).json({ message: 'Invalid collection ID' });
  }
  
  const product = await Product.create({
    collection,
    name,
    description,
    type,
    gender,
    activity,
    images,
    availableColors,
    availableSizes
  });
  
  // Update collection products count
  await Collection.findByIdAndUpdate(collection, {
    $inc: { productsCount: 1 }
  });
  
  res.status(201).json({
    success: true,
    data: product
  });
}));

// Update product
router.put('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('collection');
  
  res.json({
    success: true,
    data: updatedProduct
  });
}));

// Delete product
router.delete('/:id', dummyAuth, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  // Delete associated quantities
  await ProductQuantity.deleteMany({ product: req.params.id });
  
  // Soft delete product
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  
  // Update collection products count
  await Collection.findByIdAndUpdate(product.collection, {
    $inc: { productsCount: -1 }
  });
  
  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
}));

// Get product quantities
router.get('/:id/quantities', asyncHandler(async (req, res) => {
  const quantities = await ProductQuantity.find({ 
    product: req.params.id,
    isActive: true 
  }).populate('product', 'name');
  
  res.json({
    success: true,
    data: quantities
  });
}));

// Update product quantities
router.put('/:id/quantities', dummyAuth, asyncHandler(async (req, res) => {
  const { quantities } = req.body;
  
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  // Update or create quantities
  const updatedQuantities = [];
  
  for (const qty of quantities) {
    const existingQty = await ProductQuantity.findOneAndUpdate(
      {
        product: req.params.id,
        size: qty.size,
        color: qty.color
      },
      {
        quantity: qty.quantity,
        price: qty.price
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );
    
    updatedQuantities.push(existingQty);
  }
  
  res.json({
    success: true,
    data: updatedQuantities
  });
}));

export default router;