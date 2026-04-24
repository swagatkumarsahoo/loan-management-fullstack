package com.loanapp.loanmanagement.repository;

import com.loanapp.loanmanagement.entity.Loan;
import com.loanapp.loanmanagement.entity.Payment;
import com.loanapp.loanmanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Page<Payment> findByPaidByOrderByPaidAtDesc(User user, Pageable pageable);

    List<Payment> findByLoanOrderByPaidAtDesc(Loan loan);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p WHERE p.paidBy = :user AND p.paymentStatus = 'SUCCESS'")
    Double sumSuccessfulPaymentsByUser(@Param("user") User user);

    boolean existsByTransactionId(String transactionId);
}
