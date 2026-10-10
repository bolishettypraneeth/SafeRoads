
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LiveMap.css";

const HYDERABAD = [17.385, 78.4867];

function MapResize() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function LiveMap() {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadIncidents() {
    try {
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/incidents"
      );

      if (!response.ok) {
        throw new Error("Unable to load incidents.");
      }

      const data = await response.json();

      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        "Could not load incidents. Check that your backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncidents();

    const interval = setInterval(loadIncidents, 30000);

    return () => clearInterval(interval);
  }, []);

  function getCoordinates(incident) {
    const lat = Number(
      incident.latitude ?? incident.lat
    );

    const lng = Number(
      incident.longitude ??
      incident.lng ??
      incident.lon
    );

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      (lat !== 0 || lng !== 0)
    ) {
      return [lat, lng];
    }

    return null;
  }

  function getIncidentTitle(incident) {
    return (
      incident.title ??
      incident.incidentType ??
      incident.type ??
      incident.category ??
      "Reported road issue"
    );
  }

  function getStatus(incident) {
    return incident.status ?? "Reported";
  }

  return (
    <div className="live-map-page">
      <div className="live-map-header">
        <div>
          <span className="live-map-eyebrow">
            SAFEROADS • HYDERABAD
          </span>
          <h1>Live Traffic Map</h1>
          <p>
            View reported road incidents and their locations.
          </p>
        </div>

        <button
          className="live-map-refresh"
          onClick={loadIncidents}
        >
          Refresh Map
        </button>
      </div>

      <div className="live-map-summary">
        <div className="live-map-stat">
          <span>Total Reports</span>
          <strong>{incidents.length}</strong>
        </div>

        <div className="live-map-stat">
          <span>Mapped Reports</span>
          <strong>
            {incidents.filter(getCoordinates).length}
          </strong>
        </div>

        <div className="live-map-stat">
          <span>Last Update</span>
          <strong>{loading ? "Loading..." : "Updated"}</strong>
        </div>
      </div>

      {error && (
        <div className="live-map-error">{error}</div>
      )}

      <div className="live-map-container">
        <MapContainer
          center={HYDERABAD}
          zoom={12}
          scrollWheelZoom={true}
          className="live-map"
        >
          <MapResize />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {incidents.map((incident, index) => {
            const position = getCoordinates(incident);

            if (!position) return null;

            return (
              <Marker
                key={incident.id ?? index}
                position={position}
                icon={L.divIcon({
                  className: "incident-map-marker",
                  html: `<div class="incident-marker-dot">!</div>`,
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                })}
              >
                <Popup>
                  <strong>
                    {getIncidentTitle(incident)}
                  </strong>

                  <p>
                    {incident.description ??
                      "No description provided."}
                  </p>

                  <p>
                    <b>Status:</b> {getStatus(incident)}
                  </p>

                  <p>
                    {incident.location ??
                      incident.address ??
                      "Location not specified"}
                  </p>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="live-map-legend">
        <span className="incident-marker-dot">!</span>
        <span>Reported road incident</span>
        <span className="live-map-note">
          Reports refresh every 30 seconds.
        </span>
      </div>

      {incidents.length > 0 &&
        incidents.every((incident) => !getCoordinates(incident)) && (
          <p className="live-map-note">
            Your incident records do not contain usable latitude
            and longitude values, so markers cannot be displayed yet.
          </p>
        )}
    </div>
  );
}
