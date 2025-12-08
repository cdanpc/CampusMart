# Campus Mart - Backend Developer Handoff Package

**Project:** Campus Mart - CIT University Marketplace System  
**Frontend Developer:** Dan  
**Date:** November 30, 2025  
**Version:** 1.0

---

## 📋 Executive Summary

Campus Mart is a fully-featured campus marketplace web application designed for CIT University students to buy, sell, and trade items. The **frontend is 100% complete** with all UI/UX features, routing, and authentication flows implemented using React 19.2.0.

Currently, the frontend operates in **DEV_MODE** using mock data. Your task is to implement the backend API using Spring Boot to replace the mock data with real database operations.

---

## 📦 What's Included in This Handoff

### 1. **Database Documentation** (`database/ERD_SCHEMA.md`)
- Complete Entity-Relationship Diagram (ASCII format)
- 12 fully-defined database tables with all columns, types, and constraints
- Full SQL CREATE TABLE scripts ready to execute
- Database triggers for auto-updating `like_count` and `seller_rating`
- Sample category data inserts
- Relationship documentation (one-to-one, one-to-many)
- Foreign key definitions with cascading rules

### 2. **API Documentation** (`database/API_ENDPOINTS.md`)
- 50+ REST API endpoints fully documented
- Complete request/response schemas for each endpoint
- Authentication requirements specified
- Error response formats and status codes
- Pagination specifications
- File upload requirements
- Data validation rules
- Testing notes and security considerations

### 3. **Implementation Guide** (`database/BACKEND_IMPLEMENTATION_GUIDE.md`)
- Step-by-step backend setup instructions
- Database creation commands
- Spring Boot configuration (application.properties)
- JPA Entity examples with relationships
- Repository layer patterns
- Service layer architecture
- Controller implementation examples
- JWT authentication setup
- File upload configuration
- Testing strategies
- Deployment checklist

### 4. **Integration Checklist** (`database/FRONTEND_INTEGRATION_CHECKLIST.md`)
- Frontend code locations requiring changes (DEV_MODE flag)
- All TODO comments documented with file locations
- Testing checklist for each feature
- Common integration issues and solutions
- Environment variable configuration
- Step-by-step integration workflow

---

## 🗂️ Project Structure

```
CampusMart/
├── backend/                          # Spring Boot backend (YOUR WORK HERE)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/campusmart/
│   │   │   │   ├── BackendApplication.java    # Main Spring Boot app
│   │   │   │   ├── config/                     # Configuration classes
│   │   │   │   │   ├── CorsConfig.java         # ✅ Already configured
│   │   │   │   │   ├── SecurityConfig.java     # ⚠️ TO CREATE
│   │   │   │   │   └── WebConfig.java          # ⚠️ TO CREATE (file uploads)
│   │   │   │   ├── controller/                 # REST Controllers
│   │   │   │   │   ├── HelloController.java    # ✅ Test endpoint exists
│   │   │   │   │   ├── AuthController.java     # ⚠️ TO CREATE
│   │   │   │   │   ├── ProductController.java  # ⚠️ TO CREATE
│   │   │   │   │   ├── OrderController.java    # ⚠️ TO CREATE
│   │   │   │   │   └── ... (8 more controllers)
│   │   │   │   ├── entity/                     # JPA Entities
│   │   │   │   │   ├── User.java               # ⚠️ TO CREATE
│   │   │   │   │   ├── Profile.java            # ⚠️ TO CREATE
│   │   │   │   │   ├── Product.java            # ⚠️ TO CREATE
│   │   │   │   │   └── ... (9 more entities)
│   │   │   │   ├── repository/                 # Data access layer
│   │   │   │   │   ├── UserRepository.java     # ⚠️ TO CREATE
│   │   │   │   │   ├── ProductRepository.java  # ⚠️ TO CREATE
│   │   │   │   │   └── ... (10 more repos)
│   │   │   │   ├── service/                    # Business logic
│   │   │   │   │   ├── AuthService.java        # ⚠️ TO CREATE
│   │   │   │   │   ├── ProductService.java     # ⚠️ TO CREATE
│   │   │   │   │   └── ... (8 more services)
│   │   │   │   ├── dto/                        # Data Transfer Objects
│   │   │   │   │   ├── LoginRequest.java       # ⚠️ TO CREATE
│   │   │   │   │   ├── AuthResponse.java       # ⚠️ TO CREATE
│   │   │   │   │   └── ... (20+ DTOs)
│   │   │   │   └── security/                   # JWT & Security
│   │   │   │       ├── JwtUtil.java            # ⚠️ TO CREATE
│   │   │   │       ├── JwtAuthFilter.java      # ⚠️ TO CREATE
│   │   │   │       └── UserPrincipal.java      # ⚠️ TO CREATE
│   │   │   └── resources/
│   │   │       └── application.properties      # ⚠️ TO UPDATE (DB config)
│   │   └── test/                               # Unit tests
│   ├── build.gradle                            # ⚠️ TO UPDATE (dependencies)
│   └── uploads/                                # File storage (auto-created)
│
├── frontend/                         # React frontend (✅ COMPLETE)
│   ├── src/
│   │   ├── components/               # 15+ React components
│   │   ├── pages/                    # 14 pages (auth, app, public)
│   │   ├── routes/                   # Routing configuration
│   │   ├── services/
│   │   │   ├── authService.js        # ⚠️ DEV_MODE = true (change to false)
│   │   │   ├── itemService.js        # ✅ Ready for backend
│   │   │   └── api.js                # ✅ Axios configured correctly
│   │   ├── context/                  # Auth & Cart context
│   │   └── styles/                   # CSS files
│   ├── package.json                  # Node dependencies
│   └── vite.config.js                # ✅ Proxy configured for /api
│
└── database/                         # 📚 DOCUMENTATION (READ THESE FIRST!)
    ├── ERD_SCHEMA.md                 # ⭐ START HERE - Database schema
    ├── API_ENDPOINTS.md              # ⭐ THEN READ - All API specs
    ├── BACKEND_IMPLEMENTATION_GUIDE.md  # ⭐ FOLLOW THIS - Step-by-step guide
    └── FRONTEND_INTEGRATION_CHECKLIST.md  # ⭐ FOR TESTING - Integration steps
```

