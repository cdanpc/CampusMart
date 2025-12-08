package com.appdevg5.technominds.repository;

import com.appdevg5.technominds.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    
    List<NotificationEntity> findByProfileIdOrderByCreatedAtDesc(Integer profileId);
    
    List<NotificationEntity> findByProfileIdAndIsReadOrderByCreatedAtDesc(Integer profileId, Boolean isRead);
    
    List<NotificationEntity> findByProfileIdAndTypeOrderByCreatedAtDesc(Integer profileId, String type);
    
    Integer countByProfileIdAndIsRead(Integer profileId, Boolean isRead);
    
    void deleteAllByProfileId(Integer profileId);
}
