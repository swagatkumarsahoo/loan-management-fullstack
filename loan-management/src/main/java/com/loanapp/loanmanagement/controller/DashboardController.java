package com.loanapp.loanmanagement.controller;

import com.loanapp.loanmanagement.dto.response.ApiResponse;
import com.loanapp.loanmanagement.dto.response.DashboardResponse;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(
                dashboardService.getUserDashboard(currentUser),
                "Dashboard fetched successfully"));
    }
}
