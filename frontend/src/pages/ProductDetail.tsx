import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Edit, Save, Plus, Trash2 } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { useApi } from '../contexts/ApiContext';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { api } = useApi();
  const [product, setProduct] = useState<any>(null);
  const [quantities, setQuantities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuantities, setEditingQuantities] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchQuantities();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.getProduct(id!);
      setProduct(response.data.data);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    }
  };

  const fetchQuantities = async () => {
    try {
      setLoading(true);
      const response = await api.getProductQuantities(id!);
      setQuantities(response.data.data);
    } catch (error: any) {
      console.error('Error fetching quantities:', error);
      toast.error('Failed to load product quantities');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (index: number, field: string, value: any) => {
    const updated = [...quantities];
    updated[index] = { ...updated[index], [field]: value };
    setQuantities(updated);
  };

  const addNewQuantity = () => {
    if (!product) return;
    
    const newQuantity = {
      _id: `new-${Date.now()}`,
      product: product._id,
      size: 'M',
      color: product.availableColors[0] || 'black',
      quantity: 0,
      price: 0,
      isNew: true
    };
    setQuantities([...quantities, newQuantity]);
  };

  const removeQuantity = (index: number) => {
    const updated = quantities.filter((_, i) => i !== index);
    setQuantities(updated);
  };

  const saveQuantities = async () => {
    try {
      const quantityData = quantities.map(qty => ({
        size: qty.size,
        color: qty.color,
        quantity: Number(qty.quantity),
        price: Number(qty.price)
      }));

      await api.updateProductQuantities(id!, { quantities: quantityData });
      toast.success('Quantities updated successfully');
      setEditingQuantities(false);
      fetchQuantities();
    } catch (error: any) {
      console.error('Error updating quantities:', error);
      toast.error('Failed to update quantities');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <Card className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
        <p className="text-gray-500 mb-4">The product you're looking for doesn't exist.</p>
        <Link to="/products">
          <Button>Back to Products</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/products">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">Manage product details and inventory</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Images */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
          <div className="space-y-4">
            {product.images?.map((imageGroup: any, index: number) => (
              <div key={index}>
                <h4 className="font-medium text-gray-700 mb-2 capitalize">
                  {imageGroup.color} Variant
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {imageGroup.urls.map((url: string, urlIndex: number) => (
                    <div key={urlIndex} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`${product.name} - ${imageGroup.color} ${urlIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Product Details */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-gray-600">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <Badge variant="info" className="mt-1">
                    {product.type.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <Badge variant="default" className="mt-1">
                    {product.gender === 'm' ? 'Men' : product.gender === 'f' ? 'Women' : 'Unisex'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Activity</label>
                <p className="mt-1 text-gray-600">{product.activity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Collection</label>
                <p className="mt-1 text-gray-600">{product.collection?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Available Colors</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {product.availableColors?.map((color: string) => (
                    <div key={color} className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                      <span className="text-sm text-gray-600 capitalize">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Available Sizes</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {product.availableSizes?.map((size: string) => (
                    <Badge key={size} variant="default" size="sm">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Inventory Management */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Management</h3>
          <div className="flex space-x-2">
            {editingQuantities ? (
              <>
                <Button 
                  size="sm" 
                  variant="success" 
                  icon={<Save className="w-4 h-4" />}
                  onClick={saveQuantities}
                >
                  Save Changes
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setEditingQuantities(false);
                    fetchQuantities();
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="sm" 
                  icon={<Plus className="w-4 h-4" />}
                  onClick={addNewQuantity}
                >
                  Add Variant
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  icon={<Edit className="w-4 h-4" />}
                  onClick={() => setEditingQuantities(true)}
                >
                  Edit Quantities
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                {editingQuantities && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quantities.map((qty, index) => (
                <tr key={qty._id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingQuantities ? (
                      <select
                        value={qty.size}
                        onChange={(e) => handleQuantityChange(index, 'size', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        {product.availableSizes?.map((size: string) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge variant="default" size="sm">{qty.size}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingQuantities ? (
                      <select
                        value={qty.color}
                        onChange={(e) => handleQuantityChange(index, 'color', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        {product.availableColors?.map((color: string) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: qty.color }}
                        />
                        <span className="capitalize">{qty.color}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingQuantities ? (
                      <input
                        type="number"
                        value={qty.quantity}
                        onChange={(e) => handleQuantityChange(index, 'quantity', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                        min="0"
                      />
                    ) : (
                      <span className={`${qty.quantity === 0 ? 'text-red-600' : qty.quantity < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {qty.quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingQuantities ? (
                      <input
                        type="number"
                        value={qty.price}
                        onChange={(e) => handleQuantityChange(index, 'price', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <span className="font-medium">
                        ₹{qty.price?.toLocaleString()}
                      </span>
                    )}
                  </td>
                  {editingQuantities && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<Trash2 className="w-3 h-3" />}
                        onClick={() => removeQuantity(index)}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {quantities.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No inventory data available</p>
            <Button 
              size="sm" 
              className="mt-2"
              icon={<Plus className="w-4 h-4" />}
              onClick={addNewQuantity}
            >
              Add First Variant
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductDetail;