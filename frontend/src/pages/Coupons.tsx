import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Gift, BarChart3 } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import { useApi } from '../contexts/ApiContext';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import toast from 'react-hot-toast';

interface Coupon {
  _id: string;
  couponCode: string;
  applicable: any[];
  usedBy: any[];
  priceCondition: {
    low?: number;
    high?: number;
  };
  reductionPrice: number;
  reductionPercent: number;
  maxUsage: number;
  isActive: boolean;
  expiryDate: string;
  createdAt: string;
}

const Coupons: React.FC = () => {
  const { api } = useApi();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
  const [couponStats, setCouponStats] = useState<any>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const reductionType = watch('reductionType', 'percent');

  useEffect(() => {
    fetchCoupons();
    fetchCustomers();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.getCoupons();
      setCoupons(response.data.data);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.getCustomers({ limit: 100 });
      setCustomers(response.data.data);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    }
  };

  const fetchCouponStats = async (couponId: string) => {
    try {
      const response = await api.getCouponStats(couponId);
      setCouponStats(response.data.data);
      setStatsModalOpen(true);
    } catch (error: any) {
      console.error('Error fetching coupon stats:', error);
      toast.error('Failed to load coupon statistics');
    }
  };

  const handleSubmitForm = async (data: any) => {
    try {
      const couponData = {
        couponCode: data.couponCode.toUpperCase(),
        applicable: selectedCustomers.map(c => c.value),
        priceCondition: {
          low: data.lowPrice || null,
          high: data.highPrice || null
        },
        reductionPrice: data.reductionType === 'amount' ? Number(data.reductionAmount) : 0,
        reductionPercent: data.reductionType === 'percent' ? Number(data.reductionPercent) : 0,
        maxUsage: Number(data.maxUsage),
        expiryDate: new Date(data.expiryDate)
      };

      if (editingCoupon) {
        await api.updateCoupon(editingCoupon._id, couponData);
        toast.success('Coupon updated successfully');
      } else {
        await api.createCoupon(couponData);
        toast.success('Coupon created successfully');
      }
      
      setIsModalOpen(false);
      setEditingCoupon(null);
      setSelectedCustomers([]);
      reset();
      fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    const customerOptions = coupon.applicable.map(c => ({
      value: c._id,
      label: `${c.name} (${c.email})`
    }));
    setSelectedCustomers(customerOptions);
    
    reset({
      couponCode: coupon.couponCode,
      lowPrice: coupon.priceCondition.low || '',
      highPrice: coupon.priceCondition.high || '',
      reductionType: coupon.reductionPrice > 0 ? 'amount' : 'percent',
      reductionAmount: coupon.reductionPrice || '',
      reductionPercent: coupon.reductionPercent || '',
      maxUsage: coupon.maxUsage,
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await api.deleteCoupon(id);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleCoupon(id);
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (error: any) {
      console.error('Error toggling coupon:', error);
      toast.error('Failed to update coupon status');
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setSelectedCustomers([]);
    reset({
      couponCode: '',
      lowPrice: '',
      highPrice: '',
      reductionType: 'percent',
      reductionAmount: '',
      reductionPercent: '',
      maxUsage: 100,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const customerOptions = customers.map(customer => ({
    value: customer._id,
    label: `${customer.name} (${customer.email})`
  }));

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
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage coupon codes and customer incentives</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Create Coupon
        </Button>
      </div>

      {/* Coupons List */}
      <div className="space-y-4">
        {coupons.map((coupon) => (
          <Card key={coupon._id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold font-mono text-primary-600">
                    {coupon.couponCode}
                  </h3>
                  <Badge 
                    variant={coupon.isActive ? 'success' : 'danger'}
                    size="sm"
                  >
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {isExpired(coupon.expiryDate) && (
                    <Badge variant="warning" size="sm">
                      Expired
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Reduction</p>
                    <p className="font-medium text-gray-900">
                      {coupon.reductionPrice > 0 
                        ? formatCurrency(coupon.reductionPrice)
                        : `${coupon.reductionPercent}% OFF`
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Price Range</p>
                    <p className="font-medium text-gray-900">
                      {coupon.priceCondition.low || coupon.priceCondition.high
                        ? `${coupon.priceCondition.low ? formatCurrency(coupon.priceCondition.low) : '₹0'} - ${coupon.priceCondition.high ? formatCurrency(coupon.priceCondition.high) : '∞'}`
                        : 'No limits'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Usage</p>
                    <p className="font-medium text-gray-900">
                      {coupon.usedBy.length} / {coupon.maxUsage}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Expires</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(coupon.expiryDate)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-500">
                  <span>
                    <strong>Applicable to:</strong> {coupon.applicable.length === 0 ? 'All Customers' : `${coupon.applicable.length} customers`}
                  </span>
                  <span className="ml-6">
                    <strong>Created:</strong> {formatDate(coupon.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<BarChart3 className="w-3 h-3" />}
                  onClick={() => fetchCouponStats(coupon._id)}
                >
                  Stats
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  icon={coupon.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                  onClick={() => handleToggle(coupon._id)}
                />
                
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Edit className="w-3 h-3" />}
                  onClick={() => handleEdit(coupon)}
                />
                
                <Button
                  size="sm"
                  variant="danger"
                  icon={<Trash2 className="w-3 h-3" />}
                  onClick={() => handleDelete(coupon._id)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {coupons.length === 0 && !loading && (
        <Card className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
          <p className="text-gray-500 mb-4">
            Create your first coupon to incentivize customer purchases
          </p>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
            Create Coupon
          </Button>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code *
            </label>
            <input
              {...register('couponCode', { 
                required: 'Coupon code is required',
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'Only uppercase letters and numbers allowed'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono uppercase"
              placeholder="SAVE20"
            />
            {errors.couponCode && (
              <p className="text-red-500 text-sm mt-1">{errors.couponCode.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Amount
              </label>
              <input
                type="number"
                {...register('lowPrice')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Amount
              </label>
              <input
                type="number"
                {...register('highPrice')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="No limit"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reduction Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  {...register('reductionType', { required: 'Reduction type is required' })}
                  value="percent"
                  className="mr-2"
                />
                Percentage
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  {...register('reductionType', { required: 'Reduction type is required' })}
                  value="amount"
                  className="mr-2"
                />
                Fixed Amount
              </label>
            </div>
          </div>

          {reductionType === 'percent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage *
              </label>
              <input
                type="number"
                {...register('reductionPercent', { 
                  required: reductionType === 'percent' ? 'Percentage is required' : false,
                  min: { value: 1, message: 'Minimum 1%' },
                  max: { value: 100, message: 'Maximum 100%' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="10"
                min="1"
                max="100"
              />
              {errors.reductionPercent && (
                <p className="text-red-500 text-sm mt-1">{errors.reductionPercent.message as string}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount *
              </label>
              <input
                type="number"
                {...register('reductionAmount', { 
                  required: reductionType === 'amount' ? 'Amount is required' : false,
                  min: { value: 1, message: 'Minimum ₹1' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="100"
                min="1"
              />
              {errors.reductionAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.reductionAmount.message as string}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Usage *
              </label>
              <input
                type="number"
                {...register('maxUsage', { 
                  required: 'Max usage is required',
                  min: { value: 1, message: 'Minimum 1 usage' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="100"
                min="1"
              />
              {errors.maxUsage && (
                <p className="text-red-500 text-sm mt-1">{errors.maxUsage.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                {...register('expiryDate', { required: 'Expiry date is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicable Customers
            </label>
            <Select
              isMulti
              options={customerOptions}
              value={selectedCustomers}
              onChange={(selected) => setSelectedCustomers(selected as any[])}
              placeholder="Select customers (leave empty for all customers)"
              className="text-sm"
              classNamePrefix="select"
            />
            <p className="text-xs text-gray-500 mt-1">
              If no customers are selected, the coupon will be available to all customers
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingCoupon ? 'Update' : 'Create'} Coupon
            </Button>
          </div>
        </form>
      </Modal>

      {/* Stats Modal */}
      <Modal
        isOpen={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        title="Coupon Statistics"
        size="md"
      >
        {couponStats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {couponStats.totalApplicableUsers}
                </p>
                <p className="text-sm text-gray-600">Total Applicable Users</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {couponStats.totalUsed}
                </p>
                <p className="text-sm text-gray-600">Times Used</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {couponStats.usagePercentage}%
                </p>
                <p className="text-sm text-gray-600">Usage Rate</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {couponStats.remainingUsage}
                </p>
                <p className="text-sm text-gray-600">Remaining Usage</p>
              </div>
            </div>
            
            {couponStats.isExpired && (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Badge variant="danger">This coupon has expired</Badge>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Coupons;