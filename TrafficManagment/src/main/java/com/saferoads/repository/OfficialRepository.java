package com.saferoads.repository;

import com.saferoads.model.Official;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfficialRepository extends JpaRepository<Official, Long> {

    Optional<Official> findByEmail(String email);
}