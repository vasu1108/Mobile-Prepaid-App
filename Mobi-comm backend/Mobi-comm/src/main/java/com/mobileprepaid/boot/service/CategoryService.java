package com.mobileprepaid.boot.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobileprepaid.boot.model.Plan;
import com.mobileprepaid.boot.repository.PlanRepository;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    private PlanRepository planRepository;

    public List<Plan> getPlansByCategory(String categoryName) {
        return planRepository.findByCategory_CategoryName(categoryName);
    }
}

