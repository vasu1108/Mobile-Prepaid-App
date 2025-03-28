package com.mobileprepaid.boot.controller;

import com.mobileprepaid.boot.model.Category;
import com.mobileprepaid.boot.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable int id) {
        Category category = categoryService.getCategoryById(id);  
        return ResponseEntity.ok(category);  
    }


    @PostMapping
    public ResponseEntity<Category> addCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.addCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable int id, @RequestBody Category category) {
        Category updatedCategory = categoryService.updateCategory(id, category);
        return updatedCategory != null ? ResponseEntity.ok(updatedCategory) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable int id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/names")
    public ResponseEntity<List<Map<String, Object>>> getCategoryIdAndName() {
        return ResponseEntity.ok(categoryService.getAllCategoryIdAndName());
    }
    
    @DeleteMapping("/{categoryId}/deactivate-plans")
    public ResponseEntity<String> deleteCategoryAndDeactivatePlans(@PathVariable int categoryId) {
        categoryService.deleteCategoryAndDeactivatePlans(categoryId);
        return ResponseEntity.ok("Category deleted and associated plans deactivated.");
    }


}


