package com.appdevg5.technominds.TradeOffer;

import com.appdevg5.technominds.Product.ProductEntity;
import com.appdevg5.technominds.Profile.ProfileEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity for the 'trade_offers' table.
 * Represents an offer made by a buyer (offerer) on a specific product.
 */
@Entity
@Table(name = "trade_offers")
@NoArgsConstructor
public class TradeOfferEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // The product this offer is for
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    // The user making the offer (buyer)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offerer_id", nullable = false)
    private ProfileEntity offerer;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    @Column(name = "offered_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal offeredPrice;

    @Column(name = "trade_description", columnDefinition = "TEXT")
    private String tradeDescription;

    // Trade item details
    @Column(name = "item_name", length = 255)
    private String itemName;

    @Column(name = "item_estimated_value", precision = 10, scale = 2)
    private BigDecimal itemEstimatedValue;

    @Column(name = "item_condition", length = 50)
    private String itemCondition;

    @Column(name = "item_image_url", length = 500)
    private String itemImageUrl;

    @Column(name = "cash_component", precision = 10, scale = 2)
    private BigDecimal cashComponent;

    // Status can be PENDING, ACCEPTED, REJECTED, WITHDRAWN
    @NotBlank
    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ProductEntity getProduct() {
        return product;
    }

    public void setProduct(ProductEntity product) {
        this.product = product;
    }

    public ProfileEntity getOfferer() {
        return offerer;
    }

    public void setOfferer(ProfileEntity offerer) {
        this.offerer = offerer;
    }

    public BigDecimal getOfferedPrice() {
        return offeredPrice;
    }

    public void setOfferedPrice(BigDecimal offeredPrice) {
        this.offeredPrice = offeredPrice;
    }

    public String getTradeDescription() {
        return tradeDescription;
    }

    public void setTradeDescription(String tradeDescription) {
        this.tradeDescription = tradeDescription;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public BigDecimal getItemEstimatedValue() {
        return itemEstimatedValue;
    }

    public void setItemEstimatedValue(BigDecimal itemEstimatedValue) {
        this.itemEstimatedValue = itemEstimatedValue;
    }

    public String getItemCondition() {
        return itemCondition;
    }

    public void setItemCondition(String itemCondition) {
        this.itemCondition = itemCondition;
    }

    public String getItemImageUrl() {
        return itemImageUrl;
    }

    public void setItemImageUrl(String itemImageUrl) {
        this.itemImageUrl = itemImageUrl;
    }

    public BigDecimal getCashComponent() {
        return cashComponent;
    }

    public void setCashComponent(BigDecimal cashComponent) {
        this.cashComponent = cashComponent;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // createdAt is managed by Hibernate; setter provided for completeness
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // updatedAt is managed by Hibernate; setter provided for completeness
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}