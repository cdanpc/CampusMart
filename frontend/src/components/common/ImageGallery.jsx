import { useState } from 'react';
import ImagePreviewModal from './ImagePreviewModal';
import './ImageGallery.css';

/**
 * ImageGallery Component
 * Displays main image with thumbnail navigation and preview modal
 * 
 * @param {Array} images - Array of image objects with imageUrl/url properties
 * @param {string} altText - Alt text for images
 * @param {string} className - Additional CSS classes
 */
export default function ImageGallery({ 
  images = [], 
  altText = 'Product image',
  className = '' 
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const hasImages = images.length > 0;
  const displayImage = hasImages 
    ? (images[selectedIndex]?.imageUrl || images[selectedIndex]?.url)
    : 'https://placehold.co/1000x750/E5E7EB/6B7280?text=No+Image';

  const imageUrls = images.map(img => img.imageUrl || img.url);

  return (
    <>
      <div className={`image-gallery ${className}`}>
        <div className="image-gallery__main">
          <img 
            src={displayImage}
            alt={`${altText} - View ${selectedIndex + 1}`}
            className="image-gallery__image"
            onClick={() => setIsPreviewOpen(true)}
          />
        </div>
        
        {hasImages && images.length > 1 && (
          <div className="image-gallery__thumbnails">
            {images.map((image, index) => (
              <img
                key={image.id || image.imageId || index}
                src={image.imageUrl || image.url || 'https://placehold.co/150x150/E5E7EB/6B7280?text=No+Image'}
                alt={`${altText} ${index + 1}`}
                className={`image-gallery__thumbnail ${index === selectedIndex ? 'image-gallery__thumbnail--active' : ''}`}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        images={imageUrls}
        currentIndex={selectedIndex}
        onNavigate={setSelectedIndex}
      />
    </>
  );
}
