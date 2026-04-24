package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.dto.request.PaymentRequest;
import com.loanapp.loanmanagement.dto.response.PaymentResponse;
import com.loanapp.loanmanagement.entity.EMISchedule;
import com.loanapp.loanmanagement.entity.Loan;
import com.loanapp.loanmanagement.entity.Payment;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.EMIStatus;
import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.exception.ResourceNotFoundException;
import com.loanapp.loanmanagement.repository.EMIScheduleRepository;
import com.loanapp.loanmanagement.repository.LoanRepository;
import com.loanapp.loanmanagement.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final EMIScheduleRepository emiScheduleRepository;
    private final LoanRepository loanRepository;

    private static final double PENALTY_RATE_PER_DAY = 0.001; // 0.1% per overdue day

    @Transactional
    public PaymentResponse makePayment(User user, PaymentRequest request) {
        EMISchedule emi = emiScheduleRepository.findById(request.getEmiScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("EMI schedule not found"));

        // Ownership check
        if (!emi.getLoan().getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("EMI schedule not found");
        }

        if (emi.getStatus() == EMIStatus.PAID) {
            throw new IllegalStateException("This EMI is already paid.");
        }

        // Calculate penalty if overdue
        double penalty = 0.0;
        if (LocalDate.now().isAfter(emi.getDueDate())) {
            long daysOverdue = LocalDate.now().toEpochDay() - emi.getDueDate().toEpochDay();
            penalty = Math.round(emi.getEmiAmount() * PENALTY_RATE_PER_DAY * daysOverdue * 100.0) / 100.0;
        }

        double totalDue = emi.getEmiAmount() + penalty;
        if (request.getAmountPaid() < totalDue) {
            throw new IllegalArgumentException(
                    String.format("Amount paid ₹%.2f is less than total due ₹%.2f (EMI ₹%.2f + Penalty ₹%.2f)",
                            request.getAmountPaid(), totalDue, emi.getEmiAmount(), penalty));
        }

        // Record payment
        String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        Payment payment = Payment.builder()
                .loan(emi.getLoan())
                .emiSchedule(emi)
                .paidBy(user)
                .amountPaid(request.getAmountPaid())
                .penaltyPaid(penalty)
                .transactionId(txnId)
                .paymentMode(request.getPaymentMode())
                .paymentStatus("SUCCESS")
                .remarks(request.getRemarks())
                .build();
        paymentRepository.save(payment);

        // Update EMI status
        emi.setStatus(EMIStatus.PAID);
        emi.setPaidDate(LocalDate.now());
        emi.setPenaltyAmount(penalty);
        emiScheduleRepository.save(emi);

        // Check if all EMIs are paid → close the loan
        Loan loan = emi.getLoan();
        long unpaidCount = emiScheduleRepository
                .findByLoanAndStatus(loan, EMIStatus.PENDING).size()
                + emiScheduleRepository.findByLoanAndStatus(loan, EMIStatus.OVERDUE).size();
        if (unpaidCount == 0) {
            loan.setStatus(LoanStatus.CLOSED);
            loanRepository.save(loan);
        }

        return toResponse(payment, emi.getInstalmentNumber());
    }

    public Page<PaymentResponse> getMyPayments(User user, Pageable pageable) {
        return paymentRepository.findByPaidByOrderByPaidAtDesc(user, pageable)
                .map(p -> toResponse(p, p.getEmiSchedule().getInstalmentNumber()));
    }

    private PaymentResponse toResponse(Payment p, int instalmentNumber) {
        return PaymentResponse.builder()
                .id(p.getId())
                .loanId(p.getLoan().getId())
                .emiScheduleId(p.getEmiSchedule().getId())
                .instalmentNumber(instalmentNumber)
                .amountPaid(p.getAmountPaid())
                .penaltyPaid(p.getPenaltyPaid())
                .transactionId(p.getTransactionId())
                .paymentMode(p.getPaymentMode())
                .paymentStatus(p.getPaymentStatus())
                .remarks(p.getRemarks())
                .paidAt(p.getPaidAt())
                .build();
    }
}
