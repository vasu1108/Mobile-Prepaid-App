package com.mobileprepaid.boot.repository;

import com.mobileprepaid.boot.model.UserDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDetailsRepository extends JpaRepository<UserDetail, Integer> {
}
