// ...existing code...
package com.appdevg5.technominds.Profile;

import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for managing user profiles.
 * Base URL: /api/profiles
 */
@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;
    private static final String UPLOAD_DIR = "uploads/profiles/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};

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

    // POST /api/profiles/{id}/upload-picture - Upload profile picture
    @PostMapping("/{id}/upload-picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @PathVariable Integer id,
            @RequestParam("image") MultipartFile file) {
        try {
            // Validate file exists
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Please select a file to upload"
                ));
            }
            
            // Validate file size
            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "File size exceeds 5MB limit"
                ));
            }
            
            // Get original filename and validate extension
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid filename"
                ));
            }
            
            // Validate file extension
            String fileExtension = "";
            int lastDotIndex = originalFilename.lastIndexOf('.');
            if (lastDotIndex > 0) {
                fileExtension = originalFilename.substring(lastDotIndex).toLowerCase();
            }
            
            boolean validExtension = false;
            for (String allowedExt : ALLOWED_EXTENSIONS) {
                if (fileExtension.equals(allowedExt)) {
                    validExtension = true;
                    break;
                }
            }
            
            if (!validExtension) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp"
                ));
            }
            
            // Generate unique filename
            String uniqueFilename = "profile_" + id + "_" + UUID.randomUUID().toString() + fileExtension;
            
            // Create upload path
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Generate URL for accessing the file
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/profiles/images/")
                    .path(uniqueFilename)
                    .toUriString();
            
            // Update profile with new picture URL
            profileService.getProfileById(id).ifPresent(profile -> {
                profile.setProfilePicture(fileUrl);
                profileService.updateProfile(id, profile);
            });
            
            System.out.println("Profile picture uploaded successfully: " + uniqueFilename);
            System.out.println("File saved to: " + filePath.toAbsolutePath());
            System.out.println("Accessible at: " + fileUrl);
            
            return ResponseEntity.ok(Map.of(
                "imageUrl", fileUrl,
                "filename", uniqueFilename,
                "message", "Profile picture uploaded successfully"
            ));
            
        } catch (IOException e) {
            System.err.println("Failed to upload profile picture: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to save image: " + e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("Unexpected error during profile picture upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to upload image: " + e.getMessage()
            ));
        }
    }
    
    // GET /api/profiles/images/{filename} - Serve uploaded profile images
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename) {
        try {
            // Validate filename to prevent directory traversal attacks
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest().build();
            }
            
            // Load file as Resource
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            
            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
                    
        } catch (MalformedURLException e) {
            System.err.println("Invalid file path: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            System.err.println("Error reading file: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Unexpected error serving profile image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
// ...existing code...