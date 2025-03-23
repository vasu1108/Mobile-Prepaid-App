package com.mobileprepaid.boot.service;

import com.mobileprepaid.boot.model.User;
import com.mobileprepaid.boot.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(int id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(int id, User user) {
        User existingUser = getUserById(id);
        
        existingUser.setName(user.getName());
        existingUser.setUserEmail(user.getUserEmail());
        existingUser.setUserStatus(user.getUserStatus()); // Updating user status
        
        return userRepository.save(existingUser);
    }


    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }
    
    public User getUserByMobile(String mobileNumber) {
        return userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found with mobile number: " + mobileNumber));
    }
    
    public void updatePassword(int userId, String newPassword) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        existingUser.setPasswordHash(newPassword); // You should hash the password before saving
        userRepository.save(existingUser);
    }

}
