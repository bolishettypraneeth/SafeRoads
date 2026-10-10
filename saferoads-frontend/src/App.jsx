
import React, { useCallback, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

import Auth from "./Auth";
import Weather from "./Weather";
import EmergencyAlerts from "./EmergencyAlerts";
import RoadConditions from "./RoadConditions";

const API_BASE = "http://localhost:8080/api";
const HYDERABAD_CENTER = [17.385, 78.4867];

const DEFAULT_INCIDENT = {
  type: "Accident",
  description: "",
  location: "",
  latitude: HYDERABAD_CENTER[0],
  longitude: HYDERABAD_CENTER[1],
  priority: "Medium",
};

const DEMO_TRAFFIC = [
  {
    name: "Low Traffic - Demonstration",
    color: "#16a34a",
    positions: [
      [17.385, 78.4867],
      [17.393, 78.495],
      [17.401, 78.504],
    ],
  },
  {
    name: "Moderate Traffic - Demonstration",
    color: "#f59e0b",
    positions: [
      [17.385, 78.4867],
      [17.376, 78.499],
      [17.368, 78.511],
    ],
  },
  {
    name: "Heavy Traffic - Demonstration",
    color: "#dc2626",
    positions: [
      [17.385, 78.4867],
      [17.378, 78.475],
      [17.371, 78.463],
    ],
  },
];

const defaultMarkerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getIncidentId(incident) {
  return incident?.id ?? incident?.incidentId;
}

function getIncidentStatus(incident) {
  return String(incident?.status || "REPORTED").toUpperCase();
}

function getIncidentCoordinates(incident) {
  const latitude = Number(
    incident?.latitude ?? incident?.lat ?? incident?.locationLatitude
  );

  const longitude = Number(
    incident?.longitude ?? incident?.lng ?? incident?.locationLongitude
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    (latitude === 0 && longitude === 0)
  ) {
    return null;
  }

  return [latitude, longitude];
}

function getIncidentLocation(incident) {
  return (
    incident?.location ||
    incident?.address ||
    incident?.place ||
    "Location not provided"
  );
}

function getPriority(incident) {
  return String(incident?.priority || incident?.severity || "Medium");
}

function getPriorityColor(priority) {
  switch (String(priority).toLowerCase()) {
    case "critical":
      return "#991b1b";
    case "high":
      return "#dc2626";
    case "low":
      return "#16a34a";
    default:
      return "#d97706";
  }
}

function getApiError(error, fallback) {
  return (
    error?.message ||
    fallback ||
    "An unexpected error occurred."
  );
}

function MapCenterUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (
      Array.isArray(center) &&
      center.length === 2 &&
      center.every(Number.isFinite)
    ) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
}

function TrafficLegend() {
  return (
    <div className="traffic-legend">
      <strong>Traffic Demonstration Overlay</strong>

      <span>
        <i style={{ backgroundColor: "#16a34a" }} />
        Low
      </span>

      <span>
        <i style={{ backgroundColor: "#f59e0b" }} />
        Moderate
      </span>

      <span>
        <i style={{ backgroundColor: "#dc2626" }} />
        Heavy
      </span>

      <small>
        Illustrative road segments only. These are not verified live
        traffic conditions.
      </small>
    </div>
  );
}

