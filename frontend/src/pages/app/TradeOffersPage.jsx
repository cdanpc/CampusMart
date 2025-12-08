import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOffersBySeller, getOffersByBuyer, acceptOffer, rejectOffer, withdrawOffer, deleteTradeOffer } from '../../services/tradeOfferService';
import AppHeader from '../../components/layout/AppHeader';
import Button from '../../components/common/Button';
import './TradeOffersPage.css';

export default function TradeOffersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [sentOffers, setSentOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Track which offer is being acted upon

  useEffect(() => {
    if (user?.id) {
      fetchOffers();
    }
  }, [user, activeTab]);

  const fetchOffers = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'received') {
        const offers = await getOffersBySeller(user.id);
        setReceivedOffers(offers || []);
      } else {
        const offers = await getOffersByBuyer(user.id);
        setSentOffers(offers || []);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to load trade offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId) => {
    setActionLoading(offerId);
    try {
      await acceptOffer(offerId);
      await fetchOffers();
      alert('Offer accepted successfully!');
    } catch (err) {
      console.error('Error accepting offer:', err);
      alert('Failed to accept offer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (offerId) => {
    if (!confirm('Are you sure you want to reject this offer?')) return;
    
    setActionLoading(offerId);
    try {
      await rejectOffer(offerId);
      await fetchOffers();
      alert('Offer rejected.');
    } catch (err) {
      console.error('Error rejecting offer:', err);
      alert('Failed to reject offer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async (offerId) => {
    if (!confirm('Are you sure you want to withdraw this offer?')) return;
    
    setActionLoading(offerId);
    try {
      await withdrawOffer(offerId);
      await fetchOffers();
      alert('Offer withdrawn.');
    } catch (err) {
      console.error('Error withdrawing offer:', err);
      alert('Failed to withdraw offer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (offerId) => {
    if (!confirm('Are you sure you want to delete this offer? This action cannot be undone.')) return;
    
    setActionLoading(offerId);
    try {
      await deleteTradeOffer(offerId);
      await fetchOffers();
      alert('Offer deleted successfully.');
    } catch (err) {
      console.error('Error deleting offer:', err);
      alert('Failed to delete offer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-badge status-pending';
      case 'ACCEPTED':
        return 'status-badge status-accepted';
      case 'REJECTED':
        return 'status-badge status-rejected';
      case 'WITHDRAWN':
        return 'status-badge status-withdrawn';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '₱0.00';
    return `₱${parseFloat(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const offers = activeTab === 'received' ? receivedOffers : sentOffers;
  const pendingCount = offers.filter(o => o.status === 'PENDING').length;

  return (
    <div className="trade-offers-page">
      <AppHeader />
      
      <div className="trade-offers-container">
        <div className="page-header">
          <h1>Trade Offers</h1>
          <p className="page-subtitle">Manage your product trade offers</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'received' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Received Offers
            {activeTab === 'received' && pendingCount > 0 && (
              <span className="badge">{pendingCount}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'sent' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Offers
            {activeTab === 'sent' && pendingCount > 0 && (
              <span className="badge">{pendingCount}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="offers-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading offers...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <Button onClick={fetchOffers}>Retry</Button>
            </div>
          ) : offers.length === 0 ? (
            <div className="empty-state">
              <p>
                {activeTab === 'received' 
                  ? 'No offers received yet. When buyers make offers on your products, they will appear here.' 
                  : 'You haven\'t made any offers yet. Browse products and make offers on items you\'re interested in.'}
              </p>
            </div>
          ) : (
            <div className="offers-list">
              {offers.map((offer) => (
                <div key={offer.id} className="offer-card">
                  <div className="offer-header">
                    <div className="offer-product-info">
                      <h3>{offer.product?.name || 'Product'}</h3>
                      <p className="product-price">
                        Asking Price: {formatPrice(offer.product?.price)}
                      </p>
                    </div>
                    <span className={getStatusBadgeClass(offer.status)}>
                      {offer.status || 'PENDING'}
                    </span>
                  </div>

                  <div className="offer-details">
                    <div className="detail-row">
                      <span className="label">
                        {activeTab === 'received' ? 'From:' : 'To Seller:'}
                      </span>
                      <span className="value">
                        {activeTab === 'received' 
                          ? `${offer.offerer?.firstName || ''} ${offer.offerer?.lastName || 'Unknown Buyer'}`
                          : `${offer.product?.seller?.firstName || ''} ${offer.product?.seller?.lastName || 'Unknown Seller'}`
                        }
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Offered Amount:</span>
                      <span className="value offered-price">{formatPrice(offer.offeredPrice)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Date:</span>
                      <span className="value">{formatDate(offer.createdAt)}</span>
                    </div>
                    {offer.tradeDescription && (
                      <div className="detail-row description">
                        <span className="label">Description:</span>
                        <p className="value">{offer.tradeDescription}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="offer-actions">
                    {activeTab === 'received' && offer.status === 'PENDING' && (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => handleAccept(offer.id)}
                          disabled={actionLoading === offer.id}
                        >
                          {actionLoading === offer.id ? 'Processing...' : 'Accept'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleReject(offer.id)}
                          disabled={actionLoading === offer.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {activeTab === 'sent' && offer.status === 'PENDING' && (
                      <Button
                        variant="secondary"
                        onClick={() => handleWithdraw(offer.id)}
                        disabled={actionLoading === offer.id}
                      >
                        {actionLoading === offer.id ? 'Processing...' : 'Withdraw Offer'}
                      </Button>
                    )}

                    {offer.status !== 'PENDING' && (
                      <Button
                        variant="secondary"
                        onClick={() => handleDelete(offer.id)}
                        disabled={actionLoading === offer.id}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
