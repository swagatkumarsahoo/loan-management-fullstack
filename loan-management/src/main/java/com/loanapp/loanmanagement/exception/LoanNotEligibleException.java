package com.loanapp.loanmanagement.exception;

public class LoanNotEligibleException extends RuntimeException {
    public LoanNotEligibleException(String message) {
        super(message);
    }
}
