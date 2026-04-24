package com.loanapp.loanmanagement.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotNull(message = "EMI schedule ID is required")
    private Long emiScheduleId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", message = "Payment amount must be positive")
    private Double amountPaid;

    @NotBlank(message = "Payment mode is required")
    private String paymentMode;  // UPI, NEFT, IMPS, CARD

    private String remarks;
}
