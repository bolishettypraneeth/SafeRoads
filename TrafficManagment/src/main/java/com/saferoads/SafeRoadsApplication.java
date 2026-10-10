package com.saferoads;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SafeRoadsApplication {

    public static void main(String[] args) {

        SpringApplication.run(SafeRoadsApplication.class, args);

        System.out.println("=================================");
        System.out.println(" SafeRoads Backend Started");
        System.out.println(" http://localhost:8080");
        System.out.println("=================================");
    }
}