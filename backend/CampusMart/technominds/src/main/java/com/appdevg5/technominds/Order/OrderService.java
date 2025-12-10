package com.appdevg5.technominds.Order;

import com.appdevg5.technominds.Product.ProductEntity;
import com.appdevg5.technominds.Product.ProductRepository;
import com.appdevg5.technominds.Profile.ProfileEntity;
import com.appdevg5.technominds.Profile.ProfileRepository;
import com.appdevg5.technominds.Review.ReviewRepository;
import com.appdevg5.technominds.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for managing Order-related business logic.
 */
@Slf4j
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProfileRepository profileRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final ReviewRepository reviewRepository;

    public OrderService(OrderRepository orderRepository, 
                       ProfileRepository profileRepository,
                       ProductRepository productRepository,
                       NotificationService notificationService,
                       ReviewRepository reviewRepository) {
        this.orderRepository = orderRepository;
        this.profileRepository = profileRepository;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
        this.reviewRepository = reviewRepository;
    }

    // READ
    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<OrderEntity> getOrderById(Integer id) {
        Optional<OrderEntity> order = orderRepository.findById(id);
        // Force lazy loading of related entities
        order.ifPresent(o -> {
            o.getBuyer().getId(); // Trigger lazy load
            o.getSeller().getId(); // Trigger lazy load
            o.getProduct().getId(); // Trigger lazy load
        });
        return order;
    }

    @Transactional(readOnly = true)
    public List<OrderEntity> getOrdersByBuyer(Integer buyerId) {
        // Use repository method that matches nested property path: buyer.id
        List<OrderEntity> orders = orderRepository.findByBuyer_Id(buyerId);
        // Force lazy loading
        orders.forEach(o -> {
            o.getSeller().getId();
            o.getProduct().getId();
        });
        return orders;
    }

    @Transactional(readOnly = true)
    public List<OrderEntity> getOrdersBySeller(Integer sellerId) {
        // Use repository method that matches nested property path: seller.id
        List<OrderEntity> orders = orderRepository.findBySeller_Id(sellerId);
        // Force lazy loading
        orders.forEach(o -> {
            o.getBuyer().getId();
            o.getProduct().getId();
        });
        return orders;
    }

    /**
     * Convenience read: find orders by associated product id.
     */
    @Transactional(readOnly = true)
    public List<OrderEntity> getOrdersByProduct(Integer productId) {
        List<OrderEntity> orders = orderRepository.findByProduct_Id(productId);
        // Force lazy loading
        orders.forEach(o -> {
            o.getBuyer().getId();
            o.getSeller().getId();
        });
        return orders;
    }

    // CREATE
    @Transactional
    public OrderEntity createOrder(OrderEntity order) {
        log.debug("Starting order creation");
        
        // Validate buyer exists
        if (order.getBuyer() == null || order.getBuyer().getId() == null) {
            log.warn("Validation failed: Buyer is null or missing ID");
            throw new IllegalArgumentException("Buyer is required");
        }
        
        // Validate seller exists
        if (order.getSeller() == null || order.getSeller().getId() == null) {
            log.warn("Validation failed: Seller is null or missing ID");
            throw new IllegalArgumentException("Seller is required");
        }
        
        // Validate product exists
        if (order.getProduct() == null || order.getProduct().getId() == null) {
            log.warn("Validation failed: Product is null or missing ID");
            throw new IllegalArgumentException("Product is required");
        }
        
        log.debug("Basic validation passed");
        
        // Prevent buying your own product
        if (order.getBuyer().getId().equals(order.getSeller().getId())) {
            log.warn("Validation failed: Buyer and seller are the same");
            throw new IllegalArgumentException("You cannot buy your own product");
        }
        
        log.debug("Loading entities from database");
        
        // Load actual entities from database
        ProfileEntity buyer = profileRepository.findById(order.getBuyer().getId())
                .orElseThrow(() -> {
                    log.warn("Buyer not found with ID: {}", order.getBuyer().getId());
                    return new IllegalArgumentException("Buyer not found");
                });
        log.debug("Buyer loaded: {} {}", buyer.getFirstName(), buyer.getLastName());
        
        ProfileEntity seller = profileRepository.findById(order.getSeller().getId())
                .orElseThrow(() -> {
                    log.warn("Seller not found with ID: {}", order.getSeller().getId());
                    return new IllegalArgumentException("Seller not found");
                });
        log.debug("Seller loaded: {} {}", seller.getFirstName(), seller.getLastName());
        
        ProductEntity product = productRepository.findById(order.getProduct().getId())
                .orElseThrow(() -> {
                    log.warn("Product not found with ID: {}", order.getProduct().getId());
                    return new IllegalArgumentException("Product not found");
                });
        log.debug("Product loaded: {}", product.getName());
        
        // Verify product seller matches order seller
        if (!product.getSeller().getId().equals(seller.getId())) {
            log.warn("Seller mismatch: Product seller ID {} != Order seller ID {}", product.getSeller().getId(), seller.getId());
            throw new IllegalArgumentException("Product does not belong to the specified seller");
        }
        log.debug("Seller verification passed");
        
        // Check if product has stock
        if (product.getStock() != null && product.getStock() < order.getQuantity()) {
            log.warn("Insufficient stock: Available={}, Requested={}", product.getStock(), order.getQuantity());
            throw new IllegalArgumentException("Insufficient stock available");
        }
        log.debug("Stock check passed");
        
        // Set the loaded entities
        order.setBuyer(buyer);
        order.setSeller(seller);
        order.setProduct(product);
        
        // Initialize status if not set
        if (order.getStatus() == null || order.getStatus().isEmpty()) {
            order.setStatus("pending");
        }
        log.debug("Order status set to: {}", order.getStatus());
        
        // Save the order
        log.debug("Saving order to database");
        OrderEntity savedOrder = orderRepository.save(order);
        log.info("Order saved successfully with ID: {}", savedOrder.getId());
        
        // Optionally: Decrease product stock
        if (product.getStock() != null) {
            product.setStock(product.getStock() - order.getQuantity());
            productRepository.save(product);
        }
        
        // Create notification for seller
        try {
            String buyerName = buyer.getFirstName() + " " + buyer.getLastName();
            notificationService.notifyOrderPlaced(
                seller.getId(), 
                savedOrder.getId().longValue(), 
                product.getName(), 
                buyerName
            );
        } catch (Exception e) {
            // Log error but don't fail the order creation
            log.error("Failed to create notification: {}", e.getMessage(), e);
        }
        
        return savedOrder;
    }

    // UPDATE (Primarily for status changes: e.g., to completed)
    @Transactional
    public Optional<OrderEntity> updateOrderStatus(Integer id, String newStatus) {
        return orderRepository.findById(id).map(existingOrder -> {
            String oldStatus = existingOrder.getStatus();
            // Business Rule: Validate the transition logic (e.g., pending -> confirmed -> processing -> ready -> completed)
            existingOrder.setStatus(newStatus);
            OrderEntity updatedOrder = orderRepository.save(existingOrder);
            
            // Create notification based on status change
            try {
                ProfileEntity buyer = existingOrder.getBuyer();
                ProfileEntity seller = existingOrder.getSeller();
                ProductEntity product = existingOrder.getProduct();
                
                // Notify buyer when order is confirmed by seller
                if ("confirmed".equalsIgnoreCase(newStatus) && !"confirmed".equalsIgnoreCase(oldStatus)) {
                    notificationService.notifyOrderConfirmed(
                        buyer.getId(),
                        existingOrder.getId().longValue(),
                        product.getName()
                    );
                }
                
                // Notify buyer when order is ready for pickup
                if ("ready_for_pickup".equalsIgnoreCase(newStatus) && !"ready_for_pickup".equalsIgnoreCase(oldStatus)) {
                    String pickupLocation = existingOrder.getPickupLocation() != null 
                        ? existingOrder.getPickupLocation() 
                        : "the designated location";
                    notificationService.notifyOrderReadyForPickup(
                        buyer.getId(),
                        existingOrder.getId().longValue(),
                        product.getName(),
                        pickupLocation
                    );
                }
                
                // Notify buyer when order is completed
                if ("completed".equalsIgnoreCase(newStatus) && !"completed".equalsIgnoreCase(oldStatus)) {
                    notificationService.notifyOrderCompleted(
                        buyer.getId(),
                        existingOrder.getId().longValue(),
                        product.getName()
                    );
                }
                
                // Notify both parties when order is cancelled
                if ("cancelled".equalsIgnoreCase(newStatus) && !"cancelled".equalsIgnoreCase(oldStatus)) {
                    notificationService.notifyOrderCancelled(
                        buyer.getId(),
                        existingOrder.getId().longValue(),
                        product.getName(),
                        "Order cancelled"
                    );
                    notificationService.notifyOrderCancelled(
                        seller.getId(),
                        existingOrder.getId().longValue(),
                        product.getName(),
                        "Order cancelled"
                    );
                }
            } catch (Exception e) {
                // Log error but don't fail the status update
                log.error("Failed to create notification: {}", e.getMessage(), e);
            }
            
            return updatedOrder;
        });
    }

    // DELETE
    @Transactional
    public void deleteOrder(Integer id) {
        orderRepository.deleteById(id);
    }

    // Convert OrderEntity to OrderDetailDTO with populated fields
    private OrderDetailDTO convertToDetailDTO(OrderEntity order) {
        OrderDetailDTO dto = new OrderDetailDTO();
        
        // Order basic info
        dto.setOrderId(order.getId());
        dto.setQuantity(order.getQuantity());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPickupLocation(order.getPickupLocation());
        dto.setDeliveryNotes(order.getDeliveryNotes());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        
        // Product details - Force initialization of lazy-loaded entity
        ProductEntity product = order.getProduct();
        org.hibernate.Hibernate.initialize(product);
        if (product.getCategory() != null) {
            org.hibernate.Hibernate.initialize(product.getCategory());
        }
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setProductDescription(product.getDescription());
        dto.setProductPrice(product.getPrice());
        dto.setProductImage(product.getImageUrl());
        dto.setProductCondition(product.getCondition());
        dto.setProductCategory(product.getCategory() != null ? product.getCategory().getName() : null);
        
        // Buyer details - Force initialization of lazy-loaded entity
        ProfileEntity buyer = order.getBuyer();
        org.hibernate.Hibernate.initialize(buyer);
        dto.setBuyerProfileId(buyer.getId());
        dto.setBuyerFirstName(buyer.getFirstName());
        dto.setBuyerLastName(buyer.getLastName());
        dto.setBuyerEmail(buyer.getEmail());
        dto.setBuyerPhone(buyer.getPhoneNumber());
        
        // Seller details - Force initialization of lazy-loaded entity
        ProfileEntity seller = order.getSeller();
        org.hibernate.Hibernate.initialize(seller);
        dto.setSellerProfileId(seller.getId());
        dto.setSellerFirstName(seller.getFirstName());
        dto.setSellerLastName(seller.getLastName());
        dto.setSellerEmail(seller.getEmail());
        dto.setSellerPhone(seller.getPhoneNumber());
        
        // Check if order has review
        boolean hasReview = reviewRepository.findByOrder_Id(order.getId())
            .stream()
            .findFirst()
            .map(review -> {
                dto.setReviewId(review.getId());
                return true;
            })
            .orElse(false);
        dto.setHasReview(hasReview);
        
        return dto;
    }

    // Get detailed orders for buyer
    @Transactional(readOnly = true)
    public List<OrderDetailDTO> getDetailedOrdersByBuyer(Integer buyerId) {
        List<OrderEntity> orders = orderRepository.findByBuyer_Id(buyerId);
        return orders.stream()
            .map(this::convertToDetailDTO)
            .collect(Collectors.toList());
    }

    // Get detailed orders for seller
    @Transactional(readOnly = true)
    public List<OrderDetailDTO> getDetailedOrdersBySeller(Integer sellerId) {
        List<OrderEntity> orders = orderRepository.findBySeller_Id(sellerId);
        return orders.stream()
            .map(this::convertToDetailDTO)
            .collect(Collectors.toList());
    }
}