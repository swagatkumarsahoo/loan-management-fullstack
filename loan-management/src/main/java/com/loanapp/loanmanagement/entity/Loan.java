package com.loanapp.loanmanagement.entity;

import com.loanapp.loanmanagement.enums.LoanStatus;
import com.loanapp.loanmanagement.enums.LoanType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── Relationships ──────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EMISchedule> emiSchedules = new ArrayList<>();

    // ─── Loan details ───────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanType loanType;

    @Column(nullable = false)
    private Double principalAmount;

    @Column(nullable = false)
    private Double annualInterestRate;

    @Column(nullable = false)
    private Integer tenureMonths;

    // ─── Calculated fields (set by service) ─────────────────────
    private Double emiAmount;
    private Double totalPayableAmount;
    private Double totalInterestAmount;

    // ─── Status & lifecycle ──────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoanStatus status = LoanStatus.PENDING;

    private String purpose;
    private String rejectionReason;

    // ─── Admin actions ───────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime reviewedAt;
    private LocalDateTime disbursedAt;

    // ─── Timestamps ──────────────────────────────────────────────
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime appliedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
