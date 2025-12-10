package com.appdevg5.technominds.Review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for review with reviewer details.
 * Used to return review information along with reviewer profile data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
