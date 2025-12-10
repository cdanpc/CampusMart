package com.appdevg5.technominds.Order;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Order responses to avoid circular reference issues
 */
@Data
@NoArgsConstructor
public class OrderDTO {
    private Integer id;
    private Integer buyerId;
    private String buyerName;
    private Integer sellerId;
    private String sellerName;
    private Integer productId;
    private String productName;
    private BigDecimal totalAmount;
    private Integer quantity;
    private String status;
    private String paymentMethod;
    private String pickupLocation;
    private String deliveryNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderDTO(OrderEntity order) {
        this.id = order.getId();
        this.buyerId = order.getBuyer() != null ? order.getBuyer().getId() : null;
        this.buyerName = order.getBuyer() != null ? 
            order.getBuyer().getFirstName() + " " + order.getBuyer().getLastName() : null;
        this.sellerId = order.getSeller() != null ? order.getSeller().getId() : null;
        this.sellerName = order.getSeller() != null ? 
            order.getSeller().getFirstName() + " " + order.getSeller().getLastName() : null;
        this.productId = order.getProduct() != null ? order.getProduct().getId() : null;
        this.productName = order.getProduct() != null ? order.getProduct().getName() : null;
        this.totalAmount = order.getTotalAmount();
        this.quantity = order.getQuantity();
        this.status = order.getStatus();
        this.paymentMethod = order.getPaymentMethod();
        this.pickupLocation = order.getPickupLocation();
        this.deliveryNotes = order.getDeliveryNotes();
        this.createdAt = order.getCreatedAt();
        this.updatedAt = order.getUpdatedAt();
    }
}
