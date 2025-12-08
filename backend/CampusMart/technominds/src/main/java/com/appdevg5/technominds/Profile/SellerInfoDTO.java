package com.appdevg5.technominds.Profile;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for seller profile information with aggregated statistics.
 * Used for seller profile page to return complete seller info in a single API call.
 */
public class SellerInfoDTO {
    
    private Integer profileId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String instagramHandle;
    private LocalDateTime createdAt;
    private BigDecimal sellerRating;
    private Integer totalReviews;
    private Integer totalListings;
    private Integer availableListings;
    
    // Constructors
    public SellerInfoDTO() {}
    
    public SellerInfoDTO(Integer profileId, String firstName, String lastName, String email, 
                         String phoneNumber, String instagramHandle, LocalDateTime createdAt,
                         BigDecimal sellerRating, Integer totalReviews, Integer totalListings, 
                         Integer availableListings) {
        this.profileId = profileId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.instagramHandle = instagramHandle;
        this.createdAt = createdAt;
        this.sellerRating = sellerRating;
        this.totalReviews = totalReviews;
        this.totalListings = totalListings;
        this.availableListings = availableListings;
    }
    
    // Getters and Setters
    public Integer getProfileId() {
        return profileId;
    }
    
    public void setProfileId(Integer profileId) {
        this.profileId = profileId;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getInstagramHandle() {
        return instagramHandle;
    }
    
    public void setInstagramHandle(String instagramHandle) {
        this.instagramHandle = instagramHandle;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public BigDecimal getSellerRating() {
        return sellerRating;
    }
    
    public void setSellerRating(BigDecimal sellerRating) {
        this.sellerRating = sellerRating;
    }
    
    public Integer getTotalReviews() {
        return totalReviews;
    }
    
    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }
    
    public Integer getTotalListings() {
        return totalListings;
    }
    
    public void setTotalListings(Integer totalListings) {
        this.totalListings = totalListings;
    }
    
    public Integer getAvailableListings() {
        return availableListings;
    }
    
    public void setAvailableListings(Integer availableListings) {
        this.availableListings = availableListings;
    }
}
