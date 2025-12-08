import { useState } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import './RatingModal.css';

export default function SellerRatingModal({ isOpen, onClose, seller, onSubmit, productId }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !seller) return null;

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

    // Prepare rating data matching backend ReviewEntity format
    // productId is optional - if null, this is a seller-only review
    const ratingData = {
      reviewer: { id: user?.profile?.id },
      seller: { id: seller.profileId || seller.profile_id },
      product: productId ? { id: productId } : null,
      rating: rating,
      comment: review.trim()
    };

    console.log('Submitting seller rating:', ratingData);
    
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
          <h2 className="rating-modal__title">{productId ? 'Rate Product & Seller' : 'Rate Seller'}</h2>
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
          {/* Seller Info */}
          <div className="rating-product">
            <div className="seller-avatar-large">
              {(seller.firstName || seller.first_name)?.[0] || ''}{(seller.lastName || seller.last_name)?.[0] || ''}
            </div>
            <div className="rating-product__details">
              <h3 className="rating-product__name">
                {seller.firstName || seller.first_name} {seller.lastName || seller.last_name}
              </h3>
              <p className="rating-product__seller">
                Current Rating: {seller.sellerRating || seller.seller_rating || 0}/5.0 ({seller.totalReviews || seller.total_reviews || 0} reviews)
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
                placeholder="Share your experience with this seller..."
                value={review}
                onChange={(e) => {
                  setReview(e.target.value);
                  setError('');
                }}
                rows="5"
                maxLength={500}
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
