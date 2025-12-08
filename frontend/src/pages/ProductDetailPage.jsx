import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiHeart, FiEye, FiMessageSquare, FiRefreshCw, FiTag, FiPackage, FiCheckCircle, FiBarChart2, FiUser, FiMail, FiPhone, FiStar, FiEdit } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { getProductById, likeProduct, hasUserLikedProduct } from '../services/productService';
import { getReviewsByProduct, calculateAverageRating, getRatingDistribution } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import TradeOfferModal from '../components/common/TradeOfferModal';
import ContactSellerModal from '../components/common/ContactSellerModal';
import PlaceOrderModal from '../components/common/PlaceOrderModal';
import ImagePreviewModal from '../components/common/ImagePreviewModal';
import EditProductPanel from '../components/common/EditProductPanel';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSellerProfile = location.state?.fromSellerProfile;
  const sellerId = location.state?.sellerId;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsPerPage] = useState(5);
  const [reviewsSortBy, setReviewsSortBy] = useState('recent');

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      // Validate ID exists and is not "undefined" string
      if (!id || id === 'undefined') {
        setLoading(false);
        setError('Invalid product ID');
        return;
      }

      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        
        // Check if user has liked this product
        if (user?.profile?.id) {
          const liked = await hasUserLikedProduct(id, user.profile.id);
          setHasLiked(liked);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  // Fetch product reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id || id === 'undefined') return;
      
      try {
        setReviewsLoading(true);
        const reviewsData = await getReviewsByProduct(id);
        setReviews(reviewsData || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Handle like button click
  const handleLike = async () => {
    if (isLiking || !user?.profile?.id) return;
    
    try {
      setIsLiking(true);
      const updatedProduct = await likeProduct(id, user.profile.id);
      setProduct(updatedProduct);
      setHasLiked(!hasLiked); // Toggle local state
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  // Calculate product average rating from reviews
  const productAverageRating = reviews.length > 0 ? calculateAverageRating(reviews) : 0;
  const safeRating = Number(productAverageRating) || 0; // Ensure it's always a number
  const ratingDistribution = reviews.length > 0 ? getRatingDistribution(reviews) : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  // Pagination and sorting
  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewsSortBy === 'highest') return b.rating - a.rating;
    if (reviewsSortBy === 'lowest') return a.rating - b.rating;
    return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
  });
  
  const totalReviewsPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const displayedReviews = sortedReviews.slice(
    reviewsPage * reviewsPerPage,
    (reviewsPage + 1) * reviewsPerPage
  );

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

  // Loading state
  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="container">
          {fromSellerProfile ? (
            <button onClick={() => navigate(`/seller/${sellerId}`)} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <FiChevronLeft className="back-link__icon" />
              <span>Back to Seller Profile</span>
            </button>
          ) : (
            <Link to="/dashboard" className="back-link">
              <FiChevronLeft className="back-link__icon" />
              <span>Back to Marketplace</span>
            </Link>
          )}
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#ef4444' }}>
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist.'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get images array, handling both formats
  const productImages = product.images || product.productImages || [];
  const hasImages = productImages.length > 0;
  const displayImage = hasImages ? (productImages[selectedImage]?.imageUrl || productImages[selectedImage]?.url) : 'https://placehold.co/1000x750/E5E7EB/6B7280?text=No+Image';

  return (
    <div className="product-detail">
      {/* Back Navigation */}
      <div className="container">
        {fromSellerProfile ? (
          <button onClick={() => navigate(`/seller/${sellerId}`)} className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiChevronLeft className="back-link__icon" />
            <span>Back to Seller Profile</span>
          </button>
        ) : (
          <Link to="/dashboard" className="back-link">
            <FiChevronLeft className="back-link__icon" />
            <span>Back to Marketplace</span>
          </Link>
        )}
      </div>

      {/* Product Details Grid */}
      <div className="container">
        <div className="product-detail__grid">
          
          {/* Left Column: Images & Description */}
          <div className="product-detail__main">
            
            {/* Image Gallery */}
            <section className="image-gallery">
              <div className="image-gallery__main">
                <img 
                  src={displayImage}
                  alt={`${product.name} - View ${selectedImage + 1}`}
                  className="image-gallery__image"
                  onClick={() => {
                    setPreviewImageIndex(selectedImage);
                    setIsPreviewModalOpen(true);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              {hasImages && productImages.length > 1 && (
                <div className="image-gallery__thumbnails-row">
                  {productImages.slice(1).map((image, index) => (
                    <img
                      key={image.id || image.imageId || index}
                      src={image.imageUrl || image.url || 'https://placehold.co/150x150/E5E7EB/6B7280?text=No+Image'}
                      alt={`Additional image ${index + 1}`}
                      className="thumbnail-row-item"
                      onClick={() => {
                        setPreviewImageIndex(index + 1);
                        setIsPreviewModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Product Details */}
            <section className="product-details-card">
              <h2 className="product-details-title">Product Details</h2>
              
              <p className="product-details-description">{product.description || 'No description available.'}</p>
              
              <div className="product-details-specs">
                <div className="spec-item-row">
                  <FiTag className="spec-icon spec-icon-purple" />
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">{product.category?.name || 'Uncategorized'}</span>
                </div>
                
                {(product.brandType || product.brand_type) && (
                  <div className="spec-item-row">
                    <FiPackage className="spec-icon spec-icon-purple" />
                    <span className="spec-label">Brand/Model:</span>
                    <span className="spec-value">{product.brandType || product.brand_type}</span>
                  </div>
                )}
                
                <div className="spec-item-row">
                  <FiCheckCircle className="spec-icon spec-icon-green" />
                  <span className="spec-label">Condition:</span>
                  <span className="spec-value">{product.condition || 'Not specified'}</span>
                </div>
                
                <div className="spec-item-row">
                  <FiBarChart2 className="spec-icon spec-icon-blue" />
                  <span className="spec-label">Stock:</span>
                  <span className="spec-value">{product.stock || 0} item{(product.stock || 0) !== 1 ? 's' : ''} available</span>
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="reviews">
              <h2 className="reviews__title">
                Product Reviews
              </h2>
              
              {reviewsLoading ? (
                <div className="reviews__loading">
                  <p>Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="reviews__empty">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <>
                  {/* Rating Summary */}
                  <div className="reviews__summary">
                    <div className="reviews__summary-score">
                      <div className="reviews__average">
                        <span className="reviews__average-number">{safeRating.toFixed(1)}</span>
                        <div className="reviews__average-stars">{renderStars(safeRating)}</div>
                        <span className="reviews__average-text">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="reviews__distribution">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="reviews__distribution-row">
                          <span className="reviews__distribution-label">{star} <FiStar className="star-icon" /></span>
                          <div className="reviews__distribution-bar">
                            <div 
                              className="reviews__distribution-fill" 
                              style={{ width: `${reviews.length > 0 ? (ratingDistribution[star] / reviews.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="reviews__distribution-count">({ratingDistribution[star]})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="reviews__controls">
                    <label htmlFor="sort-reviews">Sort by:</label>
                    <select 
                      id="sort-reviews"
                      value={reviewsSortBy} 
                      onChange={(e) => {
                        setReviewsSortBy(e.target.value);
                        setReviewsPage(0);
                      }}
                      className="reviews__sort-select"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div>

                  {/* Reviews List */}
                  <div className="reviews__list">
                    {displayedReviews.map(review => (
                      <div key={review.id} className="review">
                        <div className="review__header">
                          <div className="review__user-info">
                            <div className="review__avatar">
                              {(review.reviewer?.firstName?.[0] || review.reviewer?.first_name?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <p className="review__reviewer">
                                {review.reviewer?.firstName || review.reviewer?.first_name || 'Anonymous'} {review.reviewer?.lastName?.[0] || review.reviewer?.last_name?.[0] || ''}.
                              </p>
                              <div className="review__stars">{renderStars(review.rating)}</div>
                            </div>
                          </div>
                          <p className="review__date">{formatDate(review.createdAt || review.created_at)}</p>
                        </div>
                        <p className="review__comment">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalReviewsPages > 1 && (
                    <div className="reviews__pagination">
                      <button 
                        onClick={() => setReviewsPage(prev => Math.max(0, prev - 1))}
                        disabled={reviewsPage === 0}
                        className="reviews__pagination-btn"
                      >
                        Previous
                      </button>
                      <span className="reviews__pagination-info">
                        Page {reviewsPage + 1} of {totalReviewsPages}
                      </span>
                      <button 
                        onClick={() => setReviewsPage(prev => Math.min(totalReviewsPages - 1, prev + 1))}
                        disabled={reviewsPage === totalReviewsPages - 1}
                        className="reviews__pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

          </div>

          {/* Right Column: Actions & Seller Info */}
          <div className="product-detail__sidebar">
            
            {/* Product Action Card */}
            <div className="product-action">
              <h1 className="product-action__name">{product.name}</h1>
              
              <div className="product-action__header">
                {(product.tradeOnly || product.trade_only) ? (
                  <p className="product-action__price" style={{ color: '#10b981' }}>Trade Only</p>
                ) : (
                  <p className="product-action__price">₱{Number.parseFloat(product.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                )}
              </div>

              <div className="product-action__buttons">
                {user?.profile?.id === product.seller?.id ? (
                  // Owner's view - show Edit button
                  <>
                    <div className="owner-notice">
                      <p>🏷️ This is your product</p>
                    </div>
                    <button 
                      className="btn btn--primary"
                      onClick={() => setIsEditPanelOpen(true)}
                    >
                      <FiEdit className="btn__icon" />
                      Edit Product
                    </button>
                  </>
                ) : (
                  // Non-owner's view - show Buy Now button
                  <>
                    {!(product.tradeOnly || product.trade_only) && (
                      <button 
                        className="btn btn--primary"
                        onClick={() => setIsPlaceOrderOpen(true)}
                      >
                        <FiPackage className="btn__icon" />
                        Buy Now
                      </button>
                    )}
                    <button 
                      className="btn btn--secondary"
                      onClick={() => setIsContactModalOpen(true)}
                    >
                      <FiMessageSquare className="btn__icon" />
                      Contact Seller
                    </button>
                    {/* Show trade offer button only for trade-eligible products */}
                    {(product.tradeOnly || product.trade_only || product.trade_ok) && (
                      <button 
                        className="btn btn--accent"
                        onClick={() => setIsTradeModalOpen(true)}
                      >
                        <FiRefreshCw className="btn__icon" />
                        Make a Trade Offer
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="product-action__stats">
                <div className="stat">
                  <FiEye className="stat__icon" />
                  <span>{product.viewCount || product.view_count || 0} Views</span>
                </div>
                <button 
                  className={`stat stat--like ${hasLiked ? 'stat--liked' : ''}`}
                  onClick={handleLike}
                  disabled={isLiking || !user?.profile?.id}
                  title={!user?.profile?.id ? 'Login to like products' : hasLiked ? 'Unlike' : 'Like'}
                >
                  <FiHeart className={`stat__icon ${hasLiked ? 'stat__icon--filled' : ''}`} />
                  <span>{product.likeCount || product.like_count || 0} Likes</span>
                </button>
              </div>
            </div>

            {/* Seller Information Card */}
            <div className="seller-card">
              <h2 className="seller-card__title">Seller Details</h2>
              
              <div className="seller-card__content">
                <div className="seller-card__name">
                  <FiUser className="seller-card__icon" />
                  <Link to={`/seller/${product.seller?.id || product.seller?.profile_id}`} className="seller-card__link">
                    {product.seller?.firstName || product.seller?.first_name} {product.seller?.lastName || product.seller?.last_name}
                  </Link>
                </div>
                
                <div className="seller-card__contacts">
                  <div className="contact">
                    <FiMail className="contact__icon" />
                    <span>{product.seller?.email || 'Not available'}</span>
                  </div>
                  {(product.seller?.phoneNumber || product.seller?.phone_number) && (
                    <div className="contact">
                      <FiPhone className="contact__icon" />
                      <span>{product.seller?.phoneNumber || product.seller?.phone_number}</span>
                    </div>
                  )}
                  {(product.seller?.instagramHandle || product.seller?.instagram_handle) && (
                    <div className="contact">
                      <FaInstagram className="contact__icon" />
                      <span>{product.seller?.instagramHandle || product.seller?.instagram_handle}</span>
                    </div>
                  )}
                </div>
                
                {(product.seller?.createdAt || product.seller?.created_at) && (
                  <p className="seller-card__member-since">
                    Member since: {formatDate(product.seller?.createdAt || product.seller?.created_at)}
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      <TradeOfferModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)} 
        product={product}
      />

      <ContactSellerModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        product={product}
        seller={product.seller}
      />

      <PlaceOrderModal 
        isOpen={isPlaceOrderOpen} 
        onClose={() => setIsPlaceOrderOpen(false)} 
        product={product}
        seller={product.seller}
      />

      <ImagePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        images={productImages.map(img => img.imageUrl || img.url)}
        currentIndex={previewImageIndex}
        onNavigate={setPreviewImageIndex}
      />

      {/* Edit Product Panel - Only for owners */}
      {isEditPanelOpen && (
        <>
          <div className="edit-panel-overlay" onClick={() => setIsEditPanelOpen(false)} />
          <EditProductPanel
            isOpen={isEditPanelOpen}
            onClose={() => setIsEditPanelOpen(false)}
            productData={product}
            onProductUpdated={async (updatedProduct) => {
              if (updatedProduct) {
                setProduct(updatedProduct);
              } else {
                // Refetch product if updated product not returned
                try {
                  const refreshedProduct = await getProductById(id);
                  setProduct(refreshedProduct);
                } catch (err) {
                  console.error('Error refreshing product:', err);
                }
              }
              setIsEditPanelOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}
