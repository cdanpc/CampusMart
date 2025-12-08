import { useState } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import './ReviewsModal.css';

export default function ReviewsModal({ isOpen, onClose, reviews, sellerRating, totalReviews, sellerName }) {
  const [sortBy, setSortBy] = useState('recent');

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={`full-${i}`} className="star star--filled" />);
    }
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="star star--half" />);
    }
    while (stars.length < 5) {
      stars.push(<FiStar key={`empty-${stars.length}`} className="star star--empty" />);
    }
    return stars;
  };

  const sortReviews = (reviewsList) => {
    const sorted = [...reviewsList];
    switch (sortBy) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  const sortedReviews = sortReviews(reviews);

  return (
    <div className="reviews-modal-overlay" onClick={onClose}>
      <div className="reviews-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="reviews-modal__header">
          <h2 className="reviews-modal__title">All Seller Reviews</h2>
          <button 
            onClick={onClose} 
            className="modal-close"
            aria-label="Close reviews modal"
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="reviews-modal-content">
          {/* Summary Section */}
          <div className="reviews-modal-summary">
            <div className="reviews-summary-score">
              <div className="summary-rating-number">{sellerRating}</div>
              <div className="summary-stars">
                {renderStars(sellerRating)}
              </div>
              <p className="summary-text">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} for {sellerName}
              </p>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="reviews-sort-controls">
            <label htmlFor="sort-reviews" className="sort-label">Sort by:</label>
            <select 
              id="sort-reviews"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="reviews-modal-list">
            {sortedReviews.length > 0 ? (
              sortedReviews.map((review) => (
                <div key={review.review_id} className="reviews-modal-item">
                  <div className="reviews-modal-item__header">
                    <div className="review-author-section">
                      <div className="review-author-avatar">
                        {review.reviewer_name.charAt(0)}
                      </div>
                      <div>
                        <p className="review-author-name">{review.reviewer_name}</p>
                        <p className="review-date">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    <div className="review-stars-inline">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="reviews-modal-item__text">{review.review_text}</p>
                </div>
              ))
            ) : (
              <div className="reviews-empty">
                <p>No reviews yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
