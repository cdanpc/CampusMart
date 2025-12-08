package com.appdevg5.technominds.Message;

import com.appdevg5.technominds.Profile.ProfileEntity;
import com.appdevg5.technominds.Product.ProductEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_reports")
@NoArgsConstructor
public class ConversationReportEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Integer id;

    // The user who is reporting
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_profile_id", nullable = false)
    private ProfileEntity reporter;

    // The user being reported
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_profile_id", nullable = false)
    private ProfileEntity reportedUser;

    // Context: Which product this report is about (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = true)
    private ProductEntity product;

    @NotBlank
    @Column(name = "reason", columnDefinition = "TEXT", nullable = false)
    private String reason;

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

    public ProfileEntity getReporter() {
        return reporter;
    }

    public void setReporter(ProfileEntity reporter) {
        this.reporter = reporter;
    }

    public ProfileEntity getReportedUser() {
        return reportedUser;
    }

    public void setReportedUser(ProfileEntity reportedUser) {
        this.reportedUser = reportedUser;
    }

    public ProductEntity getProduct() {
        return product;
    }

    public void setProduct(ProductEntity product) {
        this.product = product;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
