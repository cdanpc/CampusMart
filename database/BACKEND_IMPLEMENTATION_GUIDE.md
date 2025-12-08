# Campus Mart - Backend Implementation Guide

**Version:** 1.0  
**Tech Stack:** Spring Boot 3.x, Java 17+, MySQL 8.x, JWT Authentication  
**Last Updated:** November 30, 2025

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Spring Boot Configuration](#spring-boot-configuration)
4. [Entity Models (JPA)](#entity-models-jpa)
5. [Repository Layer](#repository-layer)
6. [Service Layer](#service-layer)
7. [Controller Layer](#controller-layer)
8. [JWT Authentication Setup](#jwt-authentication-setup)
9. [File Upload Configuration](#file-upload-configuration)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Checklist](#deployment-checklist)

---

## 1. Prerequisites

### Required Software
- **Java JDK:** 17 or higher
- **Maven/Gradle:** Gradle 7.x (already in project)
- **MySQL:** 8.0 or higher
- **IDE:** IntelliJ IDEA, Eclipse, or VS Code with Java extensions
- **Postman/Insomnia:** For API testing

### Verify Setup
```bash
# Check Java version
java -version

# Check Gradle version
./gradlew --version

# Check MySQL version
mysql --version
```

---

## 2. Database Setup

### Step 1: Create Database
```sql
CREATE DATABASE campusmart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Create MySQL User (Optional but Recommended)
```sql
CREATE USER 'campusmart_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON campusmart_db.* TO 'campusmart_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Run Schema Scripts
Execute the SQL scripts from `database/ERD_SCHEMA.md` in this order:

```sql
USE campusmart_db;

-- 1. Create Tables (in dependency order)
CREATE TABLE users (...);
CREATE TABLE profiles (...);
CREATE TABLE categories (...);
CREATE TABLE products (...);
CREATE TABLE product_images (...);
CREATE TABLE orders (...);
CREATE TABLE messages (...);
CREATE TABLE reviews (...);
CREATE TABLE trade_offers (...);
CREATE TABLE notifications (...);
CREATE TABLE product_likes (...);
CREATE TABLE user_settings (...);

-- 2. Create Triggers
DELIMITER $$
CREATE TRIGGER after_like_insert ...
CREATE TRIGGER after_like_delete ...
CREATE TRIGGER after_review_insert ...
CREATE TRIGGER after_review_delete ...
DELIMITER ;

-- 3. Insert Sample Categories
INSERT INTO categories VALUES (...);
```

### Step 4: Verify Tables
```sql
SHOW TABLES;
DESCRIBE users;
DESCRIBE products;
```

---

## 3. Spring Boot Configuration

### Update `application.properties`

Located at: `backend/src/main/resources/application.properties`

```properties
# Application Info
spring.application.name=campusmart-backend
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/campusmart_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=campusmart_user
spring.datasource.password=your_secure_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=25MB
file.upload-dir=./uploads

# JWT Configuration
jwt.secret=your_jwt_secret_key_min_256_bits_replace_this_with_secure_random_string
jwt.expiration=86400000

# Logging
logging.level.com.campusmart=DEBUG
logging.level.org.springframework.web=INFO
```

**Important:** Replace `your_secure_password` and `jwt.secret` with secure values!

### Update `build.gradle`

Located at: `backend/build.gradle`

```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.campusmart'
version = '1.0.0'
sourceCompatibility = '17'

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    
    // MySQL Driver
    runtimeOnly 'com.mysql:mysql-connector-j'
    
    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
    
    // Lombok (optional but recommended)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

---

## 4. Entity Models (JPA)

Create entities in: `backend/src/main/java/com/campusmart/entity/`

### 4.1 User Entity
```java
package com.campusmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Profile profile;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 4.2 Profile Entity
```java
package com.campusmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;
    
    @Column(name = "phone_number", length = 15)
    private String phoneNumber;
    
    @Column(name = "instagram_handle", length = 50)
    private String instagramHandle;
    
    @Column(name = "academic_level", length = 50)
    private String academicLevel;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "seller_rating", precision = 3, scale = 2)
    private BigDecimal sellerRating = BigDecimal.ZERO;
    
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 4.3 Product Entity
```java
package com.campusmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_profile_id", nullable = false)
    private Profile seller;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "brand_type", length = 100)
    private String brandType;
    
    @Column(name = "product_condition", length = 50)
    private String condition;
    
    @Column(name = "contact_info", columnDefinition = "TEXT")
    private String contactInfo;
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
    
    @Column(name = "trade_only", nullable = false)
    private Boolean tradeOnly = false;
    
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;
    
    @Column(name = "like_count", nullable = false)
    private Integer likeCount = 0;
    
    @Column(nullable = false)
    private Integer stock = 1;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductImage> images;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 4.4 Order Entity
```java
package com.campusmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_profile_id", nullable = false)
    private Profile buyer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_profile_id", nullable = false)
    private Profile seller;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(nullable = false)
    private Integer quantity = 1;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;
    
    @Column(name = "pickup_location", columnDefinition = "TEXT")
    private String pickupLocation;
    
    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, READY, COMPLETED, CANCELLED
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Note:** Create similar entities for: `Category`, `ProductImage`, `Message`, `Review`, `TradeOffer`, `Notification`, `ProductLike`, `UserSettings`

---

## 5. Repository Layer

Create repositories in: `backend/src/main/java/com/campusmart/repository/`

### 5.1 User Repository
```java
package com.campusmart.repository;

import com.campusmart.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
}
```

### 5.2 Product Repository
```java
package com.campusmart.repository;

import com.campusmart.entity.Product;
import com.campusmart.entity.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Page<Product> findByIsAvailable(Boolean isAvailable, Pageable pageable);
    
    Page<Product> findByCategoryCategoryId(Long categoryId, Pageable pageable);
    
    Page<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
        String name, String description, Pageable pageable);
    
    Page<Product> findBySeller(Profile seller, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isAvailable = true ORDER BY p.createdAt DESC")
    Page<Product> findLatestProducts(Pageable pageable);
}
```

### 5.3 Order Repository
```java
package com.campusmart.repository;

import com.campusmart.entity.Order;
import com.campusmart.entity.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByBuyer(Profile buyer, Pageable pageable);
    Page<Order> findBySeller(Profile seller, Pageable pageable);
    Page<Order> findByBuyerAndStatus(Profile buyer, Order.OrderStatus status, Pageable pageable);
}
```

**Note:** Create similar repositories for all entities

---

## 6. Service Layer

Create services in: `backend/src/main/java/com/campusmart/service/`

### 6.1 Authentication Service
```java
package com.campusmart.service;

import com.campusmart.dto.LoginRequest;
import com.campusmart.dto.RegisterRequest;
import com.campusmart.dto.AuthResponse;
import com.campusmart.entity.User;
import com.campusmart.entity.Profile;
import com.campusmart.repository.UserRepository;
import com.campusmart.repository.ProfileRepository;
import com.campusmart.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);
        
        // Create profile
        Profile profile = new Profile();
        profile.setUser(user);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setInstagramHandle(request.getInstagramHandle());
        profile.setAcademicLevel(request.getAcademicLevel());
        profile = profileRepository.save(profile);
        
        // Generate token
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), profile.getProfileId());
        
        return new AuthResponse(token, user, profile);
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        Profile profile = user.getProfile();
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), profile.getProfileId());
        
        return new AuthResponse(token, user, profile);
    }
}
```

### 6.2 Product Service
```java
package com.campusmart.service;

