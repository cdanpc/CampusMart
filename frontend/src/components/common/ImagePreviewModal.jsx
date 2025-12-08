import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './ImagePreviewModal.css';

export default function ImagePreviewModal({ 
  isOpen, 
  onClose, 
  images = [], 
  currentIndex = 0,
  onNavigate 
}) {
  if (!isOpen || images.length === 0) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const currentImage = images[currentIndex];
  const imageUrl = typeof currentImage === 'string' 
    ? currentImage 
    : URL.createObjectURL(currentImage);

  return (
    <div className="image-preview-modal" onClick={handleOverlayClick}>
      <div className="image-preview-modal__content" onClick={handleOverlayClick}>
        {images.length > 1 && currentIndex > 0 && (
          <button 
            className="image-preview-modal__nav image-preview-modal__nav--prev"
            onClick={handlePrevious}
          >
            <FiChevronLeft />
          </button>
        )}

        <div className="image-preview-modal__image-container" onClick={(e) => e.stopPropagation()}>
          <img 
            src={imageUrl} 
            alt={`Preview ${currentIndex + 1}`}
            className="image-preview-modal__image"
          />
        </div>

        {images.length > 1 && currentIndex < images.length - 1 && (
          <button 
            className="image-preview-modal__nav image-preview-modal__nav--next"
            onClick={handleNext}
          >
            <FiChevronRight />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="image-preview-modal__counter" onClick={(e) => e.stopPropagation()}>
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
