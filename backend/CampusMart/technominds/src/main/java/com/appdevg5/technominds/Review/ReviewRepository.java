package com.appdevg5.technominds.Review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for ReviewEntity.
 */
@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Integer> {

    /**
     * Finds all reviews received by a specific user (reviewee / seller).
     * Matches ReviewEntity.seller -> profiles.id
     */
    List<ReviewEntity> findBySeller_IdOrderByCreatedAtDesc(Integer sellerId);

    /**
     * Finds all reviews written by a specific user (reviewer).
     * Matches ReviewEntity.reviewer -> profiles.id
     */
    List<ReviewEntity> findByReviewer_IdOrderByCreatedAtDesc(Integer reviewerId);

    /**
     * Finds reviews for a specific product (optional relation).
     */
    List<ReviewEntity> findByProduct_IdOrderByCreatedAtDesc(Integer productId);
    
    /**
     * Finds review for a specific order.
     */
    List<ReviewEntity> findByOrder_Id(Integer orderId);
    
    /**
     * Finds all reviews received by a specific seller with pagination.
     */
    Page<ReviewEntity> findBySeller_Id(Integer sellerId, Pageable pageable);
    
    /**
     * Check if a review already exists for a buyer-seller-product combination.
     * Ensures one review per transaction.
     */
    boolean existsByReviewer_IdAndSeller_IdAndProduct_Id(Integer reviewerId, Integer sellerId, Integer productId);
    
    /**
     * Check if a seller-only review (no product) already exists for a buyer-seller combination.
     * Ensures one seller-only review per buyer-seller pair.
     */
    boolean existsByReviewer_IdAndSeller_IdAndProduct_IsNull(Integer reviewerId, Integer sellerId);
}