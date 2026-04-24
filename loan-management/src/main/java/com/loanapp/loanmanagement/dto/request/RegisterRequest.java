package com.loanapp.loanmanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String fullName;

    @Email(message = "Enter a valid email address")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
             message = "Password must contain uppercase, lowercase and a digit")
    private String password;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String phone;

    @DecimalMin(value = "0.0", inclusive = false, message = "Annual income must be positive")
    private Double annualIncome;

    @Min(value = 300, message = "Credit score must be at least 300")
    @Max(value = 900, message = "Credit score cannot exceed 900")
    private Integer creditScore;
}
