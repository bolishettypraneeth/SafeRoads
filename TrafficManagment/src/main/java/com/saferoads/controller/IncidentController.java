package com.saferoads.controller;

import com.saferoads.model.Incident;
import com.saferoads.service.IncidentService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentService service;

    public IncidentController(IncidentService service) {
        this.service = service;
    }

    @PostMapping
    public Incident createIncident(@RequestBody Incident incident) {
        return service.createIncident(incident);
    }

    @GetMapping
    public List<Incident> getAllIncidents() {
        return service.getAllIncidents();
    }

    @GetMapping("/{id}")
    public Incident getIncident(@PathVariable Long id) {
        return service.getIncident(id);
    }

    @PutMapping("/{id}/status")
    public Incident updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return service.updateStatus(id, status);
    }
}