**Legend:**
- ✅ = Already implemented and working
- ⚠️ = Needs to be created/updated by backend developer

---

## 🎯 Your Mission

### Phase 1: Setup (1-2 hours)
1. ✅ Review all documentation in `database/` folder
2. ✅ Set up MySQL database (create `campusmart_db`)
3. ✅ Run SQL scripts from `ERD_SCHEMA.md` to create tables
4. ✅ Update `application.properties` with database credentials
5. ✅ Update `build.gradle` with required dependencies
6. ✅ Test database connection with Spring Boot

### Phase 2: Authentication (3-4 hours)
1. ⚠️ Create JPA entities: `User`, `Profile`
2. ⚠️ Create repositories: `UserRepository`, `ProfileRepository`
3. ⚠️ Implement JWT utility classes (`JwtUtil`, `JwtAuthFilter`)
4. ⚠️ Create `AuthService` with login/register logic
5. ⚠️ Create `AuthController` with 3 endpoints:
   - POST `/api/auth/login`
   - POST `/api/auth/register`
   - GET `/api/auth/me`
6. ✅ Test with Postman
7. ✅ Test with frontend (set `DEV_MODE = false`)

### Phase 3: Core Features - Products (4-6 hours)
1. ⚠️ Create JPA entities: `Product`, `ProductImage`, `Category`, `ProductLike`
2. ⚠️ Create repositories for all product-related entities
3. ⚠️ Implement file upload service (`FileStorageService`)
4. ⚠️ Create `ProductService` with CRUD + like functionality
5. ⚠️ Create `ProductController` with 7 endpoints (see API_ENDPOINTS.md)
6. ✅ Test product creation with image uploads
7. ✅ Test product browsing, filtering, searching

### Phase 4: Orders (2-3 hours)
1. ⚠️ Create JPA entity: `Order`
2. ⚠️ Create `OrderRepository` with custom queries
3. ⚠️ Create `OrderService` with order creation & status updates
4. ⚠️ Create `OrderController` with 5 endpoints
5. ✅ Test order creation and status transitions

### Phase 5: Messages (2-3 hours)
1. ⚠️ Create JPA entity: `Message`
2. ⚠️ Create `MessageRepository` with conversation queries
3. ⚠️ Create `MessageService` with conversation grouping
4. ⚠️ Create `MessageController` with 4 endpoints
5. ✅ Test messaging between users

### Phase 6: Reviews & Ratings (1-2 hours)
1. ⚠️ Create JPA entity: `Review`
2. ⚠️ Create `ReviewRepository`
3. ⚠️ Create `ReviewService` (ensure triggers update `seller_rating`)
4. ⚠️ Create `ReviewController` with 2 endpoints
5. ✅ Test review submission and rating calculations

