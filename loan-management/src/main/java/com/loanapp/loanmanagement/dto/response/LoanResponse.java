package com.loanapp.loanmanagement.dto.response;

import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.enums.LoanType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LoanResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private LoanType loanType;
    private Double principalAmount;
    private Double annualInterestRate;
    private Integer tenureMonths;
    private Double emiAmount;
    private Double totalPayableAmount;
    private Double totalInterestAmount;
    private LoanStatus status;
    private String purpose;
    private String rejectionReason;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime disbursedAt;
}
