import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productQuantity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductQuantity',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Maximum 10 items per product']
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ lastUpdated: 1 });

export default mongoose.model('Cart', cartSchema);