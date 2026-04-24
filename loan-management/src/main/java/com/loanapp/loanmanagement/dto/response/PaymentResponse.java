package com.loanapp.loanmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long loanId;
    private Long emiScheduleId;
    private Integer instalmentNumber;
    private Double amountPaid;
    private Double penaltyPaid;
    private String transactionId;
    private String paymentMode;
    private String paymentStatus;
    private String remarks;
    private LocalDateTime paidAt;
}
