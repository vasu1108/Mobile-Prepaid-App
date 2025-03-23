package com.mobileprepaid.boot.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobileprepaid.boot.model.Plan;
import com.mobileprepaid.boot.repository.PlanRepository;

import jakarta.persistence.EntityNotFoundException;

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
    
 // Fetch all active plans
    public List<Plan> getAllActivePlans() {
        return planRepository.findByPlanStatus("Active");
    }

 // Service Method
    public List<Plan> getActivePlansByCategory(String category) {
        return planRepository.findByCategoryCategoryNameAndPlanStatus(category, "Active");
    }

    public Plan deactivatePlan(int planId) {
        Plan existingPlan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("Plan not found with ID: " + planId));

        existingPlan.setPlanStatus("Inactive");
        return planRepository.save(existingPlan);
    }

}
