# Campus Mart - Database Schema (ERD)

**Last Updated:** November 30, 2025  
**Version:** 2.0 - Updated based on implemented features

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK: user_id     │
│ email           │
│ password        │
│ created_at      │
└────────┬────────┘
         │ 1
         │
         │ 1
┌────────▼────────────────────┐
│        PROFILES             │
├─────────────────────────────┤
│ PK: profile_id              │
│ FK: user_id                 │
│ first_name                  │
│ last_name                   │
│ email                       │
│ phone_number                │
│ instagram_handle            │
│ academic_level              │
│ bio                         │
│ seller_rating               │
│ total_reviews               │
│ created_at                  │
│ updated_at                  │
└──┬──────────────────────┬───┘
   │                      │
   │ 1                    │ 1
   │                      │
   │ *                    │ *
┌──▼────────────┐   ┌────▼──────────────┐
│   PRODUCTS    │   │  USER_SETTINGS    │
├───────────────┤   ├───────────────────┤
│ PK: product_id│   │ PK: setting_id    │
│ FK: seller_   │   │ FK: profile_id    │
│     profile_id│   │ notify_messages   │
│ FK: category_ │   │ notify_orders     │
│     id        │   │ notify_promotions │
│ name          │   │ profile_visibility│
│ description   │   │ show_email        │
│ price         │   │ show_phone        │
│ brand_type    │   │ two_factor_enabled│
│ condition     │   │ created_at        │
│ contact_info  │   │ updated_at        │
│ is_available  │   └───────────────────┘
│ trade_only    │
│ view_count    │   ┌───────────────────┐
│ like_count    │   │  NOTIFICATIONS    │
│ stock         │   ├───────────────────┤
│ created_at    │   │ PK: notification_ │
│ updated_at    │   │     id            │
└──┬────────┬───┘   │ FK: profile_id    │
   │        │       │ type              │
   │ 1      │ 1     │ title             │
   │        │       │ message           │
   │ *      │ *     │ link              │
   │        │       │ is_read           │
┌──▼────────┴──┐    │ created_at        │
│  PRODUCT_    │    └───────────────────┘
│  IMAGES      │
├──────────────┤    ┌───────────────────┐
│ PK: image_id │    │  PRODUCT_LIKES    │
│ FK: product_ │    ├───────────────────┤
│     id       │    │ PK: like_id       │
│ image_url    │    │ FK: profile_id    │
│ is_primary   │    │ FK: product_id    │
└──────────────┘    │ created_at        │
                    └───────────────────┘
┌──────────────┐
│  CATEGORIES  │    ┌───────────────────┐
├──────────────┤    │     ORDERS        │
│ PK: category_│    ├───────────────────┤
│     id       │    │ PK: order_id      │
│ name         │    │ FK: buyer_profile │
│ description  │    │     _id           │
└──────────────┘    │ FK: seller_profile│
                    │     _id           │
                    │ FK: product_id    │
┌──────────────┐    │ total_amount      │
│   MESSAGES   │    │ quantity          │
├──────────────┤    │ status            │
│ PK: message_ │    │ payment_method    │
│     id       │    │ pickup_location   │
│ FK: sender_  │    │ delivery_notes    │
│     profile_ │    │ created_at        │
│     id       │    │ updated_at        │
│ FK: receiver_│    └───────────────────┘
│     profile_ │
│     id       │    ┌───────────────────┐
│ FK: product_ │    │     REVIEWS       │
│     id       │    ├───────────────────┤
│ content      │    │ PK: review_id     │
│ is_read      │    │ FK: reviewer_     │
│ created_at   │    │     profile_id    │
└──────────────┘    │ FK: reviewed_     │
                    │     profile_id    │
