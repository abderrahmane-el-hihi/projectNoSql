package com.ghp.desktopclient.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthResponse {
    private String token;
    private String jwt;
    private String accessToken;
    private String username;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getJwt() { return jwt; }
    public void setJwt(String jwt) { this.jwt = jwt; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
