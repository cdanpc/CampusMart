package com.appdevg5.technominds.TradeOffer;

import com.appdevg5.technominds.Product.ProductEntity;
import com.appdevg5.technominds.Profile.ProfileEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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
@Getter
@Setter
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
}