package com.loanapp.loanmanagement.dto.request;

import com.loanapp.loanmanagement.enums.LoanType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoanApplicationRequest {

    @NotNull(message = "Loan type is required")
    private LoanType loanType;

    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "10000.0", message = "Minimum loan amount is ₹10,000")
    @DecimalMax(value = "50000000.0", message = "Maximum loan amount is ₹5 Crore")
    private Double principalAmount;

    @NotNull(message = "Tenure is required")
    @Min(value = 6,   message = "Minimum tenure is 6 months")
    @Max(value = 360, message = "Maximum tenure is 360 months (30 years)")
    private Integer tenureMonths;

    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose cannot exceed 500 characters")
    private String purpose;
}