┌──────────────┐    │ FK: product_id    │
│ TRADE_OFFERS │    │ rating            │
├──────────────┤    │ review_text       │
│ PK: trade_   │    │ created_at        │
│     offer_id │    └───────────────────┘
│ FK: offerer_ │
│     profile_ │
│     id       │
│ FK: product_ │
│     id       │
│ item_name    │
│ item_        │
│ estimated_   │
│ value        │
│ cash_        │
│ component    │
│ trade_       │
│ description  │
│ item_image_  │
│ url          │
│ status       │
│ created_at   │
│ updated_at   │
└──────────────┘
```

---

## Table Definitions

### 1. USERS
**Purpose:** Authentication and account management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (CIT-U) |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation date |

**Relationships:**
- One-to-One with PROFILES

---

### 2. PROFILES
**Purpose:** User profile information and seller ratings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| profile_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique profile identifier |
| user_id | INT | FOREIGN KEY → users(user_id), UNIQUE | Reference to user account |
| first_name | VARCHAR(100) | NOT NULL | User's first name |
| last_name | VARCHAR(100) | NOT NULL | User's last name |
| email | VARCHAR(255) | NOT NULL | Contact email |
| phone_number | VARCHAR(20) | NOT NULL | Contact number (09XXXXXXXXX) |
| instagram_handle | VARCHAR(100) | | Instagram username |
| academic_level | VARCHAR(50) | NOT NULL | Year level (1st Year, 2nd Year, etc.) |
| bio | TEXT | | User biography |
| seller_rating | DECIMAL(3,2) | DEFAULT 0.00 | Average seller rating (0.00-5.00) |
| total_reviews | INT | DEFAULT 0 | Total number of reviews received |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Profile creation date |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Relationships:**
- One-to-One with USERS
- One-to-Many with PRODUCTS (as seller)
- One-to-Many with ORDERS (as buyer)
- One-to-Many with ORDERS (as seller)
- One-to-Many with MESSAGES (as sender)
- One-to-Many with MESSAGES (as receiver)
- One-to-Many with REVIEWS (as reviewer)
- One-to-Many with REVIEWS (as reviewed)
- One-to-Many with TRADE_OFFERS
- One-to-Many with NOTIFICATIONS
- One-to-Many with PRODUCT_LIKES
- One-to-One with USER_SETTINGS

**Indexes:**
- `idx_email` on email
- `idx_seller_rating` on seller_rating

---

### 3. PRODUCTS
**Purpose:** Product listings in the marketplace

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| product_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique product identifier |
| seller_profile_id | INT | FOREIGN KEY → profiles(profile_id) | Seller reference |
| category_id | INT | FOREIGN KEY → categories(category_id) | Product category |
| name | VARCHAR(255) | NOT NULL | Product name |
| description | TEXT | NOT NULL | Detailed description |
| price | DECIMAL(10,2) | | Product price (NULL if trade-only) |
| brand_type | VARCHAR(100) | | Brand or type |
| condition | VARCHAR(50) | | Item condition (New, Like New, Good, etc.) |
| contact_info | TEXT | | Meetup/contact instructions |
| is_available | BOOLEAN | DEFAULT TRUE | Availability status |
| trade_only | BOOLEAN | DEFAULT FALSE | Trade-only flag (no cash sale) |
| view_count | INT | DEFAULT 0 | Number of views |
| like_count | INT | DEFAULT 0 | Number of likes |
| stock | INT | DEFAULT 1 | Available quantity |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Listing creation date |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Relationships:**
- Many-to-One with PROFILES (seller)
- Many-to-One with CATEGORIES
- One-to-Many with PRODUCT_IMAGES
- One-to-Many with ORDERS
- One-to-Many with MESSAGES
- One-to-Many with REVIEWS
- One-to-Many with TRADE_OFFERS
- One-to-Many with PRODUCT_LIKES

**Indexes:**
- `idx_seller` on seller_profile_id
- `idx_category` on category_id
- `idx_available` on is_available
- `idx_created_at` on created_at (for sorting by date)

---

### 4. PRODUCT_IMAGES
**Purpose:** Store multiple images for each product

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| image_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique image identifier |
| product_id | INT | FOREIGN KEY → products(product_id) | Product reference |
| image_url | VARCHAR(500) | NOT NULL | Image URL or path |
| is_primary | BOOLEAN | DEFAULT FALSE | Primary/featured image flag |

**Relationships:**
- Many-to-One with PRODUCTS

**Indexes:**
- `idx_product` on product_id
- `idx_primary` on (product_id, is_primary)

---

### 5. CATEGORIES
**Purpose:** Product categorization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| category_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique category identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Category name |
| description | TEXT | | Category description |

**Example Categories:**
- Food, Electronics, Books & Educational, Fashion, Appliance, Services, etc.

**Relationships:**
- One-to-Many with PRODUCTS

---

### 6. ORDERS
**Purpose:** Track purchases and transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| order_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique order identifier |
| buyer_profile_id | INT | FOREIGN KEY → profiles(profile_id) | Buyer reference |
| seller_profile_id | INT | FOREIGN KEY → profiles(profile_id) | Seller reference |
| product_id | INT | FOREIGN KEY → products(product_id) | Product reference |
| total_amount | DECIMAL(10,2) | NOT NULL | Total order amount |
| quantity | INT | DEFAULT 1 | Order quantity |
| status | ENUM | NOT NULL | Order status (see below) |
| payment_method | VARCHAR(50) | | Payment method (cash, gcash, paymaya) |
| pickup_location | VARCHAR(255) | | Agreed pickup location |
| delivery_notes | TEXT | | Special instructions or notes |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Order creation date |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Status Values:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Seller confirmed order
- `processing` - Order being prepared
- `ready` - Ready for pickup
- `completed` - Transaction completed
- `cancelled` - Order cancelled

**Relationships:**
- Many-to-One with PROFILES (buyer)
- Many-to-One with PROFILES (seller)
- Many-to-One with PRODUCTS

**Indexes:**
- `idx_buyer` on buyer_profile_id
- `idx_seller` on seller_profile_id
- `idx_product` on product_id
- `idx_status` on status

---

### 7. MESSAGES
**Purpose:** In-app messaging system for buyers and sellers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| message_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique message identifier |
| sender_profile_id | INT | FOREIGN KEY → profiles(profile_id) | Sender reference |
| receiver_profile_id | INT | FOREIGN KEY → profiles(profile_id) | Receiver reference |
| product_id | INT | FOREIGN KEY → products(product_id) | Related product |
| content | TEXT | NOT NULL | Message content |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Relationships:**
- Many-to-One with PROFILES (sender)
- Many-to-One with PROFILES (receiver)
- Many-to-One with PRODUCTS

**Indexes:**
- `idx_sender` on sender_profile_id
- `idx_receiver` on receiver_profile_id
- `idx_conversation` on (sender_profile_id, receiver_profile_id, product_id)
- `idx_unread` on (receiver_profile_id, is_read)

---

### 8. REVIEWS
**Purpose:** Seller ratings and feedback system

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| review_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique review identifier |
| reviewer_profile_id | INT | FOREIGN KEY → profiles(profile_id) | Reviewer reference |
| reviewed_profile_id | INT | FOREIGN KEY → profiles(profile_id) | Reviewed seller reference |
| product_id | INT | FOREIGN KEY → products(product_id) | Related product |
| rating | DECIMAL(2,1) | NOT NULL, CHECK (rating >= 1.0 AND rating <= 5.0) | Rating (1.0-5.0) |
| review_text | TEXT | | Review content |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Review timestamp |

**Relationships:**
- Many-to-One with PROFILES (reviewer)
- Many-to-One with PROFILES (reviewed)
- Many-to-One with PRODUCTS

**Indexes:**
- `idx_reviewer` on reviewer_profile_id
- `idx_reviewed` on reviewed_profile_id
- `idx_product` on product_id

**Constraints:**
- Prevent self-review: CHECK (reviewer_profile_id != reviewed_profile_id)

---

### 9. TRADE_OFFERS
**Purpose:** Handle trade/barter offers for products

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| trade_offer_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique trade offer identifier |
| offerer_profile_id | INT | FOREIGN KEY → profiles(profile_id) | Person making the offer |
| product_id | INT | FOREIGN KEY → products(product_id) | Target product |
| item_name | VARCHAR(255) | NOT NULL | Offered item name |
| item_estimated_value | DECIMAL(10,2) | NOT NULL | Estimated value of offered item |
| cash_component | DECIMAL(10,2) | DEFAULT 0.00 | Additional cash offered |
| trade_description | TEXT | NOT NULL | Description of offered item |
| item_image_url | VARCHAR(500) | | Image of offered item |
| status | ENUM | DEFAULT 'pending' | Offer status (see below) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Offer creation date |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Status Values:**
- `pending` - Awaiting seller response
- `accepted` - Seller accepted the offer
- `rejected` - Seller rejected the offer

**Relationships:**
- Many-to-One with PROFILES (offerer)
- Many-to-One with PRODUCTS

**Indexes:**
- `idx_offerer` on offerer_profile_id
- `idx_product` on product_id
- `idx_status` on status

---

### 10. NOTIFICATIONS ⚠️ NEW
**Purpose:** In-app notification system for users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique notification identifier |
| profile_id | INT | FOREIGN KEY → profiles(profile_id) | Recipient reference |
| type | ENUM | NOT NULL | Notification type (see below) |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification content |
| link | VARCHAR(500) | | Related page URL |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Notification timestamp |

**Type Values:**
- `message` - New message received
- `order` - Order status update
- `promotion` - System announcements/promotions

**Relationships:**
- Many-to-One with PROFILES

**Indexes:**
- `idx_profile` on profile_id
- `idx_unread` on (profile_id, is_read)
- `idx_type` on type

---

### 11. PRODUCT_LIKES ⚠️ NEW
**Purpose:** Track user favorites/likes for products

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| like_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique like identifier |
| profile_id | INT | FOREIGN KEY → profiles(profile_id) | User who liked |
| product_id | INT | FOREIGN KEY → products(product_id) | Liked product |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Like timestamp |

**Relationships:**
- Many-to-One with PROFILES
- Many-to-One with PRODUCTS

**Indexes:**
- `idx_profile` on profile_id
- `idx_product` on product_id
- UNIQUE constraint on (profile_id, product_id) - prevent duplicate likes

---

### 12. USER_SETTINGS ⚠️ NEW
**Purpose:** Store user preferences and settings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| setting_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique setting identifier |
| profile_id | INT | FOREIGN KEY → profiles(profile_id), UNIQUE | User reference |
| notify_messages | BOOLEAN | DEFAULT TRUE | Message notifications enabled |
| notify_orders | BOOLEAN | DEFAULT TRUE | Order notifications enabled |
| notify_promotions | BOOLEAN | DEFAULT FALSE | Promotion notifications enabled |
| profile_visibility | ENUM | DEFAULT 'public' | Profile visibility (see below) |
| show_email | BOOLEAN | DEFAULT FALSE | Show email on profile |
| show_phone | BOOLEAN | DEFAULT FALSE | Show phone on profile |
| two_factor_enabled | BOOLEAN | DEFAULT FALSE | 2FA enabled |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Settings creation date |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last update timestamp |

**Profile Visibility Values:**
- `public` - Visible to everyone
- `students` - Visible to CIT-U students only
- `private` - Hidden from search

**Relationships:**
- One-to-One with PROFILES

**Indexes:**
- UNIQUE constraint on profile_id

---

## Relationships Summary

### One-to-One
- USERS ↔ PROFILES
- PROFILES ↔ USER_SETTINGS

### One-to-Many
- PROFILES → PRODUCTS (as seller)
- PROFILES → ORDERS (as buyer)
- PROFILES → ORDERS (as seller)
- PROFILES → MESSAGES (as sender)
- PROFILES → MESSAGES (as receiver)
- PROFILES → REVIEWS (as reviewer)
- PROFILES → REVIEWS (as reviewed)
- PROFILES → TRADE_OFFERS
- PROFILES → NOTIFICATIONS
- PROFILES → PRODUCT_LIKES
- PRODUCTS → PRODUCT_IMAGES
- PRODUCTS → ORDERS
- PRODUCTS → MESSAGES
- PRODUCTS → REVIEWS
- PRODUCTS → TRADE_OFFERS
- PRODUCTS → PRODUCT_LIKES
- CATEGORIES → PRODUCTS

---

## Database Creation Scripts

### Create Database
```sql
CREATE DATABASE campusmart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusmart_db;
```

### Create Tables (in dependency order)

```sql
-- 1. USERS
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PROFILES
CREATE TABLE profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    instagram_handle VARCHAR(100),
    academic_level VARCHAR(50) NOT NULL,
    bio TEXT,
    seller_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_seller_rating (seller_rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CATEGORIES
CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PRODUCTS
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    seller_profile_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2),
    brand_type VARCHAR(100),
    `condition` VARCHAR(50),
    contact_info TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    trade_only BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    stock INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    INDEX idx_seller (seller_profile_id),
    INDEX idx_category (category_id),
    INDEX idx_available (is_available),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PRODUCT_IMAGES