function SafeRoadsMap({
  incidents = [],
  height = "480px",
  showTraffic = true,
  selectedIncident = null,
}) {
  const selectedCoordinates = selectedIncident
    ? getIncidentCoordinates(selectedIncident)
    : null;

  const center = selectedCoordinates || HYDERABAD_CENTER;

  return (
    <div className="saferoads-map-wrapper">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height, width: "100%", borderRadius: "12px" }}
        scrollWheelZoom
      >
        <MapCenterUpdater center={center} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle
          center={HYDERABAD_CENTER}
          radius={2500}
          pathOptions={{
            color: "#16a34a",
            fillColor: "#16a34a",
            fillOpacity: 0.07,
            weight: 2,
          }}
        >
          <Popup>SafeRoads Hyderabad demonstration area</Popup>
        </Circle>

        {showTraffic &&
          DEMO_TRAFFIC.map((road) => (
            <Polyline
              key={road.name}
              positions={road.positions}
              pathOptions={{
                color: road.color,
                weight: 6,
                opacity: 0.8,
              }}
            >
              <Popup>
                <strong>{road.name}</strong>
                <br />
                Simulated traffic data for demonstration.
              </Popup>
            </Polyline>
          ))}

        {incidents.map((incident, index) => {
          const coordinates = getIncidentCoordinates(incident);

          if (!coordinates) return null;

          return (
            <Marker
              key={getIncidentId(incident) ?? `incident-${index}`}
              position={coordinates}
              icon={defaultMarkerIcon}
            >
              <Popup>
                <strong>{incident.type || "Reported Incident"}</strong>
                <br />
                {incident.description || "No description provided."}
                <br />
                <strong>Location:</strong> {getIncidentLocation(incident)}
                <br />
                <strong>Priority:</strong> {getPriority(incident)}
                <br />
                <strong>Status:</strong> {getIncidentStatus(incident)}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// --------------------------------------------------
// MAIN DASHBOARD
// --------------------------------------------------

function DashboardApp({ user, onLogout }) {
  const [page, setPage] = useState("Dashboard");
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ ...DEFAULT_INCIDENT });
  const [submittingReport, setSubmittingReport] = useState(false);

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [trafficEnabled, setTrafficEnabled] = useState(true);

  const navigationItems = [
    { name: "Dashboard", icon: "📊" },
    { name: "Live Map", icon: "🗺️" },
    { name: "Emergency Alerts", icon: "🚨" },
    { name: "Road Conditions", icon: "🛣️" },
    { name: "Weather Alerts", icon: "🌦️" },
    { name: "Safety Guidelines", icon: "🛡️" },
  ];

  // LOAD INCIDENTS

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE}/incidents`);

      if (!response.ok) {
        throw new Error(`Unable to load incidents (${response.status})`);
      }

      const data = await response.json();

      setIncidents(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.incidents)
          ? data.incidents
          : []
      );
    } catch (error) {
      setErrorMessage(
        `Could not load incidents: ${getApiError(
          error,
          "Check that your Spring Boot backend is running."
        )}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (!successMessage && !errorMessage) return undefined;

    const timeout = setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 6000);

    return () => clearTimeout(timeout);
  }, [successMessage, errorMessage]);

  // REPORT AN INCIDENT

  function openReportModal() {
    setReportForm({ ...DEFAULT_INCIDENT });
    setErrorMessage("");
    setSuccessMessage("");
    setShowReportModal(true);
  }

  function closeReportModal() {
    if (!submittingReport) {
      setShowReportModal(false);
    }
  }

  function handleReportChange(event) {
    const { name, value } = event.target;

    setReportForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function submitIncident(event) {
    event.preventDefault();

    if (!reportForm.description.trim()) {
      setErrorMessage("Please enter an incident description.");
      return;
    }

    const latitude = Number(reportForm.latitude);
    const longitude = Number(reportForm.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setErrorMessage("Please enter valid latitude and longitude values.");
      return;
    }

    const payload = {
      type: reportForm.type,
      description: reportForm.description.trim(),
      location: reportForm.location.trim(),
      latitude,
      longitude,
      priority: reportForm.priority,
    };

    setSubmittingReport(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `Request failed (${response.status})`);
      }

      setShowReportModal(false);
      setReportForm({ ...DEFAULT_INCIDENT });
      setSuccessMessage("Your incident report was submitted successfully.");

      await loadIncidents();
    } catch (error) {
      setErrorMessage(
        `Could not submit report: ${getApiError(
          error,
          "Please check your backend and try again."
        )}`
      );
    } finally {
      setSubmittingReport(false);
    }
  }

  // DASHBOARD CALCULATIONS

  const totalIncidents = incidents.length;

  const openIncidents = incidents.filter((incident) => {
    const status = getIncidentStatus(incident);
    return status !== "RESOLVED" && status !== "CLOSED";
  }).length;

  const resolvedIncidents = incidents.filter((incident) => {
    const status = getIncidentStatus(incident);
    return status === "RESOLVED" || status === "CLOSED";
  }).length;

  const emergencyIncidents = incidents.filter((incident) => {
    const priority = getPriority(incident).toUpperCase();
    const status = getIncidentStatus(incident);

    return (
      (priority === "CRITICAL" || priority === "HIGH") &&
      status !== "RESOLVED" &&
      status !== "CLOSED"
    );
  }).length;

  const recentIncidents = [...incidents].slice(-5).reverse();

  // SHARED COMPONENTS

  function renderPageHeading() {
    const headings = {
      Dashboard: "Dashboard Overview",
      "Live Map": "Live Traffic & Incident Map",
      "Emergency Alerts": "Emergency Alert Centre",
      "Road Conditions": "Road Conditions & Roadwork",
      "Weather Alerts": "Weather Alerts",
      "Safety Guidelines": "Road Safety Guidelines",
    };

    return headings[page] || "SafeRoads";
  }

  function renderIncidentStatus(incident) {
    const status = getIncidentStatus(incident);

    return (
      <span
        className={`incident-status status-${status
          .toLowerCase()
          .replaceAll("_", "-")}`}
      >
        {status.replaceAll("_", " ")}
      </span>
    );
  }

  function renderIncidentTable(items) {
    if (loading && incidents.length === 0) {
      return <p>Loading incident reports...</p>;
    }

    if (items.length === 0) {
      return <p>No incident reports found.</p>;
    }

    return (
      <div className="incident-table-wrapper">
        <table className="incident-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {items.map((incident, index) => (
              <tr key={getIncidentId(incident) ?? index}>
                <td>{getIncidentId(incident) ?? "N/A"}</td>
                <td>{incident.type || "Incident"}</td>
                <td>{incident.description || "No description"}</td>
                <td>{getIncidentLocation(incident)}</td>
                <td>
                  <span
                    style={{
                      color: getPriorityColor(getPriority(incident)),
                      fontWeight: 700,
                    }}
                  >
                    {getPriority(incident)}
                  </span>
                </td>
                <td>{renderIncidentStatus(incident)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // DASHBOARD PAGE

  function renderDashboard() {
    return (
      <>
        <div className="dashboard-welcome">
          <div>
            <h2>Welcome to SafeRoads, {user.name || "User"}</h2>
            <p>
              Monitor road incidents, safety conditions, and traffic
              demonstrations across Hyderabad.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openReportModal}
          >
            + Report an Issue
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div>
              <p>Total Incidents</p>
              <h3>{totalIncidents}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚧</div>
            <div>
              <p>Open Incidents</p>
              <h3>{openIncidents}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div>
              <p>Resolved Incidents</p>
              <h3>{resolvedIncidents}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚨</div>
            <div>
              <p>High/Critical Priority</p>
              <h3>{emergencyIncidents}</h3>
            </div>
          </div>
        </div>

        <div className="dashboard-alert-banner">
          <div>
            <strong>Emergency Alert Centre</strong>
            <p>
              Review accident, fire, flooding, and road-closure reports.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPage("Emergency Alerts")}
          >
            View Alerts →
          </button>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Hyderabad Map</h2>
              <p>Incident markers and illustrative traffic segments</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage("Live Map")}
            >
              Open Full Map
            </button>
          </div>

          <SafeRoadsMap
            incidents={incidents}
            height="390px"
            showTraffic={trafficEnabled}
          />

          <TrafficLegend />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Incident Reports</h2>
              <p>Latest reports stored in the backend</p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={loadIncidents}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {renderIncidentTable(recentIncidents)}
        </section>
      </>
    );
  }

  // LIVE MAP PAGE

  function renderLiveMap() {
    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>SafeRoads Map</h2>
            <p>
              Hyderabad map showing saved incident coordinates and
              illustrative traffic routes.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadIncidents}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh Map"}
          </button>
        </div>

        <label className="traffic-toggle">
          <input
            type="checkbox"
            checked={trafficEnabled}
            onChange={(event) => setTrafficEnabled(event.target.checked)}
          />
          Show demonstration traffic overlay
        </label>

        <SafeRoadsMap
          incidents={incidents}
          height="580px"
          showTraffic={trafficEnabled}
          selectedIncident={selectedIncident}
        />

        {trafficEnabled && <TrafficLegend />}

        <p className="map-note">
          OpenStreetMap supplies the basemap. Colored traffic segments are
          simulated demonstration data, not verified live traffic.
          Incident markers appear only when reports contain valid coordinates.
        </p>

        <h3>Reported Incidents</h3>

        <div className="map-incident-list">
          {incidents.length === 0 ? (
            <p>No incidents are currently available.</p>
          ) : (
            incidents.map((incident, index) => (
              <button
                type="button"
                className="map-incident-item"
                key={getIncidentId(incident) ?? index}
                onClick={() => {
                  setSelectedIncident(incident);
                  const coordinates = getIncidentCoordinates(incident);

                  if (!coordinates) {
                    setErrorMessage(
                      "This incident does not contain valid map coordinates."
                    );
                  } else {
                    setErrorMessage("");
                  }
                }}
              >
                <span>
                  <strong>{incident.type || "Incident"}</strong>
                  <small>{getIncidentLocation(incident)}</small>
                </span>

                <span>{getIncidentStatus(incident)}</span>
              </button>
            ))
          )}
        </div>
      </section>
    );
  }

  // SAFETY GUIDELINES PAGE

  function renderSafetyGuidelines() {
    const guidelines = [
      {
        icon: "🚦",
        title: "Follow Traffic Signals",
        text: "Obey traffic signals, signs, and directions from authorized officers.",
      },
      {
        icon: "🪖",
        title: "Wear a Helmet",
        text: "Motorcycle riders and passengers should wear properly fastened helmets.",
      },
      {
        icon: "🚗",
        title: "Wear a Seat Belt",
        text: "Drivers and passengers should use seat belts and follow safe driving practices.",
      },
      {
        icon: "📵",
        title: "Avoid Phone Distractions",
        text: "Do not use a handheld phone while driving. Keep your attention on the road.",
      },
      {
        icon: "🚸",
        title: "Protect Pedestrians",
        text: "Use marked crossings and slow down near schools and pedestrian areas.",
      },
      {
        icon: "🌧️",
        title: "Drive Carefully in Bad Weather",
        text: "Reduce speed in rain, avoid flooded roads, and follow verified diversion instructions.",
      },
      {
        icon: "🚨",
        title: "Report Road Emergencies",
        text: "Report accidents, hazards, flooding, or damaged roads through SafeRoads.",
      },
      {
        icon: "🛠️",
        title: "Respect Roadwork Zones",
        text: "Follow temporary signs, barriers, and directions around construction zones.",
      },
    ];

    return (
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Road Safety Guidelines</h2>
            <p>Practical steps to help keep road users safe.</p>
          </div>
        </div>

        <div className="guidelines-grid">
          {guidelines.map((guideline) => (
            <article className="guideline-card" key={guideline.title}>
              <div className="guideline-icon">{guideline.icon}</div>
              <h3>{guideline.title}</h3>
              <p>{guideline.text}</p>
            </article>
          ))}
        </div>

        <div className="safety-disclaimer">
          These are general safety guidelines and do not replace official
          instructions, local traffic regulations, or emergency guidance.
        </div>
      </section>
    );
  }

  // APPLICATION RENDER

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🛣️</div>
          <div>
            <h1>SafeRoads</h1>
            <p>Smart City Traffic System</p>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <p className="navigation-label">MAIN MENU</p>

          {navigationItems.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`navigation-item ${
                page === item.name ? "active" : ""
              }`}
              onClick={() => {
                setPage(item.name);
                setErrorMessage("");
                setSuccessMessage("");
              }}
            >
              <span className="navigation-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-status-dot" />
          <span>SafeRoads System</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div>
            <h1>{renderPageHeading()}</h1>
            <p>Road safety, incident monitoring and reporting</p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="report-header-button"
              onClick={openReportModal}
            >
              + Report an Issue
            </button>

            <div className="user-header">
              <span>👤 {user.name || user.email}</span>
              <button
                type="button"
                className="secondary-button"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {(errorMessage || successMessage) && (
          <div
            className={`app-notice ${
              errorMessage ? "notice-error" : "notice-success"
            }`}
            role="status"
          >
            <span>{errorMessage || successMessage}</span>

            <button
              type="button"
              onClick={() => {
                setErrorMessage("");
                setSuccessMessage("");
              }}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        <div className="page-content">
          {page === "Dashboard" && renderDashboard()}

          {page === "Live Map" && renderLiveMap()}

          {page === "Emergency Alerts" && (
            <section className="panel full-panel">
              <EmergencyAlerts
                incidents={incidents}
                loading={loading}
                onRefresh={loadIncidents}
              />
            </section>
          )}

          {page === "Road Conditions" && (
            <section className="panel full-panel">
              <RoadConditions
                incidents={incidents}
                onRefresh={loadIncidents}
              />
            </section>
          )}

          {page === "Weather Alerts" && (
            <section className="panel full-panel">
              <Weather />
            </section>
          )}

          {page === "Safety Guidelines" && renderSafetyGuidelines()}
        </div>

        <footer className="app-footer">
          <p>
            © {new Date().getFullYear()} SafeRoads — Smart City Traffic System
          </p>
          <p>Project demonstration · Hyderabad, Telangana</p>
        </footer>
      </main>

      {/* REPORT INCIDENT MODAL */}

      {showReportModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReportModal();
            }
          }}
        >
          <section
            className="report-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="report-modal-title">Report a Road Issue</h2>
                <p>Submit an incident to the SafeRoads system.</p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeReportModal}
                disabled={submittingReport}
                aria-label="Close report form"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitIncident} className="report-form">
              <label htmlFor="incident-type">Incident Type</label>
              <select
                id="incident-type"
                name="type"
                value={reportForm.type}
                onChange={handleReportChange}
                required
              >
                <option value="Accident">Accident</option>
                <option value="Fire">Fire</option>
                <option value="Flooding">Flooding / Waterlogging</option>
                <option value="Road Closure">Road Closure</option>
                <option value="Pothole">Pothole</option>
                <option value="Damaged Road">Damaged Road</option>
                <option value="Roadwork">Roadwork / Construction</option>
                <option value="Traffic Jam">Traffic Jam</option>
                <option value="Signal Failure">Traffic Signal Failure</option>
                <option value="Other">Other</option>
              </select>

              <label htmlFor="incident-description">Description</label>
              <textarea
                id="incident-description"
                name="description"
                value={reportForm.description}
                onChange={handleReportChange}
                placeholder="Describe the incident or road problem..."
                rows={4}
                required
              />

              <label htmlFor="incident-location">Location</label>
              <input
                id="incident-location"
                name="location"
                value={reportForm.location}
                onChange={handleReportChange}
                placeholder="Road name, area, or landmark"
              />

              <div className="coordinate-fields">
                <div>
                  <label htmlFor="incident-latitude">Latitude</label>
                  <input
                    id="incident-latitude"
                    type="number"
                    name="latitude"
                    step="any"
                    min="-90"
                    max="90"
                    value={reportForm.latitude}
                    onChange={handleReportChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="incident-longitude">Longitude</label>
                  <input
                    id="incident-longitude"
                    type="number"
                    name="longitude"
                    step="any"
                    min="-180"
                    max="180"
                    value={reportForm.longitude}
                    onChange={handleReportChange}
                    required
                  />
                </div>
              </div>

              <p className="coordinate-note">
                Default coordinates point to central Hyderabad. Change them
                to the actual incident location when known.
              </p>

              <label htmlFor="incident-priority">Priority</label>
              <select
                id="incident-priority"
                name="priority"
                value={reportForm.priority}
                onChange={handleReportChange}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeReportModal}
                  disabled={submittingReport}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={submittingReport}
                >
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// USER LOGIN SESSION
// --------------------------------------------------

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("saferoadsUser")) || null;
    } catch {
      return null;
    }
  });

  function handleLogin(loggedInUser) {
    try {
      sessionStorage.setItem(
        "saferoadsUser",
        JSON.stringify(loggedInUser)
      );
    } catch {
      // Keep the user signed in for the current React session.
    }

    setUser(loggedInUser);
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem("saferoadsUser");
    } catch {
      // No action needed if session storage is unavailable.
    }

    setUser(null);
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return <DashboardApp user={user} onLogout={handleLogout} />;
}

