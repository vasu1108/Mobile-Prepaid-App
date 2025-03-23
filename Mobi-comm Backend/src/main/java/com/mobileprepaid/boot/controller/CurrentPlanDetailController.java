package com.mobileprepaid.boot.controller;

import com.mobileprepaid.boot.model.CurrentPlanDetail;
import com.mobileprepaid.boot.service.CurrentPlanDetailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/current-plan")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class CurrentPlanDetailController {

    private final CurrentPlanDetailService currentPlanDetailService;

    public CurrentPlanDetailController(CurrentPlanDetailService currentPlanDetailService) {
        this.currentPlanDetailService = currentPlanDetailService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CurrentPlanDetail> getCurrentPlanByUserId(@PathVariable int userId) {
        return currentPlanDetailService.getCurrentPlanByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<CurrentPlanDetail>> getAllCurrentPlans() {
        List<CurrentPlanDetail> plans = currentPlanDetailService.getAllCurrentPlans();
        return ResponseEntity.ok(plans);
    }

    @PutMapping("/update/{userId}")
    public ResponseEntity<CurrentPlanDetail> updateCurrentPlan(@PathVariable int userId, @RequestBody CurrentPlanDetail updatedDetails) {
        return ResponseEntity.ok(currentPlanDetailService.updateCurrentPlan(userId, updatedDetails));
    }

    @PutMapping("/status/{userId}")
    public ResponseEntity<CurrentPlanDetail> activateOrExpirePlan(@PathVariable int userId, @RequestParam String status) {
        return ResponseEntity.ok(currentPlanDetailService.activateOrExpirePlan(userId, status));
    }
    
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<CurrentPlanDetail>> getPlansExpiringSoon() {
        return ResponseEntity.ok(currentPlanDetailService.getPlansExpiringSoon());
    }
}
