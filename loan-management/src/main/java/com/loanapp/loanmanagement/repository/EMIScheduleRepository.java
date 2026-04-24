package com.loanapp.loanmanagement.repository;

import com.loanapp.loanmanagement.entity.EMISchedule;
import com.loanapp.loanmanagement.entity.Loan;
import com.loanapp.loanmanagement.enums.EMIStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EMIScheduleRepository extends JpaRepository<EMISchedule, Long> {

    List<EMISchedule> findByLoanOrderByInstalmentNumberAsc(Loan loan);

    List<EMISchedule> findByLoanAndStatus(Loan loan, EMIStatus status);

    Optional<EMISchedule> findByLoanAndInstalmentNumber(Loan loan, int instalmentNumber);

    // Find all overdue EMIs across all loans (for admin)
    @Query("SELECT e FROM EMISchedule e WHERE e.status = 'PENDING' AND e.dueDate < :today")
    List<EMISchedule> findAllOverdue(@Param("today") LocalDate today);

    long countByStatus(EMIStatus status);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p WHERE p.loan = :loan")
    Double sumPaidAmountByLoan(@Param("loan") Loan loan);
}
