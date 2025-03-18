package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.model.Recharge;
import com.mobileprepaid.boot.repository.RechargeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RechargeService {
    private final RechargeRepository rechargeRepository;

    public RechargeService(RechargeRepository rechargeRepository) {
        this.rechargeRepository = rechargeRepository;
    }

    public List<Recharge> getAllRecharges() {
        return rechargeRepository.findAll();
    }

    public Recharge getRechargeById(int id) {
        return rechargeRepository.findById(id).orElseThrow(() -> new RuntimeException("Recharge not found"));
    }

    public Recharge saveRecharge(Recharge recharge) {
        return rechargeRepository.save(recharge);
    }
    
    public List<Recharge> getRechargesByUserId(int userId) {
        return rechargeRepository.findByUserUserId(userId);
    }
}
