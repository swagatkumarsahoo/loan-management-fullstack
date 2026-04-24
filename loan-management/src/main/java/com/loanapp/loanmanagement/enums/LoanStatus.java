package com.loanapp.loanmanagement.enums;

public enum LoanStatus {
    PENDING,
    APPROVED,
    REJECTED,
    ACTIVE,       // Approved + disbursed — EMIs running
    CLOSED,       // All EMIs paid
    DEFAULTED     // Missed 3+ EMIs
}
