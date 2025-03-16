package com.mobileprepaid.boot.model;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "transactions")
public class Transaction {
    @Id
    @Column(length = 50)
    private String transactionId;

    

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal transactionAmount;

    @Column(nullable = false, length = 50)
    private String paymentMode;

    @Column(nullable = false, length = 20)
    private String transactionStatus; // 'Success', 'Failed', 'Pending'

    @Column(nullable = false)
    private LocalDateTime transactionDate;
}