CREATE TABLE product_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_primary (product_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ORDERS
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_profile_id INT NOT NULL,
    seller_profile_id INT NOT NULL,
    product_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 1,
    status ENUM('pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled') NOT NULL,
    payment_method VARCHAR(50),
    pickup_location VARCHAR(255),
    delivery_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_profile_id) REFERENCES profiles(profile_id) ON DELETE RESTRICT,
    FOREIGN KEY (seller_profile_id) REFERENCES profiles(profile_id) ON DELETE RESTRICT,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    INDEX idx_buyer (buyer_profile_id),
    INDEX idx_seller (seller_profile_id),
    INDEX idx_product (product_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. MESSAGES
CREATE TABLE messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_profile_id INT NOT NULL,
    receiver_profile_id INT NOT NULL,
    product_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_sender (sender_profile_id),
    INDEX idx_receiver (receiver_profile_id),
    INDEX idx_conversation (sender_profile_id, receiver_profile_id, product_id),
    INDEX idx_unread (receiver_profile_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. REVIEWS
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    reviewer_profile_id INT NOT NULL,
    reviewed_profile_id INT NOT NULL,
    product_id INT NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_reviewer (reviewer_profile_id),
    INDEX idx_reviewed (reviewed_profile_id),
    INDEX idx_product (product_id),
    CONSTRAINT chk_no_self_review CHECK (reviewer_profile_id != reviewed_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TRADE_OFFERS
CREATE TABLE trade_offers (
    trade_offer_id INT PRIMARY KEY AUTO_INCREMENT,
    offerer_profile_id INT NOT NULL,
    product_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_estimated_value DECIMAL(10,2) NOT NULL,
    cash_component DECIMAL(10,2) DEFAULT 0.00,
    trade_description TEXT NOT NULL,
    item_image_url VARCHAR(500),
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (offerer_profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_offerer (offerer_profile_id),
    INDEX idx_product (product_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. NOTIFICATIONS
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    type ENUM('message', 'order', 'promotion') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
    INDEX idx_profile (profile_id),
    INDEX idx_unread (profile_id, is_read),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. PRODUCT_LIKES
CREATE TABLE product_likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (profile_id, product_id),
    INDEX idx_profile (profile_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. USER_SETTINGS
CREATE TABLE user_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT UNIQUE NOT NULL,
    notify_messages BOOLEAN DEFAULT TRUE,
    notify_orders BOOLEAN DEFAULT TRUE,
    notify_promotions BOOLEAN DEFAULT FALSE,
    profile_visibility ENUM('public', 'students', 'private') DEFAULT 'public',
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Insert Sample Categories
```sql
INSERT INTO categories (name, description) VALUES
('Food', 'Food items, snacks, and beverages'),
('Electronics', 'Gadgets, computers, and electronic devices'),
('Books & Educational', 'Textbooks, reference materials, and study guides'),
('Fashion', 'Clothing, accessories, and watches'),
('Appliance', 'Home and dorm appliances'),
('Services', 'Tutoring, printing, and other services'),
('Sports & Fitness', 'Sports equipment and fitness gear'),
('Home & Living', 'Furniture, decor, and household items');
```

---

## Database Triggers

### Update like_count on PRODUCTS when PRODUCT_LIKES changes
```sql
DELIMITER $$

CREATE TRIGGER after_like_insert
AFTER INSERT ON product_likes
FOR EACH ROW
BEGIN
    UPDATE products
    SET like_count = like_count + 1
    WHERE product_id = NEW.product_id;
END$$

CREATE TRIGGER after_like_delete
AFTER DELETE ON product_likes
FOR EACH ROW
BEGIN
    UPDATE products
    SET like_count = like_count - 1
    WHERE product_id = OLD.product_id;
END$$

DELIMITER ;
```

### Update seller_rating on PROFILES when REVIEWS change
```sql
DELIMITER $$

CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE profiles
    SET 
        seller_rating = (
            SELECT AVG(rating)
            FROM reviews
            WHERE reviewed_profile_id = NEW.reviewed_profile_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewed_profile_id = NEW.reviewed_profile_id
        )
    WHERE profile_id = NEW.reviewed_profile_id;
END$$

CREATE TRIGGER after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE profiles
    SET 
        seller_rating = COALESCE((
            SELECT AVG(rating)
            FROM reviews
            WHERE reviewed_profile_id = OLD.reviewed_profile_id
        ), 0.00),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewed_profile_id = OLD.reviewed_profile_id
        )
    WHERE profile_id = OLD.reviewed_profile_id;
END$$

DELIMITER ;
```

---

## Notes

1. **Character Set**: UTF-8 (utf8mb4) for emoji and international character support
2. **Engine**: InnoDB for transaction support and foreign key constraints
3. **Cascading Deletes**: 
   - User deletion cascades to profile and all related data
   - Product deletion cascades to images, likes, but restricts orders/reviews
4. **Indexes**: Added on frequently queried columns for performance
5. **Constraints**: 
   - Rating must be between 1.0 and 5.0
   - Users cannot review themselves
   - One like per user per product

---

## Future Enhancements (Optional)

1. **Product Tags Table** - For better product search and filtering
2. **Saved Searches** - Store user search preferences
3. **Report System** - Report inappropriate listings or users
4. **Transaction History** - Detailed payment/transaction logs
5. **Admin Logs** - Track administrative actions
6. **Product Views Tracking** - Detailed view analytics per user
7. **Conversation Archives** - Archive/unarchive conversations
8. **Blocked Users** - Block specific users from contacting you

---

**End of ERD Schema Document**
