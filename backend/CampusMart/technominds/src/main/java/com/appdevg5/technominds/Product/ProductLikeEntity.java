package com.appdevg5.technominds.Product;

import com.appdevg5.technominds.Profile.ProfileEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "profile_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class ProductLikeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private ProfileEntity profile;

    @Column(name = "liked_at", nullable = false)
    private LocalDateTime likedAt;

    @PrePersist
    protected void onCreate() {
        likedAt = LocalDateTime.now();
    }

    public ProductLikeEntity(ProductEntity product, ProfileEntity profile) {
        this.product = product;
        this.profile = profile;
    }
}
