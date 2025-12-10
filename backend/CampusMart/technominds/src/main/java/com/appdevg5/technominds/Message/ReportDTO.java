package com.appdevg5.technominds.Message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private Integer reporterId;
    private Integer reportedUserId;
    private Integer productId;
    private String reason;
}
