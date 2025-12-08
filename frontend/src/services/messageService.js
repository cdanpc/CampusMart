import api from './api';

/**
 * Message Service
 * Handles all message-related API calls
 */

/**
 * Get all conversations for a user
 * @param {number} userId - Profile ID of the user
 * @returns {Promise<Array>} List of conversations with last message and unread count
 */
export const getConversations = async (userId) => {
  const response = await api.get(`/messages/conversations/${userId}`);
  return response.data;
};

/**
 * Get unread message count for a user
 * @param {number} userId - Profile ID of the user
 * @returns {Promise<Object>} Object with unreadCount
 */
export const getUnreadCount = async (userId) => {
  const response = await api.get(`/messages/unread-count/${userId}`);
  return response.data;
};

/**
 * Get conversation between two users
 * @param {number} user1Id - First user's profile ID
 * @param {number} user2Id - Second user's profile ID
 * @returns {Promise<Array>} List of messages in chronological order
 */
export const getConversation = async (user1Id, user2Id) => {
  const response = await api.get(`/messages/conversation/${user1Id}/${user2Id}`);
  return response.data;
};

/**
 * Get conversation between two users for a specific product
 * @param {number} user1Id - First user's profile ID
 * @param {number} user2Id - Second user's profile ID
 * @param {number|null} productId - Product ID (null for general inquiries)
 * @returns {Promise<Array>} List of messages in chronological order
 */
export const getConversationByProduct = async (user1Id, user2Id, productId) => {
  // Use different endpoint based on whether this is a general inquiry or product-specific
  const endpoint = productId 
    ? `/messages/conversation/${user1Id}/${user2Id}/product/${productId}`
    : `/messages/conversation/${user1Id}/${user2Id}/general`;
  
  const response = await api.get(endpoint);
  return response.data;
};

/**
 * Send a new message
 * @param {Object} messageData - Message data
 * @param {number} messageData.senderId - Sender's profile ID
 * @param {number} messageData.receiverId - Receiver's profile ID
 * @param {number} messageData.productId - Product ID (optional)
 * @param {string} messageData.content - Message content
 * @param {string} messageData.imageUrl - Image URL (optional)
 * @returns {Promise<Object>} Created message object
 */
export const sendMessage = async (messageData) => {
  // Format data for backend
  const payload = {
    sender: { id: messageData.senderId },
    receiver: { id: messageData.receiverId },
    product: messageData.productId ? { id: messageData.productId } : null,
    content: messageData.content
  };
  
  // Add imageUrl if provided
  if (messageData.imageUrl) {
    payload.imageUrl = messageData.imageUrl;
  }
  
  const response = await api.post('/messages', payload);
  return response.data;
};

/**
 * Mark a single message as read
 * @param {number} messageId - Message ID
 * @returns {Promise<Object>} Updated message object
 */
export const markMessageAsRead = async (messageId) => {
  const response = await api.patch(`/messages/${messageId}/read`);
  return response.data;
};

/**
 * Mark all messages in a conversation as read
 * @param {Object} conversationData - Conversation data
 * @param {number} conversationData.userId - Current user's profile ID
 * @param {number} conversationData.otherUserId - Other user's profile ID
 * @param {number} conversationData.productId - Product ID (optional)
 * @returns {Promise<Object>} Response message
 */
export const markConversationAsRead = async (conversationData) => {
  const response = await api.patch('/messages/conversation/read', conversationData);
  return response.data;
};

/**
 * Delete a message
 * @param {number} messageId - Message ID
 * @returns {Promise<void>}
 */
export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
};

/**
 * Delete (soft delete) a conversation
 * @param {number} userId - Current user's profile ID
 * @param {number} otherUserId - Other user's profile ID
 * @param {number} productId - Product ID (optional)
 * @returns {Promise<Object>} Response message
 */
export const deleteConversation = async (userId, otherUserId, productId = null) => {
  const params = { userId, otherUserId };
  if (productId) params.productId = productId;
  
  const response = await api.delete('/messages/conversation', { params });
  return response.data;
};

/**
 * Archive a conversation
 * @param {number} userId - Current user's profile ID
 * @param {number} otherUserId - Other user's profile ID
 * @param {number} productId - Product ID (optional)
 * @returns {Promise<Object>} Response message
 */
export const archiveConversation = async (userId, otherUserId, productId = null) => {
  const params = { userId, otherUserId };
  if (productId) params.productId = productId;
  
  const response = await api.patch('/messages/conversation/archive', null, { params });
  return response.data;
};

/**
 * Mute or unmute a conversation
 * @param {number} userId - Current user's profile ID
 * @param {number} otherUserId - Other user's profile ID
 * @param {boolean} muted - Whether to mute (true) or unmute (false)
 * @param {number} productId - Product ID (optional)
 * @returns {Promise<Object>} Response message
 */
export const muteConversation = async (userId, otherUserId, muted, productId = null) => {
  const params = { userId, otherUserId, muted };
  if (productId) params.productId = productId;
  
  const response = await api.patch('/messages/conversation/mute', null, { params });
  return response.data;
};

/**
 * Report a conversation
 * @param {Object} reportData - Report data
 * @param {number} reportData.reporterId - Reporter's profile ID
 * @param {number} reportData.reportedUserId - Reported user's profile ID
 * @param {number} reportData.productId - Product ID (optional)
 * @param {string} reportData.reason - Reason for reporting
 * @returns {Promise<Object>} Response message
 */
export const reportConversation = async (reportData) => {
  const response = await api.post('/reports', reportData);
  return response.data;
};

/**
 * Upload a message image
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Object with imageUrl
 */
export const uploadMessageImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post('/messages/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
