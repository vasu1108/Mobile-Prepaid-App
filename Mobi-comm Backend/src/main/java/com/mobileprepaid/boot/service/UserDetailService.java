package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.model.User;
import com.mobileprepaid.boot.model.UserDetail;
import com.mobileprepaid.boot.repository.UserDetailsRepository;
import com.mobileprepaid.boot.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserDetailService {
    private final UserDetailsRepository userDetailsRepository;
    private final UserRepository userRepository;

    public UserDetailService(UserDetailsRepository userDetailsRepository, UserRepository userRepository) {
        this.userDetailsRepository = userDetailsRepository;
		this.userRepository = userRepository;
    }

    public List<UserDetail> getAllUserDetails() {
        return userDetailsRepository.findAll();
    }

    
    public UserDetail getUserDetailsById(int id) {
        return userDetailsRepository.findById(id).orElseThrow(() -> new RuntimeException("User details not found"));
    }

    public UserDetail saveUserDetails(UserDetail userDetails) {
        return userDetailsRepository.save(userDetails);
    }

    public UserDetail updateUserDetails(int id, UserDetail userDetails) {
        UserDetail existingUserDetails = getUserDetailsById(id);
        existingUserDetails.setDateOfBirth(userDetails.getDateOfBirth());
        existingUserDetails.setAlternateContact(userDetails.getAlternateContact());
        existingUserDetails.setCommunicationLanguage(userDetails.getCommunicationLanguage());
        existingUserDetails.setWorkDetails(userDetails.getWorkDetails());
        existingUserDetails.setUserAddress(userDetails.getUserAddress());
        return userDetailsRepository.save(existingUserDetails);
    }

    public UserDetail updateUserDetailsByUserId(int userId, UserDetail updatedUserDetail) {
        return userDetailsRepository.findByUserUserId(userId).map(existingDetail -> {
            existingDetail.setDateOfBirth(updatedUserDetail.getDateOfBirth());
            existingDetail.setAlternateContact(updatedUserDetail.getAlternateContact());
            existingDetail.setCommunicationLanguage(updatedUserDetail.getCommunicationLanguage());
            existingDetail.setWorkDetails(updatedUserDetail.getWorkDetails());
            existingDetail.setUserAddress(updatedUserDetail.getUserAddress());

            // Update user email if present
            if (updatedUserDetail.getUser() != null && updatedUserDetail.getUser().getUserEmail() != null) {
                User user = existingDetail.getUser();
                user.setUserEmail(updatedUserDetail.getUser().getUserEmail());
                userRepository.save(user);
            }

            return userDetailsRepository.save(existingDetail);
        }).orElseThrow(() -> new RuntimeException("UserDetail not found for userId: " + userId));
    }
    
    public void deleteUserDetails(int id) {
        userDetailsRepository.deleteById(id);
    }
    
    public Optional<UserDetail> getUserDetailByUserId(int userId) {
        return userDetailsRepository.findByUserUserId(userId);
    }
}
