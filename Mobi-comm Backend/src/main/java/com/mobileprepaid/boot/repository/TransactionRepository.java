package com.mobileprepaid.boot.repository;

import com.mobileprepaid.boot.model.Transaction;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
	boolean existsById(String transactionId);
	Optional<Transaction> findTopByUserUserIdOrderByTransactionDateDesc(int userId);
}

