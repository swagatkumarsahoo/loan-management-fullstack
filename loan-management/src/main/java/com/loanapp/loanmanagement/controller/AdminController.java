package com.loanapp.loanmanagement.controller;

import com.loanapp.loanmanagement.dto.request.LoanReviewRequest;
import com.loanapp.loanmanagement.dto.response.ApiResponse;
import com.loanapp.loanmanagement.dto.response.DashboardResponse;
import com.loanapp.loanmanagement.dto.response.LoanResponse;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.repository.UserRepository;
import com.loanapp.loanmanagement.service.DashboardService;
import com.loanapp.loanmanagement.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final LoanService loanService;
    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    /** Admin dashboard statistics */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(
                dashboardService.getAdminDashboard(), "Dashboard data fetched"));
    }

    /** List all loans with optional status filter + pagination */
    @GetMapping("/loans")
    public ResponseEntity<ApiResponse<Page<LoanResponse>>> getAllLoans(
            @RequestParam(required = false) LoanStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<LoanResponse> loans = status != null
                ? loanService.getLoansByStatus(status, pageable)
                : loanService.getAllLoans(pageable);
        return ResponseEntity.ok(ApiResponse.success(loans, "Loans fetched successfully"));
    }

    /** Approve or reject a PENDING loan */
    @PostMapping("/loans/review")
    public ResponseEntity<ApiResponse<LoanResponse>> reviewLoan(
            @Valid @RequestBody LoanReviewRequest request,
            @AuthenticationPrincipal User admin) {

        return ResponseEntity.ok(ApiResponse.success(
                loanService.reviewLoan(admin, request),
                request.getApproved() ? "Loan approved successfully" : "Loan rejected"));
    }

    /** List all registered users */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(
                userRepository.findAll(), "Users fetched successfully"));
    }

    /** Deactivate a user account */
    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<String>> deactivateUser(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setIsActive(false);
            userRepository.save(user);
        });
        return ResponseEntity.ok(ApiResponse.success("User deactivated", "Done"));
    }
}
