import api from './api';

/**
 * Order Service
 * Handles all order-related API calls
 */

/**
 * Create a new order (Buy Now)
 * @param {Object} orderData - Order data including buyer, seller, product, payment info
 * @returns {Promise<Object>} Created order object
 */
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

/**
 * Get all orders for the current user (as buyer)
 * @param {number} buyerId - Profile ID of the buyer
 * @returns {Promise<Array>} List of orders
 */
export const getOrdersByBuyer = async (buyerId) => {
  const response = await api.get(`/orders/buyer/${buyerId}`);
  return response.data;
};

/**
 * Get all orders for the current user (as seller)
 * @param {number} sellerId - Profile ID of the seller
 * @returns {Promise<Array>} List of orders
 */
export const getOrdersBySeller = async (sellerId) => {
  const response = await api.get(`/orders/seller/${sellerId}`);
  return response.data;
};

/**
 * Get a specific order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order object
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status (pending, confirmed, processing, ready, completed, cancelled)
 * @returns {Promise<Object>} Updated order object
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

/**
 * Get orders for a specific product
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} List of orders
 */
export const getOrdersByProduct = async (productId) => {
  const response = await api.get(`/orders/product/${productId}`);
  return response.data;
};

/**
 * Delete an order
 * @param {number} orderId - Order ID
 * @returns {Promise<void>}
 */
export const deleteOrder = async (orderId) => {
  const response = await api.delete(`/orders/${orderId}`);
  return response.data;
};
