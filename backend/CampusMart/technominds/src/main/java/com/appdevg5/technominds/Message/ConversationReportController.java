package com.appdevg5.technominds.Message;

import com.appdevg5.technominds.Product.ProductEntity;
import com.appdevg5.technominds.Product.ProductRepository;
import com.appdevg5.technominds.Profile.ProfileEntity;
import com.appdevg5.technominds.Profile.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ConversationReportController {

    @Autowired
    private ConversationReportRepository reportRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping
    public ResponseEntity<Map<String, String>> reportConversation(@RequestBody ReportDTO reportDTO) {
        // Validate reporter exists
        ProfileEntity reporter = profileRepository.findById(reportDTO.getReporterId())
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        // Validate reported user exists
        ProfileEntity reportedUser = profileRepository.findById(reportDTO.getReportedUserId())
                .orElseThrow(() -> new RuntimeException("Reported user not found"));

        // Validate product exists (if provided)
        ProductEntity product = null;
        if (reportDTO.getProductId() != null) {
            product = productRepository.findById(reportDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
        }

        // Create report entity
        ConversationReportEntity report = new ConversationReportEntity();
        report.setReporter(reporter);
        report.setReportedUser(reportedUser);
        report.setProduct(product);
        report.setReason(reportDTO.getReason());

        // Save report
        reportRepository.save(report);

        return ResponseEntity.ok(Map.of("message", "Conversation reported successfully"));
    }
}
