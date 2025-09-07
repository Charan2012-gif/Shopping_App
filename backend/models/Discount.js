import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Discount name is required'],
    trim: true,
    maxlength: [100, 'Discount name cannot exceed 100 characters']
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: []
  }],
  discountPercent: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [0, 'Discount cannot be negative'],
    max: [90, 'Discount cannot exceed 90%']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Validation to ensure end date is after start date
discountSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Indexes
discountSchema.index({ products: 1 });
discountSchema.index({ isActive: 1 });
discountSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model('Discount', discountSchema);