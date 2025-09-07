import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Phone, Mail, Edit } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import { useApi } from '../contexts/ApiContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const { api } = useApi();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.getOrder(id!);
      setOrder(response.data.data);
      reset({
        status: response.data.data.status,
        trackingId: response.data.data.trackingId || ''
      });
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (data: any) => {
    try {
      await api.updateOrderStatus(id!, data);
      toast.success('Order status updated successfully');
      setIsStatusModalOpen(false);
      fetchOrder();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'processing': return 'default';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <Card className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
        <p className="text-gray-500 mb-4">The order you're looking for doesn't exist.</p>
        <Link to="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/orders">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={getStatusBadgeVariant(order.status)} size="md">
            {order.status.toUpperCase()}
          </Badge>
          <Button 
            icon={<Edit className="w-4 h-4" />}
            onClick={() => setIsStatusModalOpen(true)}
          >
            Update Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.product?.name || 'Product Name'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      per item
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h3>
            <div className="text-gray-600">
              {order.shippingAddress ? (
                <div>
                  <p>{order.shippingAddress.line1}</p>
                  <p>{order.shippingAddress.area}</p>
                  <p>{order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
                </div>
              ) : (
                <p>No shipping address available</p>
              )}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{order.user.name}</p>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {order.user.email}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Phone className="w-4 h-4 mr-2" />
                  {order.user.mobile}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.totalMRP)}</span>
              </div>
              
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              
              {order.couponCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coupon ({order.couponCode})</span>
                  <span className="text-green-600">Applied</span>
                </div>
              )}
              
              <hr className="border-gray-200" />
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">
                  {formatCurrency(order.finalAmount)}
                </span>
              </div>
            </div>
          </Card>

          {order.trackingId && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tracking Information</h3>
              <p className="text-sm text-gray-600 mb-2">Tracking ID</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded border">
                {order.trackingId}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Order Status"
        size="md"
      >
        <form onSubmit={handleSubmit(handleStatusUpdate)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking ID (Optional)
            </label>
            <input
              {...register('trackingId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter tracking ID"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update Status
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderDetail;