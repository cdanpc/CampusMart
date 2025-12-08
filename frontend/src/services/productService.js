import api from './api';

// Get all products
export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Get product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Search products
export const searchProducts = async (searchTerm) => {
  const response = await api.get(`/products/search?term=${searchTerm}`);
  return response.data;
};

// Get products by seller
export const getProductsBySeller = async (sellerId) => {
  const response = await api.get(`/products/seller/${sellerId}`);
  return response.data;
};

// Create product (requires authentication)
export const createProduct = async (productData, sellerId) => {
  const url = sellerId ? `/products?sellerId=${sellerId}` : '/products';
  const response = await api.post(url, productData);
  return response.data;
};

// Update product (requires authentication)
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete product (requires authentication)
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Toggle like for product (requires profileId)
export const likeProduct = async (id, profileId) => {
  const response = await api.post(`/products/${id}/like?profileId=${profileId}`);
  return response.data;
};

// Check if user has liked a product
export const hasUserLikedProduct = async (id, profileId) => {
  const response = await api.get(`/products/${id}/liked?profileId=${profileId}`);
  return response.data;
};
