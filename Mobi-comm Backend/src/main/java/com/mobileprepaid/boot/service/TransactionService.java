package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.exception.ResourceNotFoundException;
import com.mobileprepaid.boot.exception.DataIntegrityViolationException;
import com.mobileprepaid.boot.model.Transaction;
import com.mobileprepaid.boot.model.Plan;
import com.mobileprepaid.boot.model.Recharge;
import com.mobileprepaid.boot.model.User;
import com.mobileprepaid.boot.repository.TransactionRepository;
import com.mobileprepaid.boot.repository.PlanRepository;
import com.mobileprepaid.boot.repository.RechargeRepository;
import com.mobileprepaid.boot.repository.UserRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PlanRepository planRepository;
    private final UserRepository userRepository;
    private final RechargeRepository rechargeRepository;

    @Autowired
    private JavaMailSender mailSender;

    public List<Transaction> getAllTransactions() {
        List<Transaction> transactions = transactionRepository.findAll();
        if (transactions.isEmpty()) {
            throw new ResourceNotFoundException("No transactions found.");
        }
        return transactions;
    }

    public Transaction getTransactionById(String id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));
    }

    private String generateTransactionId() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        int randomNum = new Random().nextInt(900) + 100; // Generates a 3-digit number
        return "TXN" + timestamp + randomNum;
    }

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        transaction.setTransactionId(generateTransactionId());

        User user = userRepository.findById(transaction.getUser().getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + transaction.getUser().getUserId()));
        Plan plan = planRepository.findById(transaction.getPlan().getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with ID: " + transaction.getPlan().getPlanId()));

        transaction.setUser(user);
        transaction.setPlan(plan);
        transaction.setTransactionDate(LocalDateTime.now());

        try {
            Transaction savedTransaction = transactionRepository.save(transaction);

            // Automatically create a Recharge entry
            Recharge recharge = new Recharge();
            recharge.setUser(user);
            recharge.setPlan(plan);
            recharge.setRechargeDate(LocalDateTime.now());
            recharge.setTransaction(savedTransaction);

            rechargeRepository.save(recharge);

            return savedTransaction;
        } catch (DataIntegrityViolationException ex) {
            throw new DataIntegrityViolationException("Failed to save transaction due to database constraints.");
        } catch (Exception ex) {
            throw new RuntimeException("An unexpected error occurred while processing the transaction.");
        }
    }

    public Optional<Transaction> getLastTransactionByUserId(int userId) {
        return transactionRepository.findTopByUserUserIdOrderByTransactionDateDesc(userId);
    }

    public void sendTransactionEmail(Map<String, Object> emailData) {
        try {
            String to = (String) emailData.get("userEmail");
            String subject = (String) emailData.get("subject");
            String body = (String) emailData.get("body");

            if (to == null || subject == null || body == null) {
                throw new IllegalArgumentException("Invalid email data. Missing required fields.");
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // Send as HTML content
            mailSender.send(message);

        } catch (MessagingException ex) {
            throw new RuntimeException("Failed to send transaction email.", ex);
        }
    }
}
