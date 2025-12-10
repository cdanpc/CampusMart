import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { formatDate } from '../../utils';
import './SellerInfoCard.css';

/**
 * SellerInfoCard Component
 * Displays seller contact information and details
 * 
 * @param {Object} seller - Seller object with contact details
 * @param {boolean} showLink - Show link to seller profile page
 * @param {string} className - Additional CSS classes
 */
export default function SellerInfoCard({ 
  seller = null, 
  showLink = true,
  className = '' 
}) {
  if (!seller) {
    return (
      <div className={`seller-info-card ${className}`}>
        <p className="seller-info-card__no-data">Seller information not available</p>
      </div>
    );
  }

  const sellerId = seller.id || seller.profileId || seller.profile_id;
  const firstName = seller.firstName || seller.first_name || '';
  const lastName = seller.lastName || seller.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Seller';
  const email = seller.email || 'Not available';
  const phone = seller.phoneNumber || seller.phone_number;
  const instagram = seller.instagramHandle || seller.instagram_handle;
  const memberSince = seller.createdAt || seller.created_at;

  return (
    <div className={`seller-info-card ${className}`}>
      <h2 className="seller-info-card__title">Seller Details</h2>
      
      <div className="seller-info-card__content">
        <div className="seller-info-card__name">
          <FiUser className="seller-info-card__icon" />
          {showLink && sellerId ? (
            <Link 
              to={`/seller/${sellerId}`} 
              className="seller-info-card__link"
            >
              {fullName}
            </Link>
          ) : (
            <span className="seller-info-card__text">{fullName}</span>
          )}
        </div>
        
        <div className="seller-info-card__contacts">
          <div className="seller-info-card__contact-item">
            <FiMail className="seller-info-card__contact-icon" />
            <span>{email}</span>
          </div>
          
          {phone && (
            <div className="seller-info-card__contact-item">
              <FiPhone className="seller-info-card__contact-icon" />
              <span>{phone}</span>
            </div>
          )}
          
          {instagram && (
            <div className="seller-info-card__contact-item">
              <FaInstagram className="seller-info-card__contact-icon" />
              <span>{instagram}</span>
            </div>
          )}
        </div>
        
        {memberSince && (
          <p className="seller-info-card__member-since">
            Member since: {formatDate(memberSince)}
          </p>
        )}
      </div>
    </div>
  );
}
