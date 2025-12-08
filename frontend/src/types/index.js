/**
 * CampusMart Type Definitions
 * Aligned with ERD schema - Single Source of Truth
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {number} seller_id
 * @property {string} name
 * @property {string} description
 * @property {number} price - DECIMAL
 * @property {string} brand_type
 * @property {string} contact_info
 * @property {boolean} is_available
 * @property {number} category_id
 * @property {string} created_at - DATETIME ISO string
 * @property {string} updated_at - DATETIME ISO string
 * @property {number} view_count
 * @property {number} like_count
 */

/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {number} total_amount - DECIMAL
 * @property {string} status - VARCHAR (pending, confirmed, completed, cancelled)
 * @property {string} delivery_notes - TEXT
 * @property {string} created_at - DATETIME ISO string
 * @property {string} updated_at - DATETIME ISO string
 * @property {number} buyer_id
 * @property {number} seller_id
 * @property {number|null} trade_offer_id
 */

/**
 * @typedef {Object} Profile
 * @property {number} id
 * @property {number} user_id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} phone_number
 * @property {string} academic_level
 * @property {string} bio - TEXT
 * @property {number} total_reviews
 * @property {string} created_at - DATETIME ISO string
 * @property {string} updated_at - DATETIME ISO string
 */

/**
 * @typedef {Object} Review
 * @property {number} id
 * @property {number} reviewer_id
 * @property {number} seller_id
 * @property {number} rating - INT (1-5)
 * @property {string} comment - TEXT
 * @property {string} created_at - DATETIME ISO string
 * @property {string} updated_at - DATETIME ISO string
 */

/**
 * @typedef {Object} Message
 * @property {number} id
 * @property {number} sender_id
 * @property {number} receiver_id
 * @property {string} content - TEXT
 * @property {boolean} is_read
 * @property {string} created_at - DATETIME ISO string
 */

/**
 * @typedef {Object} TradeOffer
 * @property {number} id
 * @property {number} offerer_id
 * @property {number} product_id
 * @property {number} offered_price - DECIMAL
 * @property {string} trade_description - TEXT
 * @property {string} status - VARCHAR (pending, accepted, rejected)
 * @property {string} created_at - DATETIME ISO string
 * @property {string} updated_at - DATETIME ISO string
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} description - TEXT
 * @property {string} created_at - DATETIME ISO string
 * @property {string} updated_at - DATETIME ISO string
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} password
 * @property {string} created_at
 * @property {Profile|null} profile
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {User} user
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} email
 * @property {string} password
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} phone_number
 * @property {string} academic_level
 */

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const TRADE_OFFER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const ACADEMIC_LEVELS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Graduate',
  'Faculty',
];
