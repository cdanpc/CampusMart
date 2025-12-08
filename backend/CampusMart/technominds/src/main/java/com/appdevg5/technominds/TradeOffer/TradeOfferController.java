package com.appdevg5.technominds.TradeOffer;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing trade offers.
 * Base URL: /api/tradeoffers
 */
@RestController
@RequestMapping("/api/tradeoffers")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class TradeOfferController {

    private final TradeOfferService tradeOfferService;

    public TradeOfferController(TradeOfferService tradeOfferService) {
        this.tradeOfferService = tradeOfferService;
    }

    // GET /api/tradeoffers
    @GetMapping
    public List<TradeOfferEntity> getAllTradeOffers() {
        return tradeOfferService.getAllTradeOffers();
    }

    // GET /api/tradeoffers/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TradeOfferEntity> getTradeOfferById(@PathVariable Integer id) {
        return tradeOfferService.getTradeOfferById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET /api/tradeoffers/seller/{sellerId} - Get offers received by a seller
    @GetMapping("/seller/{sellerId}")
    public List<TradeOfferEntity> getOffersBySeller(@PathVariable Integer sellerId) {
        return tradeOfferService.getOffersBySeller(sellerId);
    }

    // GET /api/tradeoffers/offerer/{offererId} - Get offers made by a specific offerer (buyer)
    @GetMapping("/offerer/{offererId}")
    public List<TradeOfferEntity> getOffersByOfferer(@PathVariable Integer offererId) {
        return tradeOfferService.getOffersByBuyer(offererId);
    }

    // GET /api/tradeoffers/product/{productId} - Get offers for a specific product
    @GetMapping("/product/{productId}")
    public List<TradeOfferEntity> getOffersByProduct(@PathVariable Integer productId) {
        return tradeOfferService.getOffersByProduct(productId);
    }

    // POST /api/tradeoffers - Create a new offer
    @PostMapping
    public ResponseEntity<TradeOfferEntity> createTradeOffer(@Valid @RequestBody TradeOfferEntity offer) {
        // Incoming JSON should contain nested id references, e.g.:
        // { "product": { "id": 5 }, "offerer": { "id": 1 }, "offeredPrice": 50.00, "tradeDescription": "..." }
        TradeOfferEntity newOffer = tradeOfferService.createTradeOffer(offer);
        return new ResponseEntity<>(newOffer, HttpStatus.CREATED);
    }

    // PATCH /api/tradeoffers/{id}/status - Update the status of an offer (e.g., ACCEPTED)
    @PatchMapping("/{id}/status")
    public ResponseEntity<TradeOfferEntity> updateOfferStatus(@PathVariable Integer id, @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }

        return tradeOfferService.updateTradeOfferStatus(id, newStatus)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /api/tradeoffers/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTradeOffer(@PathVariable Integer id) {
        tradeOfferService.deleteTradeOffer(id);
        return ResponseEntity.noContent().build();
    }
}