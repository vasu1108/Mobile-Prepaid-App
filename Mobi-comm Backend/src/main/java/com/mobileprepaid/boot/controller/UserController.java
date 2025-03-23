package com.mobileprepaid.boot.controller;

import com.mobileprepaid.boot.model.User;
import com.mobileprepaid.boot.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.saveUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable int id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
    
    @GetMapping("/mobile/{mobileNumber}")
    public ResponseEntity<User> getUserByMobile(@PathVariable String mobileNumber) {
        User user = userService.getUserByMobile(mobileNumber);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{userId}/update-password")
    public ResponseEntity<String> updatePassword(@PathVariable int userId, @RequestBody Map<String, String> passwordRequest) {
        userService.updatePassword(userId, passwordRequest.get("newPassword"));
        return ResponseEntity.ok("Password updated successfully.");
    }

}
