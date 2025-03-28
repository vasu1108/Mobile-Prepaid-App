package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.exception.ResourceNotFoundException;
import com.mobileprepaid.boot.exception.InvalidRequestException;
import com.mobileprepaid.boot.model.Plan;
import com.mobileprepaid.boot.repository.PlanRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanService {
    private final PlanRepository planRepository;

    @Autowired
    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    public Plan getPlanById(int id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with ID: " + id));
    }

    public Plan savePlan(Plan plan) {
        return planRepository.save(plan);
    }

    public void deletePlan(int id) {
        if (!planRepository.existsById(id)) {
            throw new ResourceNotFoundException("Plan not found with ID: " + id);
        }
        planRepository.deleteById(id);
    }

    // Fetch all active plans
    public List<Plan> getAllActivePlans() {
        return planRepository.findByPlanStatus("Active");
    }

    // Fetch active plans by category
    public List<Plan> getActivePlansByCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            throw new InvalidRequestException("Category name cannot be empty or null.");
        }
        return planRepository.findByCategoryCategoryNameAndPlanStatus(category, "Active");
    }

    // Deactivate a plan by setting its status to "Inactive"
    public Plan deactivatePlan(int planId) {
        Plan existingPlan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with ID: " + planId));

        existingPlan.setPlanStatus("Inactive");
        return planRepository.save(existingPlan);
    }
}
