import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Collection name cannot exceed 50 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Collection image is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
collectionSchema.index({ name: 1 });
collectionSchema.index({ isActive: 1 });

export default mongoose.model('Collection', collectionSchema);