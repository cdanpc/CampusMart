# Campus Mart - API Endpoints Documentation

**Last Updated:** November 30, 2025  
**Version:** 1.0  
**Base URL:** `http://localhost:8080/api`

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [User Profile Endpoints](#user-profile-endpoints)
3. [Product Endpoints](#product-endpoints)
4. [Order Endpoints](#order-endpoints)
5. [Message Endpoints](#message-endpoints)
6. [Review Endpoints](#review-endpoints)
7. [Trade Offer Endpoints](#trade-offer-endpoints)
8. [Notification Endpoints](#notification-endpoints)
9. [Settings Endpoints](#settings-endpoints)
10. [Category Endpoints](#category-endpoints)

---

## Global Headers

### Required for Authenticated Requests
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### CORS Configuration
- **Allowed Origins:** `http://localhost:5173`, `http://127.0.0.1:5173`
- **Allowed Methods:** GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Credentials:** Allowed

---

## 1. Authentication Endpoints

### 1.1 Login
**Endpoint:** `POST /auth/login`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "johndoe.rizal@cit.edu",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "johndoe.rizal@cit.edu",
    "profile": {
      "id": 1,
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe Rizal",
      "phone_number": "09123456789",
      "instagram_handle": "@john.doe.profile",
      "academic_level": "3rd Year",
      "bio": "Computer Science student",
      "seller_rating": 4.8,
      "total_reviews": 12,
      "created_at": "2024-05-01T00:00:00Z",
      "updated_at": "2025-11-30T10:00:00Z"
    }
  }
}
```

**Error Responses:**
- **400:** Invalid credentials
- **404:** Email not found
- **401:** Invalid password

---

### 1.2 Register
**Endpoint:** `POST /auth/register`  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "johndoe@cit.edu",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "09123456789",
  "instagram_handle": "@johndoe",
  "academic_level": "3rd Year"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "email": "johndoe@cit.edu",
    "profile": {
      "id": 2,
      "user_id": 2,
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "09123456789",
      "instagram_handle": "@johndoe",
      "academic_level": "3rd Year",
      "bio": "",
      "seller_rating": 0.0,
      "total_reviews": 0,
      "created_at": "2025-11-30T10:30:00Z",
      "updated_at": "2025-11-30T10:30:00Z"
    }
  }
}
```

**Error Responses:**
- **400:** Validation errors (email format, password length, required fields)
- **409:** Email already exists

---

### 1.3 Get Current User
**Endpoint:** `GET /auth/me`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "id": 1,
  "email": "johndoe.rizal@cit.edu",
  "profile": {
    "id": 1,
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe Rizal",
    "phone_number": "09123456789",
    "instagram_handle": "@john.doe.profile",
    "academic_level": "3rd Year",
    "bio": "Computer Science student",
    "seller_rating": 4.8,
    "total_reviews": 12,
    "created_at": "2024-05-01T00:00:00Z",
    "updated_at": "2025-11-30T10:00:00Z"
  }
}
```

**Error Responses:**
- **401:** Unauthorized (invalid/expired token)

---

## 2. User Profile Endpoints

### 2.1 Get Profile by ID
**Endpoint:** `GET /profiles/{profileId}`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "profile_id": 1,
  "first_name": "John",
  "last_name": "Doe Rizal",
  "email": "johndoe.rizal@cit.edu",
  "phone_number": "09123456789",
  "instagram_handle": "@john.doe.profile",
  "academic_level": "3rd Year",
  "bio": "Computer Science student",
  "seller_rating": 4.8,
  "total_reviews": 12,
  "created_at": "2024-05-01T00:00:00Z"
}
```

---

### 2.2 Update Profile
**Endpoint:** `PUT /profiles/{profileId}`  
**Auth Required:** Yes (own profile only)

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe Rizal",
  "phone_number": "09123456789",
  "instagram_handle": "@john.doe.profile",
  "bio": "Updated bio"
}
```

**Success Response (200):**
```json
{
  "profile_id": 1,
  "first_name": "John",
  "last_name": "Doe Rizal",
  "phone_number": "09123456789",
  "instagram_handle": "@john.doe.profile",
  "bio": "Updated bio",
  "updated_at": "2025-11-30T11:00:00Z"
}
```

**Error Responses:**
- **400:** Validation errors
- **403:** Cannot edit other user's profile
- **404:** Profile not found

---

## 3. Product Endpoints

### 3.1 Get All Products (Marketplace)
**Endpoint:** `GET /products`  
**Auth Required:** Yes

**Query Parameters:**
- `category` (optional): Filter by category ID
- `search` (optional): Search by name/description
- `sort` (optional): `latest`, `price_asc`, `price_desc`, `popular`
- `is_available` (optional): `true` or `false`
- `trade_only` (optional): `true` or `false`
- `page` (optional): Page number (default: 0)
- `size` (optional): Items per page (default: 20)

**Success Response (200):**
```json
{
  "content": [
    {
      "product_id": 1,
      "name": "Rolex Datejust 36mm men",
      "description": "Selling a classic Rolex...",
      "price": 50000.00,
      "brand_type": "Rolex",
      "condition": "Excellent",
      "is_available": true,
      "trade_only": false,
      "view_count": 245,
      "like_count": 58,
      "stock": 1,
      "created_at": "2025-11-15T10:30:00Z",
      "category": {
        "category_id": 1,
        "name": "Fashion"
      },
      "seller": {
        "profile_id": 2,
        "first_name": "Anita",
        "last_name": "Max Win",
        "seller_rating": 4.8
      },
      "primary_image": "https://example.com/image.jpg"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalPages": 5,
  "totalElements": 100
}
```

---

### 3.2 Get Product by ID
**Endpoint:** `GET /products/{productId}`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "product_id": 1,
  "name": "Rolex Datejust 36mm men",
  "description": "Selling a classic Rolex Datejust 36mm...",
  "price": 50000.00,
  "brand_type": "Rolex",
  "condition": "Excellent",
  "contact_info": "Available for meetup on campus",
  "is_available": true,
  "trade_only": false,
  "view_count": 245,
  "like_count": 58,
  "stock": 1,
  "created_at": "2025-11-15T10:30:00Z",
  "updated_at": "2025-11-30T10:00:00Z",
  "category": {
    "category_id": 1,
    "name": "Fashion"
  },
  "seller": {
    "profile_id": 2,
    "first_name": "Anita",
    "last_name": "Max Win",
    "email": "anitamax.win@cit.edu",
    "phone_number": "09XXXXXXXXX",
    "instagram_handle": "@anitamax.winl",
    "seller_rating": 4.8,
    "total_reviews": 12
  },
  "images": [
    {
      "image_id": 1,
      "image_url": "https://example.com/image1.jpg",
      "is_primary": true
    },
    {
      "image_id": 2,
      "image_url": "https://example.com/image2.jpg",
      "is_primary": false
    }
  ]
}
```

**Note:** Should increment `view_count` when called

---

### 3.3 Create Product
**Endpoint:** `POST /products`  
**Auth Required:** Yes

**Request Body (multipart/form-data):**
```json
{
  "name": "iPhone 13 Pro Max 256GB",
  "description": "Brand new sealed unit...",
  "price": 45000.00,
  "brand_type": "Apple",
  "condition": "Brand New",
  "contact_info": "Available for meetup",
  "category_id": 2,
  "stock": 1,
  "trade_only": false,
  "images": ["file1", "file2", "file3"]
}
```

**Success Response (201):**
```json
{
  "product_id": 5,
  "name": "iPhone 13 Pro Max 256GB",
  "seller_profile_id": 1,
  "created_at": "2025-11-30T12:00:00Z"
}
```

**Error Responses:**
- **400:** Validation errors
- **401:** Unauthorized

---

### 3.4 Update Product
**Endpoint:** `PUT /products/{productId}`  
**Auth Required:** Yes (seller only)

**Request Body:**
```json
{
  "name": "iPhone 13 Pro Max 256GB",
  "description": "Updated description",
  "price": 44000.00,
  "is_available": true,
  "stock": 1
}
```

**Error Responses:**
- **403:** Not the seller
- **404:** Product not found

---

### 3.5 Delete Product
**Endpoint:** `DELETE /products/{productId}`  
**Auth Required:** Yes (seller only)

**Success Response (204):** No content

**Error Responses:**
- **403:** Not the seller
- **404:** Product not found

---

### 3.6 Like/Unlike Product
**Endpoint:** `POST /products/{productId}/like`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "liked": true,
  "like_count": 59
}
```

**Note:** Toggle like/unlike. If already liked, it unlikes; if not liked, it likes.

---

### 3.7 Get Products by Seller
**Endpoint:** `GET /profiles/{profileId}/products`  
**Auth Required:** Yes

**Query Parameters:**
- `is_available` (optional): Filter by availability

**Success Response (200):**
```json
[
  {
    "product_id": 1,
    "name": "Rolex Datejust 36mm",
    "price": 50000.00,
    "is_available": true,
    "like_count": 58,
    "view_count": 245,
    "primary_image": "https://example.com/image.jpg"
  }
]
```

---

## 4. Order Endpoints

### 4.1 Create Order
**Endpoint:** `POST /orders`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 1,
  "payment_method": "gcash",
  "pickup_location": "CIT University Library",
  "delivery_notes": "Please bring receipt"
}
```

**Success Response (201):**
```json
{
  "order_id": 123,
  "buyer_profile_id": 1,
  "seller_profile_id": 2,
  "product_id": 1,
  "total_amount": 50000.00,
  "quantity": 1,
  "status": "pending",
  "payment_method": "gcash",
  "pickup_location": "CIT University Library",
  "delivery_notes": "Please bring receipt",
  "created_at": "2025-11-30T13:00:00Z"
}
```

**Error Responses:**
- **400:** Product not available, insufficient stock
- **404:** Product not found

---

### 4.2 Get Order by ID
**Endpoint:** `GET /orders/{orderId}`  
**Auth Required:** Yes (buyer or seller only)

**Success Response (200):**
```json
{
  "order_id": 123,
  "total_amount": 50000.00,
  "quantity": 1,
  "status": "confirmed",
  "payment_method": "gcash",
  "pickup_location": "CIT University Library",
  "delivery_notes": "Please bring receipt",
  "created_at": "2025-11-30T13:00:00Z",
  "updated_at": "2025-11-30T13:30:00Z",
  "buyer": {
    "profile_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@cit.edu",
    "phone_number": "09123456789",
    "instagram_handle": "@johndoe"
  },
  "seller": {
    "profile_id": 2,
    "first_name": "Anita",
    "last_name": "Max Win",
    "email": "anita@cit.edu",
    "phone_number": "09XXXXXXXXX"
  },
  "product": {
    "product_id": 1,
    "name": "Rolex Datejust 36mm",
    "description": "Selling a classic...",
    "price": 50000.00,
    "image": "https://example.com/image.jpg",
    "category": "Fashion"
  }
}
```

---

### 4.3 Update Order Status
**Endpoint:** `PATCH /orders/{orderId}/status`  
**Auth Required:** Yes (seller only)

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Transitions:**
- `pending` → `confirmed` or `cancelled`
- `confirmed` → `processing` or `cancelled`
- `processing` → `ready` or `cancelled`
- `ready` → `completed`

**Success Response (200):**
```json
{
  "order_id": 123,
  "status": "confirmed",
  "updated_at": "2025-11-30T14:00:00Z"
}
```

**Error Responses:**
- **403:** Not the seller or invalid status transition
- **404:** Order not found

---

### 4.4 Get Orders (Buyer)
**Endpoint:** `GET /orders/buyer`  
**Auth Required:** Yes

**Query Parameters:**
- `status` (optional): Filter by status
- `page`, `size`: Pagination

**Success Response (200):**
```json
{
  "content": [
    {
      "order_id": 123,
      "product": {
        "product_id": 1,
        "name": "Rolex Datejust 36mm",
        "price": 50000.00,
        "image": "https://example.com/image.jpg"
      },
      "seller": {
        "profile_id": 2,
        "first_name": "Anita",
        "last_name": "Max Win"
      },
      "total_amount": 50000.00,
      "status": "confirmed",
      "created_at": "2025-11-30T13:00:00Z"
    }
  ],
  "totalElements": 15
}
```

---

### 4.5 Get Orders (Seller)
**Endpoint:** `GET /orders/seller`  
**Auth Required:** Yes

**Query Parameters:**
- `status` (optional): Filter by status
- `page`, `size`: Pagination

**Success Response (200):** Same structure as 4.4

---

## 5. Message Endpoints

### 5.1 Get Conversations
**Endpoint:** `GET /messages/conversations`  
**Auth Required:** Yes

**Success Response (200):**
```json
[
  {
    "conversation_id": "1_2_1",
    "other_profile": {
      "profile_id": 2,
      "first_name": "Anita",
      "last_name": "Max Win"
    },
    "product": {
      "product_id": 1,
      "name": "Rolex Datejust 36mm",
      "price": 50000.00
    },
    "last_message": {
      "content": "Yes, still available!",
      "created_at": "2025-11-30T14:30:00Z",
      "sender_profile_id": 2
    },
    "unread_count": 2
  }
]
```

---

### 5.2 Get Messages in Conversation
**Endpoint:** `GET /messages/conversation`  
**Auth Required:** Yes

**Query Parameters:**
- `other_profile_id`: The other user's profile ID
- `product_id`: The product being discussed

**Success Response (200):**
```json
[
  {
    "message_id": 1,
    "sender_profile_id": 1,
    "receiver_profile_id": 2,
    "product_id": 1,
    "content": "Hi! Is this Rolex still available?",
    "is_read": true,
    "created_at": "2025-11-30T10:15:00Z"
  },
  {
    "message_id": 2,
    "sender_profile_id": 2,
    "receiver_profile_id": 1,
    "product_id": 1,
    "content": "Yes, it's still available!",
    "is_read": false,
    "created_at": "2025-11-30T14:30:00Z"
  }
]
```

---

### 5.3 Send Message
**Endpoint:** `POST /messages`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "receiver_profile_id": 2,
  "product_id": 1,
  "content": "Can we meet tomorrow?"
}
```

**Success Response (201):**
```json
{
  "message_id": 3,
  "sender_profile_id": 1,
  "receiver_profile_id": 2,
  "product_id": 1,
  "content": "Can we meet tomorrow?",
  "is_read": false,
  "created_at": "2025-11-30T15:00:00Z"
}
```

---

### 5.4 Mark Messages as Read
**Endpoint:** `PATCH /messages/read`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "sender_profile_id": 2,
  "product_id": 1
}
```

**Success Response (200):**
```json
{
  "messages_marked": 5
}
```

---

## 6. Review Endpoints

### 6.1 Create Review
**Endpoint:** `POST /reviews`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "reviewed_profile_id": 2,
  "product_id": 1,
  "rating": 5.0,
  "review_text": "Excellent seller! Very responsive."
}
```

**Success Response (201):**
```json
{
  "review_id": 1,
  "reviewer_profile_id": 1,
  "reviewed_profile_id": 2,
  "product_id": 1,
  "rating": 5.0,
  "review_text": "Excellent seller! Very responsive.",
  "created_at": "2025-11-30T16:00:00Z"
}
```

**Error Responses:**
- **400:** Cannot review yourself, rating out of range (1.0-5.0)
- **404:** Profile or product not found

**Note:** Should update `seller_rating` and `total_reviews` in profiles table

---

### 6.2 Get Reviews for Seller
**Endpoint:** `GET /profiles/{profileId}/reviews`  
**Auth Required:** Yes

**Success Response (200):**
```json
[
  {
    "review_id": 1,
    "reviewer": {
      "profile_id": 1,
      "first_name": "John",
      "last_name": "Doe"
    },
    "product_id": 1,
    "rating": 5.0,
    "review_text": "Excellent seller! Very responsive.",
    "created_at": "2025-11-30T16:00:00Z"
  }
]
```

---

## 7. Trade Offer Endpoints

### 7.1 Create Trade Offer
**Endpoint:** `POST /trade-offers`  
**Auth Required:** Yes

**Request Body (multipart/form-data):**
```json
{
  "product_id": 1,
  "item_name": "iPhone 12 Pro",
  "item_estimated_value": 40000.00,
  "cash_component": 10000.00,
  "trade_description": "iPhone 12 Pro 128GB in excellent condition",
  "item_image": "file"
}
```

**Success Response (201):**
```json
{
  "trade_offer_id": 1,
  "offerer_profile_id": 1,
  "product_id": 1,
  "item_name": "iPhone 12 Pro",
  "item_estimated_value": 40000.00,
  "cash_component": 10000.00,
  "trade_description": "iPhone 12 Pro 128GB in excellent condition",
  "item_image_url": "https://example.com/trade-image.jpg",
  "status": "pending",
  "created_at": "2025-11-30T17:00:00Z"
}
```

---

### 7.2 Get Trade Offers for Product
**Endpoint:** `GET /products/{productId}/trade-offers`  
**Auth Required:** Yes (seller only)

**Success Response (200):**
```json
[
  {
    "trade_offer_id": 1,
    "offerer": {
      "profile_id": 1,
      "first_name": "John",
      "last_name": "Doe"
    },
    "item_name": "iPhone 12 Pro",
    "item_estimated_value": 40000.00,
    "cash_component": 10000.00,
    "trade_description": "iPhone 12 Pro 128GB...",
    "item_image_url": "https://example.com/image.jpg",
    "status": "pending",
    "created_at": "2025-11-30T17:00:00Z"
  }
]
```

---

### 7.3 Update Trade Offer Status
**Endpoint:** `PATCH /trade-offers/{tradeOfferId}/status`  
**Auth Required:** Yes (product seller only)

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Valid Statuses:** `pending`, `accepted`, `rejected`

**Success Response (200):**
```json
{
  "trade_offer_id": 1,
  "status": "accepted",
  "updated_at": "2025-11-30T18:00:00Z"
}
```

---

## 8. Notification Endpoints

### 8.1 Get Notifications
**Endpoint:** `GET /notifications`  
**Auth Required:** Yes

**Query Parameters:**
- `type` (optional): `message`, `order`, `promotion`
- `is_read` (optional): `true` or `false`
- `page`, `size`: Pagination

**Success Response (200):**
```json
{
  "content": [
    {
      "notification_id": 1,
      "type": "message",
      "title": "New Message from Anita Max Win",
      "message": "Hi! Is the Rolex still available?",
      "link": "/messages?user=2",
      "is_read": false,
      "created_at": "2025-11-30T14:30:00Z"
    },
    {
      "notification_id": 2,
      "type": "order",
      "title": "Order Confirmed",
      "message": "Your order #1234 has been confirmed.",
      "link": "/order/1234",
      "is_read": false,
      "created_at": "2025-11-30T13:00:00Z"
    }
  ],
  "totalElements": 8
}
```

---

### 8.2 Mark Notification as Read
**Endpoint:** `PATCH /notifications/{notificationId}/read`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "notification_id": 1,
  "is_read": true
}
```

---

### 8.3 Mark All Notifications as Read
**Endpoint:** `PATCH /notifications/read-all`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "marked_count": 5
}
```

---

### 8.4 Delete Notification
**Endpoint:** `DELETE /notifications/{notificationId}`  
**Auth Required:** Yes

**Success Response (204):** No content

---

### 8.5 Delete All Notifications
**Endpoint:** `DELETE /notifications`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "deleted_count": 8
}
```

---

## 9. Settings Endpoints

### 9.1 Get User Settings
**Endpoint:** `GET /settings`  
**Auth Required:** Yes

**Success Response (200):**
```json
{
  "setting_id": 1,
  "profile_id": 1,
  "notify_messages": true,
  "notify_orders": true,
  "notify_promotions": false,
  "profile_visibility": "public",
  "show_email": false,
  "show_phone": false,
  "two_factor_enabled": false,
  "created_at": "2024-05-01T00:00:00Z",
  "updated_at": "2025-11-30T10:00:00Z"
}
```

**Note:** Creates default settings if none exist

---

### 9.2 Update User Settings
**Endpoint:** `PUT /settings`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "notify_messages": true,
  "notify_orders": true,
  "notify_promotions": false,
  "profile_visibility": "students",
  "show_email": true,
  "show_phone": false
}
```

**Success Response (200):**
```json
{
  "setting_id": 1,
  "notify_messages": true,
  "notify_orders": true,
  "notify_promotions": false,
  "profile_visibility": "students",
  "show_email": true,
  "show_phone": false,
  "updated_at": "2025-11-30T19:00:00Z"
}
```

---

### 9.3 Change Password
**Endpoint:** `POST /auth/change-password`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- **400:** Current password incorrect, new password too weak
- **401:** Unauthorized

---

## 10. Category Endpoints

### 10.1 Get All Categories
**Endpoint:** `GET /categories`  
**Auth Required:** No

**Success Response (200):**
```json
[
  {
    "category_id": 1,
    "name": "Food",
    "description": "Food items, snacks, and beverages"
  },
  {
    "category_id": 2,
    "name": "Electronics",
    "description": "Gadgets, computers, and electronic devices"
  },
  {
    "category_id": 3,
    "name": "Books & Educational",
    "description": "Textbooks, reference materials, and study guides"
  }
]
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "timestamp": "2025-11-30T20:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ],
  "path": "/api/auth/register"
}
```

---

## Common HTTP Status Codes

- **200 OK:** Successful GET, PUT, PATCH requests
- **201 Created:** Successful POST requests
- **204 No Content:** Successful DELETE requests
- **400 Bad Request:** Validation errors, invalid data
- **401 Unauthorized:** Missing or invalid authentication token
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Duplicate entry (e.g., email already exists)
- **500 Internal Server Error:** Server-side error

---

## Notes for Backend Developer

### 1. **JWT Authentication**
- Use JWT tokens for authentication
- Token should include: `user_id`, `profile_id`, `email`
- Token expiration: 24 hours (configurable)
- Refresh token mechanism (optional but recommended)

### 2. **File Upload**
- Product images: Max 5 files, 5MB each, formats: JPG, PNG, WEBP
- Trade offer images: Max 1 file, 5MB, formats: JPG, PNG, WEBP
- Store in: `/uploads/products/` and `/uploads/trades/`
- Return URL format: `{base_url}/uploads/products/{filename}`

### 3. **Pagination**
- Default page size: 20
- Max page size: 100
- Page numbers start at 0

### 4. **Real-time Features (Future Enhancement)**
- Consider WebSocket for:
  - New message notifications
  - Order status updates
  - New notification alerts

### 5. **Data Validation**
- Email: Must be valid CIT-U email format (`@cit.edu`)
- Phone: Must be 11 digits starting with `09`
- Password: Minimum 6 characters (consider stronger requirements)
- Rating: Must be between 1.0 and 5.0

### 6. **Security**
- Hash passwords with BCrypt (cost factor: 12)
- Sanitize all user inputs
- Implement rate limiting (e.g., 100 requests/minute per user)
- CORS configured for `localhost:5173`

### 7. **Database Triggers**
- Auto-update `like_count` on product_likes insert/delete
- Auto-update `seller_rating` and `total_reviews` on reviews insert/delete
- Auto-increment `view_count` on product detail view

### 8. **Frontend DEV_MODE**
- Current frontend uses mock data (DEV_MODE = true)
- Located in: `frontend/src/services/authService.js`
- Set to `false` when backend is ready

### 9. **Testing**
- Test endpoint available: `GET /api/hello`
- Returns: `{"message": "Hello from Backend API"}`

---

## Next Steps for Backend Developer

1. ✅ Review ERD Schema (`database/ERD_SCHEMA.md`)
2. ✅ Review this API documentation
3. 🔲 Set up MySQL database and run schema creation scripts
4. 🔲 Implement authentication endpoints first
5. 🔲 Implement product endpoints (core functionality)
6. 🔲 Implement order and message endpoints
7. 🔲 Implement remaining endpoints
8. 🔲 Test with frontend (set `DEV_MODE = false`)
9. 🔲 Deploy backend and update `VITE_API_URL`

---

**End of API Documentation**
