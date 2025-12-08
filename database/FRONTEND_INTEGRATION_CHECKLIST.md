# Frontend Integration Checklist

**For Backend Developer - Before Testing Integration**  
**Last Updated:** November 30, 2025

---

## Overview

This document lists all the changes needed in the frontend code to switch from **DEV_MODE (mock data)** to **production mode (real API calls)**.

---

## 1. Disable DEV_MODE

### File: `frontend/src/services/authService.js`

**Current State:**
```javascript
const DEV_MODE = true; // Mock authentication for development
```

**Required Change:**
```javascript
const DEV_MODE = false; // Use real API authentication
```

**Location:** Line 6  
**Impact:** Switches all authentication calls from mock to real API

---

## 2. Frontend TODO Comments to Address

All these TODO comments indicate places where mock data is being used and need to be replaced with actual API calls once backend is ready.

### 2.1 AppHeader.jsx (Notification Actions)
**File:** `frontend/src/components/layout/AppHeader.jsx`

**TODO 1 - Mark as Read (Line ~65):**
```javascript
// TODO: Implement mark as read API call
// const handleMarkAsRead = async (notificationId) => {
//   await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
//   setNotifications(prev => prev.map(n => 
//     n.id === notificationId ? { ...n, read: true } : n
//   ));
// };
```

**TODO 2 - Clear All (Line ~70):**
```javascript
// TODO: Implement clear all API call
// const handleClearAll = async () => {
//   await fetch('/api/notifications/read-all', { method: 'PATCH' });
//   setNotifications([]);
// };
```

**Action Required:**
1. Uncomment the code above
2. Remove the mock implementation
3. Add proper error handling
4. Test with real backend

---

### 2.2 MessagesPage.jsx (Message Actions)
**File:** `frontend/src/pages/app/MessagesPage.jsx`

**TODO 1 - Delete Conversation (Line ~155):**
```javascript
// TODO: Implement delete conversation
console.log('Delete conversation:', conversationId);
```

**TODO 2 - Archive Conversation (Line ~160):**
```javascript
// TODO: Implement archive functionality
console.log('Archive conversation:', conversationId);
```

**TODO 3 - Mute Conversation (Line ~165):**
```javascript
// TODO: Implement mute functionality
console.log('Mute conversation:', conversationId);
```

**TODO 4 - Send Message (Line ~203):**
```javascript
// TODO: Send to backend API
console.log('Sending message:', messageText);
```

**Action Required:**
1. Replace console.log with actual API calls:
   - DELETE `/api/messages/conversation?other_profile_id={id}&product_id={id}`
   - POST `/api/messages/archive` (if implementing archive feature)
   - POST `/api/messages/mute` (if implementing mute feature)
   - POST `/api/messages` with proper request body
2. Add error handling and user feedback
3. Update state after successful API calls

---

### 2.3 OrdersHistoryPage.jsx (Rating Submission)
**File:** `frontend/src/pages/app/OrdersHistoryPage.jsx`

**TODO - Submit Rating (Line ~248):**
```javascript
// TODO: Send to backend API
console.log('Submitting rating:', {
  orderId: order.order_id,
  rating: order.rating,
  reviewText: order.reviewText
});
```

**Action Required:**
1. Replace with: POST `/api/reviews`
2. Request body:
   ```javascript
   {
     reviewed_profile_id: order.seller.profile_id,
     product_id: order.product.product_id,
     rating: order.rating,
     review_text: order.reviewText
   }
   ```
3. Show success/error feedback
4. Update order state with submitted rating

---

### 2.4 ProfilePage.jsx (Listing Management)
**File:** `frontend/src/pages/app/ProfilePage.jsx`

**TODO 1 - Delete Listing (Line ~237):**
```javascript
// TODO: API call to delete
console.log('Deleting listing:', listingId);
```

**TODO 2 - Submit Rating (Line ~251):**
```javascript
// TODO: API call to save rating
console.log('Submitting rating:', {
  reviewedUserId,
  rating: formData.rating,
  reviewText: formData.reviewText
});
```

**Action Required:**
1. Delete listing: DELETE `/api/products/{productId}`
2. Submit rating: POST `/api/reviews` (same as OrdersHistoryPage)
3. Refresh listings after delete
4. Show success/error feedback

---

