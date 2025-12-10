import { Link } from 'react-router-dom';
import { FiUser, FiHeart, FiEye } from 'react-icons/fi';
import { formatCurrency, getPrimaryImage } from '../../utils';
import './ProductCard.css';

/**
 * ProductCard Component
 * Reusable product card for displaying products in grids
 * 
 * @param {Object} product - Product data object
 * @param {Function} onLike - Optional like handler (product.id, event)
 * @param {boolean} isLiking - Whether the product is currently being liked
 * @param {boolean} showSeller - Whether to show seller information (default: true)
 * @param {boolean} showStats - Whether to show like/view stats (default: true)
 * @param {Object} linkState - Optional state to pass to Link component
 */
export default function ProductCard({ 
  product, 
  onLike, 
  isLiking = false,
  showSeller = true,
  showStats = true,
  linkState = null
}) {
  if (!product) return null;

  const productName = product.name || 'Unnamed Product';
  const productPrice = product.price;
  const tradeOnly = product.tradeOnly || product.trade_only || false;
  const sellerName = product.seller?.firstName 
    ? `${product.seller.firstName} ${product.seller.lastName || ''}`
    : (product.sellerName || 'Unknown Seller');
  const likeCount = product.likeCount || product.like_count || 0;
  const viewCount = product.viewCount || product.view_count || 0;
  const categoryName = product.category?.name || 'Uncategorized';
  const productImage = getPrimaryImage(
    product.images || product.productImages || [], 
    'https://placehold.co/400x300/E5E7EB/6B7280?text=No+Image'
  );

  const handleLikeClick = (e) => {
    if (onLike) {
      e.preventDefault();
      e.stopPropagation();
      onLike(product.id, e);
    }
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      state={linkState}
      className="product-card"
    >
      <div className="product-card__image">
        <img 
          src={productImage}
          alt={productName}
          loading="lazy"
        />
      </div>
      
      <div className="product-card__content">
        <h3 className="product-card__name">{productName}</h3>
        
        <div className="product-card__price">
          {tradeOnly ? (
            <span className="trade-only">Trade Only</span>
          ) : (
            <span className="price">{formatCurrency(productPrice)}</span>
          )}
        </div>

        <div className="product-card__category">
          <span className="tag">{categoryName}</span>
        </div>

        {showStats && (
          <div className="product-card__stats">
            <span className="stat">
              <FiEye className="stat-icon" />
              {viewCount}
            </span>
            <span className="stat">
              <FiHeart className="stat-icon" />
              {likeCount}
            </span>
          </div>
        )}

        {showSeller && (
          <div className="product-card__footer">
            <div className="seller">
              <FiUser className="seller-icon" />
              <span className="seller-name">{sellerName}</span>
            </div>
            {onLike && (
              <button 
                className={`like-btn ${isLiking ? 'liking' : ''}`}
                onClick={handleLikeClick}
                disabled={isLiking}
                title="Like this product"
                type="button"
              >
                <FiHeart className="like-icon" />
                <span className="like-count">{likeCount}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
