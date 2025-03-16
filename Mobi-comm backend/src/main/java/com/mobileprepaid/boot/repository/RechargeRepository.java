package com.mobileprepaid.boot.repository;

import com.mobileprepaid.boot.model.Recharge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RechargeRepository extends JpaRepository<Recharge, Integer> {
}

