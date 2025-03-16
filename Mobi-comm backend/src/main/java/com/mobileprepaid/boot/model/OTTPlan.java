package com.mobileprepaid.boot.model;

import lombok.*;
import jakarta.persistence.*;


@Entity
@Getter
@Setter

@AllArgsConstructor
@Table(name = "ott_plans")
public class OTTPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ottPlanId;

    @ManyToOne
    @JoinColumn(name = "ott_id", nullable = false)
    private OTTProvider ottProvider;

    private String ottPlanName;
    private int ottValidityMonths;

    public OTTPlan() {}  // Explicit no-args constructor
}
