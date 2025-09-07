import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Analytics API
export const getOrderStats = (period = 'week') =>
  apiClient.get(`/analytics/orders-stats?period=${period}`);

export const getTopProducts = () =>
  apiClient.get('/analytics/top-products');

// Collections API
export const getCollections = () =>
  apiClient.get('/collections');

export const getCollection = (id: string) =>
  apiClient.get(`/collections/${id}`);

export const createCollection = (data: any) =>
  apiClient.post('/collections', data);

export const updateCollection = (id: string, data: any) =>
  apiClient.put(`/collections/${id}`, data);

export const deleteCollection = (id: string) =>
  apiClient.delete(`/collections/${id}`);

// Products API
export const getProducts = (params?: any) =>
  apiClient.get('/products', { params });

export const getProduct = (id: string) =>
  apiClient.get(`/products/${id}`);

export const createProduct = (data: any) =>
  apiClient.post('/products', data);

export const updateProduct = (id: string, data: any) =>
  apiClient.put(`/products/${id}`, data);

export const deleteProduct = (id: string) =>
  apiClient.delete(`/products/${id}`);

export const getProductQuantities = (id: string) =>
  apiClient.get(`/products/${id}/quantities`);

export const updateProductQuantities = (id: string, data: any) =>
  apiClient.put(`/products/${id}/quantities`, data);

// Orders API
export const getOrders = (params?: any) =>
  apiClient.get('/orders', { params });

export const getOrder = (id: string) =>
  apiClient.get(`/orders/${id}`);

export const updateOrderStatus = (id: string, data: any) =>
  apiClient.put(`/orders/${id}/status`, data);

export const cancelOrder = (id: string) =>
  apiClient.put(`/orders/${id}/cancel`);

// Discounts API
export const getDiscounts = () =>
  apiClient.get('/discounts');

export const getDiscount = (id: string) =>
  apiClient.get(`/discounts/${id}`);

export const createDiscount = (data: any) =>
  apiClient.post('/discounts', data);

export const updateDiscount = (id: string, data: any) =>
  apiClient.put(`/discounts/${id}`, data);

export const deleteDiscount = (id: string) =>
  apiClient.delete(`/discounts/${id}`);

export const toggleDiscount = (id: string) =>
  apiClient.patch(`/discounts/${id}/toggle`);

// Coupons API
export const getCoupons = () =>
  apiClient.get('/coupons');

export const getCoupon = (id: string) =>
  apiClient.get(`/coupons/${id}`);

export const createCoupon = (data: any) =>
  apiClient.post('/coupons', data);

export const updateCoupon = (id: string, data: any) =>
  apiClient.put(`/coupons/${id}`, data);

export const deleteCoupon = (id: string) =>
  apiClient.delete(`/coupons/${id}`);

export const toggleCoupon = (id: string) =>
  apiClient.patch(`/coupons/${id}/toggle`);

export const getCouponStats = (id: string) =>
  apiClient.get(`/coupons/${id}/stats`);

// Customers API
export const getCustomers = (params?: any) =>
  apiClient.get('/users/customers', { params });

export const getCustomer = (id: string) =>
  apiClient.get(`/users/customers/${id}`);

export const updateCustomerStatus = (id: string, data: any) =>
  apiClient.patch(`/users/customers/${id}/status`, data);

// Upload API
export const uploadSingle = (formData: FormData) =>
  apiClient.post('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const uploadMultiple = (formData: FormData) =>
  apiClient.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const deleteImage = (key: string) =>
  apiClient.delete(`/upload/${encodeURIComponent(key)}`);