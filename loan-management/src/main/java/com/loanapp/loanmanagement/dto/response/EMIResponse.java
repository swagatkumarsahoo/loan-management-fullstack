package com.loanapp.loanmanagement.dto.response;

import com.loanapp.loanmanagement.enums.EMIStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class EMIResponse {
    private Long id;
    private Long loanId;
    private Integer instalmentNumber;
    private LocalDate dueDate;
    private Double emiAmount;
    private Double principalComponent;
    private Double interestComponent;
    private Double outstandingPrincipal;
    private EMIStatus status;
    private LocalDate paidDate;
    private Double penaltyAmount;
}
