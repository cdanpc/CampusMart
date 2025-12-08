package com.appdevg5.technominds.Review;

import com.appdevg5.technominds.Order.OrderEntity;
import com.appdevg5.technominds.Product.ProductEntity;
import com.appdevg5.technominds.Profile.ProfileEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Entity for the 'reviews' table aligned with ERD column names:
 * reviews: id, reviewer_id, seller_id, product_id, order_id, rating, comment, created_at
 */
@Entity
@Table(name = "reviews")
@NoArgsConstructor
public class ReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // reviewer_id -> profiles.id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private ProfileEntity reviewer;

    // seller_id -> profiles.id (the user being reviewed)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private ProfileEntity seller;

    // product_id -> products.id (optional - review can be seller-level or product-level)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    // order_id -> orders.order_id (links review to specific order, prevents duplicate reviews)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private OrderEntity order;

    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "rating", nullable = false)
    private Integer rating; // 1 to 5

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

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

    public ProfileEntity getReviewer() {
        return reviewer;
    }

    public void setReviewer(ProfileEntity reviewer) {
        this.reviewer = reviewer;
    }

    public ProfileEntity getSeller() {
        return seller;
    }

    public void setSeller(ProfileEntity seller) {
        this.seller = seller;
    }

    public ProductEntity getProduct() {
        return product;
    }

    public void setProduct(ProductEntity product) {
        this.product = product;
    }

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
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