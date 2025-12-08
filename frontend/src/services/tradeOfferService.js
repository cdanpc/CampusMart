import api from './api';

/**
 * Trade Offer Service
 * Handles all trade offer-related API calls
 */

/**
 * Create a new trade offer
 * @param {Object} offerData - Trade offer data
 * @param {number} offerData.productId - Product ID
 * @param {number} offerData.offererId - Offerer's profile ID (buyer)
 * @param {string} offerData.itemName - Name of item being offered in trade
 * @param {number} offerData.itemEstimatedValue - Estimated value of trade item
 * @param {string} offerData.itemCondition - Condition of trade item
 * @param {string} offerData.itemImageUrl - URL of trade item image
 * @param {number} offerData.cashComponent - Additional cash component (optional)
 * @param {string} offerData.tradeDescription - Description of the offer/trade
 * @returns {Promise<Object>} Created trade offer object
 */
export const createTradeOffer = async (offerData) => {
  const payload = {
    product: { id: offerData.productId },
    offerer: { id: offerData.offererId },
    offeredPrice: offerData.itemEstimatedValue || 0, // Use item value as offered price
    itemName: offerData.itemName,
    itemEstimatedValue: offerData.itemEstimatedValue,
    itemCondition: offerData.itemCondition,
    itemImageUrl: offerData.itemImageUrl,
    cashComponent: offerData.cashComponent || 0,
    tradeDescription: offerData.tradeDescription || '',
    status: 'PENDING'
  };
  
  const response = await api.post('/tradeoffers', payload);
  return response.data;
};

/**
 * Get all trade offers received by a seller
 * @param {number} sellerId - Seller's profile ID
 * @returns {Promise<Array>} List of trade offers
 */
export const getOffersBySeller = async (sellerId) => {
  const response = await api.get(`/tradeoffers/seller/${sellerId}`);
  return response.data;
};

/**
 * Get all trade offers made by a buyer/offerer
 * @param {number} offererId - Offerer's profile ID (buyer)
 * @returns {Promise<Array>} List of trade offers
 */
export const getOffersByBuyer = async (offererId) => {
  const response = await api.get(`/tradeoffers/offerer/${offererId}`);
  return response.data;
};

/**
 * Get all trade offers for a specific product
 * @param {number} productId - Product ID
 * @returns {Promise<Array>} List of trade offers
 */
export const getOffersByProduct = async (productId) => {
  const response = await api.get(`/tradeoffers/product/${productId}`);
  return response.data;
};

/**
 * Get a specific trade offer by ID
 * @param {number} offerId - Trade offer ID
 * @returns {Promise<Object>} Trade offer object
 */
export const getTradeOfferById = async (offerId) => {
  const response = await api.get(`/tradeoffers/${offerId}`);
  return response.data;
};

/**
 * Update trade offer status (accept, reject, withdraw)
 * @param {number} offerId - Trade offer ID
 * @param {string} status - New status (ACCEPTED, REJECTED, WITHDRAWN, PENDING)
 * @returns {Promise<Object>} Updated trade offer object
 */
export const updateOfferStatus = async (offerId, status) => {
  const response = await api.patch(`/tradeoffers/${offerId}/status`, { status });
  return response.data;
};

/**
 * Delete a trade offer
 * @param {number} offerId - Trade offer ID
 * @returns {Promise<void>}
 */
export const deleteTradeOffer = async (offerId) => {
  const response = await api.delete(`/tradeoffers/${offerId}`);
  return response.data;
};

/**
 * Accept a trade offer (seller action)
 * @param {number} offerId - Trade offer ID
 * @returns {Promise<Object>} Updated trade offer object
 */
export const acceptOffer = async (offerId) => {
  return updateOfferStatus(offerId, 'ACCEPTED');
};

/**
 * Reject a trade offer (seller action)
 * @param {number} offerId - Trade offer ID
 * @returns {Promise<Object>} Updated trade offer object
 */
export const rejectOffer = async (offerId) => {
  return updateOfferStatus(offerId, 'REJECTED');
};

/**
 * Withdraw a trade offer (buyer action)
 * @param {number} offerId - Trade offer ID
 * @returns {Promise<Object>} Updated trade offer object
 */
export const withdrawOffer = async (offerId) => {
  return updateOfferStatus(offerId, 'WITHDRAWN');
};
