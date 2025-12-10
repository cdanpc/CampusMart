package com.appdevg5.technominds.Order;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Order with populated product and profile details
 * Used for frontend display to avoid sending entire entity graphs
 */
@Data
@NoArgsConstructor
public class OrderDetailDTO {
    
    // Order basic info
    private Integer orderId;
    private Integer quantity;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;
    private String pickupLocation;
    private String deliveryNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Product details
    private Integer productId;
    private String productName;
    private String productDescription;
    private BigDecimal productPrice;
    private String productImage;
    private String productCondition;
    private String productCategory;
    
    // Buyer details
    private Integer buyerProfileId;
    private String buyerFirstName;
    private String buyerLastName;
    private String buyerEmail;
    private String buyerPhone;
    
    // Seller details
    private Integer sellerProfileId;
    private String sellerFirstName;
    private String sellerLastName;
    private String sellerEmail;
    private String sellerPhone;
    
    // Review status
    private boolean hasReview;
    private Integer reviewId;
}
