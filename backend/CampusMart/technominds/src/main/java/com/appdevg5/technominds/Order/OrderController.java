package com.appdevg5.technominds.Order;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for managing finalized orders.
 * Base URL: /api/orders
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // GET /api/orders
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderEntity> orders = orderService.getAllOrders();
        List<OrderDTO> orderDTOs = orders.stream()
                .map(OrderDTO::new)
                .toList();
        return ResponseEntity.ok(orderDTOs);
    }

    // GET /api/orders/{id}
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .map(order -> ResponseEntity.ok(new OrderDTO(order)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET /api/orders/buyer/{buyerId}
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<OrderDetailDTO>> getOrdersByBuyer(@PathVariable Integer buyerId) {
        List<OrderDetailDTO> orders = orderService.getDetailedOrdersByBuyer(buyerId);
        return ResponseEntity.ok(orders);
    }

    // GET /api/orders/seller/{sellerId}
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<OrderDetailDTO>> getOrdersBySeller(@PathVariable Integer sellerId) {
        List<OrderDetailDTO> orders = orderService.getDetailedOrdersBySeller(sellerId);
        return ResponseEntity.ok(orders);
    }

    // GET /api/orders/product/{productId}
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByProduct(@PathVariable Integer productId) {
        List<OrderEntity> orders = orderService.getOrdersByProduct(productId);
        List<OrderDTO> orderDTOs = orders.stream()
                .map(OrderDTO::new)
                .toList();
        return ResponseEntity.ok(orderDTOs);
    }

    // POST /api/orders - Creates a new order (usually after trade offer acceptance or Buy Now)
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderEntity order) {
        try {
            System.out.println("[OrderController] Received order creation request:");
            System.out.println("  Buyer ID: " + (order.getBuyer() != null ? order.getBuyer().getId() : "null"));
            System.out.println("  Seller ID: " + (order.getSeller() != null ? order.getSeller().getId() : "null"));
            System.out.println("  Product ID: " + (order.getProduct() != null ? order.getProduct().getId() : "null"));
            System.out.println("  Quantity: " + order.getQuantity());
            System.out.println("  Total Amount: " + order.getTotalAmount());
            System.out.println("  Payment Method: " + order.getPaymentMethod());
            System.out.println("  Delivery Notes: " + order.getDeliveryNotes());
            
            OrderEntity newOrder = orderService.createOrder(order);

            // Build Location header: /api/orders/{id}
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(newOrder.getId())
                    .toUri();

            System.out.println("[OrderController] Order created successfully with ID: " + newOrder.getId());
            return ResponseEntity.created(location).body(new OrderDTO(newOrder));
        } catch (IllegalArgumentException e) {
            // Return 400 Bad Request for validation errors
            System.err.println("[OrderController] Validation error: " + e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "message", e.getMessage(),
                            "timestamp", java.time.LocalDateTime.now().toString()
                    ));
        } catch (Exception e) {
            // Return 500 Internal Server Error for unexpected errors
            System.err.println("[OrderController] Unexpected error creating order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message", "Failed to create order: " + e.getMessage(),
                            "timestamp", java.time.LocalDateTime.now().toString(),
                            "error", e.getClass().getSimpleName()
                    ));
        }
    }

    // PATCH /api/orders/{id}/status - Update the status of an order
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Integer id, @RequestBody Map<String, String> statusUpdate) {
        String newStatus = statusUpdate.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }

        return orderService.updateOrderStatus(id, newStatus)
                .map(order -> ResponseEntity.ok(new OrderDTO(order)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /api/orders/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .map(existing -> {
                    orderService.deleteOrder(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}