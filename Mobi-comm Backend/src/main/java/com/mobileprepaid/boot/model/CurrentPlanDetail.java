package com.mobileprepaid.boot.model;



import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "current_plan_details")
public class CurrentPlanDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int detailId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Column(nullable = false)
    private LocalDate planStartDate;

    @Column(nullable = false)
    private LocalDate planExpiryDate;

    private String dataUsed;
    private String dataRemaining;
    private int smsUsed;
    private int smsRemaining;
    private int callMinutesUsed;
    private int callMinutesRemaining;

    @Column(nullable = false, length = 20)
    private String planStatus; // 'Active', 'Expired'

    @Column(nullable = false)
    private LocalDateTime lastUpdated;
}

