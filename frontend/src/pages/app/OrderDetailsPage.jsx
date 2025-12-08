import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiPhone, FiMail, FiPackage, FiMessageSquare, FiCheck, FiX, FiClock } from 'react-icons/fi';
import Button from '../../components/common/Button';
import { getOrderById, updateOrderStatus } from '../../services/orderService';
import { getProductById } from '../../services/productService';
import { getProfileById } from '../../services/profileService';
import './OrderDetailsPage.css';

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch order details
      const order = await getOrderById(orderId);
      console.log('Fetched order:', order);

      // OrderDTO returns buyerId, sellerId, productId (not nested objects)
      const buyerId = order.buyerId;
      const sellerId = order.sellerId;
      const productId = order.productId;

      console.log('Buyer ID:', buyerId);
      console.log('Seller ID:', sellerId);
      console.log('Product ID:', productId);

      if (!buyerId || !sellerId || !productId) {
        throw new Error('Order is missing required IDs');
      }

      // Fetch buyer, seller, and product details
      const buyer = await getProfileById(buyerId);
      const seller = await getProfileById(sellerId);
      const product = await getProductById(productId);

      // Handle category for fetched product
      if (product && product.category && typeof product.category === 'object') {
        product.category = product.category.name || '';
      }
      // Handle images array for fetched product
      if (product && product.images && Array.isArray(product.images) && product.images.length > 0) {
        product.image_url = product.images[0].imageUrl || product.images[0].image_url || '';
      }

      // Build complete order data
      const completeOrderData = {
        order_id: order.id || order.order_id || order.orderId,
        buyer_profile_id: buyerId,
        seller_profile_id: sellerId,
        product_id: productId,
        quantity: order.quantity || 1,
        total_amount: order.total_amount || order.totalAmount,
        order_date: order.created_at || order.createdAt || order.order_date || order.orderDate,
        status: order.status,
        payment_method: order.payment_method || order.paymentMethod,
        pickup_location: order.pickup_location || order.pickupLocation,
        contact_number: buyer.phoneNumber || 'N/A',
        notes: order.delivery_notes || order.deliveryNotes,
        buyer,
        seller,
        product
      };

      console.log('Complete order data:', completeOrderData);
      setOrderData(completeOrderData);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(`Failed to load order details: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      ready_for_pickup: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending Confirmation',
      confirmed: 'Confirmed',
      ready_for_pickup: 'Ready for Pickup',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  const handleConfirmOrder = async () => {
    try {
      await updateOrderStatus(orderId, 'confirmed');
      await fetchOrderDetails(); // Refresh order data
      alert('Order confirmed successfully!');
    } catch (err) {
      console.error('Error confirming order:', err);
      alert('Failed to confirm order. Please try again.');
    }
  };

  const handleMarkReady = async () => {
    try {
      await updateOrderStatus(orderId, 'ready_for_pickup');
      await fetchOrderDetails(); // Refresh order data
      alert('Order marked as ready for pickup!');
    } catch (err) {
      console.error('Error marking order ready:', err);
      alert('Failed to mark order as ready. Please try again.');
    }
  };

  const handleMarkCompleted = async () => {
    if (window.confirm('Mark this order as completed? This action cannot be undone.')) {
      try {
        await updateOrderStatus(orderId, 'completed');
        await fetchOrderDetails(); // Refresh order data
        alert('Order completed successfully!');
      } catch (err) {
        console.error('Error completing order:', err);
        alert('Failed to complete order. Please try again.');
      }
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt('Please enter the cancellation reason:');
    if (reason) {
      try {
        await updateOrderStatus(orderId, 'cancelled');
        await fetchOrderDetails(); // Refresh order data
        alert('Order cancelled successfully!');
      } catch (err) {
        console.error('Error cancelling order:', err);
        alert('Failed to cancel order. Please try again.');
      }
    }
  };

  const handleMessageBuyer = () => {
    navigate(`/messages?user=${orderData.buyer_profile_id}`);
  };

  const getTimeline = (status) => {
    const timeline = [
      { status: 'pending', label: 'Order Placed', completed: true },
      { status: 'confirmed', label: 'Confirmed', completed: ['confirmed', 'ready_for_pickup', 'completed'].includes(status) },
      { status: 'ready_for_pickup', label: 'Ready for Pickup', completed: ['ready_for_pickup', 'completed'].includes(status) },
      { status: 'completed', label: 'Completed', completed: status === 'completed' }
    ];
    return timeline;
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="container">
          <div className="loading-state">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="order-details-page">
        <div className="container">
          <div className="error-state">{error || 'Order not found'}</div>
          <Button onClick={() => navigate('/profile')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="container">
        {/* Back Button */}
        <button className="back-button" onClick={() => navigate('/profile')}>
          <FiArrowLeft />
          <span>Back to Dashboard</span>
        </button>

        {/* Page Header */}
        <div className="order-header">
          <div>
            <h1 className="order-title">Order #{orderData.order_id}</h1>
            <p className="order-date">Placed on {formatDate(orderData.order_date)}</p>
          </div>
          <span className={`order-status-badge order-status-badge--${getStatusColor(orderData.status)}`}>
            {getStatusLabel(orderData.status)}
          </span>
        </div>

        <div className="order-grid">
          
          {/* Left Column: Order Info */}
          <div className="order-main">
            
            {/* Buyer Information Card */}
            <section className="info-card">
              <h2 className="info-card__title">
                <FiUser className="title-icon" />
                Buyer Information
              </h2>
              <div className="info-card__content">
                <div className="buyer-avatar">
                  {orderData.buyer?.firstName?.[0] || 'B'}{orderData.buyer?.lastName?.[0] || 'U'}
                </div>
                <div className="buyer-details">
                  <h3 className="buyer-name">
                    {orderData.buyer?.firstName || 'Unknown'} {orderData.buyer?.lastName || 'Buyer'}
                  </h3>
                  <div className="contact-info">
                    <div className="contact-item">
                      <FiPhone className="contact-icon" />
                      <span>{orderData.buyer?.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="contact-item">
                      <FiMail className="contact-icon" />
                      <span>{orderData.buyer?.email || 'N/A'}</span>
                    </div>
                    {orderData.buyer?.instagram_handle && (
                      <div className="contact-item">
                        <FiMessageSquare className="contact-icon" />
                        <span>{orderData.buyer.instagram_handle}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Product Information Card */}
            <section className="info-card">
              <h2 className="info-card__title">
                <FiPackage className="title-icon" />
                Product Details
              </h2>
              <div className="product-info">
                <img src={orderData.product?.image_url || 'https://placehold.co/200x200/cccccc/ffffff?text=No+Image'} alt={orderData.product?.name || 'Product'} className="product-image-large" />
                <div className="product-details">
                  <h3 className="product-name">{orderData.product?.name || 'Unknown Product'}</h3>
                  <p className="product-category">{orderData.product?.category || 'Uncategorized'}</p>
                  <p className="product-description">{orderData.product?.description || 'No description available'}</p>
                  <p className="product-price">₱{(orderData.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </section>

            {/* Order Timeline */}
            <section className="info-card">
              <h2 className="info-card__title">
                <FiClock className="title-icon" />
                Order Timeline
              </h2>
              <div className="timeline">
                {getTimeline(orderData.status).map((step, index) => (
                  <div key={step.status} className={`timeline-step ${step.completed ? 'timeline-step--completed' : ''}`}>
                    <div className="timeline-marker">
                      {step.completed ? <FiCheck /> : <div className="timeline-dot"></div>}
                    </div>
                    {index < getTimeline(orderData.status).length - 1 && (
                      <div className={`timeline-line ${step.completed ? 'timeline-line--completed' : ''}`}></div>
                    )}
                    <div className="timeline-content">
                      <h4 className="timeline-label">{step.label}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Actions & Summary */}
          <aside className="order-sidebar">
            
            {/* Order Summary Card */}
            <section className="summary-card">
              <h3 className="summary-card__title">Order Summary</h3>
              <div className="summary-item">
                <span className="summary-label">Payment Method:</span>
                <span className="summary-value">{orderData.payment_method || 'N/A'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pickup Location:</span>
                <span className="summary-value">{orderData.pickup_location || 'N/A'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Contact Number:</span>
                <span className="summary-value">{orderData.contact_number || 'N/A'}</span>
              </div>
              {orderData.notes && (
                <div className="summary-item summary-item--notes">
                  <span className="summary-label">Notes from Buyer:</span>
                  <span className="summary-value">{orderData.notes}</span>
                </div>
              )}
              <div className="summary-divider"></div>
              <div className="summary-item summary-item--total">
                <span className="summary-label">Total Amount:</span>
                <span className="summary-value summary-value--total">
                  ₱{(orderData.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </section>

            {/* Actions Card */}
            <section className="actions-card">
              <h3 className="actions-card__title">Actions</h3>
              
              {/* Pending status - Show Confirm button */}
              {orderData.status === 'pending' && (
                <>
                  <Button variant="primary" fullWidth onClick={handleConfirmOrder}>
                    <FiCheck className="btn-icon" />
                    Confirm Order
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleCancelOrder}>
                    <FiX className="btn-icon" />
                    Cancel Order
                  </Button>
                </>
              )}

              {/* Confirmed status - Show Ready for Pickup button */}
              {orderData.status === 'confirmed' && (
                <>
                  <Button variant="primary" fullWidth onClick={handleMarkReady}>
                    <FiCheck className="btn-icon" />
                    Mark Ready for Pickup
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleCancelOrder}>
                    <FiX className="btn-icon" />
                    Cancel Order
                  </Button>
                </>
              )}

              {/* Ready for Pickup status - Show Complete button */}
              {orderData.status === 'ready_for_pickup' && (
                <>
                  <Button variant="success" fullWidth onClick={handleMarkCompleted}>
                    <FiCheck className="btn-icon" />
                    Mark as Completed
                  </Button>
                  <Button variant="danger" fullWidth onClick={handleCancelOrder}>
                    <FiX className="btn-icon" />
                    Cancel Order
                  </Button>
                </>
              )}

              {/* Message Buyer button - always available except for completed/cancelled */}
              {orderData.status !== 'completed' && orderData.status !== 'cancelled' && (
                <Button variant="secondary" fullWidth onClick={handleMessageBuyer}>
                  <FiMessageSquare className="btn-icon" />
                  Message Buyer
                </Button>
              )}

              <Link to={`/product/${orderData.product_id}`}>
                <Button variant="outline" fullWidth>
                  View Product Listing
                </Button>
              </Link>
            </section>

          </aside>

        </div>
      </div>
    </div>
  );
}
