import api from './api';

/**
 * Review Service
 * Handles all review/rating-related API calls
 */

/**
 * Create a new review/rating
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.reviewerId - ID of the reviewer (buyer)
 * @param {number} reviewData.sellerId - ID of the seller being reviewed
 * @param {number} reviewData.productId - ID of the product (optional)
 * @param {number} reviewData.orderId - ID of the order
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review text
 * @returns {Promise<Object>} Created review object
 */
export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', {
    reviewer: { id: reviewData.reviewerId },
    seller: { id: reviewData.sellerId },
    product: reviewData.productId ? { id: reviewData.productId } : null,
    order: { id: reviewData.orderId },
    rating: reviewData.rating,
    comment: reviewData.comment
  });
  return response.data;
};

/**
 * Get all reviews for a specific product
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} List of reviews
 */
export const getReviewsByProduct = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

/**
 * Get all reviews received by a seller
 * @param {number} sellerId - Seller profile ID
 * @returns {Promise<Array>} List of reviews
 */
export const getReviewsBySeller = async (sellerId) => {
  const response = await api.get(`/reviews/user/${sellerId}`);
  return response.data;
};

/**
 * Get detailed reviews for a seller with pagination
 * @param {number} sellerId - Seller profile ID
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @param {string} sortBy - Sort option: 'recent', 'highest', 'lowest'
 * @returns {Promise<Object>} Paginated reviews with content, totalPages, totalElements
 */
export const getDetailedReviewsBySeller = async (sellerId, page = 0, size = 10, sortBy = 'recent') => {
  const response = await api.get(`/reviews/seller/${sellerId}/detailed`, {
    params: { page, size, sortBy }
  });
  return response.data;
};

/**
 * Get all reviews written by a user
 * @param {number} reviewerId - Reviewer profile ID
 * @returns {Promise<Array>} List of reviews
 */
export const getReviewsWritten = async (reviewerId) => {
  const response = await api.get(`/reviews/written/${reviewerId}`);
  return response.data;
};

/**
 * Get a specific review by ID
 * @param {number} reviewId - Review ID
 * @returns {Promise<Object>} Review object
 */
export const getReviewById = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Update an existing review
 * @param {number} reviewId - Review ID
 * @param {Object} reviewData - Updated review data (rating, comment)
 * @returns {Promise<Object>} Updated review object
 */
export const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, {
    rating: reviewData.rating,
    comment: reviewData.comment
  });
  return response.data;
};

/**
 * Delete a review
 * @param {number} reviewId - Review ID
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

/**
 * Calculate average rating from reviews array
 * @param {Array} reviews - Array of review objects
 * @returns {number} Average rating (0 if no reviews)
 */
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

/**
 * Get rating distribution
 * @param {Array} reviews - Array of review objects
 * @returns {Object} Distribution object {5: count, 4: count, ...}
 */
export const getRatingDistribution = (reviews) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!reviews || reviews.length === 0) return distribution;
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating]++;
    }
  });
  
  return distribution;
};
