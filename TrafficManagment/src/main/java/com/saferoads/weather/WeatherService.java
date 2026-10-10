
package com.saferoads.weather;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class WeatherService {

    private final RestClient restClient;

    private volatile WeatherResponse cachedWeather;

    private volatile long lastSuccessfulFetchTime;

    public WeatherService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.open-meteo.com")
                .build();
    }

    public synchronized WeatherResponse getWeather() {

        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                Map<?, ?> result = restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/v1/forecast")
                                .queryParam("latitude", 17.3850)
                                .queryParam("longitude", 78.4867)
                                .queryParam(
                                        "current",
                                        "temperature_2m,"
                                        + "relative_humidity_2m,"
                                        + "apparent_temperature,"
                                        + "precipitation,"
                                        + "wind_speed_10m,"
                                        + "weather_code"
                                )
                                .queryParam("timezone", "Asia/Kolkata")
                                .build())
                        .retrieve()
                        .body(Map.class);

                if (result == null) {
                    throw new IllegalStateException(
                            "Empty weather API response"
                    );
                }

                Map<?, ?> current =
                        (Map<?, ?>) result.get("current");

                if (current == null) {
                    throw new IllegalStateException(
                            "Weather data is missing"
                    );
                }

                WeatherResponse response = new WeatherResponse();

                response.setCity("Hyderabad");
                response.setTime(formatTime(current.get("time")));

                response.setTemperatureC(
                        number(current.get("temperature_2m"))
                );

                response.setHumidity(
                        (int) number(current.get("relative_humidity_2m"))
                );

                response.setFeelsLikeC(
                        number(current.get("apparent_temperature"))
                );

                response.setPrecipitationMm(
                        number(current.get("precipitation"))
                );

                response.setWindSpeedKmh(
                        number(current.get("wind_speed_10m"))
                );

                response.setCondition(
                        condition(current.get("weather_code"))
                );

                response.setAlerts(java.util.List.of(
                        "Weather data retrieved successfully. "
                        + "Follow local official warnings."
                ));

                response.setSource("Open-Meteo");

                cachedWeather = response;
                lastSuccessfulFetchTime = System.currentTimeMillis();

                return response;

            } catch (org.springframework.web.client.RestClientException ex) {
                if (attempt < 3) {
                    try {
                        Thread.sleep(attempt * 1000L);
                    } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        if (cachedWeather != null) {
            return cachedWeather;
        }

        throw new IllegalStateException(
                "Weather provider is unavailable. Please try again later."
        );
    }

    private double number(Object value) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }

    private String formatTime(Object value) {
        if (value == null) {
            return "Not available";
        }

        try {
            return java.time.LocalDateTime.parse(value.toString())
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        } catch (Exception ex) {
            return value.toString();
        }
    }

    private String condition(Object value) {
        int code = (int) number(value);

        if (code == 0) return "Clear sky";
        if (code <= 3) return "Partly cloudy";
        if (code == 45 || code == 48) return "Foggy";
        if (code >= 51 && code <= 57) return "Drizzle";
        if (code >= 61 && code <= 67) return "Rain";
        if (code >= 71 && code <= 77) return "Snow";
        if (code >= 80 && code <= 82) return "Rain showers";
        if (code >= 85 && code <= 86) return "Snow showers";
        if (code >= 95) return "Thunderstorm";

        return "Unknown conditions";
    }

    public long getLastSuccessfulFetchTime() {
        return lastSuccessfulFetchTime;
    }
}
