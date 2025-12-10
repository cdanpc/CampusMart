import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiBell, FiLock, FiGlobe, FiEye, FiShield, FiMail, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/authService';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [notifications, setNotifications] = useState({
    messages: true,
    orders: true,
    promotions: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
  });

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(`settings_${user?.profile?.profile_id}`);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.privacy) setPrivacy(parsed.privacy);
      if (parsed.is2FAEnabled !== undefined) setIs2FAEnabled(parsed.is2FAEnabled);
    }
  }, [user?.profile?.profile_id]);

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const settings = {
      notifications,
      privacy,
      is2FAEnabled,
      userId: user?.profile?.profile_id
    };
    
    // console.log('Saving settings:', settings);

    // Save to localStorage (MVP implementation)
    localStorage.setItem(`settings_${user?.profile?.profile_id}`, JSON.stringify(settings));

    setIsSaving(false);
    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleCancel = () => {
    if (confirm('Discard unsaved changes?')) {
      navigate('/profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    try {
      setIsSaving(true);
      await changePassword(
        user?.id,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      alert('Password changed successfully!');
      setIsChangePasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401 || error.response?.data?.message?.includes('current password')) {
        alert('Current password is incorrect. Please try again.');
      } else if (error.response?.status === 400) {
        alert(error.response.data.message || 'Invalid password format. Please try again.');
      } else {
        alert('Failed to change password. Please try again later.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnable2FA = () => {
    if (is2FAEnabled) {
      if (confirm('Disable Two-Factor Authentication?')) {
        setIs2FAEnabled(false);
        console.log('2FA disabled');
        alert('Two-Factor Authentication has been disabled');
      }
    } else {
      // Simulate 2FA setup process
      alert('A verification code has been sent to your email. (Mock functionality)');
      const code = prompt('Enter the 6-digit code:');
      
      if (code && code.length === 6) {
        setIs2FAEnabled(true);
        console.log('2FA enabled');
        alert('Two-Factor Authentication has been enabled successfully!');
      } else {
        alert('Invalid code. Please try again.');
      }
    }
  };

  const handleEmailPreferences = () => {
    alert('Email preference management will open in a new modal. (Feature coming soon)');
    console.log('Opening email preferences modal');
  };

  const handleDeleteAccount = () => {
    const confirmation = prompt(
      'This action cannot be undone. All your data will be permanently deleted.\n\nType "DELETE" to confirm:'
    );

    if (confirmation === 'DELETE') {
      const finalConfirm = confirm(
        'Are you absolutely sure? This will permanently delete your account and all associated data.'
      );

      if (finalConfirm) {
        console.log('Account deletion requested for:', user?.profile?.profile_id);
        
        // Clear user data from localStorage
        localStorage.removeItem(`settings_${user?.profile?.profile_id}`);
        
        // Note: Full account deletion requires backend implementation
        alert('Account deletion requires backend implementation.\nFor now, you will be logged out and local data cleared.');
        logout();
        navigate('/');
      }
    } else if (confirmation !== null) {
      alert('Account deletion cancelled. You must type "DELETE" exactly.');
    }
  };

  return (
    <div className="settings-page">
      <div className="container">
        <Link to="/profile" className="back-link">
          <FiChevronLeft className="back-link__icon" />
          <span>Back to Profile</span>
        </Link>

        <h1 className="settings-page__title">Settings</h1>

        {showSuccessMessage && (
          <div className="success-banner">
            <FiCheck className="success-icon" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div className="settings-grid">
          {/* Notification Settings */}
          <section className="settings-card">
            <div className="settings-card__header">
              <FiBell className="settings-card__icon" />
              <h2 className="settings-card__title">Notifications</h2>
            </div>
            <div className="settings-card__content">
              <div className="settings-item">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Message Notifications</h3>
                  <p className="settings-item__description">Get notified when you receive new messages</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.messages}
                    onChange={() => handleNotificationToggle('messages')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-item">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Order Updates</h3>
                  <p className="settings-item__description">Receive updates about your orders</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.orders}
                    onChange={() => handleNotificationToggle('orders')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-item">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Promotions & Updates</h3>
                  <p className="settings-item__description">Get notified about new features and promotions</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.promotions}
                    onChange={() => handleNotificationToggle('promotions')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="settings-card">
            <div className="settings-card__header">
              <FiShield className="settings-card__icon" />
              <h2 className="settings-card__title">Privacy</h2>
            </div>
            <div className="settings-card__content">
              <div className="settings-item">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Profile Visibility</h3>
                  <p className="settings-item__description">Who can see your profile</p>
                </div>
                <select
                  className="settings-select"
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                >
                  <option value="public">Everyone</option>
                  <option value="students">CIT-U Students Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="settings-item">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Show Email Address</h3>
                  <p className="settings-item__description">Display your email on your profile</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={privacy.showEmail}
                    onChange={() => handlePrivacyToggle('showEmail')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-item">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Show Phone Number</h3>
                  <p className="settings-item__description">Display your phone number on your profile</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={privacy.showPhone}
                    onChange={() => handlePrivacyToggle('showPhone')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section className="settings-card">
            <div className="settings-card__header">
              <FiLock className="settings-card__icon" />
              <h2 className="settings-card__title">Security</h2>
            </div>
            <div className="settings-card__content">
              <div className="settings-item">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Change Password</h3>
                  <p className="settings-item__description">Update your account password</p>
                </div>
                <button 
                  className="settings-btn"
                  onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
                >
                  {isChangePasswordOpen ? 'Cancel' : 'Change'}
                </button>
              </div>

              {isChangePasswordOpen && (
                <form className="password-form" onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      placeholder="Enter new password (min 8 characters)"
                      minLength={8}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button type="submit" className="settings-btn settings-btn--primary">
                    Update Password
                  </button>
                </form>
              )}

              <div className="settings-item">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Two-Factor Authentication</h3>
                  <p className="settings-item__description">
                    {is2FAEnabled ? 'Currently enabled' : 'Add an extra layer of security'}
                  </p>
                </div>
                <button 
                  className={`settings-btn ${is2FAEnabled ? 'settings-btn--enabled' : ''}`}
                  onClick={handleEnable2FA}
                >
                  {is2FAEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </section>

          {/* Account Settings */}
          <section className="settings-card">
            <div className="settings-card__header">
              <FiMail className="settings-card__icon" />
              <h2 className="settings-card__title">Account</h2>
            </div>
            <div className="settings-card__content">
              <div className="settings-item">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Email Preferences</h3>
                  <p className="settings-item__description">Manage your email subscriptions</p>
                </div>
                <button 
                  className="settings-btn"
                  onClick={handleEmailPreferences}
                >
                  Manage
                </button>
              </div>

              <div className="settings-item settings-item--danger">
                <div className="settings-item__info">
                  <h3 className="settings-item__title">Delete Account</h3>
                  <p className="settings-item__description">Permanently delete your account and data</p>
                </div>
                <button 
                  className="settings-btn settings-btn--danger"
                  onClick={handleDeleteAccount}
                >
                  Delete
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button 
            className="btn btn--primary"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            className="btn btn--secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
