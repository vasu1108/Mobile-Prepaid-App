package com.mobileprepaid.boot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mobileprepaid.boot.model.Plan;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Integer> {
	
	List<Plan> findByCategory_CategoryName(String categoryName);
	
	// Fetch all active plans
    List<Plan> findByPlanStatus(String planStatus);

 // Repository Method
    List<Plan> findByCategoryCategoryNameAndPlanStatus(String categoryName, String planStatus);

}