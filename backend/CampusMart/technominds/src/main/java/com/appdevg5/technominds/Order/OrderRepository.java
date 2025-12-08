package com.appdevg5.technominds.Order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for Order entity.
 */
@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Integer> {

    /**
     * Finds all orders where the given profile is the buyer.
     * Uses nested property path to match OrderEntity.buyer.id
     */
    List<OrderEntity> findByBuyer_Id(Integer buyerId);

    /**
     * Finds all orders where the given profile is the seller.
     * Uses nested property path to match OrderEntity.seller.id
     */
    List<OrderEntity> findBySeller_Id(Integer sellerId);

    /**
     * Finds all orders that are associated with a given product id.
     * Matches OrderEntity.product.id
     */
    List<OrderEntity> findByProduct_Id(Integer productId);
}