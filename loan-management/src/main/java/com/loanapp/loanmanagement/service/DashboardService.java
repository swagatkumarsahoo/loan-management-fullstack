package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.dto.response.DashboardResponse;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.EMIStatus;
import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.repository.EMIScheduleRepository;
import com.loanapp.loanmanagement.repository.LoanRepository;
import com.loanapp.loanmanagement.repository.PaymentRepository;
import com.loanapp.loanmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

        private final LoanRepository loanRepository;
        private final PaymentRepository paymentRepository;
        private final UserRepository userRepository;
        private final EMIScheduleRepository emiScheduleRepository;

        public DashboardResponse getUserDashboard(User currentUser) {
                // Reload user to get a managed entity within this transaction
                User user = userRepository.findById(currentUser.getId())
                                .orElse(currentUser);

                long active = loanRepository.countByUserAndStatus(user, LoanStatus.ACTIVE);
                long pending = loanRepository.countByUserAndStatus(user, LoanStatus.PENDING);
                long closed = loanRepository.countByUserAndStatus(user, LoanStatus.CLOSED);

                return DashboardResponse.builder()
                                .totalLoans(active + pending + closed)
                                .activeLoans(active)
                                .pendingLoans(pending)
                                .closedLoans(closed)
                                .totalAmountBorrowed(loanRepository.sumPrincipalByUser(user))
                                .totalAmountPaid(paymentRepository.sumSuccessfulPaymentsByUser(user))
                                .build();
        }

        public DashboardResponse getAdminDashboard() {
                return DashboardResponse.builder()
                                .totalUsers(userRepository.count())
                                .totalLoans(loanRepository.count())
                                .pendingLoans(loanRepository.countByStatus(LoanStatus.PENDING))
                                .activeLoans(loanRepository.countByStatus(LoanStatus.ACTIVE))
                                .totalApprovedLoans(
                                                loanRepository.countByStatus(LoanStatus.APPROVED)
                                                                + loanRepository.countByStatus(LoanStatus.ACTIVE)
                                                                + loanRepository.countByStatus(LoanStatus.CLOSED))
                                .totalRejectedLoans(loanRepository.countByStatus(LoanStatus.REJECTED))
                                .closedLoans(loanRepository.countByStatus(LoanStatus.CLOSED))
                                .totalDisbursedAmount(loanRepository.sumAllActivePrincipal())
                                .overdueEMIs(emiScheduleRepository.countByStatus(EMIStatus.OVERDUE))
                                .build();
        }
}
