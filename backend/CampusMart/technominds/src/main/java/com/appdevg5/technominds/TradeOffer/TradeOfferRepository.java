package com.appdevg5.technominds.TradeOffer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for TradeOffer entity.
 * Method names use nested property paths that match TradeOfferEntity fields.
 */
@Repository
public interface TradeOfferRepository extends JpaRepository<TradeOfferEntity, Integer> {

    /**
     * Find all offers received by a specific seller (product.seller.id = sellerId).
     */
    List<TradeOfferEntity> findByProduct_Seller_Id(Integer sellerId);

    /**
     * Find all offers made by a specific buyer/offerer (offerer.id = offererId).
     */
    List<TradeOfferEntity> findByOfferer_Id(Integer offererId);

    /**
     * Find all offers related to a specific product (product.id = productId).
     */
    List<TradeOfferEntity> findByProduct_Id(Integer productId);
}