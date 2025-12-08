import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSettings, FiMail, FiPhone, FiCalendar, FiStar, FiDollarSign, FiHeart, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getProductsBySeller, deleteProduct, getProductById } from '../../services/productService';
import { updateProfile } from '../../services/profileService';
import { getOrdersByBuyer, getOrdersBySeller } from '../../services/orderService';
import { getReviewsBySeller } from '../../services/reviewService';
import CreateProductPanel from '../../components/common/CreateProductPanel';
import EditProductPanel from '../../components/common/EditProductPanel';
import EditProfileModal from '../../components/common/EditProfileModal';
import ReceiptModal from '../../components/common/ReceiptModal';
import RatingModal from '../../components/common/RatingModal';
import ReviewsModal from '../../components/common/ReviewsModal';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'orders'
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [orderToRate, setOrderToRate] = useState(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [activeListings, setActiveListings] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsPerPage] = useState(5);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Fetch user's products
  const fetchUserProducts = async () => {
    if (!user?.profile?.id) return;
    
    try {
      setLoading(true);
      const products = await getProductsBySeller(user.profile.id);
      setActiveListings(products);
    } catch (error) {
      console.error('Error fetching user products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch seller reviews
  const fetchSellerReviews = async () => {
    if (!user?.profile?.id) return;
    
    try {
      const reviews = await getReviewsBySeller(user.profile.id);
      setSellerReviews(reviews || []);
    } catch (error) {
      console.error('Error fetching seller reviews:', error);
      setSellerReviews([]);
    }
  };

  // Fetch user's orders
  const fetchUserOrders = async () => {
    if (!user?.profile?.id) return;
    
    try {
      // Fetch both purchases and sales
      const [purchases, sales] = await Promise.all([
        getOrdersByBuyer(user.profile.id),
        getOrdersBySeller(user.profile.id)
      ]);

      // Fetch product details for each order to get images
      const fetchOrderWithProduct = async (order) => {
        try {
          const product = await getProductById(order.productId);
          const productImage = product?.images?.[0]?.imageUrl || product?.images?.[0]?.image_url || product?.image_url || 'https://placehold.co/80x80?text=Product';
          return { ...order, productImage };
        } catch (error) {
          console.error('Error fetching product for order:', error);
          return { ...order, productImage: 'https://placehold.co/80x80?text=Product' };
        }
      };

      // Fetch products for all orders in parallel
      const purchasesWithProducts = await Promise.all(purchases.map(fetchOrderWithProduct));
      const salesWithProducts = await Promise.all(sales.map(fetchOrderWithProduct));

      // Combine and format orders
      const formattedPurchases = purchasesWithProducts.map((order, index) => ({
        order_id: order.orderId || order.order_id || order.id || `temp-purchase-${index}`,
        type: 'purchase',
        product_name: order.productName || 'Unknown Product',
        image: order.productImage,
        seller_name: order.sellerName || 'Unknown Seller',
        total_amount: order.totalAmount || order.total_amount || 0,
        status: order.status || 'pending',
        order_date: new Date(order.createdAt || order.created_at).toLocaleDateString(),
        ...order
      }));

      const formattedSales = salesWithProducts.map((order, index) => ({
        order_id: order.orderId || order.order_id || order.id || `temp-sale-${index}`,
        type: 'sale',
        product_name: order.productName || 'Unknown Product',
        image: order.productImage,
        buyer_name: order.buyerName || 'Unknown Buyer',
        total_amount: order.totalAmount || order.total_amount || 0,
        status: order.status || 'pending',
        order_date: new Date(order.createdAt || order.created_at).toLocaleDateString(),
        ...order
      }));

      // Combine and sort by date (most recent first)
      const allOrders = [...formattedPurchases, ...formattedSales].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB - dateA;
      });

      // Take only the 5 most recent orders
      setRecentOrders(allOrders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchUserProducts();
    fetchUserOrders();
    fetchSellerReviews();
  }, [user]);

  // Refresh products after edit/delete
  const refreshProducts = () => {
    fetchUserProducts();
  };

  // Use actual user data from AuthContext
  const currentUser = user?.profile || {};

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

  const getInitials = (firstName, lastName) => {
    return `${firstName[0]}${lastName[0]}`;
  };

  const handleEdit = (product) => {
    // Validate product has an ID
    if (!product.id && !product.product_id) {
      console.error('Cannot edit product: missing product ID');
      alert('Unable to edit this product. Please try again.');
      return;
    }

    // Map product data to form structure, handling both camelCase and snake_case
    const fullProductData = {
      id: product.id || product.product_id,
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      brand_type: product.brandType || product.brand_type || '',
      condition: product.condition || 'Good',
      stock: product.stock || 1,
      contact_info: product.contactInfo || product.contact_info || currentUser.phoneNumber || currentUser.phone_number || '',
      category_id: product.category?.id || product.category_id || 1,
      listing_type: product.tradeOnly || product.trade_only ? 'trade_only' : 'for_sale',
      trade_only: product.tradeOnly || product.trade_only || false,
      is_available: product.isAvailable !== undefined ? product.isAvailable : product.is_available,
      images: product.images || product.productImages || [],
      viewCount: product.viewCount || product.view_count || 0,
      likeCount: product.likeCount || product.like_count || 0
    };
    
    console.log('Editing product:', fullProductData);
    setEditingProduct(fullProductData);
    setIsEditPanelOpen(true);
  };

  const handleCreateNew = () => {
    setIsCreatePanelOpen(true);
  };

  const handleEditPanelClose = () => {
    setIsEditPanelOpen(false);
    setEditingProduct(null);
  };

  const handleCreatePanelClose = () => {
    setIsCreatePanelOpen(false);
  };

  const handleDelete = async (productId) => {
    if (globalThis.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        await deleteProduct(productId);
        // Refresh the products list after deletion
        refreshProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleViewReceipt = (order) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  const handleRateProduct = (order) => {
    setOrderToRate(order);
    setIsRatingOpen(true);
  };

  const handleSubmitRating = (ratingData) => {
    console.log('Rating submitted:', ratingData);
    // TODO: API call to save rating
    // POST /api/reviews with ratingData
  };

  const handleProfileUpdate = async (profileData) => {
    try {
      console.log('Updating profile with data:', profileData);
      console.log('Profile ID:', user.profile.id);
      
      const updatedProfile = await updateProfile(user.profile.id, profileData);
      console.log('Updated profile response:', updatedProfile);
      
      // Update user in AuthContext
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...updatedProfile
        }
      };
      
      console.log('Updating user in context:', updatedUser);
      updateUser(updatedUser);
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
      throw error;
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-page__title">My Dashboard</h1>

        <div className="profile-grid">
          
          {/* Left Column: Profile & Stats */}
          <aside className="profile-sidebar">
            
            {/* Profile Card */}
            <section className="profile-card">
              <div className="profile-card__avatar">
                {getInitials(currentUser.firstName || currentUser.first_name || 'U', currentUser.lastName || currentUser.last_name || 'N')}
              </div>
              <h2 className="profile-card__name">
                {currentUser.firstName || currentUser.first_name} {currentUser.lastName || currentUser.last_name}
              </h2>
              <p className="profile-card__handle">{currentUser.instagramHandle || currentUser.instagram_handle || 'No Instagram'}</p>

              <button 
                className="profile-card__edit-btn"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <FiSettings className="btn-icon" />
                Edit Profile
              </button>
              
              <div className="profile-card__info">
                <div className="info-item">
                  <FiMail className="info-icon" />
                  <span>{currentUser.email || 'No email'}</span>
                </div>
                <div className="info-item">
                  <FiPhone className="info-icon" />
                  <span>{currentUser.phoneNumber || currentUser.phone_number || 'No phone'}</span>
                </div>
                <div className="info-item">
                  <FiCalendar className="info-icon" />
                  <span>Joined: {formatDate(currentUser.createdAt || currentUser.created_at)}</span>
                </div>
              </div>
            </section>

            {/* Seller Rating Card */}
            <section className="rating-card">
              <h3 className="rating-card__title">Seller Rating</h3>
              <div className="rating-card__score">
                <FiStar className="rating-star" />
                <span className="rating-value">{currentUser.sellerRating || currentUser.seller_rating || 'N/A'}</span>
                <span className="rating-max">/ 5.0</span>
              </div>
              <p className="rating-card__reviews">
                Based on {currentUser.totalReviews || currentUser.total_reviews || 0} seller reviews.
              </p>
              
              {/* Seller Reviews List */}
              {sellerReviews.length === 0 ? (
                <p className="empty-reviews-text">No reviews yet</p>
              ) : (
                <>
                  <div className="seller-reviews-list">
                    {(showAllReviews ? sellerReviews : sellerReviews.slice(0, 3)).map((review) => (
                      <div key={`review-${review.id || review.review_id}`} className="seller-review-item">
                        <div className="seller-review-header">
                          <div className="seller-review-user">
                            <div className="seller-review-avatar">
                              {(review.reviewer?.firstName?.[0] || review.reviewer?.first_name?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                              <p className="seller-review-name">
                                {review.reviewer?.firstName || review.reviewer?.first_name || 'Anonymous'} {review.reviewer?.lastName?.[0] || review.reviewer?.last_name?.[0] || ''}.
                              </p>
                              <div className="seller-review-stars">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </div>
                          <span className="seller-review-date">{formatDate(review.createdAt || review.created_at)}</span>
                        </div>
                        {review.product && (
                          <p className="seller-review-product">
                            <FiPackage className="product-icon" />
                            {review.product.name}
                          </p>
                        )}
                        <p className="seller-review-text">{review.comment}</p>
                      </div>
                    ))}
                  </div>

                  {sellerReviews.length > 3 && (
                    <button 
                      className="rating-card__link"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                    >
                      {showAllReviews ? 'Show Less' : `View All ${sellerReviews.length} Reviews`}
                    </button>
                  )}
                </>
              )}
            </section>

          </aside>

          {/* Right Column: Listings & Orders */}
          <main className="profile-content">
            
            {/* Tab Navigation */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'listings' ? 'tab--active' : ''}`}
                onClick={() => setActiveTab('listings')}
              >
                My Active Listings ({activeListings.length})
              </button>
              <button
                className={`tab ${activeTab === 'orders' ? 'tab--active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Orders & Transactions
              </button>
            </div>

            {/* Listings Content */}
            {activeTab === 'listings' && (
              <section className="content-section">
                <h2 className="content-section__title">Active Items for Sale</h2>
                
                {loading ? (
                  <div className="empty-state">
                    <p>Loading your listings...</p>
                  </div>
                ) : activeListings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state__icon">📦</div>
                    <h3 className="empty-state__title">No active listings yet</h3>
                    <p className="empty-state__description">Start selling by listing your first item</p>
                    <button 
                      onClick={handleCreateNew} 
                      className="empty-state__button"
                    >
                      + List Your First Item
                    </button>
                  </div>
                ) : (
                  <div className="listings-table-container">
                    <table className="listings-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Price/Trade</th>
                          <th>Likes</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeListings.map((product) => {
                          // Get the first image - preferably the primary one
                          const images = product.images || product.productImages || [];
                          const primaryImage = images.find(img => img.isPrimary || img.is_primary);
                          const firstImage = primaryImage || images[0];
                          const imageUrl = firstImage?.imageUrl || firstImage?.image_url || 'https://placehold.co/40x40/1f2937/ffffff?text=Item';
                          
                          return (
                            <tr key={`product-${product.id || product.product_id}`}>
                              <td>
                                <div className="product-cell">
                                  <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="product-image"
                                  />
                                  <span>{product.name}</span>
                                </div>
                              </td>
                            <td className="price-cell">
                              {product.tradeOnly || product.trade_only ? (
                                <span className="trade-only-badge">Trade Only</span>
                              ) : (
                                <span className="price-value">
                                  ₱{Number.parseFloat(product.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>
                            <td className="likes-cell">
                              <FiHeart className="like-icon" />
                              {product.likeCount || product.like_count || 0}
                            </td>
                            <td>
                              <span className={`status-badge status-badge--${(product.isAvailable || product.is_available) ? 'active' : 'inactive'}`}>
                                {(product.isAvailable || product.is_available) ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="actions-cell">
                              <button
                                onClick={() => handleEdit(product)}
                                className="action-link action-link--edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id || product.product_id)}
                                className="action-link action-link--delete"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* Orders Content */}
            {activeTab === 'orders' && (
              <section className="content-section">
                <h2 className="content-section__title">Recent Transactions</h2>
                
                {recentOrders.length === 0 ? (
                  <div className="empty-state">
                    <p>📋 No orders yet</p>
                    <p className="empty-state-subtitle">Your purchase and sale history will appear here</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {recentOrders.map((order, index) => (
                      <div key={`${order.type}-${order.orderId || order.order_id || order.id || index}`} className="order-card">
                        <div className="order-card__header">
                          <div>
                            <p className="order-id">
                              {order.type === 'purchase' ? 'Purchase' : 'Sale'} #{order.orderId || order.order_id || order.id}
                            </p>
                            <p className="order-date">Date: {order.order_date}</p>
                          </div>
                          <span className={`status-badge status-badge--${order.status.toLowerCase().replace(' ', '-')}`}>
                            {order.status}
                          </span>
                        </div>

                        <div className="order-card__body">
                          <img
                            src={order.image}
                            alt={order.product_name}
                            className="order-image"
                          />
                          <div className="order-details">
                            <p className="order-product">{order.product_name}</p>
                            <p className="order-user">
                              {order.type === 'purchase' 
                                ? `Sold by: ${order.seller_name}` 
                                : `Buyer: ${order.buyer_name}`}
                            </p>
                          </div>
                          <div className="order-actions">
                            <p className="order-price">
                              ₱{order.total_amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </p>
                            {order.type === 'purchase' ? (
                              <div className="order-buttons">
                                <button 
                                  onClick={() => handleViewReceipt(order)}
                                  className="order-link order-link-button"
                                >
                                  View Receipt
                                </button>
                                {order.status === 'completed' && (
                                  <button 
                                    onClick={() => handleRateProduct(order)}
                                    className="order-link order-link-button rate-button"
                                  >
                                    <FiStar className="rate-icon" />
                                    Rate Product
                                  </button>
                                )}
                              </div>
                            ) : (
                              <Link to={`/order/${order.order_id}`} className="order-link">
                                Manage Sale
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

          </main>

        </div>
      </div>

      {/* Create Item Panel */}
      <CreateProductPanel 
        isOpen={isCreatePanelOpen}
        onClose={handleCreatePanelClose}
        onProductCreated={refreshProducts}
      />

      {/* Edit Item Panel */}
      <EditProductPanel 
        isOpen={isEditPanelOpen}
        onClose={handleEditPanelClose}
        productData={editingProduct}
        onProductUpdated={refreshProducts}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userData={currentUser}
        onSave={handleProfileUpdate}
      />      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        orderData={selectedOrder}
      />

      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        orderData={orderToRate}
        onSubmit={handleSubmitRating}
      />

      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        reviews={sellerReviews}
        sellerRating={currentUser.seller_rating}
        totalReviews={currentUser.total_reviews}
        sellerName={`${currentUser.first_name} ${currentUser.last_name}`}
      />
    </div>
  );
}
