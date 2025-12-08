package com.appdevg5.technominds.Product;

import com.appdevg5.technominds.Category.CategoryRepository;
import com.appdevg5.technominds.ProductImage.ProductImageEntity;
import com.appdevg5.technominds.Profile.ProfileEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for managing Product business logic.
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductLikeRepository productLikeRepository;

    public ProductService(ProductRepository productRepository, 
                         CategoryRepository categoryRepository,
                         ProductLikeRepository productLikeRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productLikeRepository = productLikeRepository;
    }

    // READ
    public Optional<ProductEntity> getProductById(Integer id) {
        return productRepository.findById(id);
    }

    public List<ProductEntity> getAllProducts() {
        // Return only available products matching the ERD column is_available
        return productRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsAvailable()))
                .collect(Collectors.toList());
    }

    public List<ProductEntity> getProductsBySeller(Integer sellerId) {
        return productRepository.findAll().stream()
                .filter(p -> p.getSeller() != null && sellerId != null && sellerId.equals(p.getSeller().getId()))
                .collect(Collectors.toList());
    }
    
    public List<ProductEntity> getAvailableProductsBySeller(Integer sellerId) {
        return productRepository.findAll().stream()
                .filter(p -> p.getSeller() != null && sellerId != null && sellerId.equals(p.getSeller().getId()))
                .filter(p -> Boolean.TRUE.equals(p.getIsAvailable()))
                .collect(Collectors.toList());
    }

    public List<ProductEntity> searchProducts(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllProducts();
        }
        String q = searchTerm.toLowerCase();
        return productRepository.findAll().stream()
                .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(q))
                        || (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)))
                .collect(Collectors.toList());
    }

    // CREATE (Listing a new product)
    @Transactional
    public ProductEntity createProduct(ProductEntity product) {
        // Ensure it starts as available and counters initialized
        product.setIsAvailable(Boolean.TRUE);
        if (product.getViewCount() == null) product.setViewCount(0);
        if (product.getLikeCount() == null) product.setLikeCount(0);
        if (product.getStock() == null) product.setStock(1);
        if (product.getTradeOnly() == null) product.setTradeOnly(Boolean.FALSE);
        
        // Handle category reference properly
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            categoryRepository.findById(product.getCategory().getId())
                .ifPresent(product::setCategory);
        }
        
        // Handle images - set the product reference for each image
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            for (ProductImageEntity image : product.getImages()) {
                image.setProduct(product);
            }
        }
        
        return productRepository.save(product);
    }

    // UPDATE
    @Transactional
    public Optional<ProductEntity> updateProduct(Integer id, ProductEntity productDetails) {
        return productRepository.findById(id).map(existingProduct -> {
            // Allow updates to fields that match the ERD and entity:
            existingProduct.setName(productDetails.getName());
            existingProduct.setDescription(productDetails.getDescription());
            
            // Handle category reference properly
            if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
                categoryRepository.findById(productDetails.getCategory().getId())
                    .ifPresent(existingProduct::setCategory);
            } else {
                existingProduct.setCategory(null);
            }
            
            existingProduct.setPrice(productDetails.getPrice());
            existingProduct.setBrandType(productDetails.getBrandType());
            existingProduct.setCondition(productDetails.getCondition());
            existingProduct.setContactInfo(productDetails.getContactInfo());
            // Toggle availability if provided
            if (productDetails.getIsAvailable() != null) {
                existingProduct.setIsAvailable(productDetails.getIsAvailable());
            }
            if (productDetails.getTradeOnly() != null) {
                existingProduct.setTradeOnly(productDetails.getTradeOnly());
            }
            if (productDetails.getStock() != null) {
                existingProduct.setStock(productDetails.getStock());
            }
            // If clients submit view/like counts (usually updated elsewhere), accept them if non-null
            if (productDetails.getViewCount() != null) existingProduct.setViewCount(productDetails.getViewCount());
            if (productDetails.getLikeCount() != null) existingProduct.setLikeCount(productDetails.getLikeCount());

            // Handle image updates - replace old images with new ones
            if (productDetails.getImages() != null) {
                // Clear existing images
                existingProduct.getImages().clear();
                
                // Add new images and set product reference
                for (ProductImageEntity newImage : productDetails.getImages()) {
                    newImage.setProduct(existingProduct);
                    existingProduct.getImages().add(newImage);
                }
            }

            return productRepository.save(existingProduct);
        });
    }

    // DELETE (Delisting / hard delete)
    @Transactional
    public void deleteProduct(Integer id) {
        // First, delete all likes associated with this product to avoid foreign key constraint violation
        productLikeRepository.deleteByProductId(id);
        
        // Then delete the product (images will be cascade deleted automatically)
        productRepository.deleteById(id);
    }

    /**
     * Toggle like for a product by a specific user.
     * If user hasn't liked the product, add a like.
     * If user has already liked, unlike it.
     * Returns the updated product with current like count.
     */
    @Transactional
    public Optional<ProductEntity> toggleLike(Integer productId, Integer profileId) {
        return productRepository.findById(productId).map(product -> {
            // Check if user has already liked this product
            Optional<ProductLikeEntity> existingLike = 
                productLikeRepository.findByProductIdAndProfileId(productId, profileId);
            
            if (existingLike.isPresent()) {
                // User has already liked - remove the like (unlike)
                productLikeRepository.delete(existingLike.get());
            } else {
                // User hasn't liked yet - add the like
                ProfileEntity profile = new ProfileEntity();
                profile.setId(profileId);
                ProductLikeEntity newLike = new ProductLikeEntity(product, profile);
                productLikeRepository.save(newLike);
            }
            
            // Update product's like count based on actual likes in database
            long likeCount = productLikeRepository.countByProductId(productId);
            product.setLikeCount((int) likeCount);
            return productRepository.save(product);
        });
    }
    
    /**
     * Check if a user has liked a specific product
     */
    public boolean hasUserLikedProduct(Integer productId, Integer profileId) {
        return productLikeRepository.existsByProductIdAndProfileId(productId, profileId);
    }
}