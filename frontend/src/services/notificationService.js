import api from './api';

/**
 * Notification Service
 * Handles all notification-related API calls
 */

/**
 * Get all notifications for a user
 * @param {number} profileId - Profile ID
 * @param {string} type - Optional filter by type (MESSAGE, ORDER, PROMOTION, etc.)
 * @returns {Promise<Array>} List of notifications
 */
export const getNotifications = async (profileId, type = null) => {
  const params = type ? { type } : {};
  const response = await api.get(`/notifications/profile/${profileId}`, { params });
  return response.data;
};

/**
 * Get unread notifications for a user
 * @param {number} profileId - Profile ID
 * @returns {Promise<Array>} List of unread notifications
 */
export const getUnreadNotifications = async (profileId) => {
  const response = await api.get(`/notifications/profile/${profileId}/unread`);
  return response.data;
};

/**
 * Get unread notification count
 * @param {number} profileId - Profile ID
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadCount = async (profileId) => {
  const response = await api.get(`/notifications/profile/${profileId}/unread/count`);
  return response.data;
};

/**
 * Mark a notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 * @param {number} profileId - Profile ID
 * @returns {Promise<void>}
 */
export const markAllAsRead = async (profileId) => {
  const response = await api.patch(`/notifications/profile/${profileId}/read-all`);
  return response.data;
};

/**
 * Delete a notification
 * @param {number} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

/**
 * Delete all notifications
 * @param {number} profileId - Profile ID
 * @returns {Promise<void>}
 */
export const deleteAllNotifications = async (profileId) => {
  const response = await api.delete(`/notifications/profile/${profileId}`);
  return response.data;
};
