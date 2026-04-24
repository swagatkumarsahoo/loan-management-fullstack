package com.loanapp.loanmanagement.controller;

import com.loanapp.loanmanagement.dto.response.ApiResponse;
import com.loanapp.loanmanagement.dto.response.EMIResponse;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.service.EMIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emi")
@RequiredArgsConstructor
public class EMIController {

    private final EMIService emiService;

    /** Full amortisation schedule for a loan */
    @GetMapping("/schedule/{loanId}")
    public ResponseEntity<ApiResponse<List<EMIResponse>>> getSchedule(
            @PathVariable Long loanId,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(ApiResponse.success(
                emiService.getEMISchedule(loanId, currentUser),
                "EMI schedule fetched successfully"));
    }

    /** Only PENDING / OVERDUE instalments */
    @GetMapping("/pending/{loanId}")
    public ResponseEntity<ApiResponse<List<EMIResponse>>> getPending(
            @PathVariable Long loanId,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(ApiResponse.success(
                emiService.getPendingEMIs(loanId, currentUser),
                "Pending EMIs fetched successfully"));
    }
}
