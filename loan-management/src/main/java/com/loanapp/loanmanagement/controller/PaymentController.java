package com.loanapp.loanmanagement.controller;

import com.loanapp.loanmanagement.dto.request.PaymentRequest;
import com.loanapp.loanmanagement.dto.response.ApiResponse;
import com.loanapp.loanmanagement.dto.response.PaymentResponse;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.service.PaymentService;
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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** Pay an EMI instalment */
    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<PaymentResponse>> makePayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                paymentService.makePayment(currentUser, request),
                "Payment successful"));
    }

    /** Payment history for logged-in user */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getMyPayments(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User currentUser) {

        Page<PaymentResponse> payments = paymentService.getMyPayments(
                currentUser, PageRequest.of(page, size, Sort.by("paidAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(payments, "Payment history fetched"));
    }
}
