import { useState } from 'react';
import { FiX, FiPackage, FiMapPin, FiCreditCard, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/orderService';
import Input from './Input';
import Button from './Button';
import './PlaceOrderModal.css';

export default function PlaceOrderModal({ isOpen, onClose, product, seller, onOrderSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    payment_method: 'cash',
    pickup_location: '',
    contact_number: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Cash on Pickup' },
    { value: 'gcash', label: 'GCash' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pickup_location.trim()) {
      newErrors.pickup_location = 'Pickup location is required';
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Contact number is required';
    } else if (!/^09\d{9}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Please enter a valid Philippine phone number (09XXXXXXXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Check if user is trying to buy their own product
    if (user?.profile?.id === seller?.id) {
      setErrors({ submit: 'You cannot buy your own product' });
      return;
    }

    if (!user?.profile?.id) {
      setErrors({ submit: 'Please login to place an order' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const orderData = {
        buyer: { id: parseInt(user.profile.id) },
        seller: { id: parseInt(seller.id) },
        product: { id: parseInt(product.product_id || product.id) },
        totalAmount: parseFloat(product.price),
        quantity: 1,
        status: 'pending',
        paymentMethod: formData.payment_method,
        pickupLocation: formData.pickup_location,
        deliveryNotes: formData.notes ? 
          `Contact: ${formData.contact_number}\nNotes: ${formData.notes}` : 
          `Contact: ${formData.contact_number}`
      };

      console.log('Placing order with data:', orderData);
      const createdOrder = await createOrder(orderData);
      console.log('Order created successfully:', createdOrder);
      
      // Show success message
      alert('Order placed successfully! The seller will be notified.');
      
      // Reset form
      setFormData({
        payment_method: 'cash',
        pickup_location: '',
        contact_number: '',
        notes: ''
      });
      
      // Call success callback if provided
      if (onOrderSuccess) {
        onOrderSuccess(createdOrder);
      }
      
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        // Log the full error response for debugging
        console.error('Full error data:', error.response.data);
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.response?.status === 403) {
        errorMessage = 'You cannot buy your own product';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !product || !seller) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="place-order-modal">
        <div className="modal-header">
          <h2 className="modal-title">Place Order</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Product Summary */}
          <div className="order-summary">
            <FiPackage className="summary-icon" />
            <div className="summary-content">
              <h3 className="summary-product-name">{product.name}</h3>
              <p className="summary-price">₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Seller Info */}
          <div className="seller-info">
            <p className="seller-info__label">Seller:</p>
            <p className="seller-info__name">{seller.first_name} {seller.last_name}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label">
                <FiCreditCard className="label-icon" />
                Payment Method *
              </label>
              <div className="radio-group">
                {paymentMethods.map((method) => (
                  <label key={method.value} className="radio-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={formData.payment_method === method.value}
                      onChange={handleChange}
                    />
                    <span className="radio-label">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pickup Location */}
            <div className="form-group">
              <label className="form-label">
                <FiMapPin className="label-icon" />
                Pickup Location *
              </label>
              <Input
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                error={errors.pickup_location}
                placeholder="e.g., CIT University Main Gate, Building A Lobby"
              />
              <p className="field-hint">Where would you like to meet the seller?</p>
            </div>

            {/* Contact Number */}
            <Input
              label="Contact Number *"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              error={errors.contact_number}
              placeholder="09XXXXXXXXX"
            />

            {/* Notes to Seller */}
            <div className="form-group">
              <label className="form-label">
                <FiMessageSquare className="label-icon" />
                Notes to Seller (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Any special requests or questions for the seller..."
                rows={3}
              />
            </div>

            {/* Important Notice */}
            <div className="order-notice">
              <span className="notice-icon">ℹ️</span>
              <div className="notice-content">
                <p className="notice-title">Important:</p>
                <ul className="notice-list">
                  <li>The seller will be notified of your order</li>
                  <li>Meet in a safe, public location on campus</li>
                  <li>Inspect the item before payment</li>
                </ul>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="order-error" role="alert">
                {errors.submit}
              </div>
            )}

            {/* Action Buttons */}
            <div className="modal-actions">
              <Button 
                type="button" 
                variant="secondary" 
                fullWidth 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
