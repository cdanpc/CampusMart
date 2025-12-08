import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSettings, FiLogOut, FiUser, FiBell, FiMessageSquare, FiSearch, FiRepeat } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUnreadNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../services/notificationService';
import { getUnreadCount as getUnreadMessagesCount } from '../../services/messageService';
import { getOffersBySeller } from '../../services/tradeOfferService';
import CreateProductPanel from '../common/CreateProductPanel';
import Logo from '../common/Logo';
import './AppHeader.css';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingOffersCount, setPendingOffersCount] = useState(0);
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications when component mounts or when notification panel opens
  useEffect(() => {
    if (user?.profile?.id) {
      fetchUnreadCount();
      fetchUnreadMessagesCount();
      fetchPendingOffersCount();
    }
  }, [user]);

  useEffect(() => {
    if (isNotificationOpen && user?.profile?.id) {
      fetchNotifications();
    }
  }, [isNotificationOpen, user]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user?.profile?.id) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadMessagesCount();
      fetchPendingOffersCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await getUnreadNotifications(user.profile.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount(user.profile.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      const data = await getUnreadMessagesCount(user.profile.id);
      setUnreadMessagesCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    }
  };

  const fetchPendingOffersCount = async () => {
    try {
      const offers = await getOffersBySeller(user.profile.id);
      const pendingCount = offers.filter(offer => offer.status === 'PENDING').length;
      setPendingOffersCount(pendingCount);
    } catch (error) {
      console.error('Error fetching pending offers count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await markAllAsRead(user.profile.id);
      setNotifications([]);
      setUnreadCount(0);
      setIsNotificationOpen(false);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="container">
          <div className="app-header__content">
            <Link to="/dashboard" className="app-header__brand">
              <div className="app-header__logo">
                <Logo size={32} />
              </div>
              <span className="app-header__title">
                Campus <span className="app-header__title--highlight">Mart</span>
              </span>
            </Link>

            <div className="app-header__search">
              <FiSearch className="app-header__search-icon" />
              <input 
                type="text" 
                placeholder="Search items, sellers..." 
                className="app-header__search-input"
              />
            </div>

            <div className="app-header__actions">
              <button 
                className="app-header__btn app-header__btn--primary"
                onClick={() => setIsPanelOpen(true)}
              >
                + List Item
              </button>
              <Link to="/messages" className="app-header__btn app-header__btn--icon">
                <FiMessageSquare />
                {unreadMessagesCount > 0 && (
                  <span className="app-header__badge">{unreadMessagesCount}</span>
                )}
              </Link>

              <Link to="/trade-offers" className="app-header__btn app-header__btn--icon">
                <FiRepeat />
                {pendingOffersCount > 0 && (
                  <span className="app-header__badge">{pendingOffersCount}</span>
                )}
              </Link>
              
              <div className="app-header__notification" ref={notificationRef}>
                <button 
                  className="app-header__btn app-header__btn--icon"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <FiBell />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-dropdown__header">
                      <h3>Notifications</h3>
                      <button 
                        className="clear-all-btn"
                        onClick={handleClearAll}
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="notification-dropdown__list">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">
                          <FiBell className="notification-empty__icon" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? 'notification-item--unread' : ''}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <div className="notification-item__content">
                              <h4 className="notification-item__title">{notification.title}</h4>
                              <p className="notification-item__message">{notification.message}</p>
                              <span className="notification-item__time">{formatTime(notification.createdAt)}</span>
                            </div>
                            {!notification.isRead && (
                              <div className="notification-item__dot"></div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="notification-dropdown__footer">
                      <Link 
                        to="/notifications" 
                        className="view-all-link"
                        onClick={() => setIsNotificationOpen(false)}
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="app-header__profile-menu" ref={profileMenuRef}>
                <button 
                  className="app-header__btn app-header__btn--icon"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <FiUser />
                </button>
                
                {isProfileMenuOpen && (
                  <div className="profile-dropdown">
                    <Link 
                      to="/profile" 
                      className="profile-dropdown__item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiUser className="profile-dropdown__icon" />
                      My Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className="profile-dropdown__item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiSettings className="profile-dropdown__icon" />
                      Settings
                    </Link>
                    <div className="profile-dropdown__divider"></div>
                    <button 
                      className="profile-dropdown__item profile-dropdown__item--danger"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="profile-dropdown__icon" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <CreateProductPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </>
  );
}