import com.campusmart.dto.ProductRequest;
import com.campusmart.dto.ProductResponse;
import com.campusmart.entity.Product;
import com.campusmart.entity.Profile;
import com.campusmart.entity.Category;
import com.campusmart.repository.ProductRepository;
import com.campusmart.repository.ProfileRepository;
import com.campusmart.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final ProfileRepository profileRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findByIsAvailable(true, pageable)
            .map(this::toResponse);
    }
    
    @Transactional
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Increment view count
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);
        
        return toResponse(product);
    }
    
    @Transactional
    public ProductResponse createProduct(ProductRequest request, Long sellerProfileId) {
        Profile seller = profileRepository.findById(sellerProfileId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        Product product = new Product();
        product.setSeller(seller);
        product.setCategory(category);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setBrandType(request.getBrandType());
        product.setCondition(request.getCondition());
        product.setContactInfo(request.getContactInfo());
        product.setTradeOnly(request.getTradeOnly());
        product.setStock(request.getStock());
        
        product = productRepository.save(product);
        
        // Handle image uploads
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            fileStorageService.saveProductImages(product, request.getImages());
        }
        
        return toResponse(product);
    }
    
    private ProductResponse toResponse(Product product) {
        // Map entity to DTO
        return new ProductResponse(product);
    }
}
```

---

## 7. Controller Layer

Create controllers in: `backend/src/main/java/com/campusmart/controller/`

### 7.1 Authentication Controller
```java
package com.campusmart.controller;

