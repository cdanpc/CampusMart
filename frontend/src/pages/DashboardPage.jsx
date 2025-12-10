import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllProducts, likeProduct, searchProducts } from '../services/productService';
import { formatCurrency, getPrimaryImage } from '../utils';
import ProductCard from '../components/common/ProductCard';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Latest');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likingProducts, setLikingProducts] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = searchParams.get('search');
        if (query) {
          setSearchQuery(query);
          const data = await searchProducts(query);
          setProducts(data);
        } else {
          setSearchQuery('');
          const data = await getAllProducts();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchParams]);

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
            <p>
              {searchQuery 
                ? `Search results for "${searchQuery}"` 
                : 'Discover amazing items from fellow CIT-U students'
              }
            </p>
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
              {searchQuery && (
                <button 
                  className="filter-tab filter-tab--clear"
                  onClick={() => {
                    setSearchParams({});
                    setSearchQuery('');
                  }}
                >
                  Clear Search
                </button>
              )}
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
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onLike={handleLike}
                isLiking={likingProducts.has(product.id)}
                showSeller={true}
                showStats={false}
              />
            ))}
          </div>
          )}
        </div>
      </div>
    </>
  );
}
