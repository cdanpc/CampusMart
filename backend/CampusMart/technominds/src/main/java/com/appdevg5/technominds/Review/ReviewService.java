package com.appdevg5.technominds.Review;

import com.appdevg5.technominds.Order.OrderEntity;
import com.appdevg5.technominds.Order.OrderRepository;
import com.appdevg5.technominds.Profile.ProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for managing Review-related business logic.
 */
@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProfileRepository profileRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository, ProfileRepository profileRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.profileRepository = profileRepository;
        this.orderRepository = orderRepository;
    }

    // READ
    public Optional<ReviewEntity> getReviewById(Integer id) {
        return reviewRepository.findById(id);
    }

    // Reviews received by a seller (previously called reviewee)
    public List<ReviewEntity> getReviewsBySellerId(Integer sellerId) {
        return reviewRepository.findBySeller_IdOrderByCreatedAtDesc(sellerId);
    }

    // Reviews written by a specific reviewer
    public List<ReviewEntity> getReviewsByReviewerId(Integer reviewerId) {
        return reviewRepository.findByReviewer_IdOrderByCreatedAtDesc(reviewerId);
    }

    // Reviews for a specific product (optional relation)
    public List<ReviewEntity> getReviewsByProductId(Integer productId) {
        return reviewRepository.findByProduct_IdOrderByCreatedAtDesc(productId);
    }

    // CREATE
    @Transactional
    public ReviewEntity createReview(ReviewEntity review) {
        // *** IMPORTANT BUSINESS LOGIC NOTE ***
        // 1. Verify that the Order linked (if any) is in a 'COMPLETED' state.
        // 2. Verify reviewer and seller relationship against the order.
        // 3. The DB unique constraint should prevent duplicate reviews for the same order.
        return reviewRepository.save(review);
    }

    // CREATE with validation
    @Transactional
    public ReviewEntity createReviewWithValidation(ReviewEntity review) {
        // Validation 1: If order is provided, verify it exists and is completed
        if (review.getOrder() != null) {
            Integer orderId = review.getOrder().getId();
            Optional<OrderEntity> orderOpt = orderRepository.findById(orderId);
            
            if (orderOpt.isEmpty()) {
                throw new IllegalArgumentException("Order not found with ID: " + orderId);
            }
            
            OrderEntity order = orderOpt.get();
            
            // Check if order is completed
            if (!"completed".equalsIgnoreCase(order.getStatus())) {
                throw new IllegalArgumentException("Reviews can only be submitted for completed orders. Current status: " + order.getStatus());
            }
            
            // Validation 2: Check if review already exists for this order
            List<ReviewEntity> existingReviews = reviewRepository.findByOrder_Id(orderId);
            if (!existingReviews.isEmpty()) {
                throw new IllegalArgumentException("A review already exists for this order");
            }
            
            // Validation 3: Verify reviewer is the buyer of the order
            if (!order.getBuyer().getId().equals(review.getReviewer().getId())) {
                throw new IllegalArgumentException("Only the buyer of the order can submit a review");
            }
            
            // Validation 4: Verify seller matches the order
            if (!order.getSeller().getId().equals(review.getSeller().getId())) {
                throw new IllegalArgumentException("Seller mismatch with order");
            }
        }
        
        // Save the review
        ReviewEntity savedReview = reviewRepository.save(review);
        
        // Auto-update seller's rating
        updateSellerRating(review.getSeller().getId());
        
        return savedReview;
    }

    // READ all reviews by sellerId (reviews this seller received)
    public List<ReviewEntity> getReviewsBySeller(Integer sellerId) {
        return reviewRepository.findBySeller_IdOrderByCreatedAtDesc(sellerId);
    }

    // READ all reviews written by this reviewer
    public List<ReviewEntity> getReviewsWritten(Integer reviewerId) {
        return reviewRepository.findByReviewer_IdOrderByCreatedAtDesc(reviewerId);
    }

    // UPDATE
    @Transactional
    public Optional<ReviewEntity> updateReview(Integer id, ReviewEntity reviewDetails) {
        return reviewRepository.findById(id).map(existingReview -> {
            // Only allow updating comment and rating
            existingReview.setRating(reviewDetails.getRating());
            existingReview.setComment(reviewDetails.getComment());
            return reviewRepository.save(existingReview);
        });
    }

    // DELETE
    @Transactional
    public void deleteReview(Integer id) {
        reviewRepository.deleteById(id);
    }
    
    /**
     * Get detailed reviews for a seller with reviewer information and pagination.
     * @param sellerId The seller's profile ID
     * @param page Page number (0-indexed)
     * @param size Number of reviews per page
     * @param sortBy Sort field (recent, highest, lowest)
     * @return Page of ReviewDetailDTO with reviewer details
     */
    @Transactional(readOnly = true)
    public Page<ReviewDetailDTO> getDetailedReviewsBySeller(Integer sellerId, int page, int size, String sortBy) {
        Sort sort;
        switch (sortBy) {
            case "highest":
                sort = Sort.by(Sort.Direction.DESC, "rating").and(Sort.by(Sort.Direction.DESC, "createdAt"));
                break;
            case "lowest":
                sort = Sort.by(Sort.Direction.ASC, "rating").and(Sort.by(Sort.Direction.DESC, "createdAt"));
                break;
            case "recent":
            default:
                sort = Sort.by(Sort.Direction.DESC, "createdAt");
                break;
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ReviewEntity> reviewsPage = reviewRepository.findBySeller_Id(sellerId, pageable);
        
        return reviewsPage.map(review -> {
            // Force lazy loading of relationships
            review.getReviewer().getId();
            review.getSeller().getId();
            if (review.getProduct() != null) {
                review.getProduct().getId();
            }
            
            return new ReviewDetailDTO(
                review.getId(),
                review.getReviewer().getId(),
                review.getReviewer().getFirstName(),
                review.getReviewer().getLastName(),
                review.getSeller().getId(),
                review.getProduct() != null ? review.getProduct().getId() : null,
                review.getProduct() != null ? review.getProduct().getName() : null,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
            );
        });
    }
    
    /**
     * Calculate and update seller's average rating and total review count.
     */
    private void updateSellerRating(Integer sellerId) {
        List<ReviewEntity> allReviews = reviewRepository.findBySeller_IdOrderByCreatedAtDesc(sellerId);
        
        if (allReviews.isEmpty()) {
            // No reviews, set to 0
            profileRepository.findById(sellerId).ifPresent(profile -> {
                profile.setSellerRating(BigDecimal.ZERO);
                profile.setTotalReviews(0);
                profileRepository.save(profile);
            });
        } else {
            // Calculate average rating
            double average = allReviews.stream()
                .mapToInt(ReviewEntity::getRating)
                .average()
                .orElse(0.0);
            
            BigDecimal avgRating = BigDecimal.valueOf(average)
                .setScale(2, RoundingMode.HALF_UP);
            
            profileRepository.findById(sellerId).ifPresent(profile -> {
                profile.setSellerRating(avgRating);
                profile.setTotalReviews(allReviews.size());
                profileRepository.save(profile);
            });
        }
    }
}