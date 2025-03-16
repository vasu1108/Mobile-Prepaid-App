package com.mobileprepaid.boot.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobileprepaid.boot.model.Plan;
import com.mobileprepaid.boot.repository.PlanRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PlanService {
    @Autowired
    private PlanRepository planRepository;

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    public Optional<Plan> getPlanById(int id) {
        return planRepository.findById(id);
    }

    public Plan savePlan(Plan plan) {
        return planRepository.save(plan);
    }

    public void deletePlan(int id) {
        planRepository.deleteById(id);
    }
}
