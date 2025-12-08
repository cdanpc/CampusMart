import { useState } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import Button from './Button';
import './RatingModal.css';

export default function RatingModal({ isOpen, onClose, orderData, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !orderData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    if (review.trim().length < 10) {
      setError('Please write at least 10 characters in your review');
      return;
    }

    // Prepare rating data for backend API
    const ratingData = {
      reviewerId: orderData.buyerProfileId,
      sellerId: orderData.sellerProfileId,
      productId: orderData.productId,
      orderId: orderData.orderId,
      rating: rating,
      comment: review.trim()
    };

    console.log('Submitting rating:', ratingData);
    
    if (onSubmit) {
      onSubmit(ratingData);
    }
    
    // Reset form and close
    setRating(0);
    setReview('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setReview('');
    setError('');
    onClose();
  };

  return (
    <div className="rating-modal-overlay" onClick={handleClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rating-modal__header no-print">
          <h2 className="rating-modal__title">Rate Your Purchase</h2>
          <button 
            onClick={handleClose} 
            className="modal-close"
            aria-label="Close rating modal"
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="rating-content">
          {/* Product Info */}
          <div className="rating-product">
            <img 
              src={orderData?.productImage || 'https://placehold.co/100x100/e0e0e0/666?text=No+Image'} 
              alt={orderData?.productName || 'Product'}
              className="rating-product__image"
              onError={(e) => {
                e.target.src = 'https://placehold.co/100x100/e0e0e0/666?text=No+Image';
              }}
            />
            <div className="rating-product__details">
              <h3 className="rating-product__name">{orderData?.productName || 'Unknown Product'}</h3>
              <p className="rating-product__seller">
                Sold by: {orderData?.sellerFirstName || ''} {orderData?.sellerLastName || ''}
              </p>
            </div>
          </div>

          {/* Rating Form */}
          <form onSubmit={handleSubmit} className="rating-form">
            {/* Star Rating */}
            <div className="rating-stars-section">
              <label className="rating-label">Your Rating</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${
                      star <= (hoverRating || rating) ? 'star-filled' : 'star-empty'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} stars`}
                  >
                    <FiStar />
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {rating === 0 
                  ? 'Select a rating' 
                  : rating === 1 
                  ? 'Poor' 
                  : rating === 2 
                  ? 'Fair' 
                  : rating === 3 
                  ? 'Good' 
                  : rating === 4 
                  ? 'Very Good' 
                  : 'Excellent'}
              </p>
            </div>

            {/* Review Text */}
            <div className="rating-review-section">
              <label htmlFor="review" className="rating-label">
                Your Review
              </label>
              <textarea
                id="review"
                className="rating-textarea"
                placeholder="Share your experience with this product and seller..."
                value={review}
                onChange={(e) => {
                  setReview(e.target.value);
                  setError('');
                }}
                rows="5"
              />
              <p className="rating-char-count">
                {review.length} / 500 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rating-error">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="rating-modal__actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Submit Rating
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