### Phase 7: Trade Offers (2 hours)
1. ⚠️ Create JPA entity: `TradeOffer`
2. ⚠️ Create `TradeOfferRepository`
3. ⚠️ Create `TradeOfferService` with image upload
4. ⚠️ Create `TradeOfferController` with 3 endpoints
5. ✅ Test trade offer submission with image

### Phase 8: Notifications (1-2 hours)
1. ⚠️ Create JPA entity: `Notification`
2. ⚠️ Create `NotificationRepository`
3. ⚠️ Create `NotificationService`
4. ⚠️ Create `NotificationController` with 5 endpoints
5. ✅ Test notification CRUD operations

### Phase 9: Settings & Profile (1 hour)
1. ⚠️ Create JPA entity: `UserSettings`
2. ⚠️ Create `UserSettingsRepository`
3. ⚠️ Create `SettingsService` with default settings creation
4. ⚠️ Create `SettingsController` with 3 endpoints
5. ⚠️ Implement change password endpoint
6. ✅ Test settings updates

### Phase 10: Integration & Testing (2-3 hours)
1. ✅ Test all endpoints with Postman
2. ✅ Frontend: Change `DEV_MODE = false` in `authService.js`
3. ✅ Frontend: Replace all TODO comments (see `FRONTEND_INTEGRATION_CHECKLIST.md`)
4. ✅ Test entire application flow end-to-end
5. ✅ Fix any integration issues
6. ✅ Document any changes or issues

**Total Estimated Time: 20-30 hours** (depending on experience level)

---

## 📊 Database Overview

### Tables (12 total):
1. **users** - Authentication (email, password_hash)
2. **profiles** - User details (name, phone, Instagram, rating)
3. **products** - Marketplace listings (name, price, description, images)
4. **product_images** - Product photos (URL, is_primary flag)
5. **categories** - Product categories (Food, Electronics, Books, etc.)
6. **orders** - Purchase orders (buyer, seller, status, payment)
7. **messages** - User-to-user messaging (product-specific conversations)
8. **reviews** - Seller ratings (1.0-5.0 stars, review text)
9. **trade_offers** - Item exchange proposals (item + cash)
10. **notifications** - User notifications (messages, orders, promotions)
11. **product_likes** - User favorites/likes (tracks which users liked which products)
12. **user_settings** - User preferences (notification settings, privacy)

### Key Relationships:
- `users` ↔ `profiles` (one-to-one)
- `profiles` ↔ `products` (one seller has many products)
- `products` ↔ `product_images` (one product has many images)
- `profiles` ↔ `orders` (as buyer and as seller)
- `profiles` ↔ `messages` (as sender and as receiver)
- `profiles` ↔ `reviews` (as reviewer and as reviewed)

### Database Triggers:
- **after_like_insert/delete** - Auto-updates `products.like_count`
- **after_review_insert/delete** - Auto-updates `profiles.seller_rating` and `profiles.total_reviews`

---

## 🔐 Authentication Flow

```
Frontend                    Backend                     Database
--------                    -------                     --------
1. User enters email/password
   └─> POST /api/auth/login
                             2. Validate credentials
                                └─> Query users table
                                    └─> Compare password hash (BCrypt)
                                        └─> Generate JWT token
                                            └─> Include: userId, email, profileId
                             3. Return: { token, user, profile }
   └─> Store token in localStorage
   
4. Subsequent requests
   └─> Include: Authorization: Bearer {token}
                             5. Validate JWT
                                └─> Extract userId from token
                                    └─> Set SecurityContext
                                        └─> Process request
                             6. Return: data
```

**Key Points:**
- Passwords hashed with BCrypt (cost factor: 12)
- JWT tokens valid for 24 hours
- Token includes: `user_id`, `email`, `profile_id`
- Frontend stores token in `localStorage.getItem('token')`
- Frontend sends token in `Authorization: Bearer {token}` header

---

## 🌐 API Overview

