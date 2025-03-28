package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.exception.ResourceNotFoundException;
import com.mobileprepaid.boot.model.Recharge;
import com.mobileprepaid.boot.repository.RechargeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RechargeService {
    private final RechargeRepository rechargeRepository;

    public RechargeService(RechargeRepository rechargeRepository) {
        this.rechargeRepository = rechargeRepository;
    }

    public List<Recharge> getAllRecharges() {
        List<Recharge> recharges = rechargeRepository.findAll();
        if (recharges.isEmpty()) {
            throw new ResourceNotFoundException("No recharges found.");
        }
        return recharges;
    }

    public Recharge getRechargeById(int id) {
        return rechargeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recharge not found with ID: " + id));
    }

    public Recharge saveRecharge(Recharge recharge) {
        try {
            return rechargeRepository.save(recharge);
        } catch (DataIntegrityViolationException ex) {
            throw new com.mobileprepaid.boot.exception.DataIntegrityViolationException("Failed to save recharge due to database constraint violation.");
        } catch (Exception ex) {
            throw new RuntimeException("An unexpected error occurred while saving the recharge.");
        }
    }

    public List<Recharge> getRechargesByUserId(int userId) {
        List<Recharge> recharges = rechargeRepository.findByUserUserId(userId);
        if (recharges.isEmpty()) {
            throw new ResourceNotFoundException("No recharges found for user with ID: " + userId);
        }
        return recharges;
    }
}
