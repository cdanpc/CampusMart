package com.appdevg5.technominds.Product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductLikeRepository extends JpaRepository<ProductLikeEntity, Integer> {
    
    /**
     * Check if a user has already liked a product
     */
    boolean existsByProductIdAndProfileId(Integer productId, Integer profileId);
    
    /**
     * Find a like by product and profile
     */
    Optional<ProductLikeEntity> findByProductIdAndProfileId(Integer productId, Integer profileId);
    
    /**
     * Count total likes for a product
     */
    long countByProductId(Integer productId);
    
    /**
     * Delete all likes for a product (used when deleting a product)
     */
    void deleteByProductId(Integer productId);
}
