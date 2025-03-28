package com.mobileprepaid.boot.controller;

import com.mobileprepaid.boot.model.Transaction;
import com.mobileprepaid.boot.service.TransactionService;

import jakarta.mail.MessagingException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
@CrossOrigin(origins = "http://127.0.0.1:5500")
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
        Transaction savedTransaction = transactionService.createTransaction(transaction);
        return ResponseEntity.ok(savedTransaction);
    }

    @GetMapping("/last/{userId}")
    public ResponseEntity<Transaction> getLastTransaction(@PathVariable int userId) {
        return transactionService.getLastTransactionByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/email/send")
    public ResponseEntity<Map<String, String>> sendTransactionEmail(@RequestBody Map<String, Object> emailData) {
        transactionService.sendTransactionEmail(emailData);
        return ResponseEntity.ok(Map.of("message", "Transaction email sent successfully"));
    }

   
}