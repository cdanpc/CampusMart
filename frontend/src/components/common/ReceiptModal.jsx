import { FiX, FiDownload, FiPrinter, FiCheck, FiPackage, FiShoppingBag } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import Button from './Button';
import './ReceiptModal.css';

export default function ReceiptModal({ isOpen, onClose, orderData }) {
  if (!isOpen || !orderData) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const receiptElement = document.querySelector('.receipt-content');
      if (!receiptElement) {
        alert('Receipt content not found');
        return;
      }

      // Hide no-print elements temporarily
      const noPrintElements = document.querySelectorAll('.no-print');
      noPrintElements.forEach(el => el.style.display = 'none');

      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });

      // Restore no-print elements
      noPrintElements.forEach(el => el.style.display = '');

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const orderId = orderData?.orderId || orderData?.order_id || 'receipt';
        link.download = `CampusMart-Receipt-${orderId}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '—';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '₱0.00';
    try {
      return `₱${Number(amount).toLocaleString('en-PH', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    } catch (error) {
      return '₱0.00';
    }
  };

  // Safe data extraction with fallbacks - OrderDetailDTO uses camelCase
  const orderId = orderData?.orderId ?? orderData?.order_id ?? '—';
  const orderDate = orderData?.createdAt ?? orderData?.created_at;
  const status = orderData?.status ?? 'unknown';
  
  const buyer = {
    firstName: orderData?.buyerFirstName ?? orderData?.buyer?.first_name ?? '—',
    lastName: orderData?.buyerLastName ?? orderData?.buyer?.last_name ?? '',
    email: orderData?.buyerEmail ?? orderData?.buyer?.email ?? '—',
    phone: orderData?.buyerPhone ?? orderData?.buyer?.phone_number ?? orderData?.contact_number ?? '—'
  };

  const seller = {
    firstName: orderData?.sellerFirstName ?? orderData?.seller?.first_name ?? '—',
    lastName: orderData?.sellerLastName ?? orderData?.seller?.last_name ?? '',
    email: orderData?.sellerEmail ?? orderData?.seller?.email ?? '—',
    phone: orderData?.sellerPhone ?? orderData?.seller?.phone_number ?? '—'
  };

  const product = {
    name: orderData?.productName ?? orderData?.product?.name ?? 'Unknown Product',
    image: orderData?.productImage ?? orderData?.product?.image ?? orderData?.product?.imageUrl ?? 'https://placehold.co/80x80/e5e7eb/6b7280?text=No+Image',
    description: orderData?.productDescription ?? orderData?.product?.description ?? '',
    category: orderData?.productCategory ?? orderData?.product?.category ?? '—'
  };

  const totalAmount = orderData?.totalAmount ?? orderData?.total_price ?? orderData?.total_amount ?? 0;
  const quantity = orderData?.quantity ?? 1;
  const paymentMethod = orderData?.paymentMethod ?? orderData?.payment_method ?? '—';
  const pickupLocation = orderData?.pickupLocation ?? orderData?.pickup_location ?? '—';
  const notes = orderData?.deliveryNotes ?? orderData?.notes ?? '';

  return (
    <div className="receipt-modal-overlay" onClick={handleOverlayClick}>
      <div className="receipt-modal">
        
        {/* Modal Header - Print Only */}
        <div className="receipt-modal__header no-print">
          <h2 className="receipt-modal__title">Order Receipt</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Receipt Content - Printable */}
        <div className="receipt-content">
          
          {/* Receipt Header */}
          <div className="receipt-header">
            <div className="receipt-logo">
              <FiShoppingBag className="receipt-logo-icon" />
              <span className="receipt-logo-text">Campus Mart</span>
            </div>
            <h1 className="receipt-title">Order Receipt</h1>
            <p className="receipt-subtitle">Campus Mart Transaction Receipt</p>
          </div>

          {/* Receipt Info Bar */}
          <div className="receipt-info-bar">
            <div className="receipt-info-item">
              <span className="receipt-info-label">Receipt #:</span>
              <span className="receipt-info-value">CM-{orderId}</span>
            </div>
            <div className="receipt-info-item">
              <span className="receipt-info-label">Date:</span>
              <span className="receipt-info-value">{formatDate(orderDate)}</span>
            </div>
            <div className="receipt-info-item">
              <span className="receipt-info-label">Status:</span>
              <span className={`receipt-status receipt-status--${status}`}>
                <FiCheck /> {status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Buyer & Seller Info */}
          <div className="receipt-parties">
            <div className="receipt-party">
              <h3 className="receipt-party__title">Buyer Information</h3>
              <p className="receipt-party__name">{buyer.firstName} {buyer.lastName}</p>
              <p className="receipt-party__detail">{buyer.email}</p>
              <p className="receipt-party__detail">{buyer.phone}</p>
            </div>
            <div className="receipt-party">
              <h3 className="receipt-party__title">Seller Information</h3>
              <p className="receipt-party__name">{seller.firstName} {seller.lastName}</p>
              <p className="receipt-party__detail">{seller.email}</p>
              <p className="receipt-party__detail">{seller.phone}</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="receipt-section">
            <h3 className="receipt-section__title">
              <FiPackage /> Product Details
            </h3>
            <div className="receipt-product">
              <img 
                src={product.image} 
                alt={product.name} 
                className="receipt-product__image"
              />
              <div className="receipt-product__details">
                <h4 className="receipt-product__name">{product.name}</h4>
                {product.description && (
                  <p className="receipt-product__description">{product.description}</p>
                )}
                <p className="receipt-product__category">Category: {product.category}</p>
                <p className="receipt-product__quantity">Quantity: {quantity}</p>
              </div>
            </div>
          </div>

          {/* Payment & Pickup Details */}
          <div className="receipt-section">
            <h3 className="receipt-section__title">Transaction Details</h3>
            <div className="receipt-details-grid">
              <div className="receipt-detail-item">
                <span className="receipt-detail-label">Payment Method:</span>
                <span className="receipt-detail-value">{paymentMethod}</span>
              </div>
              <div className="receipt-detail-item">
                <span className="receipt-detail-label">Pickup Location:</span>
                <span className="receipt-detail-value">{pickupLocation}</span>
              </div>
              {notes && (
                <div className="receipt-detail-item receipt-detail-item--full">
                  <span className="receipt-detail-label">Notes:</span>
                  <span className="receipt-detail-value">{notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total Amount */}
          <div className="receipt-total">
            <div className="receipt-total__row">
              <span className="receipt-total__label">Subtotal:</span>
              <span className="receipt-total__value">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="receipt-total__row">
              <span className="receipt-total__label">Transaction Fee:</span>
              <span className="receipt-total__value">₱0.00</span>
            </div>
            <div className="receipt-total__divider"></div>
            <div className="receipt-total__row receipt-total__row--grand">
              <span className="receipt-total__label">Total Amount:</span>
              <span className="receipt-total__value">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="receipt-footer">
            <p className="receipt-footer__text">
              Thank you for using Campus Mart! For any concerns, please contact us at support@campusmart.com
            </p>
            <p className="receipt-footer__note">
              This is a computer-generated receipt. Keep this for your records.
            </p>
          </div>

        </div>

        {/* Modal Actions - No Print */}
        <div className="receipt-modal__actions no-print">
          <Button variant="outline" fullWidth onClick={handlePrint}>
            <FiPrinter className="btn-icon" />
            Print Receipt
          </Button>
          <Button variant="primary" fullWidth onClick={handleDownload}>
            <FiDownload className="btn-icon" />
            Download as Image
          </Button>
        </div>

      </div>
    </div>
  );
}
