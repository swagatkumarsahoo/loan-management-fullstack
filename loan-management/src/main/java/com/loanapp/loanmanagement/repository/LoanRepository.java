package com.loanapp.loanmanagement.repository;

import com.loanapp.loanmanagement.entity.Loan;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.LoanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    // ─── FIX: use JOIN FETCH to eagerly load user in the same query ───────────
    // This prevents LazyInitializationException when toResponse() accesses user
    // fields

    @Query("SELECT l FROM Loan l JOIN FETCH l.user WHERE l.user.id = :userId")
    Page<Loan> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT l FROM Loan l JOIN FETCH l.user")
    Page<Loan> findAllWithUser(Pageable pageable);

    @Query("SELECT l FROM Loan l JOIN FETCH l.user WHERE l.status = :status")
    Page<Loan> findByStatusWithUser(@Param("status") LoanStatus status, Pageable pageable);

    @Query("SELECT l FROM Loan l JOIN FETCH l.user WHERE l.id = :id")
    Optional<Loan> findByIdWithUser(@Param("id") Long id);

    // ─── Count queries (no JOIN FETCH needed — don't access user fields) ──────
    long countByUserAndStatus(User user, LoanStatus status);

    long countByStatus(LoanStatus status);

    @Query("SELECT COALESCE(SUM(l.principalAmount), 0) FROM Loan l WHERE l.user = :user AND l.status IN ('ACTIVE','CLOSED')")
    Double sumPrincipalByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(l.principalAmount), 0) FROM Loan l WHERE l.status = 'ACTIVE'")
    Double sumAllActivePrincipal();
}
