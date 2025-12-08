import { useState, useEffect } from 'react';
import { FiX, FiCamera } from 'react-icons/fi';
import Input from './Input';
import Button from './Button';
import './EditProfileModal.css';

export default function EditProfileModal({ isOpen, onClose, userData, onSave }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    instagram_handle: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when modal opens
  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        first_name: userData.firstName || userData.first_name || '',
        last_name: userData.lastName || userData.last_name || '',
        phone_number: userData.phoneNumber || userData.phone_number || '',
        instagram_handle: userData.instagramHandle || userData.instagram_handle || '',
        email: userData.email || ''
      });
      setImagePreview(userData.profile_picture || null);
    } else if (!isOpen) {
      // Reset image when modal closes
      setProfileImage(null);
      setImagePreview(null);
    }
  }, [userData, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^09\d{9}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid Philippine phone number (09XXXXXXXXX)';
    }

    if (formData.instagram_handle && !formData.instagram_handle.startsWith('@')) {
      newErrors.instagram_handle = 'Instagram handle must start with @';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSaving(true);
      try {
        const profileData = {
          firstName: formData.first_name,
          lastName: formData.last_name,
          phoneNumber: formData.phone_number,
          instagramHandle: formData.instagram_handle,
          email: formData.email
        };
        
        if (onSave) {
          await onSave(profileData);
        }
        
        if (profileImage) {
          console.log('TODO: Upload profile image:', profileImage);
          // TODO: Implement image upload when backend supports it
        }
        
        alert('Profile updated successfully!');
        onClose();
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile changes. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getInitials = () => {
    return `${formData.first_name[0] || ''}${formData.last_name[0] || ''}`.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-profile-modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Profile Avatar */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              <div className="profile-avatar-large">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="avatar-image" />
                ) : (
                  getInitials()
                )}
              </div>
              <input
                type="file"
                id="profile-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="avatar-upload-input"
              />
              <label htmlFor="profile-image-upload" className="avatar-upload-btn">
                <FiCamera />
              </label>
            </div>
            <p className="avatar-hint">Click camera icon to upload photo</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <Input
              label="First Name *"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              placeholder="Enter your first name"
            />

            {/* Last Name */}
            <Input
              label="Last Name *"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              placeholder="Enter your last name"
            />

            {/* Phone Number */}
            <Input
              label="Phone Number *"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              error={errors.phone_number}
              placeholder="09XXXXXXXXX"
            />

            {/* Instagram Handle */}
            <Input
              label="Instagram Handle"
              name="instagram_handle"
              value={formData.instagram_handle}
              onChange={handleChange}
              error={errors.instagram_handle}
              placeholder="@your.username"
            />

            {/* Email (Read-only hint) */}
            <div className="form-group">
              <Input
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="your.email@cit.edu"
              />
              <p className="email-hint">
                📧 Email changes require verification. Contact support if needed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <Button 
                type="button" 
                variant="secondary" 
                fullWidth 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
