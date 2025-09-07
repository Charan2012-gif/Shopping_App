import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Percent } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import { useApi } from '../contexts/ApiContext';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import toast from 'react-hot-toast';

interface Discount {
  _id: string;
  name: string;
  products: any[];
  discountPercent: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt: string;
}

const Discounts: React.FC = () => {
  const { api } = useApi();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await api.getDiscounts();
      setDiscounts(response.data.data);
    } catch (error: any) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts({ limit: 100 });
      setProducts(response.data.data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleSubmitForm = async (data: any) => {
    try {
      const discountData = {
        ...data,
        products: selectedProducts.map(p => p.value),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      };

      if (editingDiscount) {
        await api.updateDiscount(editingDiscount._id, discountData);
        toast.success('Discount updated successfully');
      } else {
        await api.createDiscount(discountData);
        toast.success('Discount created successfully');
      }
      
      setIsModalOpen(false);
      setEditingDiscount(null);
      setSelectedProducts([]);
      reset();
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      toast.error('Failed to save discount');
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    const productOptions = discount.products.map(p => ({
      value: p._id,
      label: p.name
    }));
    setSelectedProducts(productOptions);
    
    reset({
      name: discount.name,
      discountPercent: discount.discountPercent,
      startDate: new Date(discount.startDate).toISOString().split('T')[0],
      endDate: new Date(discount.endDate).toISOString().split('T')[0],
      description: discount.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) {
      return;
    }

    try {
      await api.deleteDiscount(id);
      toast.success('Discount deleted successfully');
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      toast.error('Failed to delete discount');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleDiscount(id);
      toast.success('Discount status updated');
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error toggling discount:', error);
      toast.error('Failed to update discount status');
    }
  };

  const openCreateModal = () => {
    setEditingDiscount(null);
    setSelectedProducts([]);
    reset({
      name: '',
      discountPercent: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: ''
    });
    setIsModalOpen(true);
  };

  const productOptions = products.map(product => ({
    value: product._id,
    label: product.name
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Discounts</h1>
          <p className="text-gray-600 mt-1">Manage product discounts and promotions</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Create Discount
        </Button>
      </div>

      {/* Discounts List */}
      <div className="space-y-4">
        {discounts.map((discount) => (
          <Card key={discount._id}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {discount.name}
                  </h3>
                  <Badge 
                    variant={discount.isActive ? 'success' : 'danger'}
                    size="sm"
                  >
                    {discount.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center space-x-1 text-accent-600">
                    <Percent className="w-4 h-4" />
                    <span className="font-semibold">{discount.discountPercent}% OFF</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">
                  {discount.description || 'No description provided'}
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>
                    <strong>Products:</strong> {discount.products.length === 0 ? 'All Products' : `${discount.products.length} selected`}
                  </span>
                  <span>
                    <strong>Valid:</strong> {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
                  </span>
                  <span>
                    <strong>Created:</strong> {formatDate(discount.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={discount.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                  onClick={() => handleToggle(discount._id)}
                >
                  {discount.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Edit className="w-3 h-3" />}
                  onClick={() => handleEdit(discount)}
                />
                
                <Button
                  size="sm"
                  variant="danger"
                  icon={<Trash2 className="w-3 h-3" />}
                  onClick={() => handleDelete(discount._id)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {discounts.length === 0 && !loading && (
        <Card className="text-center py-12">
          <Percent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discounts found</h3>
          <p className="text-gray-500 mb-4">
            Create your first discount to start promoting your products
          </p>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
            Create Discount
          </Button>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDiscount ? 'Edit Discount' : 'Create Discount'}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Name *
            </label>
            <input
              {...register('name', { required: 'Discount name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter discount name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Percentage *
            </label>
            <input
              type="number"
              {...register('discountPercent', { 
                required: 'Discount percentage is required',
                min: { value: 1, message: 'Minimum discount is 1%' },
                max: { value: 90, message: 'Maximum discount is 90%' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter discount percentage"
              min="1"
              max="90"
            />
            {errors.discountPercent && (
              <p className="text-red-500 text-sm mt-1">{errors.discountPercent.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate', { required: 'End date is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicable Products
            </label>
            <Select
              isMulti
              options={productOptions}
              value={selectedProducts}
              onChange={(selected) => setSelectedProducts(selected as any[])}
              placeholder="Select products (leave empty for all products)"
              className="text-sm"
              classNamePrefix="select"
            />
            <p className="text-xs text-gray-500 mt-1">
              If no products are selected, the discount will apply to all products
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter discount description"
            />
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
              {editingDiscount ? 'Update' : 'Create'} Discount
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Discounts;