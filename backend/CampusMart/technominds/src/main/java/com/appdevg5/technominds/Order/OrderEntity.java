package com.appdevg5.technominds.Order;

import com.appdevg5.technominds.Profile.ProfileEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity for the 'orders' table adjusted to match ERD column names:
 * orders: id, buyer_id, seller_id, total_amount, status, created_at, updated_at
 */
@Entity
@Table(name = "orders")
@NoArgsConstructor
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer id;

    // The buyer in the transaction
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_profile_id", nullable = false)
    @JsonIgnoreProperties({"orders", "products", "sentMessages", "receivedMessages", "tradeOffers", "reviews"})
    private ProfileEntity buyer;

    // The seller in the transaction
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_profile_id", nullable = false)
    @JsonIgnoreProperties({"orders", "products", "sentMessages", "receivedMessages", "tradeOffers", "reviews"})
    private ProfileEntity seller;

    // The product being ordered
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"seller", "orders", "reviews", "likes", "tradeOffers"})
    private com.appdevg5.technominds.Product.ProductEntity product;

    // Total amount for the order (matches ERD name 'total_amount')
    @DecimalMin(value = "0.00", inclusive = true)
    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // Quantity of items ordered
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    // Status can be pending, confirmed, processing, ready, completed, cancelled
    @NotNull
    @Column(name = "status", length = 50, nullable = false)
    private String status = "pending";

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "pickup_location", length = 255)
    private String pickupLocation;

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ProfileEntity getBuyer() {
        return buyer;
    }

    public void setBuyer(ProfileEntity buyer) {
        this.buyer = buyer;
    }

    public ProfileEntity getSeller() {
        return seller;
    }

    public void setSeller(ProfileEntity seller) {
        this.seller = seller;
    }

    public com.appdevg5.technominds.Product.ProductEntity getProduct() {
        return product;
    }

    public void setProduct(com.appdevg5.technominds.Product.ProductEntity product) {
        this.product = product;
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