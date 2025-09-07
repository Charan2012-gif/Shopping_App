import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Package } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { useApi } from '../contexts/ApiContext';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const { api } = useApi();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    collection: '',
    type: '',
    gender: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        ...filters
      };
      const response = await api.getProducts(params);
      setProducts(response.data.data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'top': return 'info';
      case 'bottom': return 'success';
      default: return 'default';
    }
  };

  const getGenderBadge = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'm': return { label: 'Men', variant: 'info' as const };
      case 'f': return { label: 'Women', variant: 'warning' as const };
      case 'unisex': return { label: 'Unisex', variant: 'default' as const };
      default: return { label: gender, variant: 'default' as const };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory</p>
        </div>
        <Link to="/products/new">
          <Button icon={<Plus className="w-4 h-4" />}>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>

          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Genders</option>
            <option value="m">Men</option>
            <option value="f">Women</option>
            <option value="unisex">Unisex</option>
          </select>

          <Button 
            variant="outline" 
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setFilters({ collection: '', type: '', gender: '' })}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product._id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="aspect-w-16 aspect-h-10 bg-gray-200">
              {product.images && product.images[0]?.urls[0] ? (
                <img
                  src={product.images[0].urls[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex space-x-1">
                  <Link to={`/products/${product._id}`}>
                    <Button size="sm" variant="outline" icon={<Edit className="w-3 h-3" />}>
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="danger"
                    icon={<Trash2 className="w-3 h-3" />}
                    onClick={() => handleDelete(product._id)}
                  >
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant={getBadgeVariant(product.type)}>
                  {product.type.toUpperCase()}
                </Badge>
                <Badge variant={getGenderBadge(product.gender).variant}>
                  {getGenderBadge(product.gender).label}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-500 mb-3">
                <p><strong>Collection:</strong> {product.collection?.name}</p>
                <p><strong>Activity:</strong> {product.activity}</p>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {product.availableColors?.slice(0, 3).map((color: string) => (
                  <span
                    key={color}
                    className="inline-block w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {product.availableColors?.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{product.availableColors.length - 3} more
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {product.availableSizes?.map((size: string) => (
                  <Badge key={size} variant="default" size="sm">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <Card className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
          </p>
          <Link to="/products/new">
            <Button icon={<Plus className="w-4 h-4" />}>
              Add Product
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default Products;