package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.model.Transaction;
import com.mobileprepaid.boot.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.UUID;

import com.mobileprepaid.boot.model.Transaction;
import com.mobileprepaid.boot.model.Plan;
import com.mobileprepaid.boot.model.Recharge;
import com.mobileprepaid.boot.model.User;
import com.mobileprepaid.boot.repository.TransactionRepository;
import com.mobileprepaid.boot.repository.PlanRepository;
import com.mobileprepaid.boot.repository.RechargeRepository;
import com.mobileprepaid.boot.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PlanRepository planRepository;
    private final UserRepository userRepository;
    private final RechargeRepository rechargeRepository;



    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction getTransactionById(String id) {
        return transactionRepository.findById(id).orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    private String generateTransactionId() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        int randomNum = new Random().nextInt(900) + 100; // Generates a 3-digit number
        return "TXN" + timestamp + randomNum;
    }
    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        // Fetch full User and Plan details
    	transaction.setTransactionId(generateTransactionId());
    	
        User user = userRepository.findById(transaction.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Plan plan = planRepository.findById(transaction.getPlan().getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        // Set user and plan details
        transaction.setUser(user);
        transaction.setPlan(plan);
        transaction.setTransactionDate(LocalDateTime.now());

        // Save Transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Automatically create a Recharge entry
        Recharge recharge = new Recharge();
        recharge.setUser(user);
        recharge.setPlan(plan);
        recharge.setRechargeDate(LocalDateTime.now());
        recharge.setTransaction(savedTransaction);

        // Save Recharge
        rechargeRepository.save(recharge);

        return savedTransaction;
    }

    public Optional<Transaction> getLastTransactionByUserId(int userId) {
        return transactionRepository.findTopByUserUserIdOrderByTransactionDateDesc(userId);
    }
}


