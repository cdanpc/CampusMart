import api from './api';

/**
 * Seller Service
 * Handles all seller profile-related API calls
 */

/**
 * Get seller profile with aggregated statistics
 * @param {number} sellerId - Profile ID of the seller
 * @returns {Promise<Object>} Seller info with stats
 */
export const getSellerInfo = async (sellerId) => {
  const response = await api.get(`/profiles/${sellerId}/seller-info`);
  return response.data;
};

/**
 * Get seller's active listings
 * @param {number} sellerId - Profile ID of the seller
 * @param {boolean} availableOnly - Filter for available products only
 * @returns {Promise<Array>} List of products
 */
export const getSellerListings = async (sellerId, availableOnly = true) => {
  const params = availableOnly ? { available: true } : {};
  const response = await api.get(`/products/seller/${sellerId}`, { params });
  return response.data;
};

/**
 * Get seller reviews with pagination and sorting
 * @param {number} sellerId - Profile ID of the seller
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Number of reviews per page
 * @param {string} sortBy - Sort option: 'recent', 'highest', 'lowest'
 * @returns {Promise<Object>} Paginated reviews with reviewer details
 */
export const getSellerReviews = async (sellerId, page = 0, size = 10, sortBy = 'recent') => {
  const response = await api.get(`/reviews/seller/${sellerId}/detailed`, {
    params: { page, size, sortBy }
  });
  return response.data;
};

/**
 * Submit a seller rating/review
 * Supports two types:
 * 1. Seller-only review (product is null) - rate seller directly
 * 2. Product review (product.id provided) - rate seller + product after purchase
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.reviewer.id - Reviewer's profile ID
 * @param {number} reviewData.seller.id - Seller's profile ID
 * @param {Object|null} reviewData.product - Product object (optional, null for seller-only reviews)
 * @param {number} [reviewData.product.id] - Product ID (required only for product reviews)
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @returns {Promise<Object>} Created review object
 */
export const submitSellerRating = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};
