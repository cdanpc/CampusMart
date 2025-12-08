package com.appdevg5.technominds.Notification;

import java.time.LocalDateTime;

/**
 * DTO for Notification to avoid lazy loading issues
 */
public class NotificationDTO {
    
    private Long id;
    private Long profileId;
    private String profileName;
    private String type;
    private String title;
    private String message;
    private Long relatedId;
    private String relatedType;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // Constructors
    public NotificationDTO() {}

    public NotificationDTO(Long id, Long profileId, String profileName, String type, String title, 
                          String message, Long relatedId, String relatedType, Boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.profileId = profileId;
        this.profileName = profileName;
        this.type = type;
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
        this.relatedType = relatedType;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public String getProfileName() {
        return profileName;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
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
