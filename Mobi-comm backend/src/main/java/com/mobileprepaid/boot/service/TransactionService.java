package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.model.Transaction;
import com.mobileprepaid.boot.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction getTransactionById(String id) {
        return transactionRepository.findById(id).orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }
}
