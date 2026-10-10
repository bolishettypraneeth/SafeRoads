package com.saferoads.controller;

import com.saferoads.model.Official;
import com.saferoads.repository.OfficialRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/officials")
@CrossOrigin(origins = "*")
public class OfficialController {

    private final OfficialRepository repository;

    public OfficialController(OfficialRepository repository) {
        this.repository = repository;
    }

    // REGISTER OFFICIAL
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Official official) {

        if (repository.findByEmail(official.getEmail()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body("Official email already registered");
        }

        return ResponseEntity.ok(repository.save(official));
    }

    // OFFICIAL LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Official official) {

        Official existingOfficial = repository
                .findByEmail(official.getEmail())
                .orElse(null);

        if (existingOfficial == null) {
            return ResponseEntity.badRequest()
                    .body("Official not found");
        }

        if (!existingOfficial.getPassword()
                .equals(official.getPassword())) {

            return ResponseEntity.badRequest()
                    .body("Invalid password");
        }

        return ResponseEntity.ok(existingOfficial);
    }

    // GET ALL OFFICIALS
    @GetMapping
    public Iterable<Official> getOfficials() {
        return repository.findAll();
    }
}