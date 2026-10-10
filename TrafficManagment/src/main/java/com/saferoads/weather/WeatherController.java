
package com.saferoads.weather;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private static final Logger logger =
            LoggerFactory.getLogger(WeatherController.class);

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    public ResponseEntity<?> getWeather() {
        try {
            return ResponseEntity.ok(weatherService.getWeather());

        } catch (IllegalStateException exception) {

            logger.error("Failed to retrieve weather data", exception);

            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(java.util.Map.of(
                            "error", exception.getMessage()
                    ));
        }
    }
}
