
package com.saferoads.controller;

import com.saferoads.model.User;
import com.saferoads.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (user.getName() == null || user.getName().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null
                || user.getPassword().length() < 8) {

            return ResponseEntity.badRequest().body(
                    Map.of("message",
                    "Enter your name, email and a password of at least 8 characters."));
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email already registered."));
        }

        user.setRole("USER");
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "id", saved.getId(),
                    "name", saved.getName(),
                    "email", saved.getEmail(),
                    "role", saved.getRole()
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        if (user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email and password are required."));
        }

        User existing = userRepository.findByEmail(user.getEmail())
                .orElse(null);

        if (existing == null ||
                !passwordEncoder.matches(
                        user.getPassword(), existing.getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid email or password."));
        }

        return ResponseEntity.ok(
                Map.of(
                    "id", existing.getId(),
                    "name", existing.getName(),
                    "email", existing.getEmail(),
                    "role", existing.getRole()
                )
        );
    }
}
