/**
 * Image Processing Utilities
 * Handles image compression, validation, and formatting
 */

/**
 * Compress image to reduce file size
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default: 800px)
 * @param {number} maxHeight - Maximum height (default: 800px)
 * @param {number} quality - Compression quality 0-1 (default: 0.8)
 * @returns {Promise<string>} Base64 encoded compressed image
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedReader = new FileReader();
            compressedReader.onloadend = () => resolve(compressedReader.result);
            compressedReader.onerror = reject;
            compressedReader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Compress multiple images in parallel
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<string[]>} Array of base64 encoded images
 */
export const compressImages = async (files, options = {}) => {
  const promises = files.map(file => compressImage(file, options.maxWidth, options.maxHeight, options.quality));
  return Promise.all(promises);
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5)
 * @returns {{valid: boolean, error?: string}}
 */
export const validateImage = (file, maxSizeMB = 5) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Validate multiple images
 * @param {File[]} files - Array of files to validate
 * @param {Object} options - Validation options
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateImages = (files, options = {}) => {
  const { maxSizeMB = 5, maxCount = 5 } = options;
  const errors = [];

  if (files.length > maxCount) {
    errors.push(`Maximum ${maxCount} images allowed`);
    return { valid: false, errors };
  }

  for (let i = 0; i < files.length; i++) {
    const result = validateImage(files[i], maxSizeMB);
    if (!result.valid) {
      errors.push(`Image ${i + 1}: ${result.error}`);
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Get image URL from various possible properties
 * @param {Object} imageObj - Image object with various possible property names
 * @returns {string} Image URL or placeholder
 */
export const getImageUrl = (imageObj, placeholder = 'https://placehold.co/400x300?text=No+Image') => {
  if (!imageObj) return placeholder;
  
  return imageObj.imageUrl || 
         imageObj.image_url || 
         imageObj.url || 
         imageObj.src || 
         placeholder;
};

/**
 * Get primary image from array of images
 * @param {Array} images - Array of image objects
 * @returns {string} Primary image URL or placeholder
 */
export const getPrimaryImage = (images, placeholder = 'https://placehold.co/400x300?text=No+Image') => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return placeholder;
  }

  // Find primary image
  const primaryImg = images.find(img => img.isPrimary || img.is_primary);
  if (primaryImg) {
    return getImageUrl(primaryImg, placeholder);
  }

  // Return first image if no primary
  return getImageUrl(images[0], placeholder);
};
