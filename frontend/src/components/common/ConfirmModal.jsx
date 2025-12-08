import { FiAlertTriangle, FiX } from 'react-icons/fi';
import Button from './Button';
import './ConfirmModal.css';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // 'danger' or 'warning'
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal">
        <button className="confirm-modal__close" onClick={onClose}>
          <FiX />
        </button>

        <div className={`confirm-modal__icon confirm-modal__icon--${variant}`}>
          <FiAlertTriangle />
        </div>

        <h3 className="confirm-modal__title">{title}</h3>
        <p className="confirm-modal__message">{message}</p>

        <div className="confirm-modal__actions">
          <Button 
            variant="secondary" 
            onClick={onClose}
            fullWidth
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
