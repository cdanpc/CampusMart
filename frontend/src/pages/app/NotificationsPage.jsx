import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiBell, FiMessageSquare, FiShoppingBag, FiTrendingUp, FiCheck, FiTrash2, FiFilter, FiMoreVertical } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../../services/notificationService';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.profile?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        let data;
        if (filter === 'all') {
          data = await getNotifications(user.profile.id);
        } else if (filter === 'unread') {
          data = await getNotifications(user.profile.id);
          data = data.filter(n => !n.isRead);
        } else {
          // Map filter to notification type
          const typeMap = {
            'message': 'MESSAGE',
            'order': 'ORDER',
            'promotion': 'PROMOTION'
          };
          data = await getNotifications(user.profile.id, typeMap[filter]);
        }
        
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, filter]);

  // Map notification type to icon
  const getNotificationIcon = (type) => {
    const iconMap = {
      'MESSAGE': FiMessageSquare,
      'ORDER': FiShoppingBag,
      'ORDER_PLACED': FiShoppingBag,
      'ORDER_CONFIRMED': FiShoppingBag,
      'ORDER_READY': FiShoppingBag,
      'ORDER_COMPLETED': FiShoppingBag,
      'ORDER_CANCELLED': FiShoppingBag,
      'PROMOTION': FiTrendingUp,
      'PRODUCT_LIKED': FiTrendingUp,
      'NEW_REVIEW': FiTrendingUp
    };
    return iconMap[type] || FiBell;
  };

  // Generate link based on notification type
  const getNotificationLink = (notification) => {
    if (!notification.relatedId) return null;
    
    switch (notification.relatedType) {
      case 'MESSAGE':
        return `/messages?user=${notification.relatedId}`;
      case 'ORDER':
        return `/orders/${notification.relatedId}`;
      case 'PRODUCT':
        return `/product/${notification.relatedId}`;
      default:
        return null;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes > 0 ? `${minutes} min ago` : 'Just now';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setOpenMenuId(null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.profile?.id) return;
    
    try {
      await markAllAsRead(user.profile.id);
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this notification?')) {
      try {
        await deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        setOpenMenuId(null);
      } catch (err) {
        console.error('Error deleting notification:', err);
        setError('Failed to delete notification');
      }
    }
  };

  const handleClearAll = async () => {
    if (!user?.profile?.id) return;
    
    if (confirm('Clear all notifications?')) {
      try {
        await deleteAllNotifications(user.profile.id);
        setNotifications([]);
      } catch (err) {
        console.error('Error clearing all notifications:', err);
        setError('Failed to clear all notifications');
      }
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to related content if link exists
    const link = getNotificationLink(notification);
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="notifications-page">
      <div className="container">
        <Link to="/dashboard" className="back-link">
          <FiChevronLeft className="back-link__icon" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="notifications-header">
          <div className="notifications-header__title">
            <FiBell className="notifications-header__icon" />
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>

          <div className="notifications-header__actions">
            {unreadCount > 0 && (
              <button 
                className="header-btn"
                onClick={handleMarkAllAsRead}
              >
                <FiCheck className="btn-icon" />
                Mark All as Read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                className="header-btn header-btn--danger"
                onClick={handleClearAll}
              >
                <FiTrash2 className="btn-icon" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="notifications-filters">
          <button
            className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'unread' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            className={`filter-tab ${filter === 'message' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('message')}
          >
            Messages
          </button>
          <button
            className={`filter-tab ${filter === 'order' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('order')}
          >
            Orders
          </button>
          <button
            className={`filter-tab ${filter === 'promotion' ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter('promotion')}
          >
            Promotions
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <FiBell className="empty-state__icon" />
              <h3 className="empty-state__title">No notifications</h3>
              <p className="empty-state__text">
                {filter === 'unread' 
                  ? "You're all caught up!" 
                  : 'You have no notifications at the moment'}
              </p>
            </div>
          ) : (
            notifications.map(notification => {
              const Icon = getNotificationIcon(notification.type);
              const link = getNotificationLink(notification);
              
              return (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.isRead ? 'notification-card--unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: link ? 'pointer' : 'default' }}
                >
                  <div className="notification-card__icon-wrapper">
                    <Icon className="notification-card__icon" />
                  </div>

                  <div className="notification-card__content">
                    <div className="notification-card__header">
                      <h3 className="notification-card__title">{notification.title}</h3>
                      <span className="notification-card__time">{formatTime(notification.createdAt)}</span>
                    </div>
                    <p className="notification-card__message">{notification.message}</p>
                    
                    {link && (
                      <div className="notification-card__actions">
                        <span className="notification-link">
                          View Details →
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="notification-card__menu-wrapper" ref={openMenuId === notification.id ? menuRef : null}>
                    <button
                      className="notification-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === notification.id ? null : notification.id);
                      }}
                    >
                      <FiMoreVertical />
                    </button>

                    {openMenuId === notification.id && (
                      <div className="notification-menu">
                        {!notification.isRead && (
                          <button 
                            className="notification-menu__item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                          >
                            <FiCheck /> Mark as Read
                          </button>
                        )}
                        <button 
                          className="notification-menu__item notification-menu__item--danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