### 2.5 TradeOfferModal.jsx (Submit Trade Offer)
**File:** `frontend/src/components/marketplace/TradeOfferModal.jsx`

**TODO - Submit Trade Offer (Line ~72):**
```javascript
// TODO: Submit to API
console.log('Trade offer submitted:', {
  productId,
  ...formData
});
```

**Action Required:**
1. Replace with: POST `/api/trade-offers`
2. Use FormData for file upload:
   ```javascript
   const data = new FormData();
   data.append('product_id', productId);
   data.append('item_name', formData.itemName);
   data.append('item_estimated_value', formData.estimatedValue);
   data.append('cash_component', formData.cashComponent);
   data.append('trade_description', formData.description);
   data.append('item_image', formData.image);
   ```
3. Handle success/error responses

---

### 2.6 ContactSellerModal.jsx (Send Message)
**File:** `frontend/src/components/marketplace/ContactSellerModal.jsx`

**Action Required:**
1. Currently sends mock message
2. Replace with: POST `/api/messages`
3. Request body:
   ```javascript
   {
     receiver_profile_id: sellerId,
     product_id: productId,
     content: message
   }
   ```

---

### 2.7 PlaceOrderModal.jsx (Place Order)
**File:** `frontend/src/components/marketplace/PlaceOrderModal.jsx`

**Action Required:**
1. Currently creates mock order
2. Replace with: POST `/api/orders`
3. Request body:
   ```javascript
   {
     product_id: productId,
     quantity: formData.quantity,
     payment_method: formData.paymentMethod,
     pickup_location: formData.pickupLocation,
     delivery_notes: formData.notes
   }
   ```

---

### 2.8 RatingModal.jsx (Submit Rating)
**File:** `frontend/src/components/marketplace/RatingModal.jsx`

**Action Required:**
1. Currently submits mock rating
2. Replace with: POST `/api/reviews`
3. Same implementation as OrdersHistoryPage.jsx

---

## 3. API Service Files - Verification Needed

### 3.1 authService.js
**File:** `frontend/src/services/authService.js`

**Current Mock Functions:**
- `login()` - Returns fake user data
- `register()` - Returns fake user data
- `logout()` - Only clears localStorage

**After DEV_MODE = false:**
- `login()` → POST `/api/auth/login`
- `register()` → POST `/api/auth/register`
- `logout()` → Already correct (no API call needed)

**Verification:**
```javascript
// Test login
const result = await login({ email: 'test@cit.edu', password: 'password' });
console.log('Login result:', result);

// Test register
const result = await register({
  email: 'newuser@cit.edu',
  password: 'password',
  first_name: 'Test',
  last_name: 'User',
  phone_number: '09123456789',
  instagram_handle: '@testuser',
  academic_level: '3rd Year'
});
console.log('Register result:', result);
```

---

### 3.2 itemService.js
**File:** `frontend/src/services/itemService.js`

**Functions to Verify:**
- `getItems()` → GET `/api/products?category={id}&search={query}&sort={sort}`
- `getItemById()` → GET `/api/products/{id}`
- `createItem()` → POST `/api/products` (multipart/form-data)
- `updateItem()` → PUT `/api/products/{id}`
- `deleteItem()` → DELETE `/api/products/{id}`
- `likeItem()` → POST `/api/products/{id}/like`

**Note:** These should already be using `api.js` which is configured correctly.

---

### 3.3 api.js
**File:** `frontend/src/services/api.js`

**Current Configuration:**
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Verification Needed:**
1. Request interceptor adds Bearer token ✅
2. Response interceptor handles 401 errors ✅
3. Base URL is correct ✅

**No changes needed here!**

---

## 4. Testing Checklist

### Phase 1: Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (check error handling)
- [ ] Register new user
- [ ] Register with existing email (check error)
- [ ] Logout (clears localStorage)
- [ ] Protected routes redirect to login when not authenticated
- [ ] JWT token is stored in localStorage
- [ ] JWT token is sent with subsequent requests

### Phase 2: Products/Marketplace
- [ ] View all products
- [ ] Search products
- [ ] Filter by category
- [ ] Sort products (latest, price)
- [ ] View product details
- [ ] Like/unlike product
- [ ] Create new listing (with images)
- [ ] Edit own listing
- [ ] Delete own listing
- [ ] View seller profile from product

