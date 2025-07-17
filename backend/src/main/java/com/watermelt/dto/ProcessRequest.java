package com.watermelt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcessRequest {
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    private Double targetTemperature;
} 