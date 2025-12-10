package com.appdevg5.technominds.Review;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for managing user reviews and ratings.
 * Base URL: /api/reviews
 */
@Slf4j
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // GET /api/reviews/user/{sellerId} - Get all reviews received by a user (seller)
    @GetMapping("/user/{sellerId}")
    public List<ReviewEntity> getReviewsReceived(@PathVariable Integer sellerId) {
        return reviewService.getReviewsBySellerId(sellerId);
    }
    
    // GET /api/reviews/seller/{sellerId}/detailed - Get paginated detailed reviews with reviewer info
    @GetMapping("/seller/{sellerId}/detailed")
    public ResponseEntity<Page<ReviewDetailDTO>> getDetailedReviews(
            @PathVariable Integer sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "recent") String sortBy) {
        Page<ReviewDetailDTO> reviews = reviewService.getDetailedReviewsBySeller(sellerId, page, size, sortBy);
        return ResponseEntity.ok(reviews);
    }

    // GET /api/reviews/written/{reviewerId} - Get all reviews written by a user
    @GetMapping("/written/{reviewerId}")
    public List<ReviewEntity> getReviewsWritten(@PathVariable Integer reviewerId) {
        return reviewService.getReviewsByReviewerId(reviewerId);
    }

    // GET /api/reviews/product/{productId} - Get all reviews for a specific product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewEntity>> getReviewsByProduct(@PathVariable Integer productId) {
        try {
            List<ReviewEntity> reviews = reviewService.getReviewsByProductId(productId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            log.error("Error fetching reviews for product {}: {}", productId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET /api/reviews/{id} - Get a specific review
    @GetMapping("/{id}")
    public ResponseEntity<ReviewEntity> getReviewById(@PathVariable Integer id) {
        return reviewService.getReviewById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /api/reviews - Create a new review
    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewEntity review) {
        try {
            log.debug("Received review creation request: reviewerId={}, sellerId={}, productId={}, orderId={}, rating={}",
                    review.getReviewer() != null ? review.getReviewer().getId() : null,
                    review.getSeller() != null ? review.getSeller().getId() : null,
                    review.getProduct() != null ? review.getProduct().getId() : null,
                    review.getOrder() != null ? review.getOrder().getId() : null,
                    review.getRating());
            
            ReviewEntity newReview = reviewService.createReviewWithValidation(review);
            return new ResponseEntity<>(newReview, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error creating review: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of(
                            "message", e.getMessage(),
                            "timestamp", java.time.LocalDateTime.now().toString()
                    ));
        } catch (Exception e) {
            log.error("Unexpected error creating review: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of(
                            "message", "Failed to create review: " + e.getMessage(),
                            "timestamp", java.time.LocalDateTime.now().toString()
                    ));
        }
    }

    // PUT /api/reviews/{id} - Update an existing review (rating or comment)
    @PutMapping("/{id}")
    public ResponseEntity<ReviewEntity> updateReview(@PathVariable Integer id, @Valid @RequestBody ReviewEntity reviewDetails) {
        return reviewService.updateReview(id, reviewDetails)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Integer id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}