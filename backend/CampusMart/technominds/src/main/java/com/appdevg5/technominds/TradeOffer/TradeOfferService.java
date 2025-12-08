package com.appdevg5.technominds.TradeOffer;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for managing TradeOffer-related business logic, including
 * creation, status updates, and retrieval.
 */
@Service
public class TradeOfferService {

    private final TradeOfferRepository tradeOfferRepository;
    // We would need ProfileService and ProductService here for robust validation

    public TradeOfferService(TradeOfferRepository tradeOfferRepository) {
        this.tradeOfferRepository = tradeOfferRepository;
    }

    // READ
    public List<TradeOfferEntity> getAllTradeOffers() {
        return tradeOfferRepository.findAll();
    }

    public Optional<TradeOfferEntity> getTradeOfferById(Integer id) {
        return tradeOfferRepository.findById(id);
    }

    // returns offers received by a seller (product.seller.id = sellerId)
    public List<TradeOfferEntity> getOffersBySeller(Integer sellerId) {
        return tradeOfferRepository.findByProduct_Seller_Id(sellerId);
    }

    // returns offers made by a buyer/offerer (offerer.id = buyerId)
    public List<TradeOfferEntity> getOffersByBuyer(Integer buyerId) {
        return tradeOfferRepository.findByOfferer_Id(buyerId);
    }

    // returns offers for a specific product (product.id = productId)
    public List<TradeOfferEntity> getOffersByProduct(Integer productId) {
        return tradeOfferRepository.findByProduct_Id(productId);
    }

    // CREATE
    @Transactional
    public TradeOfferEntity createTradeOffer(TradeOfferEntity offer) {
        // Minimal validation: ensure required associations exist
        if (offer == null) throw new IllegalArgumentException("Offer must not be null");
        if (offer.getProduct() == null) throw new IllegalArgumentException("Product reference is required");
        if (offer.getOfferer() == null) throw new IllegalArgumentException("Offerer (buyer) reference is required");

        // Normalize status and set default
        if (offer.getStatus() == null || offer.getStatus().trim().isEmpty()) {
            offer.setStatus("PENDING");
        } else {
            offer.setStatus(offer.getStatus().trim().toUpperCase());
        }

        // Ensure offeredPrice is non-null (business rule may differ)
        if (offer.getOfferedPrice() == null) {
            offer.setOfferedPrice(java.math.BigDecimal.ZERO);
        }

        return tradeOfferRepository.save(offer);
    }

    // UPDATE (Primarily for status changes: ACCEPTED/REJECTED/CANCELLED)
    @Transactional
    public Optional<TradeOfferEntity> updateTradeOfferStatus(Integer id, String newStatus) {
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("newStatus must be provided");
        }
        String normalized = newStatus.trim().toUpperCase();
        return tradeOfferRepository.findById(id).map(existingOffer -> {
            // Business Rule: Validate the transition may be added here
            existingOffer.setStatus(normalized);
            return tradeOfferRepository.save(existingOffer);
        });
    }

    // DELETE
    @Transactional
    public void deleteTradeOffer(Integer id) {
        tradeOfferRepository.deleteById(id);
    }
}