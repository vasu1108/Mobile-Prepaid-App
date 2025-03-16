package com.mobileprepaid.boot.controller;

import com.mobileprepaid.boot.model.Transaction;
import com.mobileprepaid.boot.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable String id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionService.saveTransaction(transaction));
    }
}

