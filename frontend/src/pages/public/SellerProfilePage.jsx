import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiMail, FiPhone, FiStar, FiCalendar, FiMessageSquare, FiPackage, FiUser } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import ContactSellerModal from '../../components/common/ContactSellerModal';
import SellerRatingModal from '../../components/common/SellerRatingModal';
import { getSellerInfo, getSellerListings, getSellerReviews, submitSellerRating } from '../../services/sellerService';
import './SellerProfilePage.css';

export default function SellerProfilePage() {
  const { sellerId } = useParams();
  const [activeTab, setActiveTab] = useState('listings');
  const [sortBy, setSortBy] = useState('recent');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // State for API data
  const [seller, setSeller] = useState(null);
  const [sellerListings, setSellerListings] = useState([]);
  const [sellerReviews, setSellerReviews] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProductForRating, setSelectedProductForRating] = useState(null);

  // Fetch seller info
  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSellerInfo(sellerId);
        setSeller(data);
      } catch (err) {
        console.error('Error fetching seller info:', err);
        setError('Failed to load seller information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerInfo();
    }
  }, [sellerId]);

  // Fetch seller listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getSellerListings(sellerId, true); // Only available products
        setSellerListings(data);
      } catch (err) {
        console.error('Error fetching seller listings:', err);
      }
    };

    if (sellerId) {
      fetchListings();
    }
  }, [sellerId]);

  // Fetch seller reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getSellerReviews(sellerId, currentPage, 10, sortBy);
        setSellerReviews(data);
      } catch (err) {
        console.error('Error fetching seller reviews:', err);
      }
    };

    if (sellerId) {
      fetchReviews();
    }
  }, [sellerId, currentPage, sortBy]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
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

  const handleSubmitRating = async (ratingData) => {
    try {
      await submitSellerRating(ratingData);
      alert('Thank you for rating this seller!');
      setIsRatingModalOpen(false);
      
      // Refresh reviews and seller info after rating
      const updatedReviews = await getSellerReviews(sellerId, currentPage, 10, sortBy);
      setSellerReviews(updatedReviews);
      
      const updatedSellerInfo = await getSellerInfo(sellerId);
      setSeller(updatedSellerInfo);
    } catch (err) {
      console.error('Error submitting rating:', err);
      if (err.response?.status === 400) {
        alert('You have already rated this seller for this product, or the product is invalid.');
      } else {
        alert('Failed to submit rating. Please try again later.');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Loading state
  if (loading) {
    return (
      <div className="seller-profile-page">
        <div className="container">
          <div className="loading-spinner">Loading seller information...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !seller) {
    return (
      <div className="seller-profile-page">
        <div className="container">
          <Link to="/dashboard" className="back-link">
            <FiChevronLeft className="back-link__icon" />
            <span>Back to Marketplace</span>
          </Link>
          <div className="error-message">
            {error || 'Seller not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-profile-page">
      <div className="container">
        {/* Back Navigation */}
        <Link to="/dashboard" className="back-link">
          <FiChevronLeft className="back-link__icon" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Seller Header */}
        <div className="seller-profile-header">
          <div className="seller-profile-avatar">
            {getInitials(seller.firstName, seller.lastName)}
          </div>
          
          <div className="seller-profile-info">
            <h1 className="seller-profile-name">
              {seller.firstName} {seller.lastName}
            </h1>
            
            <div className="seller-profile-rating">
              <div className="rating-stars">
                {renderStars(seller.sellerRating || 0)}
              </div>
              <span className="rating-text">
                {seller.sellerRating?.toFixed(1) || '0.0'}/5.0 · {seller.totalReviews} reviews
              </span>
            </div>

            <div className="seller-profile-contacts">
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <span>{seller.email}</span>
              </div>
              {seller.phoneNumber && (
                <div className="contact-item">
                  <FiPhone className="contact-icon" />
                  <span>{seller.phoneNumber}</span>
                </div>
              )}
              {seller.instagramHandle && (
                <div className="contact-item">
                  <FaInstagram className="contact-icon" />
                  <span>{seller.instagramHandle}</span>
                </div>
              )}
              <div className="contact-item">
                <FiCalendar className="contact-icon" />
                <span>Member since {formatDate(seller.createdAt)}</span>
              </div>
            </div>

            <div className="seller-profile-actions">
              <button 
                className="btn btn--primary contact-seller-btn"
                onClick={() => setIsContactModalOpen(true)}
              >
                <FiMessageSquare className="btn__icon" />
                Contact Seller
              </button>
              <button 
                className="btn btn--accent"
                onClick={() => {
                  // For direct seller rating from profile, do NOT associate with any product
                  setSelectedProductForRating(null);
                  setIsRatingModalOpen(true);
                }}
              >
                <FiStar className="btn__icon" />
                Rate Seller
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="seller-profile-tabs">
          <button
            className={`tab ${activeTab === 'listings' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            Active Listings ({seller.availableListings || 0})
          </button>
          <button
            className={`tab ${activeTab === 'reviews' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({seller.totalReviews || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'listings' && (
          <div className="seller-listings-grid">
            {sellerListings.length > 0 ? (
              sellerListings.map((product) => (
                <Link 
                  key={product.id}
                  to={`/product/${product.id}`}
                  state={{ fromSellerProfile: true, sellerId: sellerId }}
                  className="product-card"
                >
                  <div className="product-card__image-wrapper">
                    <img 
                      src={product.imageUrl || 'https://placehold.co/300x300/1f2937/ffffff?text=No+Image'} 
                      alt={product.name}
                      className="product-card__image"
                    />
                  </div>
                  <div className="product-card__content">
                    <h3 className="product-card__name">{product.name}</h3>
                    <p className="product-card__category">{product.category?.name || 'Uncategorized'}</p>
                    <p className="product-card__price">
                      ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="product-card__stats">
                      <span>❤️ {product.likeCount || 0}</span>
                      <span>👁️ {product.viewCount || 0}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <p>No active listings at the moment</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="seller-reviews-section">
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
            <div className="reviews-list">
              {sellerReviews.content?.length > 0 ? (
                <>
                  {sellerReviews.content.map((review) => (
                    <div key={review.reviewId} className="review-card">
                      <div className="review-card__header">
                        <div className="review-author">
                          <div className="review-avatar">
                            {review.reviewerFirstName?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="review-author-name">
                              {review.reviewerFirstName} {review.reviewerLastName}
                            </p>
                            <p className="review-date">{formatDate(review.createdAt)}</p>
                            {review.productName ? (
                              <div className="review-type-badge review-type-badge--product">
                                <FiPackage size={12} /> Product: {review.productName}
                              </div>
                            ) : (
                              <div className="review-type-badge review-type-badge--seller">
                                <FiUser size={12} /> Seller Review
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="review-text">{review.comment}</p>
                    </div>
                  ))}
                  
                  {/* Pagination Controls */}
                  {sellerReviews.totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn"
                        disabled={currentPage === 0}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </button>
                      <span className="pagination-info">
                        Page {currentPage + 1} of {sellerReviews.totalPages}
                      </span>
                      <button 
                        className="pagination-btn"
                        disabled={currentPage >= sellerReviews.totalPages - 1}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ContactSellerModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        product={null}
        seller={{ ...seller, id: parseInt(sellerId) }}
      />

      <SellerRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        seller={seller}
        productId={selectedProductForRating}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
}
