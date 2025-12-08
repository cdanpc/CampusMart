package com.appdevg5.technominds.Message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationReportRepository extends JpaRepository<ConversationReportEntity, Integer> {
    
    // Find all reports made by a specific user
    List<ConversationReportEntity> findByReporterId(Integer reporterId);
    
    // Find all reports against a specific user
    List<ConversationReportEntity> findByReportedUserId(Integer reportedUserId);
    
    // Find reports for a specific conversation
    List<ConversationReportEntity> findByReporterIdAndReportedUserIdAndProductId(
        Integer reporterId, 
        Integer reportedUserId, 
        Integer productId
    );
}
