package com.appdevg5.technominds.Auth;

import com.appdevg5.technominds.Profile.ProfileEntity;
import com.appdevg5.technominds.Profile.ProfileRepository;
import com.appdevg5.technominds.User.UserEntity;
import com.appdevg5.technominds.User.UserRepository;
import com.appdevg5.technominds.config.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, ProfileRepository profileRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create user with hashed password
        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);

        // Create profile
        ProfileEntity profile = new ProfileEntity();
        profile.setEmail(user.getEmail());
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhoneNumber(request.getPhoneNumber());
        profile.setInstagramHandle(request.getInstagramHandle());
        profile.setAcademicLevel(request.getAcademicLevel());
        profile = profileRepository.save(profile);

        // Generate real JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), profile.getId());

        // Return response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", profile.getId());
        profileData.put("user_id", user.getId());
        profileData.put("first_name", profile.getFirstName());
        profileData.put("last_name", profile.getLastName());
        profileData.put("email", profile.getEmail());
        profileData.put("phone_number", profile.getPhoneNumber());
        profileData.put("instagram_handle", profile.getInstagramHandle());
        profileData.put("academic_level", profile.getAcademicLevel());
        profileData.put("bio", profile.getBio());
        profileData.put("seller_rating", profile.getSellerRating());
        profileData.put("total_reviews", profile.getTotalReviews());
        profileData.put("created_at", profile.getCreatedAt());
        profileData.put("updated_at", profile.getUpdatedAt());
        
        userData.put("profile", profileData);
        response.put("user", userData);

        return response;
    }

    public Map<String, Object> login(LoginRequest request) {
        // Find user by email
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        // Check password using BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // Find profile
        ProfileEntity profile = profileRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        // Generate real JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), profile.getId());

        // Return response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("id", profile.getId());
        profileData.put("user_id", user.getId());
        profileData.put("first_name", profile.getFirstName());
        profileData.put("last_name", profile.getLastName());
        profileData.put("email", profile.getEmail());
        profileData.put("phone_number", profile.getPhoneNumber());
        profileData.put("instagram_handle", profile.getInstagramHandle());
        profileData.put("academic_level", profile.getAcademicLevel());
        profileData.put("bio", profile.getBio());
        profileData.put("seller_rating", profile.getSellerRating());
        profileData.put("total_reviews", profile.getTotalReviews());
        profileData.put("created_at", profile.getCreatedAt());
        profileData.put("updated_at", profile.getUpdatedAt());
        
        userData.put("profile", profileData);
        response.put("user", userData);

        return response;
    }

    /**
     * Check user password format (for debugging)
     */
    public Map<String, Object> checkUserPasswordFormat(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String passwordHash = user.getPassword();
        boolean isBCrypt = passwordHash.startsWith("$2a$") || passwordHash.startsWith("$2b$") || passwordHash.startsWith("$2y$");
        
        Map<String, Object> info = new HashMap<>();
        info.put("email", email);
        info.put("passwordFormat", isBCrypt ? "BCrypt" : "Plain/Other");
        info.put("passwordLength", passwordHash.length());
        info.put("passwordPrefix", passwordHash.substring(0, Math.min(10, passwordHash.length())));
        info.put("needsFix", !isBCrypt);
        
        return info;
    }

    /**
     * Fix password hashing for existing users
     */
    @Transactional
    public void fixUserPassword(String email, String plainPassword) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Hash the password properly
        String hashedPassword = passwordEncoder.encode(plainPassword);
        user.setPassword(hashedPassword);
        userRepository.save(user);
    }
}
