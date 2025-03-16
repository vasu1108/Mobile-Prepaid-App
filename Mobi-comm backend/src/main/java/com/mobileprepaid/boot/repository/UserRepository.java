package com.mobileprepaid.boot.repository;

import com.mobileprepaid.boot.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}

