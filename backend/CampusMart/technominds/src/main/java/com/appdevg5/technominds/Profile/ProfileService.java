// ...existing code...
package com.appdevg5.technominds.Profile;

import com.appdevg5.technominds.Product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for managing user Profile business logic.
 * Handles registration, profile updates, and fetching user data.
 */
@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ProductRepository productRepository;

    public ProfileService(ProfileRepository profileRepository, ProductRepository productRepository) {
        this.profileRepository = profileRepository;
        this.productRepository = productRepository;
    }

    // READ
    public Optional<ProfileEntity> getProfileById(Integer id) {
        return profileRepository.findById(id);
    }

    public List<ProfileEntity> getAllProfiles() {
        return profileRepository.findAll();
    }

    // CREATE (Registration)
    @Transactional
    public ProfileEntity createProfile(ProfileEntity profile) {
        // DB constraints should enforce uniqueness for authUserId/email
        return profileRepository.save(profile);
    }

    @Transactional
    public Optional<ProfileEntity> updateProfile(Integer id, ProfileEntity profileDetails) {
        return profileRepository.findById(id).map(existingProfile -> {
            if (profileDetails.getFirstName() != null) existingProfile.setFirstName(profileDetails.getFirstName());
            if (profileDetails.getLastName() != null) existingProfile.setLastName(profileDetails.getLastName());
            if (profileDetails.getPhoneNumber() != null) existingProfile.setPhoneNumber(profileDetails.getPhoneNumber());
            if (profileDetails.getAcademicLevel() != null) existingProfile.setAcademicLevel(profileDetails.getAcademicLevel());
            if (profileDetails.getInstagramHandle() != null) existingProfile.setInstagramHandle(profileDetails.getInstagramHandle());
            if (profileDetails.getBio() != null) existingProfile.setBio(profileDetails.getBio());
            // Email is typically immutable
            return profileRepository.save(existingProfile);
        });
    }

    // DELETE (Soft delete would be preferable in a real application)
    @Transactional
    public void deleteProfile(Integer id) {
        profileRepository.deleteById(id);
    }
    
    // UTILITY: Updates the profile's total review count
    @Transactional
    public void updateTotalReviews(Integer profileId, int newTotalReviews) {
        profileRepository.findById(profileId).ifPresent(profile -> {
            profile.setTotalReviews(newTotalReviews);
            profileRepository.save(profile);
        });
    }
    
    /**
     * Get seller profile information with aggregated statistics.
     * Returns complete seller info including total and available listings count.
     */
    @Transactional(readOnly = true)
    public Optional<SellerInfoDTO> getSellerInfo(Integer sellerId) {
        return profileRepository.findById(sellerId).map(profile -> {
            // Count total listings by this seller
            long totalListings = productRepository.findBySeller_Id(sellerId).size();
            
            // Count available listings
            long availableListings = productRepository.findBySeller_Id(sellerId).stream()
                .filter(product -> product.getIsAvailable() != null && product.getIsAvailable())
                .count();
            
            return new SellerInfoDTO(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getEmail(),
                profile.getPhoneNumber(),
                profile.getInstagramHandle(),
                profile.getCreatedAt(),
                profile.getSellerRating(),
                profile.getTotalReviews(),
                (int) totalListings,
                (int) availableListings
            );
        });
    }
}
// ...existing code...