package com.saferoads.service;

import com.saferoads.model.Incident;
import com.saferoads.repository.IncidentRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncidentService {

    private final IncidentRepository repository;

    public IncidentService(IncidentRepository repository) {
        this.repository = repository;
    }

    // CREATE INCIDENT
    public Incident createIncident(Incident incident) {

        assignDepartment(incident);

        if (incident.getStatus() == null) {
            incident.setStatus("PENDING");
        }

        return repository.save(incident);
    }

    // GET ALL INCIDENTS
    public List<Incident> getAllIncidents() {
        return repository.findAll();
    }

    // GET ONE INCIDENT
    public Incident getIncident(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
    }

    // UPDATE STATUS
    public Incident updateStatus(Long id, String status) {

        Incident incident = getIncident(id);

        incident.setStatus(status);

        return repository.save(incident);
    }

    // AUTOMATIC DEPARTMENT ASSIGNMENT
    private void assignDepartment(Incident incident) {

        String type = incident.getType();

        if (type == null) {
            incident.setDepartment("General");
            return;
        }

        switch (type.toLowerCase()) {

            case "accident":
            case "traffic":
            case "traffic jam":
                incident.setDepartment("Traffic Police");
                break;

            case "pothole":
            case "road damage":
            case "road work":
                incident.setDepartment("Road Maintenance");
                break;

            case "flood":
                incident.setDepartment("Disaster Management");
                break;

            case "fire":
                incident.setDepartment("Fire Department");
                break;

            default:
                incident.setDepartment("General");
        }
    }
}