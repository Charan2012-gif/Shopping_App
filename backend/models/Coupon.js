import mongoose from 'mongoose';

const priceConditionSchema = new mongoose.Schema({
  low: {
    type: Number,
    default: null,
    min: [0, 'Low price cannot be negative']
  },
  high: {
    type: Number,
    default: null,
    min: [0, 'High price cannot be negative']
  }
}, { _id: false });

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  applicable: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  priceCondition: priceConditionSchema,
  reductionPrice: {
    type: Number,
    min: [0, 'Reduction price cannot be negative'],
    default: 0
  },
  reductionPercent: {
    type: Number,
    min: [0, 'Reduction percent cannot be negative'],
    max: [100, 'Reduction percent cannot exceed 100'],
    default: 0
  },
  maxUsage: {
    type: Number,
    min: [1, 'Max usage must be at least 1'],
    default: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  }
}, {
  timestamps: true
});

// Validation to ensure either reductionPrice or reductionPercent is provided
couponSchema.pre('save', function(next) {
  if (this.reductionPrice === 0 && this.reductionPercent === 0) {
    next(new Error('Either reduction price or reduction percent must be provided'));
  }
  if (this.reductionPrice > 0 && this.reductionPercent > 0) {
    next(new Error('Cannot have both reduction price and reduction percent'));
  }
  next();
});

// Indexes
couponSchema.index({ couponCode: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });

export default mongoose.model('Coupon', couponSchema);