package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.exception.ResourceNotFoundException;
import com.mobileprepaid.boot.exception.DataIntegrityViolationException;
import com.mobileprepaid.boot.model.CurrentPlanDetail;
import com.mobileprepaid.boot.repository.CurrentPlanDetailRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CurrentPlanDetailService {

    private final CurrentPlanDetailRepository currentPlanDetailRepository;

    public CurrentPlanDetailService(CurrentPlanDetailRepository currentPlanDetailRepository) {
        this.currentPlanDetailRepository = currentPlanDetailRepository;
    }

    public Optional<CurrentPlanDetail> getCurrentPlanByUserId(int userId) {
        return currentPlanDetailRepository.findByUserUserId(userId);
    }

    public List<CurrentPlanDetail> getAllCurrentPlans() {
        List<CurrentPlanDetail> plans = currentPlanDetailRepository.findAll();
        if (plans.isEmpty()) {
            throw new ResourceNotFoundException("No active current plans found.");
        }
        return plans;
    }

    public CurrentPlanDetail updateCurrentPlan(int userId, CurrentPlanDetail updatedDetails) {
        return currentPlanDetailRepository.findByUserUserId(userId)
                .map(existingPlan -> {
                    existingPlan.setDataUsed(updatedDetails.getDataUsed());
                    existingPlan.setDataRemaining(updatedDetails.getDataRemaining());
                    existingPlan.setSmsUsed(updatedDetails.getSmsUsed());
                    existingPlan.setSmsRemaining(updatedDetails.getSmsRemaining());
                    existingPlan.setCallMinutesUsed(updatedDetails.getCallMinutesUsed());
                    existingPlan.setCallMinutesRemaining(updatedDetails.getCallMinutesRemaining());
                    existingPlan.setLastUpdated(LocalDateTime.now());

                    try {
                        return currentPlanDetailRepository.save(existingPlan);
                    } catch (DataIntegrityViolationException e) {
                        throw new DataIntegrityViolationException("Error updating current plan due to database constraints.");
                    }
                })
                .orElseThrow(() -> new ResourceNotFoundException("Current Plan not found for user ID: " + userId));
    }

    public CurrentPlanDetail activateOrExpirePlan(int userId, String status) {
        return currentPlanDetailRepository.findByUserUserId(userId)
                .map(plan -> {
                    plan.setPlanStatus(status);
                    plan.setLastUpdated(LocalDateTime.now());
                    return currentPlanDetailRepository.save(plan);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found for user ID: " + userId));
    }

    public List<CurrentPlanDetail> getPlansExpiringSoon() {
        LocalDate threeDaysFromNow = LocalDate.now().plusDays(3);
        List<CurrentPlanDetail> plans = currentPlanDetailRepository.findByPlanExpiryDate(threeDaysFromNow);
        
        if (plans.isEmpty()) {
            throw new ResourceNotFoundException("No plans expiring in 3 days.");
        }
        
        return plans;
    }
}
