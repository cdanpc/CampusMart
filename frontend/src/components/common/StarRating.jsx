import { FiStar } from 'react-icons/fi';
import './StarRating.css';

/**
 * StarRating Component
 * Displays star rating with full, half, and empty stars
 * 
 * @param {number} rating - Rating value (0-5)
 * @param {number} size - Star size in pixels (default: 16)
 * @param {boolean} showValue - Show numeric rating value
 * @param {string} className - Additional CSS classes
 */
export default function StarRating({ 
  rating = 0, 
  size = 16, 
  showValue = false,
  className = '' 
}) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FiStar 
        key={`full-${i}`} 
        className="star star--filled" 
        style={{ width: size, height: size }}
      />
    );
  }
  
  if (hasHalfStar) {
    stars.push(
      <FiStar 
        key="half" 
        className="star star--half" 
        style={{ width: size, height: size }}
      />
    );
  }
  
  while (stars.length < 5) {
    stars.push(
      <FiStar 
        key={`empty-${stars.length}`} 
        className="star star--empty" 
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className={`star-rating ${className}`}>
      {stars}
      {showValue && <span className="star-rating__value">{rating.toFixed(1)}</span>}
    </div>
  );
}
