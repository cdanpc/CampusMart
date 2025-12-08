package com.appdevg5.technominds.Message;

public class ReportDTO {
    private Integer reporterId;
    private Integer reportedUserId;
    private Integer productId;
    private String reason;

    public ReportDTO() {}

    public ReportDTO(Integer reporterId, Integer reportedUserId, Integer productId, String reason) {
        this.reporterId = reporterId;
        this.reportedUserId = reportedUserId;
        this.productId = productId;
        this.reason = reason;
    }

    public Integer getReporterId() {
        return reporterId;
    }

    public void setReporterId(Integer reporterId) {
        this.reporterId = reporterId;
    }

    public Integer getReportedUserId() {
        return reportedUserId;
    }

    public void setReportedUserId(Integer reportedUserId) {
        this.reportedUserId = reportedUserId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
