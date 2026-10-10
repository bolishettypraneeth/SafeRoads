
import { useEffect, useState } from "react";
import "./Weather.css";

function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadWeather() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/weather"
      );

      if (!response.ok) {
        throw new Error("Could not get weather data.");
      }

      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(
        "Weather data could not be loaded. Check that your Spring Boot backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather();

    const timer = setInterval(loadWeather, 5 * 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  // Generate weather-based alerts
  function getAlerts() {
    if (!weather) return [];

    const alerts = [];
    const rain = Number(weather.precipitationMm);
    const wind = Number(weather.windSpeedKmh);
    const temperature = Number(weather.temperatureC);
    const condition = String(weather.condition || "").toLowerCase();

    if (Number.isFinite(rain) && rain >= 7.5) {
      alerts.push({
        level: "critical",
        icon: "🌧️",
        title: "Heavy Rain Warning",
        message:
          "Heavy rainfall detected by the weather data. Slow down and avoid waterlogged roads."
      });
    } else if (Number.isFinite(rain) && rain >= 2.5) {
      alerts.push({
        level: "warning",
        icon: "🌦️",
        title: "Rain Advisory",
        message:
          "Rain is reported. Drive slowly and maintain extra braking distance."
      });
    }

    if (Number.isFinite(wind) && wind >= 50) {
      alerts.push({
        level: "critical",
        icon: "💨",
        title: "Strong Wind Warning",
        message:
          "Strong winds are reported. Reduce speed and drive carefully."
      });
    } else if (Number.isFinite(wind) && wind >= 35) {
      alerts.push({
        level: "warning",
        icon: "💨",
        title: "Wind Advisory",
        message:
          "Elevated wind speeds are reported. Take extra care on exposed roads."
      });
    }

    if (Number.isFinite(temperature) && temperature >= 40) {
      alerts.push({
        level: "warning",
        icon: "🌡️",
        title: "Extreme Heat Advisory",
        message:
          "High temperatures are reported. Stay hydrated and take care during travel."
      });
    }

    if (/thunderstorm|thunder|lightning/.test(condition)) {
      alerts.push({
        level: "critical",
        icon: "⛈️",
        title: "Thunderstorm Warning",
        message:
          "Thunderstorm conditions are reported. Seek safe shelter when necessary."
      });
    }

    if (/fog|mist/.test(condition)) {
      alerts.push({
        level: "warning",
        icon: "🌫️",
        title: "Poor Visibility Advisory",
        message:
          "Fog or mist is reported. Reduce speed and use appropriate lights."
      });
    }

    if (
      alerts.length === 0 &&
      /rain|drizzle|shower/.test(condition)
    ) {
      alerts.push({
        level: "warning",
        icon: "🌧️",
        title: "Wet Road Caution",
        message:
          "Rainy conditions are reported. Watch for slippery roads."
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        level: "safe",
        icon: "✅",
        title: "No Weather Warning Triggered",
        message:
          "Current weather measurements have not crossed the configured warning thresholds."
      });
    }

    return alerts;
  }

  return (
    <div className="weather-page">
      <header className="weather-header">
        <div>
          <div className="weather-eyebrow">
            SMART CITY · ROAD SAFETY · REAL IMPACT
          </div>

          <h1>Weather & Emergency Alerts</h1>

          <p>
            Safer roads begin with faster reporting and smarter decisions.
          </p>
        </div>

        <button
          className="weather-refresh-button"
          onClick={loadWeather}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh Weather"}
        </button>
      </header>

      {error && (
        <div className="weather-error">
          {error}
        </div>
      )}

      {weather && (
        <>
          <section className="weather-current-card">
            <div className="weather-eyebrow">
              LIVE WEATHER · HYDERABAD
            </div>

            <h2>📍 {weather.city || "Hyderabad"}, Telangana</h2>

            <div className="weather-icon">
              {String(weather.condition || "").toLowerCase().includes("rain")
                ? "🌧️"
                : String(weather.condition || "").toLowerCase().includes("cloud")
                ? "⛅"
                : "☀️"}
            </div>

            <div className="weather-temperature">
              {weather.temperatureC ?? "--"}°C
            </div>

            <div className="weather-condition">
              {weather.condition || "Weather unavailable"}
            </div>

            <p>
              Feels like{" "}
              <strong>
                {weather.feelsLikeC ?? "--"}°C
              </strong>
            </p>

            <p>Updated: {weather.time || "Not available"}</p>
          </section>

          <div className="weather-metrics-grid">
            <div className="weather-metric">
              <div className="weather-metric-icon">💧</div>
              <h3>Humidity</h3>
              <strong>{weather.humidity ?? "--"}%</strong>
            </div>

            <div className="weather-metric">
              <div className="weather-metric-icon">💨</div>
              <h3>Wind Speed</h3>
              <strong>{weather.windSpeedKmh ?? "--"} km/h</strong>
            </div>

            <div className="weather-metric">
              <div className="weather-metric-icon">🌧️</div>
              <h3>Precipitation</h3>
              <strong>{weather.precipitationMm ?? "--"} mm</strong>
            </div>
          </div>

          <section className="weather-safety-panel">
            <h2>🚨 Weather & Emergency Alerts</h2>

            {getAlerts().map((alert, index) => (
              <div
                key={index}
                className={`weather-alert-item ${
                  alert.level === "critical"
                    ? "critical"
                    : alert.level === "warning"
                    ? "warning"
                    : ""
                }`}
              >
                <span>{alert.icon}</span>

                <div>
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="weather-safety-panel">
            <h2>🛣️ Road Safety Reminders</h2>

            <ul className="weather-safety-list">
              <li>
                🌧️ <strong>During rain:</strong> Slow down,
                leave extra braking distance, and avoid flooded roads.
              </li>

              <li>
                🌫️ <strong>When visibility is poor:</strong> Use
                appropriate lights and avoid sudden braking.
              </li>

              <li>
                🚧 <strong>Report hazards:</strong> Report flooding,
                fallen trees, and blocked roads through the issue-reporting
                feature in SafeRoads.
              </li>
            </ul>
          </section>

          <details className="weather-raw-details">
            <summary>View raw API response</summary>
            <pre>{JSON.stringify(weather, null, 2)}</pre>
          </details>

          <p className="weather-source">
            Weather source: {weather.source || "Weather API"} ·
            Automatically refreshes every 5 minutes.
          </p>
        </>
      )}

      <footer className="weather-source">
        🛣️ SafeRoads — Building safer streets together.
      </footer>
    </div>
  );
}

export default Weather;
