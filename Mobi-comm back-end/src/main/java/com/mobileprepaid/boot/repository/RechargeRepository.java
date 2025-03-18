package com.mobileprepaid.boot.repository;

import com.mobileprepaid.boot.model.Recharge;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RechargeRepository extends JpaRepository<Recharge, Integer> {
	List<Recharge> findByUserUserId(int userId);
}

