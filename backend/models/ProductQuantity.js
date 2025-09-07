import mongoose from 'mongoose';

const productQuantitySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    uppercase: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    lowercase: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound unique index to ensure one document per product-size-color combination
productQuantitySchema.index({ product: 1, size: 1, color: 1 }, { unique: true });
productQuantitySchema.index({ product: 1 });
productQuantitySchema.index({ quantity: 1 });
productQuantitySchema.index({ isActive: 1 });

export default mongoose.model('ProductQuantity', productQuantitySchema);