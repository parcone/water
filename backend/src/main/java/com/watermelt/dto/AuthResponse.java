package com.watermelt.dto;

import com.watermelt.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private User user;
    
    public AuthResponse(String token) {
        this.token = token;
    }
} 