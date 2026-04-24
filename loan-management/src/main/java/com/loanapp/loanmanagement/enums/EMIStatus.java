package com.loanapp.loanmanagement.enums;

public enum EMIStatus {
    PENDING,   // Not yet due or due but unpaid
    PAID,      // Successfully paid
    OVERDUE,   // Past due date, unpaid
    WAIVED     // Admin waived this instalment
}
