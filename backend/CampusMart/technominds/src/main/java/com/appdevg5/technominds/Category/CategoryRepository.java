package com.appdevg5.technominds.Category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Category entity.
 */
@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer> {

    /**
     * Find a category by its unique name.
     */
    Optional<CategoryEntity> findByName(String name);

    /**
     * Check existence by name.
     */
    boolean existsByName(String name);
}