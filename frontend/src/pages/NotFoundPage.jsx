import { Link } from 'react-router-dom';
import { FiHome, FiSearch, FiAlertCircle } from 'react-icons/fi';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <FiAlertCircle className="not-found-icon" />
          
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Page Not Found</h2>
          
          <p className="not-found-text">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="not-found-actions">
            <Link to="/dashboard" className="btn btn--primary">
              <FiHome className="btn-icon" />
              Back to Marketplace
            </Link>
            <Link to="/profile" className="btn btn--secondary">
              <FiSearch className="btn-icon" />
              View My Profile
            </Link>
          </div>

          <div className="not-found-suggestions">
            <p className="suggestions-title">You might be looking for:</p>
            <div className="suggestions-links">
              <Link to="/dashboard">Marketplace</Link>
              <Link to="/messages">Messages</Link>
              <Link to="/profile">My Profile</Link>
              <Link to="/orders/history">Order History</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
