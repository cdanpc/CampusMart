// ...existing code...
package com.appdevg5.technominds.Profile;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for managing user profiles.
 * Base URL: /api/profiles
 */
@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // GET /api/profiles
    @GetMapping
    public List<ProfileEntity> getAllProfiles() {
        return profileService.getAllProfiles();
    }

    // GET /api/profiles/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProfileEntity> getProfileById(@PathVariable Integer id) {
        return profileService.getProfileById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // GET /api/profiles/{id}/seller-info - Get seller profile with aggregated statistics
    @GetMapping("/{id}/seller-info")
    public ResponseEntity<SellerInfoDTO> getSellerInfo(@PathVariable Integer id) {
        return profileService.getSellerInfo(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /api/profiles - Create a new profile (Initial registration)
    @PostMapping
    public ResponseEntity<ProfileEntity> createProfile(@Valid @RequestBody ProfileEntity profile) {
        ProfileEntity newProfile = profileService.createProfile(profile);
        return new ResponseEntity<>(newProfile, HttpStatus.CREATED);
    }

    // PUT /api/profiles/{id} - Update profile details
    @PutMapping("/{id}")
    public ResponseEntity<ProfileEntity> updateProfile(@PathVariable Integer id, @Valid @RequestBody ProfileEntity profileDetails) {
        return profileService.updateProfile(id, profileDetails)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /api/profiles/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Integer id) {
        profileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }
}
// ...existing code...