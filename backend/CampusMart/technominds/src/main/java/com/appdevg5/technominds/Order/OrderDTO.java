package com.appdevg5.technominds.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Order responses to avoid circular reference issues
 */
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

    // Constructors
    public OrderDTO() {}

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

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(Integer buyerId) {
        this.buyerId = buyerId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public void setBuyerName(String buyerName) {
        this.buyerName = buyerName;
    }

    public Integer getSellerId() {
        return sellerId;
    }

    public void setSellerId(Integer sellerId) {
        this.sellerId = sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public String getDeliveryNotes() {
        return deliveryNotes;
    }

    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
