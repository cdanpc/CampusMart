import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import StarRating from './StarRating';
import { formatDate } from '../../utils';
import './ReviewsSection.css';

/**
 * ReviewsSection Component
 * Displays product reviews with sorting, filtering, and pagination
 * 
 * @param {Array} reviews - Array of review objects
 * @param {number} averageRating - Average rating value
 * @param {Object} ratingDistribution - Distribution object {5: count, 4: count, ...}
 * @param {boolean} canWriteReview - Whether user can write a review
 * @param {Function} onWriteReview - Callback when write review button clicked
 * @param {number} reviewsPerPage - Number of reviews per page (default: 5)
 */
export default function ReviewsSection({ 
  reviews = [],
  averageRating = 0,
  ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  canWriteReview = false,
  onWriteReview = null,
  reviewsPerPage = 5
}) {
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(0);

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
  });

  // Pagination
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const displayedReviews = sortedReviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  const safeRating = Number(averageRating) || 0;

  if (reviews.length === 0 && !canWriteReview) {
    return (
      <div className="reviews-section reviews-section--empty">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      {reviews.length > 0 && (
        <>
          {/* Rating Summary */}
          <div className="reviews-section__summary">
            <div className="reviews-section__score">
              <div className="reviews-section__average">
                <span className="reviews-section__average-number">{safeRating.toFixed(1)}</span>
                <StarRating rating={safeRating} size={24} />
                <span className="reviews-section__average-text">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="reviews-section__distribution">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="reviews-section__distribution-row">
                  <span className="reviews-section__distribution-label">
                    {star} <FiStar className="star-icon" />
                  </span>
                  <div className="reviews-section__distribution-bar">
                    <div 
                      className="reviews-section__distribution-fill" 
                      style={{ 
                        width: `${reviews.length > 0 ? (ratingDistribution[star] / reviews.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="reviews-section__distribution-count">
                    ({ratingDistribution[star]})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="reviews-section__controls">
            {canWriteReview && onWriteReview && (
              <button 
                onClick={onWriteReview}
                className="btn btn--primary reviews-section__write-btn"
              >
                <FiStar className="btn__icon" />
                Write a Review
              </button>
            )}
            <label htmlFor="sort-reviews" className="reviews-section__sort-label">
              Sort by:
            </label>
            <select 
              id="sort-reviews"
              value={sortBy} 
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(0);
              }}
              className="reviews-section__sort-select"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          {/* Reviews List */}
          <div className="reviews-section__list">
            {displayedReviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-item__header">
                  <div className="review-item__user">
                    <div className="review-item__avatar">
                      {(review.reviewer?.firstName?.[0] || review.reviewer?.first_name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="review-item__reviewer">
                        {review.reviewer?.firstName || review.reviewer?.first_name || 'Anonymous'}{' '}
                        {review.reviewer?.lastName?.[0] || review.reviewer?.last_name?.[0] || ''}.
                      </p>
                      <StarRating rating={review.rating} size={16} />
                    </div>
                  </div>
                  <p className="review-item__date">
                    {formatDate(review.createdAt || review.created_at)}
                  </p>
                </div>
                <p className="review-item__comment">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="reviews-section__pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="reviews-section__pagination-btn"
              >
                Previous
              </button>
              <span className="reviews-section__pagination-info">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="reviews-section__pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
