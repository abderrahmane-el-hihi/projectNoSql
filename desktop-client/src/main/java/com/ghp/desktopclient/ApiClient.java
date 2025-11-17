package com.ghp.desktopclient;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ghp.desktopclient.models.AuthResponse;
import com.ghp.desktopclient.models.Doctor;
import com.ghp.desktopclient.models.Patient;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

public class ApiClient {
    private final String baseUrl; // e.g., http://localhost:8081/api
    private final HttpClient http;
    private final ObjectMapper mapper;
    private String jwtToken;

    public ApiClient() {
        this(System.getenv().getOrDefault("API_BASE_URL", "http://localhost:8081/api"));
    }

    public ApiClient(String baseUrl) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length()-1) : baseUrl;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.mapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public void setJwtToken(String token) {
        this.jwtToken = token;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public String login(String username, String password) throws IOException, InterruptedException, ApiException {
        Map<String, String> payload = Map.of("username", username, "password", password);
        String json = mapper.writeValueAsString(payload);
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/auth/login"))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (res.statusCode() / 100 != 2) {
            throw new ApiException("Login failed: " + res.statusCode() + " " + res.body());
        }
        AuthResponse auth = mapper.readValue(res.body(), AuthResponse.class);
        String token = auth.getToken();
        if (token == null || token.isBlank()) {
            // try common alternative names
            token = auth.getJwt();
            if (token == null || token.isBlank()) token = auth.getAccessToken();
        }
        if (token == null || token.isBlank()) {
            throw new ApiException("Login response did not include a token");
        }
        this.jwtToken = token;
        return token;
    }

    public List<Doctor> listDoctors() throws IOException, InterruptedException, ApiException {
        HttpRequest.Builder b = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/doctors"))
                .timeout(Duration.ofSeconds(15))
                .GET();
        withAuth(b);
        HttpResponse<String> res = http.send(b.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (res.statusCode() / 100 != 2) {
            throw new ApiException("Failed to load doctors: " + res.statusCode() + " " + res.body());
        }
        // Try to parse either a list or an object with 'content'
        try {
            return mapper.readValue(res.body(), new TypeReference<List<Doctor>>() {});
        } catch (Exception e) {
            Map<String, Object> obj = mapper.readValue(res.body(), new TypeReference<Map<String, Object>>() {});
            Object content = obj.get("content");
            String contentJson = mapper.writeValueAsString(content);
            return mapper.readValue(contentJson, new TypeReference<List<Doctor>>() {});
        }
    }

    public Patient createPatient(Patient p) throws IOException, InterruptedException, ApiException {
        String json = mapper.writeValueAsString(p);
        HttpRequest.Builder b = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/patients"))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8));
        withAuth(b);
        HttpResponse<String> res = http.send(b.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (res.statusCode() / 100 != 2) {
            throw new ApiException("Create patient failed: " + res.statusCode() + " " + res.body());
        }
        return mapper.readValue(res.body(), Patient.class);
    }

    private void withAuth(HttpRequest.Builder b) {
        if (jwtToken != null && !jwtToken.isBlank()) {
            b.header("Authorization", "Bearer " + jwtToken);
        }
    }

    public static class ApiException extends Exception {
        public ApiException(String message) { super(message); }
    }
}
