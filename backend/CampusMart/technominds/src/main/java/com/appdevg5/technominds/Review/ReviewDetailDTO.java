package com.appdevg5.technominds.Review;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for review with reviewer details.
 * Used to return review information along with reviewer profile data.
 */
public class ReviewDetailDTO {
    
    private Integer reviewId;
    private Integer reviewerId;
    private String reviewerFirstName;
    private String reviewerLastName;
    private Integer sellerId;
    private Integer productId;
    private String productName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    
    // Constructors
    public ReviewDetailDTO() {}
    
    public ReviewDetailDTO(Integer reviewId, Integer reviewerId, String reviewerFirstName, 
                          String reviewerLastName, Integer sellerId, Integer productId, 
                          String productName, Integer rating, String comment, LocalDateTime createdAt) {
        this.reviewId = reviewId;
        this.reviewerId = reviewerId;
        this.reviewerFirstName = reviewerFirstName;
        this.reviewerLastName = reviewerLastName;
        this.sellerId = sellerId;
        this.productId = productId;
        this.productName = productName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Integer getReviewId() {
        return reviewId;
    }
    
    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }
    
    public Integer getReviewerId() {
        return reviewerId;
    }
    
    public void setReviewerId(Integer reviewerId) {
        this.reviewerId = reviewerId;
    }
    
    public String getReviewerFirstName() {
        return reviewerFirstName;
    }
    
    public void setReviewerFirstName(String reviewerFirstName) {
        this.reviewerFirstName = reviewerFirstName;
    }
    
    public String getReviewerLastName() {
        return reviewerLastName;
    }
    
    public void setReviewerLastName(String reviewerLastName) {
        this.reviewerLastName = reviewerLastName;
    }
    
    public Integer getSellerId() {
        return sellerId;
    }
    
    public void setSellerId(Integer sellerId) {
        this.sellerId = sellerId;
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
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
