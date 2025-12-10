package com.appdevg5.technominds.entity;

import com.appdevg5.technominds.Profile.ProfileEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
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

    public NotificationEntity(ProfileEntity profile, String type, String title, String message, Long relatedId, String relatedType) {
        this.profile = profile;
        this.type = type;
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
        this.relatedType = relatedType;
        this.isRead = false;
    }
}
