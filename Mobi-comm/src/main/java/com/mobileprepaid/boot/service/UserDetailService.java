package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.model.UserDetail;
import com.mobileprepaid.boot.repository.UserDetailsRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailService {
    private final UserDetailsRepository userDetailsRepository;

    public UserDetailService(UserDetailsRepository userDetailsRepository) {
        this.userDetailsRepository = userDetailsRepository;
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

    public void deleteUserDetails(int id) {
        userDetailsRepository.deleteById(id);
    }
}
