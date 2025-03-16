package com.mobileprepaid.boot.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "plan_ott_benefits")
public class PlanOTTBenefit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int benefitId;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    @JsonBackReference
    private Plan plan;

    @ManyToOne
    @JoinColumn(name = "ott_plan_id", nullable = false)
    private OTTPlan ottPlan;
}