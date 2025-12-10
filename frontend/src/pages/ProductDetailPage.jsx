import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiChevronLeft, FiHeart, FiEye, FiMessageSquare, FiRefreshCw, FiTag, FiPackage, FiCheckCircle, FiBarChart2, FiEdit } from 'react-icons/fi';
import { getProductById, likeProduct, hasUserLikedProduct } from '../services/productService';
import { getReviewsByProduct, calculateAverageRating, getRatingDistribution, createReview } from '../services/reviewService';
import { getOrdersByBuyer } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils';
import TradeOfferModal from '../components/common/TradeOfferModal';
import ContactSellerModal from '../components/common/ContactSellerModal';
import PlaceOrderModal from '../components/common/PlaceOrderModal';
import EditProductPanel from '../components/common/EditProductPanel';
import RatingModal from '../components/common/RatingModal';
import ImageGallery from '../components/common/ImageGallery';
import ReviewsSection from '../components/common/ReviewsSection';
import SellerInfoCard from '../components/common/SellerInfoCard';
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
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isProductReviewOpen, setIsProductReviewOpen] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchasedOrder, setPurchasedOrder] = useState(null);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

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
          
          // Check if user has purchased this product
          try {
            const orders = await getOrdersByBuyer(user.profile.id);
            const productOrder = orders.find(order => 
              (order.productId === parseInt(id) || order.product?.id === parseInt(id)) && 
              order.status === 'completed'
            );
            if (productOrder) {
              setHasPurchased(true);
              setPurchasedOrder(productOrder);
            }
          } catch (err) {
            console.error('Error checking purchase status:', err);
          }
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

  // Handle submitting product review
  const handleProductReview = async (ratingData) => {
    try {
      await createReview({
        reviewerId: user.profile.id,
        sellerId: product.seller?.id || product.seller_id,
        productId: parseInt(id),
        orderId: purchasedOrder?.id || purchasedOrder?.order_id,
        rating: ratingData.rating,
        comment: ratingData.comment
      });
      
      // Refresh reviews
      const reviewsData = await getReviewsByProduct(id);
      setReviews(reviewsData || []);
      
      setIsProductReviewOpen(false);
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

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
  const ratingDistribution = reviews.length > 0 ? getRatingDistribution(reviews) : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="product-detail__loading">
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
            <button onClick={() => navigate(`/seller/${sellerId}`)} className="back-link back-link--button">
              <FiChevronLeft className="back-link__icon" />
              <span>Back to Seller Profile</span>
            </button>
          ) : (
            <Link to="/dashboard" className="back-link">
              <FiChevronLeft className="back-link__icon" />
              <span>Back to Marketplace</span>
            </Link>
          )}
          <div className="product-detail__error">
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist.'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get images array, handling both formats
  const productImages = product.images || product.productImages || [];

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
            <ImageGallery 
              images={productImages}
              altText={product.name}
            />

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
            <ReviewsSection
              reviews={reviews}
              averageRating={productAverageRating}
              ratingDistribution={ratingDistribution}
              canWriteReview={hasPurchased && user?.profile?.id !== product?.seller?.id}
              onWriteReview={() => setIsProductReviewOpen(true)}
              reviewsPerPage={5}
            />

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
            <SellerInfoCard seller={product.seller} />

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

      {/* Product Review Modal */}
      <RatingModal
        isOpen={isProductReviewOpen}
        onClose={() => setIsProductReviewOpen(false)}
        orderData={{
          productName: product?.name,
          sellerName: product?.seller?.firstName + ' ' + product?.seller?.lastName,
          sellerId: product?.seller?.id || product?.seller_id,
          productId: parseInt(id)
        }}
        onSubmit={handleProductReview}
      />
    </div>
  );
}
