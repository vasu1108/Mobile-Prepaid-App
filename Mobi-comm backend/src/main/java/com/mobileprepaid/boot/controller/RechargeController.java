package com.mobileprepaid.boot.controller;

import com.mobileprepaid.boot.model.Recharge;
import com.mobileprepaid.boot.service.RechargeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recharges")
public class RechargeController {
    private final RechargeService rechargeService;

    public RechargeController(RechargeService rechargeService) {
        this.rechargeService = rechargeService;
    }

    @GetMapping
    public ResponseEntity<List<Recharge>> getAllRecharges() {
        return ResponseEntity.ok(rechargeService.getAllRecharges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recharge> getRechargeById(@PathVariable int id) {
        return ResponseEntity.ok(rechargeService.getRechargeById(id));
    }

    @PostMapping
    public ResponseEntity<Recharge> createRecharge(@RequestBody Recharge recharge) {
        return ResponseEntity.ok(rechargeService.saveRecharge(recharge));
    }
}
