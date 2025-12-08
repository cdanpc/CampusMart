package com.appdevg5.technominds.entity;

import com.appdevg5.technominds.Profile.ProfileEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class NotificationEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    private ProfileEntity profile;
    
    @Column(nullable = false)
    private String type; // ORDER_PLACED, ORDER_CONFIRMED, ORDER_COMPLETED, ORDER_CANCELLED, etc.
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "related_id")
    private Long relatedId; // Order ID, Product ID, etc.
    
    @Column(name = "related_type")
    private String relatedType; // ORDER, PRODUCT, MESSAGE, etc.
    
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public NotificationEntity() {}
    
    public NotificationEntity(ProfileEntity profile, String type, String title, String message, Long relatedId, String relatedType) {
        this.profile = profile;
        this.type = type;
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
        this.relatedType = relatedType;
        this.isRead = false;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public ProfileEntity getProfile() {
        return profile;
    }
    
    public void setProfile(ProfileEntity profile) {
        this.profile = profile;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Long getRelatedId() {
        return relatedId;
    }
    
    public void setRelatedId(Long relatedId) {
        this.relatedId = relatedId;
    }
    
    public String getRelatedType() {
        return relatedType;
    }
    
    public void setRelatedType(String relatedType) {
        this.relatedType = relatedType;
    }
    
    public Boolean getIsRead() {
        return isRead;
    }
    
    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
