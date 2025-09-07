import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useApi } from '../contexts/ApiContext';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';

const AddProduct: React.FC = () => {
  const { api } = useApi();
  const navigate = useNavigate();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      collection: '',
      type: 'top',
      gender: 'm',
      activity: '',
      availableColors: [''],
      availableSizes: ['M'],
      images: [{ color: '', urls: [''] }]
    }
  });

  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control,
    name: 'availableColors'
  });

  const { fields: sizeFields, append: appendSize, remove: removeSize } = useFieldArray({
    control,
    name: 'availableSizes'
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: 'images'
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await api.getCollections();
      setCollections(response.data.data);
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      // Filter out empty values
      const cleanedData = {
        ...data,
        availableColors: data.availableColors.filter((color: string) => color.trim()),
        availableSizes: data.availableSizes.filter((size: string) => size.trim()),
        images: data.images.filter((img: any) => 
          img.color.trim() && img.urls.some((url: string) => url.trim())
        ).map((img: any) => ({
          ...img,
          urls: img.urls.filter((url: string) => url.trim())
        }))
      };

      const response = await api.createProduct(cleanedData);
      toast.success('Product created successfully');
      navigate(`/products/${response.data.data._id}`);
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const addColorUrl = (imageIndex: number) => {
    const currentImages = watch('images');
    const updatedImages = [...currentImages];
    updatedImages[imageIndex].urls.push('');
    
    // Update the form manually since we can't use useFieldArray for nested arrays easily
    const event = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', {
      writable: false,
      value: { name: 'images', value: updatedImages }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/products">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product for your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                {...register('name', { required: 'Product name is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection *
              </label>
              <select
                {...register('collection', { required: 'Collection is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a collection</option>
                {collections.map((collection) => (
                  <option key={collection._id} value={collection._id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              {errors.collection && (
                <p className="text-red-500 text-sm mt-1">{errors.collection.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                {...register('type', { required: 'Type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="m">Men</option>
                <option value="f">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity *
              </label>
              <input
                {...register('activity', { required: 'Activity is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Running, Gym, Casual"
              />
              {errors.activity && (
                <p className="text-red-500 text-sm mt-1">{errors.activity.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Colors and Sizes */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Colors and Sizes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Available Colors *
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={<Plus className="w-3 h-3" />}
                  onClick={() => appendColor('')}
                >
                  Add Color
                </Button>
              </div>
              <div className="space-y-2">
                {colorFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <input
                      {...register(`availableColors.${index}` as const)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter color name"
                    />
                    {colorFields.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        icon={<X className="w-3 h-3" />}
                        onClick={() => removeColor(index)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Available Sizes *
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  icon={<Plus className="w-3 h-3" />}
                  onClick={() => appendSize('')}
                >
                  Add Size
                </Button>
              </div>
              <div className="space-y-2">
                {sizeFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <select
                      {...register(`availableSizes.${index}` as const)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                    {sizeFields.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        icon={<X className="w-3 h-3" />}
                        onClick={() => removeSize(index)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Product Images */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => appendImage({ color: '', urls: [''] })}
            >
              Add Color Variant
            </Button>
          </div>
          
          <div className="space-y-4">
            {imageFields.map((field, imageIndex) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Color Variant {imageIndex + 1}</h4>
                  {imageFields.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      icon={<X className="w-3 h-3" />}
                      onClick={() => removeImage(imageIndex)}
                    />
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Name
                    </label>
                    <input
                      {...register(`images.${imageIndex}.color` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter color name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URLs
                    </label>
                    <div className="space-y-2">
                      {watch(`images.${imageIndex}.urls`)?.map((url: string, urlIndex: number) => (
                        <div key={urlIndex} className="flex items-center space-x-2">
                          <input
                            {...register(`images.${imageIndex}.urls.${urlIndex}` as const)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="https://example.com/image.jpg"
                          />
                          {watch(`images.${imageIndex}.urls`)?.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              icon={<X className="w-3 h-3" />}
                              onClick={() => {
                                const currentImages = watch('images');
                                const updatedImages = [...currentImages];
                                updatedImages[imageIndex].urls.splice(urlIndex, 1);
                                // You'd need to update the form value here
                              }}
                            />
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        icon={<Plus className="w-3 h-3" />}
                        onClick={() => {
                          const currentImages = watch('images');
                          const updatedImages = [...currentImages];
                          updatedImages[imageIndex].urls.push('');
                          // You'd need to update the form value here
                        }}
                      >
                        Add URL
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Submit Button */}
        <Card>
          <div className="flex space-x-4">
            <Link to="/products">
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} className="flex-1">
              Create Product
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddProduct;