package com.appdevg5.technominds.Product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for ProductEntity adjusted to match entity field names.
 */
@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Integer> {

    /**
     * Finds all products listed by a specific seller ID (nested property).
     */
    List<ProductEntity> findBySeller_Id(Integer sellerId);

    /**
     * Finds products whose name or description contains the search term (case-insensitive).
     */
    List<ProductEntity> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    /**
     * Finds all products belonging to a specific category id.
     */
    List<ProductEntity> findByCategory_Id(Integer categoryId);

    /**
     * Finds all products that are currently available.
     */
    List<ProductEntity> findByIsAvailableTrue();
    
    /**
     * Finds products by seller ID where is_available is true.
     */
    List<ProductEntity> findBySeller_IdAndIsAvailableTrue(Integer sellerId);
}