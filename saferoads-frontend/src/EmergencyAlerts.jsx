
import { useMemo } from "react";
import "./EmergencyAlerts.css";

const EMERGENCY_RULES = [
  {
    name: "Accident",
    keywords: ["accident", "collision", "crash"],
    level: "CRITICAL",
    icon: "🚨",
    color: "critical",
  },
  {
    name: "Fire",
    keywords: ["fire", "burning", "smoke"],
    level: "CRITICAL",
    icon: "🔥",
    color: "critical",
  },
  {
    name: "Flood",
    keywords: ["flood", "waterlogging", "water logging"],
    level: "HIGH",
    icon: "🌊",
    color: "high",
  },
  {
    name: "Road Closure",
    keywords: ["road closure", "road closed", "road block", "road blocked"],
    level: "HIGH",
    icon: "🚧",
    color: "high",
  },
];

function getEmergency(incident) {
  const type = String(incident.type || "").toLowerCase();
  const description = String(incident.description || "").toLowerCase();
  const combined = `${type} ${description}`;

  return EMERGENCY_RULES.find((rule) =>
    rule.keywords.some((keyword) => combined.includes(keyword))
  );
}

export default function EmergencyAlerts({ incidents = [], onRefresh, loading = false }) {
  const alerts = useMemo(() => {
    return incidents
      .map((incident) => ({
        incident,
        emergency: getEmergency(incident),
      }))
      .filter(({ incident, emergency }) => {
        const status = String(incident.status || "PENDING").toUpperCase();

        return (
          emergency &&
          !["RESOLVED", "CLOSED"].includes(status)
        );
      })
      .sort((a, b) => {
        const priority = { CRITICAL: 0, HIGH: 1 };
        return (
          priority[a.emergency.level] -
          priority[b.emergency.level]
        );
      });
  }, [incidents]);

  return (
    <main className="emergency-page">
      <header className="emergency-header">
        <div>
          <span className="emergency-eyebrow">
            SAFEROADS · INCIDENT RESPONSE
          </span>
          <h2>Emergency Alert Centre</h2>
          <p>
            Review unresolved accidents, fires, floods, and road closures
            reported to SafeRoads.
          </p>
        </div>

        <button
          className="emergency-refresh"
          onClick={onRefresh}
          disabled={loading || !onRefresh}
        >
          {loading ? "Refreshing..." : "↻ Refresh alerts"}
        </button>
      </header>

      <section className="emergency-summary">
        <div className="emergency-summary-card">
          <span>🚨</span>
          <div>
            <strong>{alerts.length}</strong>
            <p>Active emergency alerts</p>
          </div>
        </div>

        <div className="emergency-summary-card">
          <span>🔥</span>
          <div>
            <strong>
              {alerts.filter((item) => item.emergency.name === "Fire").length}
            </strong>
            <p>Fire reports</p>
          </div>
        </div>

        <div className="emergency-summary-card">
          <span>🌊</span>
          <div>
            <strong>
              {alerts.filter((item) => item.emergency.name === "Flood").length}
            </strong>
            <p>Flood reports</p>
          </div>
        </div>

        <div className="emergency-summary-card">
          <span>🚧</span>
          <div>
            <strong>
              {alerts.filter((item) => item.emergency.name === "Road Closure").length}
            </strong>
            <p>Road closures</p>
          </div>
        </div>
      </section>

      {alerts.length === 0 ? (
        <section className="emergency-empty">
          <span>✅</span>
          <h3>No active emergency reports</h3>
          <p>
            No unresolved accident, fire, flood, or road-closure reports
            were identified in the currently loaded incidents.
          </p>
        </section>
      ) : (
        <section className="emergency-list">
          {alerts.map(({ incident, emergency }) => (
            <article
              className={`emergency-card ${emergency.color}`}
              key={incident.id}
            >
              <div className="emergency-card-icon">
                {emergency.icon}
              </div>

              <div className="emergency-card-content">
                <div className="emergency-tags">
                  <span className={`emergency-severity ${emergency.color}`}>
                    {emergency.level}
                  </span>
                  <span className="emergency-category">
                    {emergency.name}
                  </span>
                </div>

                <h3>
                  {incident.type || emergency.name}
                  {incident.id != null ? ` #${incident.id}` : ""}
                </h3>

                <p className="emergency-description">
                  {incident.description || "No additional details provided."}
                </p>

                <div className="emergency-information">
                  <span>
                    📍 {incident.location || "Location not provided"}
                  </span>
                  <span>
                    Status: {incident.status || "PENDING"}
                  </span>
                  {incident.department && (
                    <span>Department: {incident.department}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <footer className="emergency-notice">
        <strong>Important:</strong> Alerts are identified from incident
        type and description. They are not independently verified and
        do not automatically contact police, fire services, ambulance
        services, or road authorities.
      </footer>
    </main>
  );
}
