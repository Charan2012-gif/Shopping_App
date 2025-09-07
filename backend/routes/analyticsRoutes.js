import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dummyAuth } from '../middleware/auth.js';
import Order from '../models/Order.js';

const router = express.Router();

// Get order statistics for dashboard
router.get('/orders-stats', dummyAuth, asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case 'day':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      };
      break;
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
      break;
    case 'month':
      dateFilter = {
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      };
      break;
    default:
      dateFilter = {};
  }

  // Get orders by status
  const ordersByStatus = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$finalAmount' }
      }
    }
  ]);

  // Get daily orders for the chart
  const dailyOrders = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$finalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Get total statistics
  const totalStats = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$finalAmount' },
        averageOrderValue: { $avg: '$finalAmount' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      ordersByStatus,
      dailyOrders,
      totalStats: totalStats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
      period
    }
  });
}));

// Get top selling products
router.get('/top-products', dummyAuth, asyncHandler(async (req, res) => {
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product.name',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: topProducts
  });
}));

export default router;