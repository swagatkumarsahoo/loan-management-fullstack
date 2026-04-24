package com.loanapp.loanmanagement.entity;

import com.loanapp.loanmanagement.enums.EMIStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "emi_schedule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EMISchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    // ─── Instalment details ──────────────────────────────────────
    @Column(nullable = false)
    private Integer instalmentNumber;  // 1, 2, 3 ... tenureMonths

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private Double emiAmount;

    @Column(nullable = false)
    private Double principalComponent;  // How much of EMI reduces principal

    @Column(nullable = false)
    private Double interestComponent;   // How much of EMI is interest

    @Column(nullable = false)
    private Double outstandingPrincipal; // Remaining principal after this EMI

    // ─── Payment state ───────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EMIStatus status = EMIStatus.PENDING;

    private LocalDate paidDate;
    private Double penaltyAmount;       // Late payment penalty

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
