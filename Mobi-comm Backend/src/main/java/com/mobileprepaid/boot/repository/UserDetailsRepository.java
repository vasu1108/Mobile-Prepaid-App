package com.mobileprepaid.boot.repository;

import com.mobileprepaid.boot.model.UserDetail;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDetailsRepository extends JpaRepository<UserDetail, Integer> {
	Optional<UserDetail> findByUserUserId(int userId);
	
	
}
