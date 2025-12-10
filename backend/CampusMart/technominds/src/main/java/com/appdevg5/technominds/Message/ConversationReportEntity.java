package com.appdevg5.technominds.Message;

import com.appdevg5.technominds.Profile.ProfileEntity;
import com.appdevg5.technominds.Product.ProductEntity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_reports")
@Getter
@Setter
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
}
