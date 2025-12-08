package com.appdevg5.technominds.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 * Intercepts requests and validates JWT tokens in Authorization header
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                if (jwtUtil.validateToken(token)) {
                    // Token is valid - add user info to request attributes
                    Integer userId = jwtUtil.extractUserId(token);
                    String email = jwtUtil.extractEmail(token);
                    Integer profileId = jwtUtil.extractProfileId(token);
                    
                    request.setAttribute("userId", userId);
                    request.setAttribute("email", email);
                    request.setAttribute("profileId", profileId);
                }
            } catch (Exception e) {
                // Invalid token - continue without authentication
                System.err.println("JWT validation error: " + e.getMessage());
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
