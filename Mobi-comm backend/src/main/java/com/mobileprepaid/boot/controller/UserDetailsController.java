package com.mobileprepaid.boot.controller;

import com.mobileprepaid.boot.model.UserDetail;
import com.mobileprepaid.boot.service.UserDetailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-details")
public class UserDetailsController {
    private final UserDetailService userDetailsService;

    public UserDetailsController(UserDetailService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @GetMapping
    public ResponseEntity<List<UserDetail>> getAllUserDetails() {
        return ResponseEntity.ok(userDetailsService.getAllUserDetails());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDetail> getUserDetailsById(@PathVariable int id) {
        return ResponseEntity.ok(userDetailsService.getUserDetailsById(id));
    }

    @PostMapping
    public ResponseEntity<UserDetail> createUserDetails(@RequestBody UserDetail userDetails) {
        return ResponseEntity.ok(userDetailsService.saveUserDetails(userDetails));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDetail> updateUserDetails(@PathVariable int id, @RequestBody UserDetail userDetails) {
        return ResponseEntity.ok(userDetailsService.updateUserDetails(id, userDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserDetails(@PathVariable int id) {
        userDetailsService.deleteUserDetails(id);
        return ResponseEntity.ok("User details deleted successfully");
    }
}
