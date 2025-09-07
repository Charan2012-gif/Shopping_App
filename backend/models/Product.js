import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: [true, 'Collection is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['bottom', 'top'],
    required: [true, 'Product type is required']
  },
  gender: {
    type: String,
    enum: ['m', 'f', 'unisex'],
    required: [true, 'Gender is required']
  },
  activity: {
    type: String,
    required: [true, 'Activity is required'],
    trim: true
  },
  images: [{
    color: {
      type: String,
      required: true
    },
    urls: [{
      type: String,
      required: true
    }]
  }],
  availableColors: [{
    type: String,
    required: true,
    lowercase: true
  }],
  availableSizes: [{
    type: String,
    required: true,
    uppercase: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ collection: 1 });
productSchema.index({ type: 1, gender: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ isActive: 1 });

export default mongoose.model('Product', productSchema);