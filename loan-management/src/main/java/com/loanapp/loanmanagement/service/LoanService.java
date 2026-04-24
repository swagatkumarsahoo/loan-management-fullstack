package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.dto.request.LoanApplicationRequest;
import com.loanapp.loanmanagement.dto.request.LoanReviewRequest;
import com.loanapp.loanmanagement.dto.response.EligibilityResponse;
import com.loanapp.loanmanagement.dto.response.LoanResponse;
import com.loanapp.loanmanagement.entity.EMISchedule;
import com.loanapp.loanmanagement.entity.Loan;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.enums.LoanType;
import com.loanapp.loanmanagement.exception.LoanNotEligibleException;
import com.loanapp.loanmanagement.exception.ResourceNotFoundException;
import com.loanapp.loanmanagement.repository.EMIScheduleRepository;
import com.loanapp.loanmanagement.repository.LoanRepository;
import com.loanapp.loanmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoanService {

    private final LoanRepository loanRepository;
    private final EMIScheduleRepository emiScheduleRepository;
    private final UserRepository userRepository;

    private static final Map<LoanType, Double> INTEREST_RATES = Map.of(
            LoanType.HOME_LOAN,       8.5,
            LoanType.PERSONAL_LOAN,  14.0,
            LoanType.CAR_LOAN,        9.5,
            LoanType.EDUCATION_LOAN,  7.0,
            LoanType.BUSINESS_LOAN,  12.0,
            LoanType.GOLD_LOAN,       9.0
    );

    public EligibilityResponse checkEligibility(User user, Double requestedAmount,
                                                Integer tenureMonths, LoanType loanType) {
        int    creditScore   = user.getCreditScore()  != null ? user.getCreditScore()  : 0;
        double income        = user.getAnnualIncome() != null ? user.getAnnualIncome() : 0;
        double monthlyIncome = income / 12.0;

        if (creditScore < 650) {
            return EligibilityResponse.builder().eligible(false)
                    .reason("Credit score " + creditScore + " is below the minimum required score of 650.")
                    .creditScore(creditScore).annualIncome(income).build();
        }
        if (income < 120000) {
            return EligibilityResponse.builder().eligible(false)
                    .reason("Annual income Rs." + income + " is below minimum required Rs.1,20,000.")
                    .creditScore(creditScore).annualIncome(income).build();
        }

        double annualRate = INTEREST_RATES.getOrDefault(loanType, 12.0);
        double emi        = calculateEMI(requestedAmount, annualRate, tenureMonths);

        if (emi > monthlyIncome * 0.50) {
            double maxEligible = calculateMaxLoanAmount(monthlyIncome * 0.50, annualRate, tenureMonths);
            return EligibilityResponse.builder().eligible(false)
                    .reason(String.format("Requested EMI Rs.%.2f exceeds 50%% of monthly income. Max eligible: Rs.%.2f", emi, maxEligible))
                    .maxEligibleAmount(maxEligible).annualInterestRate(annualRate)
                    .creditScore(creditScore).annualIncome(income).build();
        }

        double maxMultiplier = creditScore >= 750 ? 60 : creditScore >= 700 ? 48 : 36;
        double maxAllowed    = monthlyIncome * maxMultiplier;
        if (requestedAmount > maxAllowed) {
            return EligibilityResponse.builder().eligible(false)
                    .reason(String.format("Requested amount exceeds max eligible Rs.%.2f based on credit score and income.", maxAllowed))
                    .maxEligibleAmount(maxAllowed).annualInterestRate(annualRate)
                    .creditScore(creditScore).annualIncome(income).build();
        }

        return EligibilityResponse.builder().eligible(true)
                .reason("Congratulations! You are eligible for this loan.")
                .maxEligibleAmount(maxAllowed).suggestedEMI(emi)
                .annualInterestRate(annualRate).creditScore(creditScore).annualIncome(income).build();
    }

    @Transactional
    public LoanResponse applyForLoan(User currentUser, LoanApplicationRequest request) {
        User managedUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EligibilityResponse eligibility = checkEligibility(
                managedUser, request.getPrincipalAmount(), request.getTenureMonths(), request.getLoanType());
        if (!eligibility.isEligible()) {
            throw new LoanNotEligibleException(eligibility.getReason());
        }

        double annualRate    = INTEREST_RATES.getOrDefault(request.getLoanType(), 12.0);
        double emi           = calculateEMI(request.getPrincipalAmount(), annualRate, request.getTenureMonths());
        double totalPayable  = emi * request.getTenureMonths();
        double totalInterest = totalPayable - request.getPrincipalAmount();

        Loan loan = Loan.builder()
                .user(managedUser)
                .loanType(request.getLoanType())
                .principalAmount(request.getPrincipalAmount())
                .annualInterestRate(annualRate)
                .tenureMonths(request.getTenureMonths())
                .emiAmount(round(emi))
                .totalPayableAmount(round(totalPayable))
                .totalInterestAmount(round(totalInterest))
                .purpose(request.getPurpose())
                .status(LoanStatus.PENDING)
                .build();

        return toResponse(loanRepository.save(loan));
    }

    @Transactional
    public LoanResponse reviewLoan(User adminUser, LoanReviewRequest request) {
        User managedAdmin = userRepository.findById(adminUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        Loan loan = loanRepository.findByIdWithUser(request.getLoanId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + request.getLoanId()));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new IllegalStateException("Only PENDING loans can be reviewed.");
        }

        loan.setReviewedBy(managedAdmin);
        loan.setReviewedAt(LocalDateTime.now());

        if (request.getApproved()) {
            loan.setStatus(LoanStatus.APPROVED);
            loan.setDisbursedAt(LocalDateTime.now());
            generateEMISchedule(loan);
            loan.setStatus(LoanStatus.ACTIVE);
        } else {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required when rejecting a loan.");
            }
            loan.setStatus(LoanStatus.REJECTED);
            loan.setRejectionReason(request.getRejectionReason());
        }

        return toResponse(loanRepository.save(loan));
    }

    public Page<LoanResponse> getMyLoans(User user, Pageable pageable) {
        return loanRepository.findByUserId(user.getId(), pageable).map(this::toResponse);
    }

    public Page<LoanResponse> getAllLoans(Pageable pageable) {
        return loanRepository.findAllWithUser(pageable).map(this::toResponse);
    }

    public Page<LoanResponse> getLoansByStatus(LoanStatus status, Pageable pageable) {
        return loanRepository.findByStatusWithUser(status, pageable).map(this::toResponse);
    }

    public LoanResponse getLoanById(Long id, User currentUser) {
        Loan loan = loanRepository.findByIdWithUser(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + id));
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !loan.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Loan not found: " + id);
        }
        return toResponse(loan);
    }

    private void generateEMISchedule(Loan loan) {
        double principal   = loan.getPrincipalAmount();
        double monthlyRate = loan.getAnnualInterestRate() / 12.0 / 100.0;
        int    tenure      = loan.getTenureMonths();
        double emi         = loan.getEmiAmount();
        double outstanding = principal;
        List<EMISchedule> schedules = new ArrayList<>();
        LocalDate dueDate = LocalDate.now().plusMonths(1).withDayOfMonth(1);

        for (int i = 1; i <= tenure; i++) {
            double interest  = round(outstanding * monthlyRate);
            double princComp = round(emi - interest);
            if (i == tenure) { princComp = round(outstanding); emi = round(princComp + interest); }
            outstanding = round(outstanding - princComp);
            schedules.add(EMISchedule.builder()
                    .loan(loan).instalmentNumber(i).dueDate(dueDate)
                    .emiAmount(emi).principalComponent(princComp)
                    .interestComponent(interest).outstandingPrincipal(Math.max(0, outstanding))
                    .build());
            dueDate = dueDate.plusMonths(1);
        }
        emiScheduleRepository.saveAll(schedules);
    }

    public double calculateEMI(double principal, double annualRate, int tenureMonths) {
        double r = annualRate / 12.0 / 100.0;
        if (r == 0) return principal / tenureMonths;
        double power = Math.pow(1 + r, tenureMonths);
        return principal * r * power / (power - 1);
    }

    private double calculateMaxLoanAmount(double maxEMI, double annualRate, int tenureMonths) {
        double r = annualRate / 12.0 / 100.0;
        if (r == 0) return maxEMI * tenureMonths;
        double power = Math.pow(1 + r, tenureMonths);
        return maxEMI * (power - 1) / (r * power);
    }

    private double round(double v) { return Math.round(v * 100.0) / 100.0; }

    public LoanResponse toResponse(Loan loan) {
        return LoanResponse.builder()
                .id(loan.getId())
                .userId(loan.getUser().getId())
                .userFullName(loan.getUser().getFullName())
                .userEmail(loan.getUser().getEmail())
                .loanType(loan.getLoanType())
                .principalAmount(loan.getPrincipalAmount())
                .annualInterestRate(loan.getAnnualInterestRate())
                .tenureMonths(loan.getTenureMonths())
                .emiAmount(loan.getEmiAmount())
                .totalPayableAmount(loan.getTotalPayableAmount())
                .totalInterestAmount(loan.getTotalInterestAmount())
                .status(loan.getStatus())
                .purpose(loan.getPurpose())
                .rejectionReason(loan.getRejectionReason())
                .appliedAt(loan.getAppliedAt())
                .reviewedAt(loan.getReviewedAt())
                .disbursedAt(loan.getDisbursedAt())
                .build();
    }
}
