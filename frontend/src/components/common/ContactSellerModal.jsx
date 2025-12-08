import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSend } from 'react-icons/fi';
import Button from './Button';
import { sendMessage } from '../../services/messageService';
import './ContactSellerModal.css';

export default function ContactSellerModal({ isOpen, onClose, product, seller }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    content: '' // messages.content (TEXT)
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { value } = e.target;
    setFormData({ content: value });
    
    if (errors.content) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.content?.trim()) {
      newErrors.content = 'Please enter a message';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Get current user from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        if (!currentUser || !currentUser.profile || !currentUser.profile.id) {
          alert('Please log in to send messages');
          navigate('/login');
          return;
        }

        // Send message using the backend API
        // Handle different seller object structures (try all possible field names)
        const sellerId = seller.id || seller.profileId || seller.profile_id || seller.sellerId || seller.seller_id;
        
        if (!sellerId) {
          console.error('Seller object:', seller);
          console.error('Unable to find seller ID in any of these fields: id, profileId, profile_id, sellerId, seller_id');
          alert('Unable to identify seller. Please try again.');
          return;
        }
        
        console.log('Using seller ID:', sellerId);
        
        const messageData = {
          senderId: currentUser.profile.id,
          receiverId: sellerId,
          productId: product?.id || null, // Only include productId if product has valid id
          content: formData.content.trim()
        };
        
        await sendMessage(messageData);
        
        // Reset form and close modal
        setFormData({ content: '' });
        setErrors({});
        onClose();
        
        // Navigate to messages page with the conversation open
        // Only include product param if this is about a specific product
        const navigationUrl = product?.id 
          ? `/messages?user=${sellerId}&product=${product.id}`
          : `/messages?user=${sellerId}`;
        navigate(navigationUrl);
        
      } catch (error) {
        console.error('Error sending message:', error);
        setErrors({ content: 'Failed to send message. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content contact-seller-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">Contact Seller</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Product & Seller Info */}
        {seller && (
          <div className="contact-info">
            {/* Only show product info if this is about a specific product (has valid id) */}
            {product?.id && (
              <div className="contact-info__product">
                <p className="contact-info__label">Regarding:</p>
                <h3 className="contact-info__title">{product.name}</h3>
                <p className="contact-info__price">
                  ₱{product.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            <div className="contact-info__seller">
              <p className="contact-info__label">Seller:</p>
              <p className="contact-info__name">
                {seller.first_name || seller.firstName} {seller.last_name || seller.lastName}
              </p>
            </div>
          </div>
        )}

        {/* Message Form */}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Message *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className={`form-textarea ${errors.content ? 'form-textarea--error' : ''}`}
              placeholder={product?.id 
                ? "Hi! I'm interested in your item. Is it still available?"
                : "Hi! I'd like to inquire about your products/services..."}
              rows={6}
              disabled={isSubmitting}
            />
            {errors.content && (
              <span className="form-error">{errors.content}</span>
            )}
            <p className="form-help">
              Ask about availability, condition, meetup details, or negotiation.
            </p>
          </div>

          <div className="modal-actions">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <FiSend className="btn__icon" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
