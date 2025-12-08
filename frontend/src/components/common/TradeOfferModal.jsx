import { useState } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import Input from './Input';
import Button from './Button';
import './TradeOfferModal.css';
import { createTradeOffer } from '../../services/tradeOfferService';
import { uploadMessageImage } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';

export default function TradeOfferModal({ isOpen, onClose, product }) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    item_name: '',
    item_estimated_value: '',
    item_condition: 'Good',
    cash_component: '',
    trade_description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, item_image: 'File size must be less than 5MB' }));
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, item_image: 'Please select an image file' }));
        return;
      }
      setItemImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, item_image: '' }));
    }
  };

  const removeImage = () => {
    setItemImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!itemImage) {
      newErrors.item_image = 'Please upload an image of your trade item';
    }

    if (!formData.item_name?.trim()) {
      newErrors.item_name = 'Please enter the item name';
    }

    if (!formData.item_estimated_value || parseFloat(formData.item_estimated_value) <= 0) {
      newErrors.item_estimated_value = 'Please enter a valid estimated value';
    }

    if (!formData.trade_description?.trim()) {
      newErrors.trade_description = 'Please describe your trade offer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!user || !user.id) {
      setErrors({ form: 'You must be logged in to make an offer' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // First, upload the item image
      setUploadingImage(true);
      const uploadResult = await uploadMessageImage(itemImage);
      setUploadingImage(false);

      if (!uploadResult.imageUrl) {
        throw new Error('Failed to upload item image');
      }

      // Create trade offer with all item details
      const offerData = {
        productId: product?.id || product?.product_id,
        offererId: user.id,
        itemName: formData.item_name.trim(),
        itemEstimatedValue: parseFloat(formData.item_estimated_value),
        itemCondition: formData.item_condition,
        itemImageUrl: uploadResult.imageUrl,
        cashComponent: formData.cash_component ? parseFloat(formData.cash_component) : 0,
        tradeDescription: formData.trade_description.trim()
      };

      await createTradeOffer(offerData);
      
      // Show success state
      setSuccess(true);
      
      // Reset form after a delay and close
      setTimeout(() => {
        setFormData({
          item_name: '',
          item_estimated_value: '',
          item_condition: 'Good',
          cash_component: '',
          trade_description: ''
        });
        setItemImage(null);
        setImagePreview(null);
        setSuccess(false);
        setErrors({});
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error creating trade offer:', error);
      setErrors({
        form: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to submit offer. Please try again.'
      });
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content trade-offer-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">Make a Trade Offer</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Product Info */}
        {product && (
          <div className="trade-product-info">
            <div className="trade-product-info__details">
              <h3 className="trade-product-info__name">{product.name}</h3>
              <p className="trade-product-info__price">
                Asking Price: <span>₱{product.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
          </div>
        )}

        {/* Trade Offer Form */}
        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Success Message */}
          {success && (
            <div className="success-message" style={{ 
              padding: '1rem', 
              background: '#10b981', 
              color: 'white', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ✓ Trade offer submitted successfully!
            </div>
          )}

          {/* Error Message */}
          {errors.form && (
            <div className="error-message" style={{ 
              padding: '1rem', 
              background: '#ef4444', 
              color: 'white', 
              borderRadius: '8px', 
              marginBottom: '1rem'
            }}>
              {errors.form}
            </div>
          )}

          {/* Item Image Upload */}
          <div className="form-group">
            <label className="form-label">Your Trade Item Image *</label>
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Trade item preview" className="image-preview" />
                <button type="button" className="remove-image-btn" onClick={removeImage}>
                  <FiX /> Remove
                </button>
              </div>
            ) : (
              <label className="image-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-upload-input"
                />
                <div className="image-upload-content">
                  <FiUpload className="upload-icon" />
                  <p>Click to upload item photo</p>
                  <span className="upload-hint">PNG, JPG, GIF, WEBP up to 5MB</span>
                </div>
              </label>
            )}
            {errors.item_image && (
              <span className="form-error">{errors.item_image}</span>
            )}
          </div>

          {/* Item Name */}
          <Input
            label="Item Name *"
            name="item_name"
            type="text"
            value={formData.item_name}
            onChange={handleChange}
            error={errors.item_name}
            placeholder="e.g., Macbook Pro 2021, iPhone 13, etc."
          />

          {/* Item Estimated Value */}
          <Input
            label="Estimated Item Value (₱) *"
            name="item_estimated_value"
            type="number"
            step="0.01"
            value={formData.item_estimated_value}
            onChange={handleChange}
            error={errors.item_estimated_value}
            placeholder="0.00"
          />

          {/* Item Condition */}
          <div className="form-group">
            <label className="form-label">Item Condition *</label>
            <select
              name="item_condition"
              value={formData.item_condition}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="For Parts">For Parts</option>
            </select>
          </div>

          {/* Cash Component (Optional) */}
          <Input
            label="Additional Cash Offer (₱)"
            name="cash_component"
            type="number"
            step="0.01"
            value={formData.cash_component}
            onChange={handleChange}
            placeholder="0.00 (optional)"
          />
          <p className="form-help" style={{ marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Optional: Add cash to sweeten the deal if your item's value is lower
          </p>

          {/* Trade Description */}
          <div className="form-group">
            <label className="form-label">Trade Offer Description *</label>
            <textarea
              name="trade_description"
              value={formData.trade_description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe your trade offer, item condition details, meetup preferences, etc..."
              rows={5}
            />
            {errors.trade_description && (
              <span className="form-error">{errors.trade_description}</span>
            )}
            <p className="form-help">
              Explain your trade offer clearly. Include item condition, why you're trading, and any preferences.
            </p>
          </div>

          <div className="modal-actions">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={loading || uploadingImage}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading || uploadingImage || success}
            >
              {uploadingImage ? 'Uploading Image...' : loading ? 'Submitting...' : success ? 'Submitted!' : 'Submit Trade Offer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