### Authentication (3 endpoints)
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/auth/me` - Get current user info

### Products (7 endpoints)
- GET `/api/products` - List all products (with filters, search, pagination)
- GET `/api/products/{id}` - Get product details
- POST `/api/products` - Create product (multipart/form-data for images)
- PUT `/api/products/{id}` - Update product
- DELETE `/api/products/{id}` - Delete product
- POST `/api/products/{id}/like` - Toggle like/unlike
- GET `/api/profiles/{id}/products` - Get seller's products

### Orders (5 endpoints)
- POST `/api/orders` - Create order
- GET `/api/orders/{id}` - Get order details
- PATCH `/api/orders/{id}/status` - Update order status
- GET `/api/orders/buyer` - Get orders as buyer
- GET `/api/orders/seller` - Get orders as seller

### Messages (4 endpoints)
- GET `/api/messages/conversations` - Get conversation list
- GET `/api/messages/conversation` - Get messages in conversation
- POST `/api/messages` - Send message
- PATCH `/api/messages/read` - Mark messages as read

### Reviews (2 endpoints)
- POST `/api/reviews` - Create review
- GET `/api/profiles/{id}/reviews` - Get seller reviews

### Trade Offers (3 endpoints)
- POST `/api/trade-offers` - Create trade offer
- GET `/api/products/{id}/trade-offers` - Get offers for product
- PATCH `/api/trade-offers/{id}/status` - Accept/reject offer

### Notifications (5 endpoints)
- GET `/api/notifications` - Get notifications (with pagination)
- PATCH `/api/notifications/{id}/read` - Mark as read
- PATCH `/api/notifications/read-all` - Mark all as read
- DELETE `/api/notifications/{id}` - Delete notification
- DELETE `/api/notifications` - Delete all notifications

### Settings (3 endpoints)
- GET `/api/settings` - Get user settings
- PUT `/api/settings` - Update settings
- POST `/api/auth/change-password` - Change password

### Categories (1 endpoint)
- GET `/api/categories` - Get all categories (public, no auth)

### Profiles (2 endpoints)
- GET `/api/profiles/{id}` - Get profile by ID
- PUT `/api/profiles/{id}` - Update profile (own profile only)

**Total: 35+ endpoints**

---

## 🛠️ Technology Stack

### Backend (Your Responsibility)
- **Framework:** Spring Boot 3.x
- **Language:** Java 17+
- **Database:** MySQL 8.0+
- **ORM:** Spring Data JPA / Hibernate
- **Authentication:** JWT (io.jsonwebtoken:jjwt)
- **Security:** Spring Security
- **Build Tool:** Gradle 7.x
- **Password Hashing:** BCrypt
- **File Storage:** Local filesystem (`./uploads/`)

### Frontend (Already Complete)
- **Framework:** React 19.2.0
- **Build Tool:** Vite
- **Routing:** React Router DOM 7.9.6
- **Icons:** React Icons (FiXxx from react-icons/fi)
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Styling:** Plain CSS (no framework)

### Development Ports
- **Backend:** `http://localhost:8080`
- **Frontend:** `http://localhost:5173`
- **Database:** `localhost:3306`

---

## 📝 Important Notes

### 1. **Email Validation**
All users must register with **@cit.edu** email addresses only.

```java
@Pattern(regexp = "^[\\w.-]+@cit\\.edu$", message = "Must be a valid CIT-U email")
private String email;
```

### 2. **File Upload Limits**
- **Product Images:** Max 5 files, 5MB each, formats: JPG, PNG, WEBP
- **Trade Offer Images:** Max 1 file, 5MB, formats: JPG, PNG, WEBP

### 3. **Order Status Transitions**
Valid transitions only:
- `pending` → `confirmed` or `cancelled`
- `confirmed` → `processing` or `cancelled`
- `processing` → `ready` or `cancelled`
- `ready` → `completed`

Invalid transitions should return 400 Bad Request.

### 4. **Review Constraints**
- Rating must be between 1.0 and 5.0
- Users cannot review themselves
- One review per user per product (optional: can be enforced)

### 5. **Product Like Toggle**
POST `/api/products/{id}/like` should toggle:
- If user already liked → Unlike (delete from `product_likes`)
- If user hasn't liked → Like (insert into `product_likes`)

Return: `{ "liked": true/false, "like_count": 59 }`

### 6. **Pagination Standards**
- Default page size: 20
- Max page size: 100
- Page numbers start at 0
- Return Spring's `Page` object with `content`, `totalElements`, `totalPages`

### 7. **Current User Access**
Use `@CurrentUser UserPrincipal currentUser` annotation in controllers to get authenticated user info. Implement custom `UserPrincipal` and `@CurrentUser` annotation.

