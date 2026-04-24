package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.dto.response.EMIResponse;
import com.loanapp.loanmanagement.entity.Loan;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.EMIStatus;
import com.loanapp.loanmanagement.exception.ResourceNotFoundException;
import com.loanapp.loanmanagement.repository.EMIScheduleRepository;
import com.loanapp.loanmanagement.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EMIService {

    private final EMIScheduleRepository emiScheduleRepository;
    private final LoanRepository loanRepository;

    public List<EMIResponse> getEMISchedule(Long loanId, User currentUser) {
        Loan loan = loanRepository.findByIdWithUser(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !loan.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Loan not found: " + loanId);
        }

        return emiScheduleRepository.findByLoanOrderByInstalmentNumberAsc(loan)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<EMIResponse> getPendingEMIs(Long loanId, User currentUser) {
        Loan loan = loanRepository.findByIdWithUser(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));
        return emiScheduleRepository.findByLoanAndStatus(loan, EMIStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markOverdueEMIs() {
        emiScheduleRepository.findAllOverdue(LocalDate.now())
                .forEach(emi -> emi.setStatus(EMIStatus.OVERDUE));
    }

    private EMIResponse toResponse(com.loanapp.loanmanagement.entity.EMISchedule e) {
        return EMIResponse.builder()
                .id(e.getId())
                .loanId(e.getLoan().getId())
                .instalmentNumber(e.getInstalmentNumber())
                .dueDate(e.getDueDate())
                .emiAmount(e.getEmiAmount())
                .principalComponent(e.getPrincipalComponent())
                .interestComponent(e.getInterestComponent())
                .outstandingPrincipal(e.getOutstandingPrincipal())
                .status(e.getStatus())
                .paidDate(e.getPaidDate())
                .penaltyAmount(e.getPenaltyAmount())
                .build();
    }
}
