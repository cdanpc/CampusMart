import { FiTrash2, FiX } from 'react-icons/fi';
import './ImageUploadModal.css';

/**
 * ImageUploadModal Component
 * Modal for previewing and managing multiple images before sending
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Close modal callback
 * @param {Array} images - Array of image objects with id and preview URL
 * @param {Function} onRemoveImage - Remove image callback
 * @param {Function} onAddMore - Add more images callback
 * @param {Function} onSend - Send images callback
 * @param {boolean} uploading - Whether images are being uploaded
 */
export default function ImageUploadModal({
  isOpen,
  onClose,
  images = [],
  onRemoveImage,
  onAddMore,
  onSend,
  uploading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="image-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-upload-modal__header">
          <h3>Send Image{images.length > 1 ? 's' : ''}</h3>
          <button className="image-upload-modal__close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="image-upload-modal__body">
          <div className="image-upload-modal__grid">
            {images.map((image) => (
              <div key={image.id} className="image-upload-modal__item">
                <img src={image.preview} alt="Preview" />
                <button
                  type="button"
                  className="image-upload-modal__delete"
                  onClick={() => onRemoveImage(image.id)}
                  title="Remove image"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="image-upload-modal__footer">
          <button
            type="button"
            onClick={onAddMore}
            className="btn btn--secondary"
            disabled={uploading}
          >
            Add More Images
          </button>
          <button
            type="button"
            onClick={onSend}
            className="btn btn--primary"
            disabled={images.length === 0 || uploading}
          >
            {uploading ? 'Sending...' : `Send ${images.length} Image${images.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}