
import React, { useMemo, useState } from "react";
import "./RoadConditions.css";

const ROAD_TYPES = [
  "Pothole",
  "Damaged Road",
  "Roadwork",
  "Road Closure",
  "Waterlogging",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export default function RoadConditions({ incidents = [], onRefresh }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const roadReports = useMemo(() => {
    return incidents.filter((incident) => {
      const type = String(incident.type || "").toLowerCase();
      const description = String(incident.description || "").toLowerCase();

      const isRoadReport = ROAD_TYPES.some((roadType) => {
        const keyword = roadType.toLowerCase();
        return type.includes(keyword) || description.includes(keyword);
      });

      const matchesSearch =
        `${incident.type || ""} ${incident.description || ""} ${
          incident.location || incident.address || ""
        }`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All" ||
        type.includes(typeFilter.toLowerCase()) ||
        description.includes(typeFilter.toLowerCase());

      const priority = String(
        incident.priority || incident.severity || "Medium"
      ).toLowerCase();

      const matchesPriority =
        priorityFilter === "All" ||
        priority === priorityFilter.toLowerCase();

      return (
        isRoadReport &&
        matchesSearch &&
        matchesType &&
        matchesPriority
      );
    });
  }, [incidents, search, typeFilter, priorityFilter]);

  const getStatus = (incident) =>
    String(incident.status || "REPORTED").toUpperCase();

  const getPriority = (incident) =>
    String(incident.priority || incident.severity || "Medium");

  const getPriorityClass = (priority) => {
    const value = priority.toLowerCase();

    if (value === "critical") return "critical";
    if (value === "high") return "high";
    if (value === "low") return "low";
    return "medium";
  };

  const getStatusClass = (status) => {
    const value = status.toLowerCase();

    if (value === "resolved" || value === "closed") return "resolved";
    if (value === "in_progress" || value === "in progress") {
      return "in-progress";
    }

    return "reported";
  };

  const isCompleted = (incident) => {
    const status = getStatus(incident);
    return status === "RESOLVED" || status === "CLOSED";
  };

  const total = roadReports.length;
  const open = roadReports.filter((item) => !isCompleted(item)).length;
  const resolved = roadReports.filter(isCompleted).length;
  const urgent = roadReports.filter((item) =>
    ["HIGH", "CRITICAL"].includes(getPriority(item).toUpperCase())
  ).length;

  return (
    <div className="road-conditions">
      <div className="road-conditions-header">
        <div>
          <h2>Road Conditions & Roadwork</h2>
          <p>
            Review reported potholes, damaged roads, construction, and closures.
          </p>
        </div>

        <button
          type="button"
          className="road-refresh-button"
          onClick={() => onRefresh?.()}
        >
          ↻ Refresh Reports
        </button>
      </div>

      <div className="road-stat-grid">
        <div className="road-stat-card">
          <span>Total Road Reports</span>
          <strong>{total}</strong>
        </div>

        <div className="road-stat-card">
          <span>Open Reports</span>
          <strong>{open}</strong>
        </div>

        <div className="road-stat-card">
          <span>Resolved Reports</span>
          <strong>{resolved}</strong>
        </div>

        <div className="road-stat-card">
          <span>High/Critical Priority</span>
          <strong>{urgent}</strong>
        </div>
      </div>

      <div className="road-filter-panel">
        <input
          type="search"
          placeholder="Search road issue or location..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search road reports"
        />

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          aria-label="Filter by road issue"
        >
          <option value="All">All Road Issues</option>
          {ROAD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          aria-label="Filter by priority"
        >
          <option value="All">All Priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>

      <div className="road-report-list">
        {roadReports.length === 0 ? (
          <div className="road-empty-state">
            <div className="road-empty-icon">🛣️</div>
            <h3>No matching road reports</h3>
            <p>
              Try changing your filters or report a road issue using
              the existing Report an Issue feature.
            </p>
          </div>
        ) : (
          roadReports.map((incident) => {
            const status = getStatus(incident);
            const priority = getPriority(incident);

            return (
              <article
                className="road-report-card"
                key={incident.id ?? incident.incidentId}
              >
                <div className="road-report-top">
                  <div>
                    <h3>{incident.type || "Road Issue"}</h3>
                    <p className="road-report-id">
                      Report ID: {incident.id ?? incident.incidentId ?? "N/A"}
                    </p>
                  </div>

                  <span
                    className={`road-priority ${getPriorityClass(priority)}`}
                  >
                    {priority}
                  </span>
                </div>

                <p className="road-report-description">
                  {incident.description || "No description provided."}
                </p>

                <div className="road-report-details">
                  <span>
                    <strong>Location:</strong>{" "}
                    {incident.location ||
                      incident.address ||
                      (incident.latitude != null &&
                      incident.longitude != null
                        ? `${incident.latitude}, ${incident.longitude}`
                        : "Location not provided")}
                  </span>

                  <span>
                    <strong>Status:</strong>{" "}
                    <span className={`road-status ${getStatusClass(status)}`}>
                      {status.replaceAll("_", " ")}
                    </span>
                  </span>

                  <span>
                    <strong>Reported:</strong>{" "}
                    {incident.createdAt
                      ? new Date(incident.createdAt).toLocaleString()
                      : incident.reportedAt
                      ? new Date(incident.reportedAt).toLocaleString()
                      : "Date unavailable"}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>

      <p className="road-data-note">
        Reports are displayed from the existing SafeRoads incident records.
        Road-condition and repair status updates depend on the information
        submitted to the system.
      </p>
    </div>
  );
}
