package com.mobileprepaid.boot.repository;

import com.mobileprepaid.boot.model.CurrentPlanDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CurrentPlanDetailRepository extends JpaRepository<CurrentPlanDetail, Integer> {
    Optional<CurrentPlanDetail> findByUserUserId(int userId);

    //Fetch plans that expire in exactly 3 days
    List<CurrentPlanDetail> findByPlanExpiryDate(LocalDate planExpiryDate);
}
