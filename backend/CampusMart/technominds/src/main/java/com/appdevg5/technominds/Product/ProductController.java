package com.appdevg5.technominds.Product;

import com.appdevg5.technominds.Profile.ProfileEntity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for managing products listed on the platform.
 * Base URL: /api/products
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // GET /api/products - Get all listed products
    @GetMapping
    public List<ProductEntity> getAllListedProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductEntity> getProductById(@PathVariable Integer id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/seller/{sellerId}")
    public List<ProductEntity> getProductsBySeller(
            @PathVariable Integer sellerId,
            @RequestParam(name = "available", required = false) Boolean available) {
        if (available != null && available) {
            return productService.getAvailableProductsBySeller(sellerId);
        }
        return productService.getProductsBySeller(sellerId);
    }

    @GetMapping("/search")
    public List<ProductEntity> searchProducts(@RequestParam(name = "term", required = false) String term) {
        return productService.searchProducts(term);
    }

    // POST /api/products - List a new product
    // Accepts ProductEntity in body. If only sellerId is provided as query param, it will be assigned.
    @PostMapping
    public ResponseEntity<ProductEntity> createProduct(
            @Valid @RequestBody ProductEntity product,
            @RequestParam(name = "sellerId", required = false) Integer sellerId
    ) {
        if (product.getSeller() == null && sellerId != null) {
            ProfileEntity sellerRef = new ProfileEntity();
            sellerRef.setId(sellerId);
            product.setSeller(sellerRef);
        }
        ProductEntity newProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(newProduct);
    }

    // PUT /api/products/{id} - Update product details
    @PutMapping("/{id}")
    public ResponseEntity<ProductEntity> updateProduct(@PathVariable Integer id, @Valid @RequestBody ProductEntity productDetails) {
        return productService.updateProduct(id, productDetails)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /api/products/{id} - Delist product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/products/{id}/like - Toggle like for a product
    @PostMapping("/{id}/like")
    public ResponseEntity<ProductEntity> toggleLikeProduct(
            @PathVariable Integer id,
            @RequestParam(name = "profileId") Integer profileId) {
        return productService.toggleLike(id, profileId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // GET /api/products/{id}/liked - Check if user has liked a product
    @GetMapping("/{id}/liked")
    public ResponseEntity<Boolean> hasUserLikedProduct(
            @PathVariable Integer id,
            @RequestParam(name = "profileId") Integer profileId) {
        boolean hasLiked = productService.hasUserLikedProduct(id, profileId);
        return ResponseEntity.ok(hasLiked);
    }
}