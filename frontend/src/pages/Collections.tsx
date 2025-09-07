import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import { useApi } from '../contexts/ApiContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Collection {
  _id: string;
  name: string;
  imageUrl: string;
  description?: string;
  productsCount: number;
  createdAt: string;
}

const Collections: React.FC = () => {
  const { api } = useApi();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await api.getCollections();
      setCollections(response.data.data);
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (data: any) => {
    try {
      if (editingCollection) {
        await api.updateCollection(editingCollection._id, data);
        toast.success('Collection updated successfully');
      } else {
        await api.createCollection(data);
        toast.success('Collection created successfully');
      }
      
      setIsModalOpen(false);
      setEditingCollection(null);
      reset();
      fetchCollections();
    } catch (error: any) {
      console.error('Error saving collection:', error);
      toast.error('Failed to save collection');
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    reset({
      name: collection.name,
      imageUrl: collection.imageUrl,
      description: collection.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) {
      return;
    }

    try {
      await api.deleteCollection(id);
      toast.success('Collection deleted successfully');
      fetchCollections();
    } catch (error: any) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const openCreateModal = () => {
    setEditingCollection(null);
    reset();
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600 mt-1">Organize your products into collections</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Add Collection
        </Button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Card key={collection._id} padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="aspect-w-16 aspect-h-10 bg-gray-200">
              <img
                src={collection.imageUrl}
                alt={collection.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
                }}
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {collection.name}
                </h3>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Edit className="w-3 h-3" />}
                    onClick={() => handleEdit(collection)}
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    icon={<Trash2 className="w-3 h-3" />}
                    onClick={() => handleDelete(collection._id)}
                  />
                </div>
              </div>
              
              {collection.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {collection.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{collection.productsCount} products</span>
                <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {collections.length === 0 && !loading && (
        <Card className="text-center py-12">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
          <p className="text-gray-500 mb-4">
            Create your first collection to organize your products
          </p>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
            Add Collection
          </Button>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCollection ? 'Edit Collection' : 'Create Collection'}
        size="md"
      >
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name *
            </label>
            <input
              {...register('name', { required: 'Collection name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter collection name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL *
            </label>
            <input
              {...register('imageUrl', { 
                required: 'Image URL is required',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter collection description"
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
              {editingCollection ? 'Update' : 'Create'} Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Collections;