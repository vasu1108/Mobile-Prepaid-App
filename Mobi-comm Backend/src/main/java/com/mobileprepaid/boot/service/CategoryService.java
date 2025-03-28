package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.exception.ResourceNotFoundException;
import com.mobileprepaid.boot.exception.DataIntegrityViolationException;
import com.mobileprepaid.boot.model.Category;
import com.mobileprepaid.boot.model.Plan;
import com.mobileprepaid.boot.repository.CategoryRepository;
import com.mobileprepaid.boot.repository.PlanRepository;
import com.mobileprepaid.boot.repository.TransactionRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

	private final CategoryRepository categoryRepository;
    private final PlanRepository planRepository;
    private final PlanService planService; // ✅ Inject PlanService

    public CategoryService(CategoryRepository categoryRepository, PlanRepository planRepository, PlanService planService) {
        this.categoryRepository = categoryRepository;
        this.planRepository = planRepository;
        this.planService = planService;
    }

    public List<Plan> getPlansByCategory(String categoryName) {
        List<Plan> plans = planRepository.findByCategory_CategoryName(categoryName);
        if (plans.isEmpty()) {
            throw new ResourceNotFoundException("No plans found for category: " + categoryName);
        }
        return plans;
    }

    public List<Category> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            throw new ResourceNotFoundException("No categories found.");
        }
        return categories;
    }

    public Category getCategoryById(int id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    public Category addCategory(Category category) {
        try {
            return categoryRepository.save(category);
        } catch (DataIntegrityViolationException e) {
            throw new DataIntegrityViolationException("Category name must be unique.");
        }
    }

    public Category updateCategory(int id, Category updatedCategory) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setCategoryName(updatedCategory.getCategoryName());
                    try {
                        return categoryRepository.save(category);
                    } catch (DataIntegrityViolationException e) {
                        throw new DataIntegrityViolationException("Category update failed due to database constraints.");
                    }
                })
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    public void deleteCategory(int id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }

    public List<Map<String, Object>> getAllCategoryIdAndName() {
        List<Object[]> results = categoryRepository.findAllCategoriesWithIdAndName();
        if (results.isEmpty()) {
            throw new ResourceNotFoundException("No categories found.");
        }
        return results.stream()
                .map(obj -> Map.of("categoryId", obj[0], "categoryName", obj[1]))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteCategoryAndDeactivatePlans(int categoryId) {
        // ✅ Fetch category from DB
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + categoryId));

        // ✅ Fetch all plans under this category
        List<Plan> plans = planRepository.findByCategory_CategoryName(category.getCategoryName());

        // ✅ Deactivate each plan and remove category reference
        for (Plan plan : plans) {
            plan.setPlanStatus("Inactive"); // Deactivate plan
            plan.setCategory(null); // Remove reference to category to prevent constraint issues
            planRepository.save(plan);
        }

        // ✅ Delete the category after removing associations
        categoryRepository.delete(category);
    }



}
