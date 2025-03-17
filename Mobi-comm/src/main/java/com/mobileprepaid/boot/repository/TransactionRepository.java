package com.mobileprepaid.boot.repository;

import com.mobileprepaid.boot.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
	boolean existsById(String transactionId);
}