### 8. **Error Response Format**
All errors should return consistent format:
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
    }
  ],
  "path": "/api/auth/register"
}
```

---

## 🧪 Testing Strategy

### 1. **Unit Testing**
Test individual service methods:
```java
@Test
void testCreateProduct() {
    // Given
    ProductRequest request = new ProductRequest(...);
    
    // When
    ProductResponse response = productService.createProduct(request, sellerId);
    
    // Then
    assertNotNull(response.getProductId());
    assertEquals("iPhone 13", response.getName());
}
```

### 2. **Integration Testing with Postman**
- Import endpoints from `API_ENDPOINTS.md`
- Create Postman collection for each module
- Test success cases and error cases
- Save JWT token as environment variable

### 3. **End-to-End Testing with Frontend**
Follow `FRONTEND_INTEGRATION_CHECKLIST.md`:
1. Start backend: `./gradlew bootRun`
2. Start frontend: `npm run dev`
3. Set `DEV_MODE = false` in frontend
4. Go through entire user flow:
   - Register → Login → Browse products → Create listing → Send message → Place order → Submit review

---

## 🚀 Quick Start Guide

### Step 1: Clone & Setup
```bash
cd backend
./gradlew build
```

### Step 2: Create Database
```sql
CREATE DATABASE campusmart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Run SQL Scripts
Execute all CREATE TABLE and CREATE TRIGGER statements from `database/ERD_SCHEMA.md`

### Step 4: Configure Application
Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campusmart_db
spring.datasource.username=your_username
spring.datasource.password=your_password
jwt.secret=your_256_bit_secret_key
```

### Step 5: Update Dependencies
Update `build.gradle` with JWT, MySQL, JPA dependencies (see BACKEND_IMPLEMENTATION_GUIDE.md)

### Step 6: Start Building
Follow Phase 1-10 in "Your Mission" section above.

### Step 7: Test
```bash
# Start backend
./gradlew bootRun

# In another terminal, test endpoint
curl http://localhost:8080/api/hello
# Should return: {"message":"Hello from Backend API"}
```

---

## 📞 Support & Questions

**Frontend Developer:** Dan  
**Project Repository:** [GitHub Link if available]

**Documentation Files:**
1. `database/ERD_SCHEMA.md` - Database schema with SQL scripts
2. `database/API_ENDPOINTS.md` - Complete API specifications
3. `database/BACKEND_IMPLEMENTATION_GUIDE.md` - Implementation guide with code examples
4. `database/FRONTEND_INTEGRATION_CHECKLIST.md` - Integration testing checklist

**If you encounter issues:**
1. Check the relevant documentation file first
2. Review similar examples in the implementation guide
3. Test with Postman before integrating with frontend
4. Document any blockers or questions

---

## ✅ Definition of Done

The backend is considered complete when:

- [ ] All 35+ API endpoints are implemented and tested
- [ ] Database is created with all 12 tables and triggers
- [ ] JWT authentication is working
- [ ] File uploads (product images, trade offers) are working
- [ ] All CRUD operations are functional
- [ ] Frontend can successfully integrate (DEV_MODE = false works)
- [ ] All endpoints return data matching `API_ENDPOINTS.md` specifications
- [ ] Error handling is consistent across all endpoints
- [ ] Code is documented and follows Java best practices
- [ ] Postman collection is created for all endpoints
- [ ] Integration testing checklist is completed

---

## 🎯 Success Criteria

You'll know you're done when:

1. ✅ User can register and login from frontend
2. ✅ User can browse products with search/filter
3. ✅ User can create listings with image uploads
4. ✅ User can send messages to sellers
5. ✅ User can place orders
6. ✅ Seller can update order status
7. ✅ User can submit reviews and ratings
8. ✅ User can submit trade offers
9. ✅ Notifications are created and displayed
10. ✅ All settings can be updated
11. ✅ All TODO comments in frontend are replaced with working API calls
12. ✅ No console errors in browser or backend logs

---

## 📚 Additional Resources

### Spring Boot Documentation
- [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Data JPA](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Spring Security](https://docs.spring.io/spring-security/reference/index.html)

### JWT Resources
- [JWT.io](https://jwt.io/) - JWT debugger
- [JJWT Library](https://github.com/jwtk/jjwt) - Java JWT library

### Testing Tools
- [Postman](https://www.postman.com/) - API testing
- [MySQL Workbench](https://www.mysql.com/products/workbench/) - Database management

---

## 🎉 Final Words

You have everything you need to build this backend:

✅ **Complete database schema** with SQL scripts  
✅ **50+ fully documented API endpoints** with request/response examples  
✅ **Step-by-step implementation guide** with code samples  
✅ **Integration checklist** with testing procedures  
✅ **Working frontend** ready to integrate  

The frontend is polished, tested, and waiting for your backend. Take your time, follow the guides, test thoroughly, and you'll have a fully functional marketplace system.

**Estimated timeline:** 20-30 hours of focused development work.

**Good luck, and happy coding! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** November 30, 2025  
**Status:** Ready for Backend Development