import com.campusmart.dto.LoginRequest;
import com.campusmart.dto.RegisterRequest;
import com.campusmart.dto.AuthResponse;
import com.campusmart.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        // Get current user from SecurityContext
        UserResponse user = authService.getCurrentUser();
        return ResponseEntity.ok(user);
    }
}
```

### 7.2 Product Controller
```java
package com.campusmart.controller;

import com.campusmart.dto.ProductRequest;
import com.campusmart.dto.ProductResponse;
import com.campusmart.service.ProductService;
import com.campusmart.security.CurrentUser;
import com.campusmart.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(Pageable pageable) {
        Page<ProductResponse> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long productId) {
        ProductResponse product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }
    
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
        @ModelAttribute ProductRequest request,
        @CurrentUser UserPrincipal currentUser
    ) {
        ProductResponse product = productService.createProduct(request, currentUser.getProfileId());
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }
}
```

---

## 8. JWT Authentication Setup

### 8.1 JWT Utility Class
```java
package com.campusmart.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String generateToken(Long userId, String email, Long profileId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        
        return Jwts.builder()
            .setSubject(userId.toString())
            .claim("email", email)
            .claim("profileId", profileId)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey())
            .compact();
    }
    
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
        
        return Long.parseLong(claims.getSubject());
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### 8.2 Security Configuration
```java
package com.campusmart.config;

import com.campusmart.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors()
            .and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests()
            .requestMatchers("/api/auth/**", "/api/categories/**").permitAll()
            .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
```

---

## 9. File Upload Configuration

### 9.1 File Storage Service
```java
package com.campusmart.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    public String saveFile(MultipartFile file, String subDir) throws IOException {
        // Create directory if not exists
        Path uploadPath = Paths.get(uploadDir, subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);
        
        return "/" + subDir + "/" + newFilename;
    }
}
```

### 9.2 Static Resource Configuration
```java
package com.campusmart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${file.upload-dir}")
    private String uploadDir;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + uploadDir + "/");
    }
}
```

---

## 10. Testing Strategy

### 10.1 Unit Testing
```java
@SpringBootTest
@AutoConfigureMockMvc
class ProductServiceTest {
    
    @Autowired
    private ProductService productService;
    
    @MockBean
    private ProductRepository productRepository;
    
    @Test
    void testCreateProduct() {
        // Test implementation
    }
}
```

### 10.2 Integration Testing with Postman
1. Import API endpoints from `API_ENDPOINTS.md`
2. Test authentication flow first
3. Test CRUD operations for each entity
4. Test file uploads
5. Test error responses

---

## 11. Deployment Checklist

- [ ] Update `jwt.secret` with secure random string (min 256 bits)
- [ ] Update database password
- [ ] Set `spring.jpa.show-sql=false` in production
- [ ] Configure CORS for production frontend URL
- [ ] Set up file upload directory with proper permissions
- [ ] Configure email service (if using notifications)
- [ ] Set up SSL/HTTPS
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Create database backups
- [ ] Test all endpoints with frontend (DEV_MODE = false)

---

**Next Steps:**
1. Start with Authentication endpoints
2. Move to Products (core functionality)
3. Implement remaining endpoints
4. Test with Postman
5. Integrate with frontend
6. Deploy!

**Good luck with implementation! 🚀**
