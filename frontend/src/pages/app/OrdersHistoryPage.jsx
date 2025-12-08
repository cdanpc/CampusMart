import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiFilter, FiFileText, FiStar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getOrdersByBuyer, getOrdersBySeller, updateOrderStatus } from '../../services/orderService';
import { createReview } from '../../services/reviewService';
import ReceiptModal from '../../components/common/ReceiptModal';
import RatingModal from '../../components/common/RatingModal';
import './OrdersHistoryPage.css';

export default function OrdersHistoryPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [orderToRate, setOrderToRate] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' or 'sales'

  useEffect(() => {
    if (user?.profile?.id) {
      fetchOrders();
    }
  }, [user, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let orders;
      if (activeTab === 'purchases') {
        orders = await getOrdersByBuyer(user.profile.id);
      } else {
        orders = await getOrdersBySeller(user.profile.id);
      }
      setAllOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'confirmed');
      alert('Order confirmed! The buyer will be notified.');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Failed to confirm order');
    }
  };

  const handleReadyForPickup = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'ready_for_pickup');
      alert('Order marked as ready for pickup! The buyer will be notified.');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error marking order ready:', error);
      alert('Failed to mark order as ready');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('Mark this order as completed? This action confirms the buyer has received the item.')) {
      return;
    }
    try {
      await updateOrderStatus(orderId, 'completed');
      alert('Order marked as completed! The buyer will be notified.');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (!reason) {
      return; // User cancelled the prompt
    }
    try {
      await updateOrderStatus(orderId, 'cancelled');
      alert('Order has been cancelled. Both parties will be notified.');
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="status-icon status-icon--completed" />;
      case 'confirmed':
      case 'processing':
        return <FiClock className="status-icon status-icon--processing" />;
      case 'ready_for_pickup':
      case 'pending_pickup':
        return <FiTruck className="status-icon status-icon--pending" />;
      case 'cancelled':
        return <FiXCircle className="status-icon status-icon--cancelled" />;
      case 'pending':
        return <FiPackage className="status-icon status-icon--pending" />;
      default:
        return <FiPackage className="status-icon" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'ready_for_pickup':
        return 'Ready for Pickup';
      case 'pending_pickup':
        return 'Pending Pickup';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-badge--completed';
      case 'confirmed':
      case 'processing':
        return 'status-badge--processing';
      case 'ready_for_pickup':
      case 'pending_pickup':
        return 'status-badge--pending';
      case 'pending':
        return 'status-badge--pending';
      case 'cancelled':
        return 'status-badge--cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewReceipt = (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  const handleRateProduct = (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    setOrderToRate(order);
    setIsRatingOpen(true);
  };

  const handleSubmitRating = async (ratingData) => {
    if (submittingRating) return;
    
    setSubmittingRating(true);
    try {
      console.log('Submitting rating to API:', ratingData);
      await createReview(ratingData);
      alert('Thank you for your rating! Your review has been submitted successfully.');
      
      // Refresh orders to update hasReview status
      await fetchOrders();
      
      // Close modal
      setIsRatingOpen(false);
      setOrderToRate(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit rating';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmittingRating(false);
    }
  };

  const filteredOrders = allOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const productName = order.productName || '';
    const otherPartyName = activeTab === 'purchases' 
      ? order.sellerName || ''
      : order.buyerName || '';
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         otherPartyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="orders-history-page">
        <div className="container">
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-history-page">
      <div className="container">
        {/* Header */}
        <div className="orders-history-header">
          <Link to="/profile" className="back-link">
            <FiChevronLeft className="back-link__icon" />
            <span>Back to Profile</span>
          </Link>

          <h1 className="page-title">Order History</h1>
          <p className="page-subtitle">View and track all your orders</p>
        </div>

        {/* Tabs */}
        <div className="orders-tabs">
          <button
            className={`tab-btn ${activeTab === 'purchases' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            My Purchases
          </button>
          <button
            className={`tab-btn ${activeTab === 'sales' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            My Sales
          </button>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by product or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${statusFilter === 'all' ? 'filter-btn--active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`filter-btn ${statusFilter === 'pending' ? 'filter-btn--active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${statusFilter === 'confirmed' ? 'filter-btn--active' : ''}`}
              onClick={() => setStatusFilter('confirmed')}
            >
              Confirmed
            </button>
            <button
              className={`filter-btn ${statusFilter === 'ready_for_pickup' ? 'filter-btn--active' : ''}`}
              onClick={() => setStatusFilter('ready_for_pickup')}
            >
              Ready
            </button>
            <button
              className={`filter-btn ${statusFilter === 'completed' ? 'filter-btn--active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </button>
            <button
              className={`filter-btn ${statusFilter === 'cancelled' ? 'filter-btn--active' : ''}`}
              onClick={() => setStatusFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <FiPackage className="empty-state__icon" />
              <h3 className="empty-state__title">No orders found</h3>
              <p className="empty-state__text">
                {searchQuery 
                  ? 'Try adjusting your search or filters' 
                  : 'You haven\'t placed any orders yet'}
              </p>
              <Link to="/dashboard" className="btn btn--primary">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            filteredOrders.map(order => {
              // Extract seller/buyer names from OrderDetailDTO camelCase fields
              const sellerName = `${order.sellerFirstName || ''} ${order.sellerLastName || ''}`.trim() || 'Unknown';
              const buyerName = `${order.buyerFirstName || ''} ${order.buyerLastName || ''}`.trim() || 'Unknown';
              const productImage = order.productImage || 'https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image';
              
              return (
              <div key={`order-${order.orderId || order.id || order.order_id}`} className="order-card">
                <Link
                  to={`/order/${order.orderId || order.id || order.order_id}`}
                  className="order-card__link"
                >
                  <div className="order-card__image">
                    <img 
                      src={productImage} 
                      alt={order.productName || 'Product'}
                      onError={(e) => { e.target.src = 'https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image'; }}
                    />
                  </div>

                  <div className="order-card__content">
                    <div className="order-card__header">
                      <div className="order-card__info">
                        <h3 className="order-card__title">{order.productName || 'Product'}</h3>
                        <p className="order-card__seller">
                          {activeTab === 'purchases' ? 'Seller' : 'Buyer'}: {activeTab === 'purchases' ? sellerName : buyerName}
                        </p>
                        <p className="order-card__date">{formatDate(order.createdAt || order.created_at)}</p>
                      </div>

                      <div className="order-card__status">
                        {getStatusIcon(order.status)}
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="order-card__footer">
                      <div className="order-card__details">
                        <span className="order-detail">
                          Order #{order.orderId || order.id || order.order_id}
                        </span>
                        <span className="order-detail">
                          Qty: {order.quantity}
                        </span>
                        <span className="order-detail">
                          {order.paymentMethod || order.payment_method}
                        </span>
                        {activeTab === 'sales' && (order.pickupLocation || order.pickup_location) && (
                          <span className="order-detail" title="Pickup Location">
                            📍 {order.pickupLocation || order.pickup_location}
                          </span>
                        )}
                      </div>

                      <div className="order-card__price">
                        ₱{(order.totalAmount || order.total_amount || order.total_price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    {/* Show delivery notes for sellers */}
                    {activeTab === 'sales' && (order.deliveryNotes || order.delivery_notes) && (
                      <div className="order-card__notes">
                        <strong>Contact/Notes:</strong> {order.deliveryNotes || order.delivery_notes}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Action Buttons for Sellers - Inside Card */}
                {activeTab === 'sales' && (
                  <div className="order-card__actions">
                    {order.status === 'pending' && (
                      <>
                        <button
                          className="action-btn action-btn--primary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleConfirmOrder(order.orderId || order.id || order.order_id);
                          }}
                        >
                          <FiCheckCircle className="action-btn__icon" />
                          Confirm Order
                        </button>
                        <button
                          className="action-btn action-btn--danger"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancelOrder(order.orderId || order.id || order.order_id);
                          }}
                        >
                          <FiXCircle className="action-btn__icon" />
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <>
                        <button
                          className="action-btn action-btn--primary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleReadyForPickup(order.orderId || order.id || order.order_id);
                          }}
                        >
                          <FiTruck className="action-btn__icon" />
                          Ready for Pickup
                        </button>
                        <button
                          className="action-btn action-btn--danger"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancelOrder(order.orderId || order.id || order.order_id);
                          }}
                        >
                          <FiXCircle className="action-btn__icon" />
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {order.status === 'ready_for_pickup' && (
                      <>
                        <button
                          className="action-btn action-btn--success"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCompleteOrder(order.orderId || order.id || order.order_id);
                          }}
                        >
                          <FiCheckCircle className="action-btn__icon" />
                          Mark as Completed
                        </button>
                        <button
                          className="action-btn action-btn--danger"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancelOrder(order.orderId || order.id || order.order_id);
                          }}
                        >
                          <FiXCircle className="action-btn__icon" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Action Buttons for Buyers - Inside Card */}
                {activeTab === 'purchases' && order.status === 'completed' && (
                  <div className="order-card__actions">
                    <button
                      className="action-btn action-btn--secondary"
                      onClick={(e) => handleViewReceipt(e, order)}
                    >
                      <FiFileText className="action-btn__icon" />
                      View Receipt
                    </button>
                    {!order.hasReview && (
                      <button
                        className="action-btn action-btn--primary"
                        onClick={(e) => handleRateProduct(e, order)}
                        disabled={submittingRating}
                      >
                        <FiStar className="action-btn__icon" />
                        {submittingRating ? 'Submitting...' : 'Rate Product'}
                      </button>
                    )}
                    {order.hasReview && (
                      <span className="review-submitted-badge">
                        <FiCheckCircle /> Review Submitted
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
            })
          )}
        </div>

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="orders-summary">
            <div className="summary-card">
              <div className="summary-item">
                <span className="summary-label">Total Orders</span>
                <span className="summary-value">{filteredOrders.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Completed</span>
                <span className="summary-value">
                  {filteredOrders.filter(order => order.status === 'completed').length}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pending</span>
                <span className="summary-value">
                  {filteredOrders.filter(order => order.status === 'pending' || order.status === 'confirmed' || order.status === 'ready_for_pickup').length}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{activeTab === 'purchases' ? 'Total Spent' : 'Total Earned'}</span>
                <span className="summary-value">
                  ₱{filteredOrders.reduce((sum, order) => sum + (order.totalAmount || order.total_amount || order.total_price || 0), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReceiptModal 
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
    </div>
  );
}
