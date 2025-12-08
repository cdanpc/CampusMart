import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiUser, FiHeart } from 'react-icons/fi';
import { getAllProducts, likeProduct } from '../services/productService';
// Remove this if AppHeader is in a layout component:
// import AppHeader from '../components/layout/AppHeader';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Latest');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likingProducts, setLikingProducts] = useState(new Set());

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Handle like button click
  const handleLike = async (productId, event) => {
    event.preventDefault(); // Prevent navigation to product detail
    event.stopPropagation(); // Stop event bubbling
    
    if (!user?.profile?.id) {
      // User not logged in
      return;
    }
    
    if (likingProducts.has(productId)) return; // Prevent multiple simultaneous requests
    
    try {
      setLikingProducts(prev => new Set(prev).add(productId));
      const updatedProduct = await likeProduct(productId, user.profile.id);
      
      // Update the product in the list
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, likeCount: updatedProduct.likeCount } : p
        )
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLikingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const filteredProducts = products
    .filter(product => {
      // Filter by trade type
      if (activeTab === 'sale' && (product.trade_only || product.tradeOnly)) return false;
      if (activeTab === 'tradeable' && !(product.trade_only || product.tradeOnly)) return false;
      
      // Filter by category
      if (selectedCategory !== 'All Categories') {
        const productCategory = product.category?.name || 'Uncategorized';
        if (productCategory !== selectedCategory) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      switch (sortBy) {
        case 'Price: Low to High':
          return (a.price || 0) - (b.price || 0);
        case 'Price: High to Low':
          return (b.price || 0) - (a.price || 0);
        case 'Most Popular':
          return (b.likeCount || b.like_count || 0) - (a.likeCount || a.like_count || 0);
        case 'Latest':
        default:
          return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
      }
    });

  return (
    <>
      {/* Remove <AppHeader /> if it's already in your layout */}
      <div className="dashboard__header">
        <div className="container">
          <div className="dashboard__welcome">
            <h1>Welcome, {user?.profile?.first_name || 'John Doe'}!</h1>
            <p>Discover amazing items from fellow CIT-U students</p>
          </div>

          {loading && (
            <div className="dashboard__loading">
              <p>Loading products...</p>
            </div>
          )}

          <div className="dashboard__filters">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${activeTab === 'all' ? 'filter-tab--active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Items
              </button>
              <button 
                className={`filter-tab ${activeTab === 'sale' ? 'filter-tab--active' : ''}`}
                onClick={() => setActiveTab('sale')}
              >
                For Sale Only
              </button>
              <button 
                className={`filter-tab ${activeTab === 'tradeable' ? 'filter-tab--active' : ''}`}
                onClick={() => setActiveTab('tradeable')}
              >
                Tradable Items
              </button>
            </div>

            <div className="filter-dropdowns">
              <select 
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>All Categories</option>
                <option>Food</option>
                <option>Electronics</option>
                <option>Books</option>
                <option>Service</option>
                <option>Fashion</option>
                <option>Home</option>
                <option>Appliance</option>
              </select>

              <select 
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option>Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__content">
        <div className="container">
          {filteredProducts.length === 0 ? (
            <div className="dashboard__empty">
              <div className="dashboard__empty-icon">📦</div>
              <h2 className="dashboard__empty-title">
                {loading ? 'Loading products...' : 'No products available'}
              </h2>
              <p className="dashboard__empty-message">
                {loading 
                  ? 'Please wait while we fetch the latest items...'
                  : activeTab === 'all' 
                    ? 'Be the first to list an item! Click the "+ List Item" button above to get started.'
                    : `No ${activeTab === 'sale' ? 'items for sale' : 'tradeable items'} available right now.`
                }
              </p>
            </div>
          ) : (
          <div className="product-grid">
            {filteredProducts.map(product => {
              // Handle both backend (camelCase) and mock data formats
              const productName = product.name;
              const productPrice = product.price;
              const tradeOnly = product.tradeOnly || product.trade_only;
              const tradeOk = product.trade_ok;
              const sellerName = product.seller?.name || product.seller?.firstName + ' ' + (product.seller?.lastName || '');
              const likeCount = product.likeCount || product.like_count || 0;
              // Always use the first image from images array
              const productImages = product.images || product.productImages || [];
              const productImage = productImages.length > 0 
                ? (productImages[0]?.imageUrl || productImages[0]?.url)
                : 'https://placehold.co/400x300/E5E7EB/6B7280?text=No+Image';
              const categoryName = product.category?.name || 'Uncategorized';
              
              return (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="product-card"
                >
                  <div className="product-card__image">
                    <img 
                      src={productImage}
                      alt={productName}
                    />
                  </div>
                  <div className="product-card__content">
                    <h3 className="product-card__name">{productName}</h3>
                    <div className="product-card__price">
                      {tradeOnly ? (
                        <span className="trade-only">Trade Only</span>
                      ) : (
                        <>
                          <span className="price">₱{productPrice?.toFixed(2) || '0.00'}</span>
                          {tradeOk && <span className="trade-ok">(Trade OK)</span>}
                        </>
                      )}
                    </div>
                    <div className="product-card__tags">
                      <span className="tag">{categoryName}</span>
                      {product.tags?.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="product-card__footer">
                      <div className="seller">
                        <FiUser className="seller-icon" />
                        <span className="seller-name">{sellerName}</span>
                      </div>
                      <button 
                        className="likes"
                        onClick={(e) => handleLike(product.id, e)}
                        disabled={likingProducts.has(product.id)}
                        title="Like this product"
                      >
                        <FiHeart className="like-icon" />
                        <span className="like-count">{likeCount}</span>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </>
  );
}
