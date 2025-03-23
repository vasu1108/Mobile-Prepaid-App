package com.mobileprepaid.boot.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mobileprepaid.boot.model.Plan;
import com.mobileprepaid.boot.service.CategoryService;
import com.mobileprepaid.boot.service.PlanService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/plans")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class PlanController {
    @Autowired
    private PlanService planService;
    
    @Autowired
    private CategoryService categoryService;

    @GetMapping("/category")
    public ResponseEntity<List<Plan>> getPlansByCategory(@RequestParam String category) {
        return ResponseEntity.ok(categoryService.getPlansByCategory(category));
    }


    @GetMapping
    public ResponseEntity<List<Plan>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Plan> getPlanById(@PathVariable int id) {
        Optional<Plan> plan = planService.getPlanById(id);
        return plan.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Plan> createPlan(@RequestBody Plan plan) {
        return ResponseEntity.ok(planService.savePlan(plan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Plan> updatePlan(@PathVariable int id, @RequestBody Plan updatedPlan) {
        if (planService.getPlanById(id).isPresent()) {
            updatedPlan.setPlanId(id);
            return ResponseEntity.ok(planService.savePlan(updatedPlan));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable int id) {
        planService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
    
 // Get all active plans
    @GetMapping("/active")
    public ResponseEntity<List<Plan>> getAllActivePlans() {
        List<Plan> activePlans = planService.getAllActivePlans();
        return ResponseEntity.ok(activePlans);
    }

    // Get active plans by category ID
    @GetMapping("/active-by-category")
    public ResponseEntity<List<Plan>> getActivePlansByCategory(@RequestParam String category) {
        List<Plan> activePlans = planService.getActivePlansByCategory(category);
        return ResponseEntity.ok(activePlans);
    }
    
    @PutMapping("/{planId}/deactivate")
    public ResponseEntity<Plan> deactivatePlan(@PathVariable int planId) {
        Plan updatedPlan = planService.deactivatePlan(planId);
        return ResponseEntity.ok(updatedPlan);
    }


}
