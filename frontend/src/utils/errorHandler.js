/**
 * Error Handling Utilities
 * Centralized error handling and message formatting
 */

/**
 * Extract user-friendly error message from API error
 * @param {Error} error - The error object from API call
 * @param {string} defaultMessage - Default fallback message
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, defaultMessage = 'An error occurred. Please try again.') => {
  // Network error
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Network error: Unable to connect to server. Please check your connection.';
  }

  // Server response error
  if (error.response?.data) {
    const { data } = error.response;
    
    // If there's a message field, return it
    if (data.message) {
      return data.message;
    }
    
    // If there's an error field, return it
    if (data.error) {
      return data.error;
    }
    
    // If there are validation errors, format them
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages = Object.values(data.errors).join(', ');
      return errorMessages || defaultMessage;
    }
  }

  // HTTP status code specific messages
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This item already exists.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Server error: ${error.response.status}`;
    }
  }

  return error.message || defaultMessage;
};

/**
 * Handle async operation with error handling
 * @param {Function} operation - Async function to execute
 * @param {Object} options - Configuration options
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const handleAsync = async (operation, options = {}) => {
  const {
    onSuccess,
    onError,
    defaultError = 'Operation failed',
    showConsoleError = true
  } = options;

  try {
    const result = await operation();
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = getErrorMessage(error, defaultError);
    
    if (showConsoleError) {
      console.error('Operation failed:', error);
    }
    
    if (onError) {
      onError(errorMessage, error);
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Create a try-catch wrapper for event handlers
 * @param {Function} handler - The event handler function
 * @param {Function} onError - Error callback
 * @returns {Function} Wrapped handler
 */
export const withErrorHandler = (handler, onError) => {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Handler error:', error);
      
      if (onError) {
        onError(errorMessage, error);
      }
      
      return null;
    }
  };
};
