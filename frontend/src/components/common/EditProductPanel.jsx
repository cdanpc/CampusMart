import { useState, useEffect } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import Input from './Input';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import ImagePreviewModal from './ImagePreviewModal';
import { useAuth } from '../../context/AuthContext';
import { updateProduct } from '../../services/productService';
import { compressImages, getErrorMessage, validateRequired, validateNumber } from '../../utils';
import './ProductPanel.css';

export default function EditProductPanel({ isOpen, onClose, productData, onProductUpdated }) {
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
    listing_type: 'for_sale'
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
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

  // Load product data when panel opens
  useEffect(() => {
    if (productData && isOpen) {
      const existingProductImages = productData.images || productData.productImages || [];
      setExistingImages(existingProductImages);
      
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        brand_type: productData.brandType || productData.brand_type || '',
        condition: productData.condition || '',
        stock: productData.stock?.toString() || '1',
        contact_info: productData.contactInfo || productData.contact_info || '',
        category_id: (productData.category?.id || productData.category_id)?.toString() || '',
        listing_type: productData.tradeOnly || productData.trade_only ? 'trade_only' : 'for_sale'
      });
      
      setNewImages([]);
      setErrors({});
    }
  }, [productData, isOpen]);

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
      setNewImages(prev => [...prev, ...files]);
      e.target.value = '';
    }
  };

  const handleDeleteClick = (index, isExisting) => {
    setImageToDelete({ index, isExisting });
    setShowDeleteConfirm(true);
  };

  const confirmRemoveImage = () => {
    if (imageToDelete !== null) {
      const { isExisting, index } = imageToDelete;
      
      if (isExisting) {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
      } else {
        setNewImages(prev => prev.filter((_, i) => i !== index));
      }
      
      setImageToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleImageClick = (index) => {
    setPreviewImageIndex(index);
    setShowImagePreview(true);
  };

  const allPreviewImages = [
    ...existingImages.map(img => img.imageUrl || img.url),
    ...newImages.map(file => URL.createObjectURL(file))
  ];

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
        setErrors({ submit: 'You must be logged in to update items.' });
        return;
      }

      setLoading(true);
      try {
        // Compress new images
        const newImageDataUrls = await compressImages(newImages);

        const newImagesArray = newImageDataUrls.map(dataUrl => ({
          imageUrl: dataUrl,
          isPrimary: false
        }));

        // Combine existing and new images
        const existingImagesArray = existingImages.map((img, index) => ({
          imageUrl: img.imageUrl || img.url,
          isPrimary: index === 0
        }));

        const allImages = [...existingImagesArray, ...newImagesArray];

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
          viewCount: productData.viewCount || productData.view_count || 0,
          likeCount: productData.likeCount || productData.like_count || 0,
          category: formData.category_id ? { id: Number.parseInt(formData.category_id) } : null,
          images: allImages
        };

        const updatedProduct = await updateProduct(productData.id || productData.product_id, productPayload);
        
        if (onProductUpdated) onProductUpdated(updatedProduct);
        onClose();
      } catch (error) {
        console.error('Error updating product:', error);
        setErrors({ submit: getErrorMessage(error, 'Failed to update product. Please try again.') });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen || !productData) return null;

  return (
    <>
      <div className="panel-overlay panel-overlay--active" onClick={handleOverlayClick} />

      <div className="list-item-panel list-item-panel--open">
        <div className="panel-header">
          <h2 className="panel-title">Edit Item</h2>
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
                id="edit-image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="image-upload__input"
              />
              <label htmlFor="edit-image-upload" className="image-upload__label">
                <FiUpload />
                <span>Upload New Images</span>
              </label>
            </div>
            
            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="image-thumbnails">
                <div className="image-thumbnails__label">
                  {existingImages.length > 0 && newImages.length > 0
                    ? `Product Images (${existingImages.length + newImages.length} total: ${existingImages.length} current, ${newImages.length} new)`
                    : existingImages.length > 0
                    ? `Current Images (${existingImages.length})`
                    : `New Images (${newImages.length})`}
                </div>
                <div className="image-thumbnails__grid">
                  {/* Existing images */}
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="image-thumbnail">
                      <div 
                        className="image-thumbnail__preview"
                        onClick={() => handleImageClick(index)}
                        title="Click to preview"
                      >
                        <img 
                          src={image.imageUrl || image.url} 
                          alt={`Current ${index + 1}`}
                          className="image-thumbnail__img"
                        />
                      </div>
                      <button
                        type="button"
                        className="image-thumbnail__remove"
                        onClick={() => handleDeleteClick(index, true)}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* New images */}
                  {newImages.map((image, index) => (
                    <div key={`new-${index}-${image.name}`} className="image-thumbnail">
                      <div 
                        className="image-thumbnail__preview"
                        onClick={() => handleImageClick(existingImages.length + index)}
                        title="Click to preview"
                      >
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`New ${index + 1}`}
                          className="image-thumbnail__img"
                        />
                      </div>
                      <button
                        type="button"
                        className="image-thumbnail__remove"
                        onClick={() => handleDeleteClick(index, false)}
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
            <div className="error-message--submit">
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
              {loading ? 'Updating...' : 'Update Item'}
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
