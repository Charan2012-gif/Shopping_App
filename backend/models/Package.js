import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  }],
  packageNumber: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['packed', 'shipped', 'in_transit', 'delivered'],
    default: 'packed'
  },
  trackingId: {
    type: String,
    unique: true,
    sparse: true
  },
  courierService: {
    type: String,
    default: null
  },
  estimatedDelivery: {
    type: Date,
    default: null
  },
  actualDelivery: {
    type: Date,
    default: null
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    default: 0
  },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Generate package number before saving
packageSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.packageNumber = `PKG${Date.now()}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes
packageSchema.index({ orders: 1 });
packageSchema.index({ packageNumber: 1 });
packageSchema.index({ status: 1 });
packageSchema.index({ trackingId: 1 });

export default mongoose.model('Package', packageSchema);