import { useState } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import Input from './Input';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import ImagePreviewModal from './ImagePreviewModal';
import { useAuth } from '../../context/AuthContext';
import { createProduct } from '../../services/productService';
import './ProductPanel.css';

export default function CreateProductPanel({ isOpen, onClose, onProductCreated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand_type: '',
    condition: '',
    stock: '1',
    contact_info: '',
    category_id: '',
    listing_type: 'for_sale',
    images: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Books' },
    { id: 3, name: 'Fashion' },
    { id: 4, name: 'Home' },
    { id: 5, name: 'Food' },
    { id: 6, name: 'Service' },
    { id: 7, name: 'Appliance' },
    { id: 8, name: 'Apparel & Watch' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));
      e.target.value = '';
    }
  };

  const handleDeleteClick = (index) => {
    setImageToDelete(index);
    setShowDeleteConfirm(true);
  };

  const confirmRemoveImage = () => {
    if (imageToDelete !== null) {
      const updatedImages = formData.images.filter((_, i) => i !== imageToDelete);
      setFormData(prev => ({
        ...prev,
        images: updatedImages
      }));
      setImageToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedReader = new FileReader();
              compressedReader.onloadend = () => resolve(compressedReader.result);
              compressedReader.onerror = reject;
              compressedReader.readAsDataURL(blob);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageClick = (index) => {
    setPreviewImageIndex(index);
    setShowImagePreview(true);
  };

  const allPreviewImages = formData.images.map(file => URL.createObjectURL(file));

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (formData.listing_type !== 'trade_only') {
      if (!formData.price) {
        newErrors.price = 'Price is required for sale items';
      } else if (isNaN(formData.price) || Number(formData.price) < 0) {
        newErrors.price = 'Please enter a valid price';
      }
    }

    if (!formData.category_id) newErrors.category_id = 'Please select a category';
    if (!formData.condition) newErrors.condition = 'Please select item condition';
    if (!formData.stock || formData.stock < 1) newErrors.stock = 'Stock must be at least 1';
    if (!formData.contact_info.trim()) newErrors.contact_info = 'Contact information is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (!user?.profile?.id) {
        setErrors({ submit: 'You must be logged in and have a profile to list items.' });
        return;
      }

      setLoading(true);
      try {
        const imagePromises = formData.images.map(file => compressImage(file));
        const imageDataUrls = await Promise.all(imagePromises);

        const imagesArray = imageDataUrls.map((dataUrl, index) => ({
          imageUrl: dataUrl,
          isPrimary: index === 0
        }));

        const productPayload = {
          name: formData.name,
          description: formData.description,
          price: formData.listing_type === 'trade_only' ? null : Number.parseFloat(formData.price),
          brandType: formData.brand_type || null,
          condition: formData.condition,
          stock: Number.parseInt(formData.stock),
          contactInfo: formData.contact_info,
          isAvailable: true,
          tradeOnly: formData.listing_type === 'trade_only',
          viewCount: 0,
          likeCount: 0,
          category: formData.category_id ? { id: Number.parseInt(formData.category_id) } : null,
          images: imagesArray
        };

        await createProduct(productPayload, user.profile.id);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          brand_type: '',
          condition: '',
          stock: '1',
          contact_info: '',
          category_id: '',
          listing_type: 'for_sale',
          images: []
        });
        
        onClose();
        if (onProductCreated) onProductCreated();
      } catch (error) {
        console.error('Error creating product:', error);
        let errorMessage = 'Failed to create product. Please try again.';
        
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error: Unable to connect to server.';
        } else if (error.response) {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        }
        
        setErrors({ submit: errorMessage });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="panel-overlay panel-overlay--active" onClick={handleOverlayClick} />

      <div className="list-item-panel list-item-panel--open">
        <div className="panel-header">
          <h2 className="panel-title">List New Item</h2>
          <button className="panel-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form className="panel-form" onSubmit={handleSubmit}>
          <Input
            label="Product Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., iPhone 13 Pro Max"
          />

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-textarea ${errors.description ? 'form-textarea--error' : ''}`}
              placeholder="Describe your item in detail..."
              rows={4}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Listing Type *</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="listing_type"
                  value="sale"
                  checked={formData.listing_type === 'sale'}
                  onChange={handleChange}
                />
                <span className="radio-label">
                  <strong>For Sale</strong>
                  <small>Sell for cash only</small>
                </span>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="listing_type"
                  value="trade_only"
                  checked={formData.listing_type === 'trade_only'}
                  onChange={handleChange}
                />
                <span className="radio-label">
                  <strong>Trade Only</strong>
                  <small>Looking to trade, not selling for cash</small>
                </span>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="listing_type"
                  value="trade_ok"
                  checked={formData.listing_type === 'trade_ok'}
                  onChange={handleChange}
                />
                <span className="radio-label">
                  <strong>For Sale (Trade OK)</strong>
                  <small>Prefer cash but open to trade offers</small>
                </span>
              </label>
            </div>
          </div>

          <Input
            label={formData.listing_type === 'trade_only' ? 'Price (₱) - Optional' : 'Price (₱) *'}
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            placeholder="0.00"
            disabled={formData.listing_type === 'trade_only'}
          />

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`form-select ${errors.category_id ? 'form-select--error' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <span className="form-error">{errors.category_id}</span>}
          </div>

          <Input
            label="Brand/Model (Optional)"
            name="brand_type"
            value={formData.brand_type}
            onChange={handleChange}
            placeholder="e.g., Apple, Nike, Sony"
          />

          <div className="form-group">
            <label className="form-label">Condition *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={`form-select ${errors.condition ? 'form-select--error' : ''}`}
            >
              <option value="">Select condition</option>
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
            {errors.condition && <span className="form-error">{errors.condition}</span>}
          </div>

          <Input
            label="Stock Quantity *"
            name="stock"
            type="number"
            min="1"
            value={formData.stock}
            onChange={handleChange}
            error={errors.stock}
            placeholder="1"
          />

          <div className="form-group">
            <label className="form-label">Contact Information *</label>
            <textarea
              name="contact_info"
              value={formData.contact_info}
              onChange={handleChange}
              className={`form-textarea ${errors.contact_info ? 'form-textarea--error' : ''}`}
              placeholder="How should buyers contact you?"
              rows={3}
            />
            {errors.contact_info && <span className="form-error">{errors.contact_info}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Product Images</label>
            
            <div className="image-upload">
              <input
                type="file"
                id="create-image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="image-upload__input"
              />
              <label htmlFor="create-image-upload" className="image-upload__label">
                <FiUpload />
                <span>Upload Images</span>
              </label>
            </div>
            
            {formData.images.length > 0 && (
              <div className="image-thumbnails">
                <div className="image-thumbnails__label">
                  Selected Images ({formData.images.length})
                </div>
                <div className="image-thumbnails__grid">
                  {formData.images.map((image, index) => (
                    <div key={`${index}-${image.name}`} className="image-thumbnail">
                      <div 
                        className="image-thumbnail__preview"
                        onClick={() => handleImageClick(index)}
                        title="Click to preview"
                      >
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index + 1}`}
                          className="image-thumbnail__img"
                        />
                      </div>
                      <button
                        type="button"
                        className="image-thumbnail__remove"
                        onClick={() => handleDeleteClick(index)}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errors.submit && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fee', 
              color: '#c33', 
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              {errors.submit}
            </div>
          )}

          <div className="panel-actions">
            <Button 
              type="button" 
              variant="secondary" 
              fullWidth 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth
              disabled={loading}
            >
              {loading ? 'Saving...' : 'List Item'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setImageToDelete(null);
        }}
        onConfirm={confirmRemoveImage}
        title="Remove Image?"
        message="Are you sure you want to remove this image?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />

      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        images={allPreviewImages}
        currentIndex={previewImageIndex}
        onNavigate={setPreviewImageIndex}
      />
    </>
  );
}
