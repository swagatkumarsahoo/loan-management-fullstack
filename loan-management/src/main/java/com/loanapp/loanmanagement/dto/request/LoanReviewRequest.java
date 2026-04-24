package com.loanapp.loanmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoanReviewRequest {

    @NotNull(message = "Loan ID is required")
    private Long loanId;

    @NotNull(message = "Approval decision is required")
    private Boolean approved;   // true = APPROVE, false = REJECT

    private String rejectionReason; // Required if approved = false
}
