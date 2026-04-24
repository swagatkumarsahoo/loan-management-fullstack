package com.loanapp.loanmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emi_schedule_id", nullable = false)
    private EMISchedule emiSchedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by", nullable = false)
    private User paidBy;

    // ─── Payment details ─────────────────────────────────────────
    @Column(nullable = false)
    private Double amountPaid;

    private Double penaltyPaid;

    @Column(nullable = false, unique = true)
    private String transactionId;      // Unique reference number

    private String paymentMode;        // UPI, NEFT, IMPS, CARD

    @Column(nullable = false)
    private String paymentStatus;      // SUCCESS, FAILED, PENDING

    private String remarks;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime paidAt;
}
