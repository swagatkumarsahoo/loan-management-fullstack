package com.loanapp.loanmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardResponse {
    // User stats
    private Long totalLoans;
    private Long activeLoans;
    private Long pendingLoans;
    private Long closedLoans;
    private Double totalAmountBorrowed;
    private Double totalAmountPaid;
    private Double totalOutstanding;

    // Admin-only stats (null for regular users)
    private Long totalUsers;
    private Long totalApprovedLoans;
    private Long totalRejectedLoans;
    private Double totalDisbursedAmount;
    private Long overdueEMIs;
}
