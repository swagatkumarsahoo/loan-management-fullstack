package com.loanapp.loanmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EligibilityResponse {
    private boolean eligible;
    private String reason;
    private Double maxEligibleAmount;
    private Double suggestedEMI;
    private Double annualInterestRate;
    private Integer creditScore;
    private Double annualIncome;
}
