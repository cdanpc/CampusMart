package com.appdevg5.technominds.Profile;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for seller profile information with aggregated statistics.
 * Used for seller profile page to return complete seller info in a single API call.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