### Phase 3: Orders
- [ ] Place order
- [ ] View orders as buyer
- [ ] View orders as seller
- [ ] Seller can update order status
- [ ] View order details
- [ ] Submit rating after order completion

### Phase 4: Messages
- [ ] Send message to seller
- [ ] View conversation list
- [ ] View conversation messages
- [ ] Mark messages as read
- [ ] Send new message in existing conversation
- [ ] Unread count updates correctly

### Phase 5: Notifications
- [ ] View notifications in header dropdown
- [ ] View all notifications page
- [ ] Mark single notification as read
- [ ] Mark all notifications as read
- [ ] Delete single notification
- [ ] Delete all notifications

### Phase 6: Profile & Settings
- [ ] View own profile
- [ ] View other user profile
- [ ] Edit profile information
- [ ] View own listings
- [ ] Update settings preferences
- [ ] Change password

### Phase 7: Trade Offers
- [ ] Submit trade offer (with image)
- [ ] View trade offers (as seller)
- [ ] Accept/reject trade offer

### Phase 8: Reviews
- [ ] Submit review for seller
- [ ] View reviews on seller profile
- [ ] Seller rating updates after review

---

## 5. Environment Configuration

### Development
**File:** `frontend/.env.development` (create if not exists)
```env
VITE_API_URL=http://localhost:8080
```

### Production
**File:** `frontend/.env.production` (create if not exists)
```env
VITE_API_URL=https://your-production-backend.com
```

**Update api.js to use environment variable:**
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api' || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 6. Common Integration Issues & Solutions

### Issue 1: CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Backend must allow `http://localhost:5173` in CORS configuration
- Check `CorsConfig.java` in backend

---

### Issue 2: 401 Unauthorized on All Requests
**Error:** All API calls return 401

**Possible Causes:**
1. JWT token not being sent → Check request interceptor in `api.js`
2. Token expired → Check token expiration time
3. Token format incorrect → Should be `Bearer {token}`

**Solution:**
```javascript
// Verify token is being sent
console.log('Token:', localStorage.getItem('token'));

// Check request headers in Network tab
// Should see: Authorization: Bearer eyJhbGciOiJ...
```

---

### Issue 3: File Uploads Failing
**Error:** 400 Bad Request on file upload

**Possible Causes:**
1. Content-Type should be `multipart/form-data` (not `application/json`)
2. File size exceeds limit (5MB per file)

**Solution:**
```javascript
// Use FormData for file uploads
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('price', 100);
formData.append('images', fileObject); // Not file path

await api.post('/products', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

---

### Issue 4: Data Not Displaying After API Call
**Error:** No error, but data doesn't appear

**Possible Causes:**
1. Response data structure different from mock data
2. Frontend expecting different field names

**Solution:**
1. Console.log the API response
2. Compare with mock data structure
3. Update frontend to match backend response format
4. Or update backend DTOs to match frontend expectations

---

## 7. Final Integration Steps

1. **Backend Developer:**
   - Complete all API endpoints
   - Test with Postman
   - Ensure all endpoints return data matching `API_ENDPOINTS.md`
   - Deploy backend to accessible URL

2. **Frontend Integration:**
   - Change `DEV_MODE = false` in `authService.js`
   - Replace all TODO comments with real API calls
   - Update environment variables if needed
   - Test each feature systematically

3. **Testing Together:**
   - Start backend: `./gradlew bootRun`
   - Start frontend: `npm run dev`
   - Go through testing checklist above
   - Fix any issues found

4. **Production Deployment:**
   - Update CORS to allow production frontend URL
   - Update frontend API URL to production backend
   - Test all features in production
   - Monitor logs for errors

---

## 8. Contact Information

**Frontend Developer:** Dan  
**Backend Developer:** [Your Name]

**Project Repository:** [GitHub Link]  
**Documentation Location:** `database/` folder

**Files to Review:**
- `ERD_SCHEMA.md` - Database schema and SQL scripts
- `API_ENDPOINTS.md` - Complete API documentation
- `BACKEND_IMPLEMENTATION_GUIDE.md` - Step-by-step backend setup
- `FRONTEND_INTEGRATION_CHECKLIST.md` - This file

---

**Good luck with integration! 🚀**

If you encounter any issues not covered here, document them and we'll update this checklist.
