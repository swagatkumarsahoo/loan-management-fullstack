package com.loanapp.loanmanagement.controller;

import com.loanapp.loanmanagement.dto.request.LoanApplicationRequest;
import com.loanapp.loanmanagement.dto.response.ApiResponse;
import com.loanapp.loanmanagement.dto.response.EligibilityResponse;
import com.loanapp.loanmanagement.dto.response.LoanResponse;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.LoanType;
import com.loanapp.loanmanagement.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    /** Check eligibility before applying */
    @GetMapping("/eligibility")
    public ResponseEntity<ApiResponse<EligibilityResponse>> checkEligibility(
            @RequestParam Double amount,
            @RequestParam Integer tenureMonths,
            @RequestParam LoanType loanType,
            @AuthenticationPrincipal User currentUser) {

        EligibilityResponse response = loanService.checkEligibility(
                currentUser, amount, tenureMonths, loanType);
        return ResponseEntity.ok(ApiResponse.success(response, "Eligibility check complete"));
    }

    /** Apply for a new loan */
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<LoanResponse>> apply(
            @Valid @RequestBody LoanApplicationRequest request,
            @AuthenticationPrincipal User currentUser) {

        LoanResponse response = loanService.applyForLoan(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Loan application submitted successfully"));
    }

    /** Get logged-in user's own loans */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<LoanResponse>>> getMyLoans(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User currentUser) {

        Page<LoanResponse> loans = loanService.getMyLoans(
                currentUser, PageRequest.of(page, size, Sort.by("appliedAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(loans, "Loans fetched successfully"));
    }

    /** Get a single loan by ID */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LoanResponse>> getLoanById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(
                ApiResponse.success(loanService.getLoanById(id, currentUser), "Loan fetched successfully"));
    }
}
