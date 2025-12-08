package com.appdevg5.technominds.Message;

import com.appdevg5.technominds.Profile.ProfileEntity;
import com.appdevg5.technominds.Product.ProductEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@NoArgsConstructor
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // The user who sent the message
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private ProfileEntity sender;

    // The user who receives the message
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private ProfileEntity receiver;

    // Context: Which product this message chain is about (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = true)
    private ProductEntity product;

    @NotBlank
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    @Column(name = "is_muted")
    private Boolean isMuted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public ProfileEntity getSender() {
        return sender;
    }

    public void setSender(ProfileEntity sender) {
        this.sender = sender;
    }

    public ProfileEntity getReceiver() {
        return receiver;
    }

    public void setReceiver(ProfileEntity receiver) {
        this.receiver = receiver;
    }

    public ProductEntity getProduct() {
        return product;
    }

    public void setProduct(ProductEntity product) {
        this.product = product;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Boolean getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Boolean isArchived) {
        this.isArchived = isArchived;
    }

    public Boolean getIsMuted() {
        return isMuted;
    }

    public void setIsMuted(Boolean isMuted) {
        this.isMuted = isMuted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // createdAt is set by the database/Hibernate; setter included for completeness but typically unused
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}