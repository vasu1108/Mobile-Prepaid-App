package com.mobileprepaid.boot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.mobileprepaid.boot.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
	@Query("SELECT c.categoryId, c.categoryName FROM Category c")
	List<Object[]> findAllCategoriesWithIdAndName();
	
	
}
